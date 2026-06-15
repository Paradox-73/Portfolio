// api/letterboxd-sync.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { MongoClient } = require('mongodb');
const axios = require('axios');
const cron = require('node-cron');
const Parser = require('rss-parser');

// Letterboxd returns 403 to clients without a browser-like User-Agent.
const parser = new Parser({
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0; +https://letterboxd.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8'
    }
});

// --- CONFIGURATION ---
const MONGO_URI = process.env.MONGO_URI;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const LETTERBOXD_USERNAME = 'Paradox_73'; // As provided by the user
const LETTERBOXD_RSS_URL = `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// --- HELPER FUNCTIONS ---

/**
 * Parses the star rating from Letterboxd's RSS content.
 * @param {string} content - The HTML content from the RSS item.
 * @returns {number|null} The rating as a number or null if not found.
 */
function parseRating(content) {
    if (!content) return null;
    const ratingMatch = content.match(/★/g);
    const halfStarMatch = content.match(/½/g);
    if (!ratingMatch) return null;

    let rating = ratingMatch.length;
    if (halfStarMatch) {
        rating += 0.5;
    }
    return rating;
}

/**
 * Parses movie title and year from a Letterboxd title string.
 * This version correctly handles titles that may or may not have ratings appended.
 * @param {string} letterboxdTitle - The title from the RSS item. e.g., "Sonic the Hedgehog, 2020 - ★★½"
 * @returns {{title: string, year: string|null}}
 */
function parseTitleAndYear(letterboxdTitle) {
    const yearMatch = letterboxdTitle.match(/, (\d{4})/);
    if (yearMatch) {
        const year = yearMatch[1]; // The captured year, e.g., "2020"
        const title = letterboxdTitle.substring(0, yearMatch.index).trim();
        return { title, year };
    }
    // Fallback if no year is found in the expected format
    return { title: letterboxdTitle.trim(), year: null };
}

/**
 * Fetches the US MPAA rating for a movie from TMDB.
 * @param {number} tmdbId - The movie's ID on TMDB.
 * @returns {string|null} The MPAA rating (e.g., "PG-13") or null.
 */
async function getMpaaRating(tmdbId) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/release_dates`, {
            params: { api_key: TMDB_API_KEY }
        });
        const usRelease = response.data.results.find(r => r.iso_3166_1 === 'US');
        if (usRelease) {
            // Find the first certification that is not empty
            const rated = usRelease.release_dates.find(rd => rd.certification);
            return rated ? rated.certification : null;
        }
        return null;
    } catch (error) {
        console.error(`Could not fetch rating for TMDB ID ${tmdbId}:`, error.message);
        return null;
    }
}


// --- MAIN SYNC LOGIC ---

async function syncLetterboxd() {
    console.log('Starting Letterboxd sync...');
    if (!MONGO_URI || !TMDB_API_KEY) {
        console.error('FATAL ERROR: MONGO_URI and/or TMDB_API_KEY are not defined in .env file.');
        return;
    }
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db("portfolioData");
        const moviesCollection = db.collection('movies');
        
        console.log(`Fetching Letterboxd RSS feed from: ${LETTERBOXD_RSS_URL}`);
        const feed = await parser.parseURL(LETTERBOXD_RSS_URL);

        for (const item of feed.items) {
            const guid = item.guid;

            // The Letterboxd RSS feed includes list activity (guid "letterboxd-list-...") alongside
            // watched films (guid "letterboxd-watch-..."). Only diary films should be synced —
            // lists like "Horror" or "Yorgos Lanthimos" otherwise get matched to bogus TMDB results.
            if (!guid || guid.includes('letterboxd-list')) {
                console.log(`Skipping non-film entry (list): ${item.title}`);
                continue;
            }

            const existingMovie = await moviesCollection.findOne({ letterboxd_guid: guid });
            if (existingMovie) {
                continue;
            }

            console.log(`Processing new entry: ${item.title}`);

            const { title, year } = parseTitleAndYear(item.title);

            const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                params: { api_key: TMDB_API_KEY, query: title, primary_release_year: year }
            });

            if (searchResponse.data.results.length === 0) {
                console.warn(`TMDB search found no results for "${title}" (${year}). Skipping.`);
                continue;
            }
            
            const tmdbId = searchResponse.data.results[0].id;

            const detailsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
                params: { api_key: TMDB_API_KEY, append_to_response: 'credits' }
            });
            const movieData = detailsResponse.data;

            const rated = await getMpaaRating(tmdbId);

            // --- Map to User's Schema ---
            const document = {
                tmdb_id: movieData.id,
                imdb_id: movieData.imdb_id,
                title: movieData.title,
                year: movieData.release_date ? new Date(movieData.release_date).getFullYear() : (year || null),
                rated: rated,
                released: movieData.release_date || null,
                runtime: movieData.runtime || null,
                genre: movieData.genres ? movieData.genres.map(g => g.name).join(', ') : '',
                director: movieData.credits.crew.find(c => c.job === 'Director')?.name || null,
                writer: movieData.credits.crew.filter(c => c.department === 'Writing').map(w => w.name).join(', '),
                actors: movieData.credits.cast.slice(0, 10).map(c => c.name).join(', '), // Using comma as per most conventions
                plot: movieData.overview,
                language: movieData.spoken_languages ? movieData.spoken_languages.map(l => l.english_name).join(', ') : '',
                country: movieData.production_countries ? movieData.production_countries.map(c => c.name).join(', ') : '',
                awards: null, // Not available from TMDB
                poster: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
                user_rating: parseRating(item.content),
                imdb_rating: null, // Not available from TMDB
                imdb_votes: null,  // Not available from TMDB
                metascore: null,   // Not available from TMDB
                rotten_tomatoes_rating: null, // Not available from TMDB
                type: 'movie',
                dvd: null,
                box_office: movieData.revenue ? `$${movieData.revenue.toLocaleString()}` : null,
                production: movieData.production_companies ? movieData.production_companies.map(p => p.name).join(', ') : '',
                website: movieData.homepage || null,
                letterboxd_name: item.title,
                processing_status: 'COMPLETE',
                parsed_cast: movieData.credits.cast.slice(0, 5).map(c => c.name).join('|'), // As per user sample
                parsed_crew: movieData.credits.crew.filter(c => c.department === 'Writing' || c.job === 'Director').map(p => p.name).join('|'),
                tagline: movieData.tagline || null,
                overview: movieData.overview,
                status: movieData.status,
                backdrop_path: movieData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}` : null,
                original_language: movieData.original_language,
                popularity: movieData.popularity,
                vote_average: movieData.vote_average,
                vote_count: movieData.vote_count,
                letterboxd_guid: guid, // Keep a unique key for sync purposes
                watched_date: new Date(item.pubDate), // Add watched date
            };

            await moviesCollection.updateOne(
                { letterboxd_guid: guid },
                { $set: document },
                { upsert: true }
            );

            console.log(`Successfully synced: "${document.title}"`);
        }

    } catch (error) {
        console.error('An error occurred during Letterboxd sync:', error.message);
    } finally {
        if (client) {
            await client.close();
        }
        console.log('Letterboxd sync finished.');
    }
}

// --- SCHEDULER ---

function startCronJob() {
    console.log('Scheduler started. Sync will run daily at midnight.');
    cron.schedule('0 0 * * *', () => {
        console.log('Cron job triggered by schedule: Running daily sync.');
        syncLetterboxd();
    });

    console.log('Running initial sync on startup...');
    setTimeout(syncLetterboxd, 5000); // 5-second delay
}

module.exports = { startCronJob, syncLetterboxd };
