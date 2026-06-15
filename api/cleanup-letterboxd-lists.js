// api/cleanup-letterboxd-lists.js
// Removes junk "list" entries that the old sync imported as movies.
// Letterboxd list activity has a guid like "letterboxd-list-..." (e.g. "Horror", "MCU"),
// whereas real watched films have "letterboxd-watch-...".
//
// Usage:
//   node api/cleanup-letterboxd-lists.js            -> dry run: lists what WOULD be deleted
//   node api/cleanup-letterboxd-lists.js --delete   -> actually deletes them
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { MongoClient } = require('mongodb');

const DELETE = process.argv.includes('--delete');
const filter = { letterboxd_guid: { $regex: '^letterboxd-list' } };

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const movies = client.db('portfolioData').collection('movies');

        const junk = await movies.find(filter).project({ title: 1, letterboxd_guid: 1 }).toArray();
        console.log(`Found ${junk.length} list (junk) entries:`);
        junk.forEach(d => console.log(`  - ${d.title}  [${d.letterboxd_guid}]`));

        if (!junk.length) { console.log('Nothing to clean up.'); return; }

        if (DELETE) {
            const res = await movies.deleteMany(filter);
            console.log(`\nDeleted ${res.deletedCount} entries.`);
        } else {
            console.log('\nDry run only. Re-run with --delete to remove these.');
        }
    } catch (err) {
        console.error('Cleanup failed:', err.message);
    } finally {
        await client.close();
    }
})();
