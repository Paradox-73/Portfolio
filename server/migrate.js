// server/migrate.js
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

const MAPPING = {
    'movies_data.csv': 'movies',
    'shows_data.csv': 'shows',
    'books_data.csv': 'books',
    'games_data.csv': 'games',
    'my_works.csv': 'works',
    'spotify_top_tracks.csv': 'music_tracks',
    'spotify_top_artists.csv': 'music_artists',
    'spotify_saved_albums.csv': 'music_albums'
};

async function migrate() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        console.log("Connected to MongoDB.");
        const db = client.db("portfolioData");

        for (const [file, collectionName] of Object.entries(MAPPING)) {
            const data = [];
            const filePath = `../client/data/${file}`;
            
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found, skipping: ${filePath}`);
                continue;
            }

            console.log(`Processing ${file}...`);

            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (row) => data.push(row))
                    .on('end', async () => {
                        if (data.length > 0) {
                            await db.collection(collectionName).deleteMany({});
                            await db.collection(collectionName).insertMany(data);
                            console.log(`Successfully migrated ${data.length} records to '${collectionName}' collection.`);
                        }
                        resolve();
                    })
                    .on('error', reject);
            });
        }
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

migrate();
