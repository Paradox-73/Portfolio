// api/import-watchlist.js
//
// Imports your Letterboxd watchlist into the `movie_watchlist` collection ONLY, so it
// doesn't clobber other collections the way the full `migrate` does. Re-runnable.
//
// Expects data/watchlist.csv with the Letterboxd export columns: Date, Name, Year, Letterboxd URI.
//
// Usage (from repo root):
//   node api/import-watchlist.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

const filePath = path.join(__dirname, '../data/watchlist.csv');

async function run() {
    if (!fs.existsSync(filePath)) {
        console.error(`Not found: ${filePath}\nDrop your Letterboxd watchlist export there as watchlist.csv and re-run.`);
        process.exit(1);
    }
    const rows = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (r) => rows.push(r))
            .on('end', resolve)
            .on('error', reject);
    });

    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const col = client.db('portfolioData').collection('movie_watchlist');
        await col.deleteMany({});
        if (rows.length) await col.insertMany(rows);
        console.log(`Imported ${rows.length} watchlist entries into 'movie_watchlist'.`);
    } finally {
        await client.close();
    }
}

run().catch(e => { console.error('Import failed:', e.message); process.exit(1); });
