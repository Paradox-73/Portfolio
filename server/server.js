// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios'); // We will use this later

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Allow server to accept JSON data

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

        // --- API Endpoints ---
        // Each endpoint fetches data from its corresponding MongoDB collection.

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

        app.get('/api/games', async (req, res) => {
            const data = await db.collection('games').find({}).toArray();
            res.json(data);
        });

        app.get('/api/works', async (req, res) => {
            const data = await db.collection('works').find({}).toArray();
            res.json(data);
        });

        // New Spotify Music Endpoints
        app.get('/api/music/tracks', async (req, res) => {
            try {
                // Assuming collection name 'spotify_top_tracks' and fields like 'Track Name', 'Artist(s)', 'Album Name', 'Image_URL', 'Preview_URL'
                const data = await db.collection('music_tracks').find({}).toArray();
                const formattedData = data.map(item => ({
                    Track: item['Track Name'],
                    Artist: item['Artist(s)'],
                    Album: item['Album Name'],
                    Image_URL: item.Image_URL, // Assuming this field exists after upload
                    Preview_URL: item.Preview_URL // Assuming this field exists after upload
                }));
                res.json(formattedData);
            } catch (error) {
                console.error("Failed to fetch music tracks:", error);
                res.status(500).json({ message: 'Failed to fetch music tracks.', details: error.message });
            }
        });

        app.get('/api/music/artists', async (req, res) => {
            try {
                // Assuming collection name 'spotify_top_artists' and fields like 'Artist Name', 'Image_URL'
                const data = await db.collection('music_artists').find({}).toArray();
                const formattedData = data.map(item => ({
                    Artist: item['Artist Name'],
                    Image_URL: item.Image_URL // Assuming this field exists after upload
                }));
                res.json(formattedData);
            } catch (error) {
                console.error("Failed to fetch music artists:", error);
                res.status(500).json({ message: 'Failed to fetch music artists.', details: error.message });
            }
        });

        app.get('/api/music/albums', async (req, res) => {
            try {
                // Assuming collection name 'spotify_saved_albums' and fields like 'Album Name', 'Artist(s)', 'Image_URL'
                const data = await db.collection('music_albums').find({}).toArray();
                const formattedData = data.map(item => ({
                    Album: item['Album Name'],
                    Artist: item['Artist(s)'],
                    Image_URL: item.Image_URL // Assuming this field exists after upload
                }));
                res.json(formattedData);
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

        if (!TMDB_API_KEY) {
            console.error('FATAL ERROR: TMDB_API_KEY is not defined in the .env file.');
            process.exit(1);
        }

        if (!OMDB_API_KEY) {
            console.warn('WARNING: OMDB_API_KEY is not defined in the .env file. OMDB fallback will not be available.');
            // Do not exit, just warn, as TMDB is primary.
        }

        const WISHLIST_PASSWORD = process.env.WISHLIST_PASSWORD;
        if (!WISHLIST_PASSWORD) {
            console.error('FATAL ERROR: WISHLIST_PASSWORD is not defined in the .env file.');
            process.exit(1);
        }

        // Helper function to fetch data from OMDB and transform it to resemble TMDB format
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

