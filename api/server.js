// server/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios'); // We will use this later
const { startCronJob, syncLetterboxd } = require('./letterboxd-sync'); // Import the cron job starter and the sync function

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Allow server to accept JSON data

// Add nodemailer
const nodemailer = require('nodemailer');

// Nodemailer Transporter Configuration
// You need to set EMAIL_USER, EMAIL_PASS, and EMAIL_TO in your .env file
// Example for Gmail:
// EMAIL_USER="your_email@gmail.com"
// EMAIL_PASS="your_app_password" // Use an app password if 2FA is enabled
// EMAIL_TO="recipient_email@example.com"
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or 'smtp' and provide host, port, secure options
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Database Connection
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas!");
        const db = client.db("portfolioData");

        // The node-cron job is disabled because it's not reliable in a serverless environment.
        // We will use Vercel's cron job feature instead.
        // startCronJob();

        // --- API Endpoints ---
        // Each endpoint fetches data from its corresponding MongoDB collection.

        // Endpoint for Vercel Cron to trigger the Letterboxd sync.
        // Vercel Cron sends a GET request and (when a CRON_SECRET env var is set) automatically
        // includes an "Authorization: Bearer <CRON_SECRET>" header. We also accept POST and a
        // ?cron_secret= query param so the sync can be triggered manually for testing.
        const handleLetterboxdSync = async (req, res) => {
            const { authorization } = req.headers;
            const { cron_secret: querySecret } = req.query;
            const cronSecret = process.env.CRON_SECRET;

            const headerSecret = authorization ? authorization.replace(/^Bearer\s+/i, '') : null;
            const requestSecret = headerSecret || querySecret;

            if (!cronSecret || requestSecret !== cronSecret) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            try {
                await syncLetterboxd();
                res.status(200).json({ message: 'Letterboxd sync completed successfully.' });
            } catch (error) {
                console.error('Letterboxd sync failed:', error);
                res.status(500).json({ message: 'Letterboxd sync failed.', details: error.message });
            }
        };
        app.get('/api/sync-letterboxd', handleLetterboxdSync);
        app.post('/api/sync-letterboxd', handleLetterboxdSync);

        app.get('/api/movies', async (req, res) => {
            const data = await db.collection('movies').find({}).toArray();
            res.json(data);
        });

        app.get('/api/shows', async (req, res) => {
            const data = await db.collection('shows').find({}).toArray();
            res.json(data);
        });

        app.get('/api/books', async (req, res) => {
            const data = await db.collection('books').find({}).toArray();
            res.json(data);
        });
        
        app.post('/api/books', async (req, res) => {
            try {
                const book = req.body;
                const result = await db.collection('books').insertOne(book);
                res.status(201).json(result);
            } catch (error) {
                res.status(500).json({ message: 'Failed to add book.', details: error.message });
            }
        });

        // Hardcover proxy — keeps the API token server-side (set HARDCOVER_API_KEY in api/.env
        // and in your Vercel project env vars). Returns the user's "read" books normalized to
        // the same shape as /api/books so the frontend render path is unchanged.
        app.get('/api/hardcover-books', async (req, res) => {
            const token = process.env.HARDCOVER_API_KEY;
            if (!token) return res.status(500).json({ message: 'HARDCOVER_API_KEY not configured on the server.' });

            const query = `query {
                me {
                    user_books(where: {status_id: {_eq: 3}}, order_by: {date_added: desc}, limit: 500) {
                        rating
                        book {
                            title
                            description
                            cached_image
                            contributions { author { name } }
                        }
                    }
                }
            }`;

            try {
                const hc = await axios.post(
                    'https://api.hardcover.app/v1/graphql',
                    { query },
                    { headers: {
                        'Content-Type': 'application/json',
                        'Authorization': /^Bearer\s/i.test(token) ? token : `Bearer ${token}`
                    } }
                );

                const me = hc.data && hc.data.data ? hc.data.data.me : null;
                const meObj = Array.isArray(me) ? me[0] : me;
                const userBooks = (meObj && meObj.user_books) ? meObj.user_books : [];

                const books = userBooks
                    .filter(ub => ub.book && ub.book.title)
                    .map(ub => {
                        const b = ub.book;
                        const authors = (b.contributions || [])
                            .map(c => c.author && c.author.name)
                            .filter(Boolean)
                            .join(', ');
                        const cover = b.cached_image && (b.cached_image.url || b.cached_image)
                            ? (b.cached_image.url || b.cached_image) : '';
                        return {
                            title: b.title,
                            authors,
                            description: b.description || 'No description available.',
                            thumbnail: cover,
                            my_rating: ub.rating
                        };
                    });

                res.json(books);
            } catch (error) {
                console.error('Hardcover fetch failed:', error.response ? error.response.data : error.message);
                res.status(500).json({ message: 'Hardcover fetch failed.', details: error.response ? error.response.data : error.message });
            }
        });

        // Hardcover "Want to Read" shelf (status_id = 1), normalized to the wishlist shape so
        // the Literature page can merge it with the MongoDB recommendations for display.
        app.get('/api/hardcover-wishlist', async (req, res) => {
            const token = process.env.HARDCOVER_API_KEY;
            if (!token) return res.status(500).json({ message: 'HARDCOVER_API_KEY not configured on the server.' });

            const query = `query {
                me {
                    user_books(where: {status_id: {_eq: 1}}, order_by: {date_added: desc}, limit: 500) {
                        book {
                            title
                            description
                            cached_image
                            contributions { author { name } }
                        }
                    }
                }
            }`;

            try {
                const hc = await axios.post(
                    'https://api.hardcover.app/v1/graphql',
                    { query },
                    { headers: {
                        'Content-Type': 'application/json',
                        'Authorization': /^Bearer\s/i.test(token) ? token : `Bearer ${token}`
                    } }
                );

                const me = hc.data && hc.data.data ? hc.data.data.me : null;
                const meObj = Array.isArray(me) ? me[0] : me;
                const userBooks = (meObj && meObj.user_books) ? meObj.user_books : [];

                const books = userBooks
                    .filter(ub => ub.book && ub.book.title)
                    .map(ub => {
                        const b = ub.book;
                        const authors = (b.contributions || [])
                            .map(c => c.author && c.author.name)
                            .filter(Boolean);
                        const cover = b.cached_image && (b.cached_image.url || b.cached_image)
                            ? (b.cached_image.url || b.cached_image) : '';
                        return {
                            title: b.title,
                            authors,
                            description: b.description || 'No description available.',
                            imageLinks: { thumbnail: cover },
                            recommendedBy: 'Kanav (Hardcover)',
                            source: 'hardcover'
                        };
                    });

                res.json(books);
            } catch (error) {
                console.error('Hardcover wishlist fetch failed:', error.response ? error.response.data : error.message);
                res.status(500).json({ message: 'Hardcover wishlist fetch failed.', details: error.response ? error.response.data : error.message });
            }
        });

        // Hardcover book search (Typesense-backed) — used by the Literature recommend search
        // and as a description fallback. Returns books normalized with full descriptions.
        app.get('/api/hardcover-search', async (req, res) => {
            const token = process.env.HARDCOVER_API_KEY;
            if (!token) return res.status(500).json({ message: 'HARDCOVER_API_KEY not configured on the server.' });

            const q = (req.query.q || '').trim();
            if (q.length < 2) return res.json([]);

            const query = `query Search($q: String!) {
                search(query: $q, query_type: "Book", per_page: 12) { results }
            }`;

            try {
                const hc = await axios.post(
                    'https://api.hardcover.app/v1/graphql',
                    { query, variables: { q } },
                    { headers: {
                        'Content-Type': 'application/json',
                        'Authorization': /^Bearer\s/i.test(token) ? token : `Bearer ${token}`
                    } }
                );

                const results = ((((hc.data || {}).data || {}).search) || {}).results;
                const docs = (results && results.hits) ? results.hits.map(h => h.document).filter(Boolean) : [];

                // Dedupe by title, preferring the edition that actually has a description + cover.
                const byTitle = new Map();
                docs.filter(d => d.title).forEach(d => {
                    const cand = {
                        title: d.title,
                        authors: Array.isArray(d.author_names) ? d.author_names : [],
                        description: d.description || '',
                        imageLinks: { thumbnail: (d.image && d.image.url) ? d.image.url : '' }
                    };
                    const key = d.title.toLowerCase().trim();
                    const ex = byTitle.get(key);
                    const richer = (a) => (a.description ? 2 : 0) + (a.imageLinks.thumbnail ? 1 : 0);
                    if (!ex || richer(cand) > richer(ex)) byTitle.set(key, cand);
                });

                res.json(Array.from(byTitle.values()).slice(0, 8));
            } catch (error) {
                console.error('Hardcover search failed:', error.response ? error.response.data : error.message);
                res.status(500).json({ message: 'Hardcover search failed.', details: error.response ? error.response.data : error.message });
            }
        });

        app.get('/api/games', async (req, res) => {
            const data = await db.collection('games').find({}).toArray();
            res.json(data);
        });

        app.get('/api/works', async (req, res) => {
            const data = await db.collection('works').find({}).toArray();
            res.json(data);
        });

        // Letterboxd watchlist (imported from watchlist.csv: Date, Name, Year, Letterboxd URI).
        app.get('/api/movie-watchlist', async (req, res) => {
            try {
                const data = await db.collection('movie_watchlist').find({}).toArray();
                res.json(data);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch watchlist.', details: error.message });
            }
        });

        // New Spotify Music Endpoints
        app.get('/api/music/tracks', async (req, res) => {
            try {
                const data = await db.collection('music_tracks').find({}).toArray();
                res.json(data);
            } catch (error) {
                console.error("Failed to fetch music tracks:", error);
                res.status(500).json({ message: 'Failed to fetch music tracks.', details: error.message });
            }
        });

        app.get('/api/music/artists', async (req, res) => {
            try {
                const data = await db.collection('music_artists').find({}).toArray();
                res.json(data);
            } catch (error) {
                console.error("Failed to fetch music artists:", error);
                res.status(500).json({ message: 'Failed to fetch music artists.', details: error.message });
            }
        });

        app.get('/api/music/albums', async (req, res) => {
            try {
                const data = await db.collection('music_albums').find({}).toArray();
                res.json(data);
            } catch (error) {
                console.error("Failed to fetch music albums:", error);
                res.status(500).json({ message: 'Failed to fetch music albums.', details: error.message });
            }
        });

        app.get('/api/wishlist', async (req, res) => {
            try {
                // Find recommendations that are not games, specifically for the books/literature page
                const data = await db.collection('recommendations').find({ 
                    status: 'wishlist',
                    type: { $ne: 'game' } 
                }).toArray();
                res.json(data);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch book wishlist.', details: error.message });
            }
        });

        // New Wishlist GET endpoint
        app.get('/api/wishlist/games', async (req, res) => {
            try {
                const data = await db.collection('recommendations').find({ type: 'game', status: 'wishlist' }).toArray();
                res.json(data);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch game wishlist.', details: error.message });
            }
        });

        // New Wishlist POST endpoint
        app.post('/api/wishlist/games', async (req, res) => {
            try {
                const { game, recommendedBy } = req.body;
                if (!game || !game.title) {
                    return res.status(400).json({ message: 'Game title is required.' });
                }
                const newWishlistItem = {
                    type: 'game',
                    status: 'wishlist',
                    title: game.title,
                    cover: game.cover || game.background_image,
                    description: game.description || game.description_raw,
                    recommendedBy: recommendedBy || 'Anonymous',
                    played: false, // Default to not played
                    timestamp: new Date(),
                };
                const result = await db.collection('recommendations').insertOne(newWishlistItem);
                res.status(201).json(result.ops ? result.ops[0] : newWishlistItem); // Return the inserted document
            } catch (error) {
                console.error('Failed to add game to wishlist:', error);
                res.status(500).json({ message: 'Failed to add game to wishlist.', details: error.message });
            }
        });

        // New Wishlist PUT endpoint to toggle played status with password
        app.put('/api/wishlist/games/:id/togglePlayed', async (req, res) => {
            try {
                const { id } = req.params;
                const { password } = req.body;

                if (password !== WISHLIST_PASSWORD) {
                    return res.status(403).json({ message: 'Incorrect password.' });
                }

                const item = await db.collection('recommendations').findOne({ _id: new ObjectId(id) });
                if (!item) {
                    return res.status(404).json({ message: 'Wishlist item not found.' });
                }

                const result = await db.collection('recommendations').updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { played: !item.played, lastUpdated: new Date() } }
                );

                if (result.modifiedCount === 0) {
                    return res.status(500).json({ message: 'Failed to update played status.' });
                }
                res.status(200).json({ message: 'Played status updated successfully.', played: !item.played });
            } catch (error) {
                console.error('Failed to toggle played status:', error);
                res.status(500).json({ message: 'Failed to toggle played status.', details: error.message });
            }
        });

        // Delete Wishlist item (existing, modified for game type)
        app.delete('/api/wishlist/games/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const result = await db.collection('recommendations').deleteOne({ _id: new ObjectId(id), type: 'game' });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Wishlist game item not found.' });
                }
                res.status(200).json({ message: 'Wishlist game item deleted.' });
            } catch (error) {
                res.status(500).json({ message: 'Failed to delete wishlist game item.', details: error.message });
            }
        });

        app.delete('/api/wishlist/:id', async (req, res) => {
            try {
                const { id } = req.params;
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: 'Invalid ID format.' });
                }
                const result = await db.collection('recommendations').deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Wishlist item not found.' });
                }
                res.status(200).json({ message: 'Wishlist item deleted successfully.' });
            } catch (error) {
                res.status(500).json({ message: 'Failed to delete wishlist item.', details: error.message });
            }
        });
        
        // --- External API Proxies ---

        const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        const OMDB_API_KEY = process.env.OMDB_API_KEY;
        const OMDB_BASE_URL = 'http://www.omdbapi.com/';
        const RAWG_API_KEY = process.env.RAWG_API_KEY; // New RAWG API Key

        if (!TMDB_API_KEY) {
            console.error('FATAL ERROR: TMDB_API_KEY is not defined in the .env file.');
            process.exit(1);
        }

        if (!OMDB_API_KEY) {
            console.warn('WARNING: OMDB_API_KEY is not defined in the .env file. OMDB fallback will not be available.');
            // Do not exit, just warn, as TMDB is primary.
        }

        if (!RAWG_API_KEY) {
            console.error('FATAL ERROR: RAWG_API_KEY is not defined in the .env file. Game search will not function.');
            process.exit(1);
        }

        const WISHLIST_PASSWORD = process.env.WISHLIST_PASSWORD;
        if (!WISHLIST_PASSWORD) {
            console.error('FATAL ERROR: WISHLIST_PASSWORD is not defined in the .env file.');
            process.exit(1);
        }

        // ... existing helper functions and proxy endpoints ...

        // Proxy for RAWG API
        app.get('/api/rawg/games', async (req, res) => {
            if (!RAWG_API_KEY) {
                return res.status(500).json({ message: 'RAWG API key is not configured.' });
            }
            const { search, id, page_size = 5 } = req.query; // Added page_size for search

            try {
                let url;
                if (id) {
                    url = `https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`;
                } else if (search) {
                    url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(search)}&page_size=${page_size}`;
                } else {
                    return res.status(400).json({ message: 'Missing search query or game ID.' });
                }

                const response = await axios.get(url);
                res.json(response.data);
            } catch (error) {
                console.error('RAWG API Proxy Error:', error.response ? error.response.data : error.message);
                res.status(error.response?.status || 500).json({
                    message: 'Error fetching data from RAWG API.',
                    details: error.message
                });
            }
        });

        // Proxy for RAWG game trailers/clips
        app.get('/api/rawg/games/:id/movies', async (req, res) => {
            if (!RAWG_API_KEY) {
                return res.status(500).json({ message: 'RAWG API key is not configured.' });
            }
            try {
                const { id } = req.params;
                const url = `https://api.rawg.io/api/games/${id}/movies?key=${RAWG_API_KEY}`;
                const response = await axios.get(url);
                res.json(response.data);
            } catch (error) {
                console.error('RAWG Movies Proxy Error:', error.response ? error.response.data : error.message);
                res.status(error.response?.status || 500).json({
                    message: 'Error fetching trailers from RAWG API.',
                    details: error.message
                });
            }
        });

        // Proxy for YouTube Data API search (optional — used as a trailer fallback).
        // Returns { videoId } of the first embeddable result, or { videoId: null }.
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        app.get('/api/youtube/search', async (req, res) => {
            if (!YOUTUBE_API_KEY) {
                // Not configured — let the client gracefully fall through to other sources.
                return res.status(200).json({ videoId: null, message: 'YouTube API key not configured.' });
            }
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ message: 'Missing search query.' });
            }
            try {
                const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=1&q=${encodeURIComponent(q)}&key=${YOUTUBE_API_KEY}`;
                const response = await axios.get(url);
                const videoId = response.data?.items?.[0]?.id?.videoId || null;
                res.json({ videoId });
            } catch (error) {
                console.error('YouTube Search Proxy Error:', error.response ? error.response.data : error.message);
                res.status(error.response?.status || 500).json({
                    message: 'Error searching YouTube.',
                    details: error.message
                });
            }
        });

        // Admin Password Verification Endpoint
        async function fetchOmdbData(query, type = 'movie') {
            if (!OMDB_API_KEY) {
                console.warn("OMDB_API_KEY not available, cannot use OMDB fallback.");
                return null;
            }
            try {
                let url;
                // Check if the query is an IMDb ID
                if (query.startsWith('tt')) {
                    url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${query}`;
                } else if (type === 'multi') {
                    url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`;
                } else {
                    const omdbType = type === 'tv' ? 'series' : 'movie';
                    url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=${omdbType}`;
                }

                const response = await axios.get(url);

                if (response.data && response.data.Search) {
                    return {
                        results: response.data.Search.map(item => ({
                            id: item.imdbID,
                            title: item.Title,
                            name: item.Title,
                            release_date: item.Year,
                            first_air_date: item.Year,
                            poster_path: item.Poster !== 'N/A' ? item.Poster : null,
                            media_type: item.Type === 'movie' ? 'movie' : 'tv',
                            overview: "No detailed overview from OMDB search results. Fetch details for more info."
                        }))
                    };
                } else if (response.data && response.data.Title) {
                    return {
                        id: response.data.imdbID,
                        title: response.data.Title,
                        name: response.data.Title,
                        overview: response.data.Plot !== 'N/A' ? response.data.Plot : "No overview available.",
                        poster_path: response.data.Poster !== 'N/A' ? response.data.Poster : null,
                        release_date: response.data.Released,
                        first_air_date: response.data.Released,
                        media_type: response.data.Type === 'movie' ? 'movie' : 'tv',
                        genres: response.data.Genre ? response.data.Genre.split(', ').map(g => ({ name: g })) : [],
                        credits: {
                            cast: response.data.Actors ? response.data.Actors.split(', ').map(a => ({ name: a })) : []
                        },
                        runtime: response.data.Runtime,
                        similar: { results: [] },
                        videos: { results: [] }
                    };
                }
                return null;
            } catch (error) {
                console.error('OMDB API Error:', error.message);
                return null;
            }
        }

        // Proxy for TMDB Search
        app.get('/api/tmdb/search/:type', async (req, res) => {
            const { type } = req.params;
            const { query } = req.query;
            if (!query) return res.status(400).json({ message: 'Search query is required.' });

            let tmdbError = false;
            let tmdbResponse = null;

            try {
                const url = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
                tmdbResponse = await axios.get(url);
                if (tmdbResponse.data && tmdbResponse.data.results && tmdbResponse.data.results.length > 0) {
                    return res.json(tmdbResponse.data);
                } else {
                    // If TMDB returns empty results, consider it a soft failure and try OMDB
                    tmdbError = true;
                    console.warn(`TMDB search for "${query}" (${type}) returned no results. Trying OMDB fallback.`);
                }
            } catch (error) {
                tmdbError = true;
                console.error('TMDB API Error:', error.response ? error.response.data : error.message);
                console.warn(`TMDB search failed for "${query}" (${type}). Trying OMDB fallback.`);
            }

            // OMDB Fallback
            if (tmdbError && OMDB_API_KEY) {
                try {
                    const omdbData = await fetchOmdbData(query, type);
                    if (omdbData && omdbData.results && omdbData.results.length > 0) {
                        res.header('X-Fallback-API', 'OMDB');
                        // Add a message for the client in the response body
                        return res.json({
                            ...omdbData,
                            fallback_warning: "TMDB might be inaccessible. Consider connecting to a VPN for full functionality."
                        });
                    }
                } catch (omdbError) {
                    console.error('OMDB Fallback Error:', omdbError.message);
                }
            }
            // If both fail or OMDB not configured, send the original TMDB error or a generic one
            res.status(500).json({
                message: 'Error fetching data. Neither TMDB nor OMDB could fulfill the request.',
                details: tmdbError ? 'TMDB failed. OMDB fallback also failed or not available.' : 'TMDB failed.',
                fallback_warning: tmdbError && OMDB_API_KEY ? "TMDB might be inaccessible. Consider connecting to a VPN for full functionality." : undefined
            });
        });

        // Proxy for TMDB TV Season Details
        app.get('/api/tmdb/tv/:id/season/:season_number', async (req, res) => {
            const { id, season_number } = req.params;

            try {
                const url = `${TMDB_BASE_URL}/tv/${id}/season/${season_number}?api_key=${TMDB_API_KEY}`;
                const response = await axios.get(url);
                res.json(response.data);
            } catch (error) {
                console.error('TMDB API Error:', error.response ? error.response.data : error.message);
                res.status(500).json({ message: 'Error fetching data from TMDB.', details: error.message });
            }
        });

        // Proxy for TMDB Details
        app.get('/api/tmdb/:type/:id', async (req, res) => {
            const { type, id } = req.params;
            const { append_to_response, title } = req.query; // Added title to query parameters
        
            let tmdbError = false;
            let tmdbResponse = null;
        
            try {
                let url = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}`;
                if (append_to_response) {
                    url += `&append_to_response=${append_to_response}`;
                }
                tmdbResponse = await axios.get(url);
                if (tmdbResponse.data) {
                    return res.json(tmdbResponse.data);
                } else {
                    tmdbError = true;
                    console.warn(`TMDB details for ID ${id} (${type}) returned no data. Trying OMDB fallback.`);
                }
            } catch (error) {
                tmdbError = true;
                console.error('TMDB API Error:', error.response ? error.response.data : error.message);
                console.warn(`TMDB details lookup failed for ID ${id} (${type}). Trying OMDB fallback.`);
            }
        
            // OMDB Fallback for details
            if (tmdbError && OMDB_API_KEY && title) {
                try {
                    const omdbData = await fetchOmdbData(title, type);
                    if (omdbData) {
                        // If omdbData is a search result, try to get details for the first one
                        if (omdbData.results && omdbData.results.length > 0) {
                            const detailedOmdbData = await fetchOmdbData(omdbData.results[0].id, type); // Fetch by IMDb ID
                            if (detailedOmdbData) {
                                res.header('X-Fallback-API', 'OMDB');
                                return res.json({
                                    ...detailedOmdbData,
                                    fallback_warning: "TMDB might be inaccessible. Consider connecting to a VPN for full functionality."
                                });
                            }
                        } else if (omdbData.id) { // If it's already a detailed response
                            res.header('X-Fallback-API', 'OMDB');
                            return res.json({
                                ...omdbData,
                                fallback_warning: "TMDB might be inaccessible. Consider connecting to a VPN for full functionality."
                            });
                        }
                    }
                } catch (omdbError) {
                    console.error('OMDB Fallback Error:', omdbError.message);
                }
            }
        
            // If both fail or OMDB not configured/no title, send the original TMDB error or a generic one
            res.status(500).json({
                message: 'Error fetching data. Neither TMDB nor OMDB could fulfill the request.',
                details: tmdbError ? 'TMDB failed. OMDB fallback also failed or not available.' : 'TMDB failed.',
                fallback_warning: tmdbError && OMDB_API_KEY ? "TMDB might be inaccessible. Consider connecting to a VPN for full functionality." : undefined
            });
        });
        
        // Spotify API Token Management
        let spotifyAccessToken = null;
        let spotifyTokenExpiry = 0;

        async function getSpotifyToken() {
            if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
                return spotifyAccessToken;
            }

            const clientId = process.env.SPOTIFY_CLIENT_ID;
            const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

            if (!clientId || !clientSecret) {
                console.error("Spotify Client ID or Secret missing");
                return null;
            }

            try {
                const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                const response = await axios.post('https://accounts.spotify.com/api/token', 
                    'grant_type=client_credentials', 
                    {
                        headers: {
                            'Authorization': `Basic ${authString}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                spotifyAccessToken = response.data.access_token;
                spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer
                return spotifyAccessToken;
            } catch (error) {
                console.error("Failed to get Spotify token:", error.message);
                return null;
            }
        }

        // Proxy for Spotify Search
        app.get('/api/spotify/search', async (req, res) => {
            const { q, type = 'track', limit = 1 } = req.query;
            if (!q) return res.status(400).json({ message: 'Query is required' });

            const token = await getSpotifyToken();
            if (!token) return res.status(500).json({ message: 'Spotify authentication failed' });

            try {
                const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                res.json(response.data);
            } catch (error) {
                console.error("Spotify search failed:", error.message);
                res.status(500).json({ message: 'Spotify search failed' });
            }
        });

        // Proxy for Spotify Artist
        app.get('/api/spotify/artist/:id', async (req, res) => {
            const { id } = req.params;
            const token = await getSpotifyToken();
            if (!token) return res.status(500).json({ message: 'Spotify authentication failed' });

            try {
                const response = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                res.json(response.data);
            } catch (error) {
                res.status(500).json({ message: 'Spotify artist fetch failed' });
            }
        });

        // Proxy for Spotify Album
        app.get('/api/spotify/album/:id', async (req, res) => {
            const { id } = req.params;
            const token = await getSpotifyToken();
            if (!token) return res.status(500).json({ message: 'Spotify authentication failed' });

            try {
                const response = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                res.json(response.data);
            } catch (error) {
                res.status(500).json({ message: 'Spotify album fetch failed' });
            }
        });

        // Admin Password Verification Endpoint
        app.post('/api/admin/verify-password', async (req, res) => {
            const { password } = req.body;
            if (password === WISHLIST_PASSWORD) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        });

        // --- Recommendation Endpoints ---
        app.get('/api/recommendations', async (req, res) => {
            try {
                const recommendations = await db.collection('recommendations').find({}).sort({ timestamp: -1 }).toArray();
                res.json(recommendations);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch recommendations.', details: error.message });
            }
        });
        
        app.post('/api/recommendations', async (req, res) => {
            try {
                const { title, ...otherDetails } = req.body;
        
                if (!title) {
                    return res.status(400).json({ message: 'Book title is required.' });
                }
        
                // Check if a book with the same title already exists
                const existingRecommendation = await db.collection('recommendations').findOne({ title: title });
        
                if (existingRecommendation) {
                    return res.status(409).json({ message: 'This book has already been recommended.' });
                }
        
                const recommendation = {
                    title,
                    ...otherDetails,
                    timestamp: new Date()
                };
        
                const result = await db.collection('recommendations').insertOne(recommendation);
                res.status(201).json(result);
            } catch (error) {
                res.status(500).json({ message: 'Failed to add recommendation.', details: error.message });
            }
        });
        
// Art Gallery Recommendation Endpoint — emails a visitor's art recommendation.
app.post('/api/art-recommendation', async (req, res) => {
    const { recommendation, name } = req.body;

    if (!recommendation || !recommendation.trim()) {
        return res.status(400).json({ message: 'Recommendation text is required.' });
    }

    const fromName = (name && name.trim()) ? name.trim() : 'Anonymous visitor';

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `New Art Recommendation from ${fromName}`,
            html: `
                <p><strong>From:</strong> ${fromName}</p>
                <p><strong>Recommendation:</strong></p>
                <p>${recommendation}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Recommendation sent successfully!' });
    } catch (error) {
        console.error('Error sending art recommendation email:', error);
        res.status(500).json({ message: 'Failed to send recommendation.', details: error.message });
    }
});

// Contact Form Submission Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: process.env.EMAIL_TO,     // Recipient address (your email)
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending contact form email:', error);
        res.status(500).json({ message: 'Failed to send message.', details: error.message });
    }
});

        // --- Start the Server ---
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
        
        } catch (err) {
            console.error("Failed to connect to MongoDB", err);
            process.exit(1);
        }
        }
        
        run().catch(console.dir);

