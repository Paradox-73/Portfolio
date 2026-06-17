// api/export-to-hardcover.js
//
// One-time / repeatable export of your curated MongoDB "books" collection into your
// Hardcover account's "Read" shelf (status_id = 3), so Hardcover can become the single
// source of truth and the site can fetch from it directly.
//
// For each MongoDB book it:
//   1. Pulls the ISBN out of the Google Books infoLink (e.g. ...dq=isbn:9780141340821).
//   2. Resolves the Hardcover book by ISBN (most accurate); falls back to a title search.
//   3. Adds it to your library as "Read", carrying over your my_rating when present.
//
// It SKIPS books already on your Hardcover shelf, so it is safe to re-run.
//
// Usage (from repo root):
//   node api/export-to-hardcover.js            # DRY RUN — resolves + prints, changes nothing
//   node api/export-to-hardcover.js --commit   # actually writes to Hardcover
//
// Requires HARDCOVER_API_KEY and MONGO_URI in api/.env (both already configured).

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');
const { MongoClient } = require('mongodb');

const TOKEN = process.env.HARDCOVER_API_KEY;
const COMMIT = process.argv.includes('--commit');
const HC_URL = 'https://api.hardcover.app/v1/graphql';
const READ_STATUS_ID = 3;

if (!TOKEN) { console.error('HARDCOVER_API_KEY missing in api/.env'); process.exit(1); }
if (!process.env.MONGO_URI) { console.error('MONGO_URI missing in api/.env'); process.exit(1); }

const authHeader = /^Bearer\s/i.test(TOKEN) ? TOKEN : `Bearer ${TOKEN}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function hc(query, variables, attempt = 0) {
    try {
        const res = await axios.post(HC_URL, { query, variables }, {
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }
        });
        if (res.data.errors) throw new Error(JSON.stringify(res.data.errors));
        return res.data.data;
    } catch (e) {
        // Hardcover rate-limits hard (HTTP 429). Back off and retry a few times,
        // honoring Retry-After when the server provides it.
        if (e.response && e.response.status === 429 && attempt < 5) {
            const retryAfter = Number(e.response.headers['retry-after']);
            const waitMs = !isNaN(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : Math.min(2000 * Math.pow(2, attempt), 30000);
            console.log(`   ...rate limited, waiting ${Math.round(waitMs / 1000)}s (retry ${attempt + 1}/5)`);
            await sleep(waitMs);
            return hc(query, variables, attempt + 1);
        }
        throw e;
    }
}

// Hardcover only accepts ratings of 0.5–5 in 0.5 increments. Round/clamp; drop anything <=0.
function normalizeRating(raw) {
    const r = Number(raw);
    if (isNaN(r) || r <= 0) return null;
    const rounded = Math.round(r * 2) / 2;
    return Math.min(5, Math.max(0.5, rounded));
}

function extractIsbn(infoLink) {
    if (!infoLink) return null;
    const m = String(infoLink).match(/isbn:(\d{9,13}[\dXx]?)/i);
    return m ? m[1] : null;
}
function normTitle(t) { return t ? t.toLowerCase().split(':')[0].split('(')[0].trim() : ''; }

// Books already on the shelf — so re-runs don't create duplicates.
async function fetchExistingShelf() {
    const data = await hc(`query {
        me { user_books(where: {status_id: {_eq: ${READ_STATUS_ID}}}, limit: 1000) {
            book { id title }
        } }
    }`);
    const me = Array.isArray(data.me) ? data.me[0] : data.me;
    const ubs = (me && me.user_books) || [];
    const ids = new Set(), titles = new Set();
    ubs.forEach(ub => { if (ub.book) { ids.add(ub.book.id); titles.add(normTitle(ub.book.title)); } });
    return { ids, titles };
}

// Resolve a Hardcover book id. Prefer an exact ISBN match against editions; fall back to search.
async function resolveBook(book) {
    const isbn = extractIsbn(book.infoLink);
    if (isbn) {
        const field = isbn.length === 13 ? 'isbn_13' : 'isbn_10';
        try {
            const data = await hc(
                `query ($v: String!) { editions(where: {${field}: {_eq: $v}}, limit: 1) { id book_id book { title } } }`,
                { v: isbn }
            );
            const ed = data.editions && data.editions[0];
            if (ed) return { book_id: ed.book_id, edition_id: ed.id, via: `isbn:${isbn}`, matchedTitle: ed.book?.title };
        } catch (e) { /* fall through to title search */ }
    }
    // Title search fallback.
    const data = await hc(
        `query ($q: String!) { search(query: $q, query_type: "Book", per_page: 5) { results } }`,
        { q: book.title }
    );
    const hits = (((data.search || {}).results || {}).hits) || [];
    const docs = hits.map(h => h.document).filter(d => d && d.id);
    if (!docs.length) return null;
    const exact = docs.find(d => normTitle(d.title) === normTitle(book.title)) || docs[0];
    return { book_id: Number(exact.id), edition_id: null, via: 'title-search', matchedTitle: exact.title };
}

async function addToShelf({ book_id, edition_id }, rating) {
    const obj = { book_id, status_id: READ_STATUS_ID };
    if (edition_id) obj.edition_id = edition_id;
    const r = normalizeRating(rating);
    if (r !== null) obj.rating = r;
    const data = await hc(
        `mutation ($object: UserBookCreateInput!) {
            insert_user_book(object: $object) { error user_book { id } }
        }`,
        { object: obj }
    );
    const out = data.insert_user_book;
    if (out && out.error) throw new Error(out.error);
    return out && out.user_book;
}

(async () => {
    console.log(COMMIT ? '=== COMMIT MODE — writing to Hardcover ===' : '=== DRY RUN — no changes will be made (pass --commit to write) ===');
    const mongo = new MongoClient(process.env.MONGO_URI);
    const summary = { added: 0, skipped: 0, unresolved: 0, failed: 0 };
    try {
        await mongo.connect();
        const books = await mongo.db('portfolioData').collection('books').find({}).toArray();
        console.log(`Loaded ${books.length} books from MongoDB.\n`);

        const shelf = await fetchExistingShelf();
        console.log(`Hardcover shelf already has ${shelf.ids.size} read books.\n`);

        for (const book of books) {
            const label = book.title || '(untitled)';
            if (!book.title || !book.title.trim()) {
                console.log(`SKIP  (no title)           ${label}`);
                summary.skipped++; continue;
            }
            if (shelf.titles.has(normTitle(book.title))) {
                console.log(`SKIP  (already on shelf)   ${label}`);
                summary.skipped++; continue;
            }
            try {
                const match = await resolveBook(book);
                if (!match) {
                    console.log(`MISS  (not found)          ${label}`);
                    summary.unresolved++; await sleep(1500); continue;
                }
                if (shelf.ids.has(match.book_id)) {
                    console.log(`SKIP  (already on shelf)   ${label}`);
                    summary.skipped++; await sleep(1500); continue;
                }
                if (COMMIT) {
                    await addToShelf(match, book.my_rating);
                    shelf.ids.add(match.book_id); shelf.titles.add(normTitle(book.title));
                    console.log(`ADDED [${match.via}]        ${label}  ->  "${match.matchedTitle}"${book.my_rating ? ` (rating ${book.my_rating})` : ''}`);
                } else {
                    console.log(`WOULD-ADD [${match.via}]    ${label}  ->  "${match.matchedTitle}"${book.my_rating ? ` (rating ${book.my_rating})` : ''}`);
                }
                summary.added++;
                await sleep(1500); // be gentle with the Hardcover rate limit
            } catch (e) {
                console.log(`FAIL                       ${label}  ::  ${e.message}`);
                summary.failed++; await sleep(1500);
            }
        }
    } catch (err) {
        console.error('\nExport aborted:', err.message);
    } finally {
        await mongo.close();
    }
    console.log(`\n=== Summary ===`);
    console.log(`${COMMIT ? 'Added' : 'Would add'}: ${summary.added} | Skipped: ${summary.skipped} | Not found: ${summary.unresolved} | Failed: ${summary.failed}`);
    if (!COMMIT) console.log('Re-run with --commit to apply.');
})();
