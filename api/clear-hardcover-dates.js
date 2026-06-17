// api/clear-hardcover-dates.js
//
// The bulk export (export-to-hardcover.js) marks books as "Read", which makes Hardcover
// stamp a read with TODAY'S date. Since these books were actually read years ago, those
// fresh dates pollute your reading diary and "year in review". This script removes the
// read DATES from the imported books while keeping them marked Read (with their ratings).
//
// It only touches reads dated on the import day, so your genuinely-dated older books are
// left alone. By default it targets today's date; pass --date=YYYY-MM-DD to target the day
// you actually ran the import.
//
// Usage (from repo root):
//   node api/clear-hardcover-dates.js                 # DRY RUN — lists reads, deletes nothing
//   node api/clear-hardcover-dates.js --date=2026-06-17
//   node api/clear-hardcover-dates.js --fix           # delete reads dated today
//   node api/clear-hardcover-dates.js --fix --date=2026-06-17
//
// Requires HARDCOVER_API_KEY in api/.env.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');

const TOKEN = process.env.HARDCOVER_API_KEY;
const FIX = process.argv.includes('--fix');
const dateArg = process.argv.find(a => a.startsWith('--date='));
const HC_URL = 'https://api.hardcover.app/v1/graphql';
const READ_STATUS_ID = 3;

if (!TOKEN) { console.error('HARDCOVER_API_KEY missing in api/.env'); process.exit(1); }

const authHeader = /^Bearer\s/i.test(TOKEN) ? TOKEN : `Bearer ${TOKEN}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Target date = --date=YYYY-MM-DD, else today's local date.
const TARGET = dateArg ? dateArg.split('=')[1] : (() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();

async function hc(query, variables, attempt = 0) {
    try {
        const res = await axios.post(HC_URL, { query, variables }, {
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }
        });
        if (res.data.errors) throw new Error(JSON.stringify(res.data.errors));
        return res.data.data;
    } catch (e) {
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

// A read counts as "import-dated" if either of its dates falls on the target day.
const onTarget = (val) => typeof val === 'string' && val.slice(0, 10) === TARGET;

(async () => {
    console.log(`Target import date: ${TARGET}`);
    console.log(FIX ? '=== FIX MODE — read dates on that day will be DELETED ===\n' : '=== DRY RUN — nothing will be deleted (pass --fix to apply) ===\n');

    const data = await hc(`query {
        me {
            user_books(where: {status_id: {_eq: ${READ_STATUS_ID}}}, limit: 1000) {
                book { title }
                user_book_reads { id started_at finished_at }
            }
        }
    }`);

    const me = Array.isArray(data.me) ? data.me[0] : data.me;
    const userBooks = (me && me.user_books) || [];
    console.log(`Read shelf has ${userBooks.length} books.\n`);

    // Collect reads to clear.
    const toDelete = [];
    let withDates = 0;
    userBooks.forEach(ub => {
        (ub.user_book_reads || []).forEach(r => {
            if (r.started_at || r.finished_at) withDates++;
            if (onTarget(r.started_at) || onTarget(r.finished_at)) {
                toDelete.push({ id: r.id, title: ub.book && ub.book.title, started_at: r.started_at, finished_at: r.finished_at });
            }
        });
    });

    console.log(`Reads with any date: ${withDates}`);
    console.log(`Reads dated ${TARGET} (import day) → ${toDelete.length} to clear:\n`);
    toDelete.forEach(r => console.log(`  ${r.title}  [started=${r.started_at || '-'} finished=${r.finished_at || '-'}]`));

    if (!toDelete.length) {
        console.log('\nNothing dated on the target day. If books still show no diary entry, the import did not create dated reads (only date_added metadata), which does NOT affect year-in-review.');
        return;
    }

    if (!FIX) { console.log(`\nRe-run with --fix to delete these ${toDelete.length} read dates.`); return; }

    console.log('');
    let deleted = 0, failed = 0;
    for (const r of toDelete) {
        try {
            await hc(`mutation ($id: Int!) { delete_user_book_read(id: $id) { id } }`, { id: r.id });
            console.log(`CLEARED  ${r.title}`);
            deleted++;
        } catch (e) {
            console.log(`FAIL     ${r.title}  ::  ${e.message}`);
            failed++;
        }
        await sleep(1200);
    }
    console.log(`\n=== Done: cleared ${deleted}, failed ${failed} ===`);
})().catch(e => { console.error('Aborted:', e.message); process.exit(1); });
