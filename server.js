const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const app = express();

const client_id = '2ea5d386e3354b15b876e71dfc811a0c';
const client_secret = '36d0f54ddd474aa8856ba24fe124a2fe';
const redirect_uri = 'http://localhost:3000/callback';
const frontend_uri = 'http://localhost:3000';

app.use(cors());

app.get('/login', (req, res) => {
    const scope = 'user-read-recently-played user-top-read';
    const auth_url = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
    });
    res.redirect(auth_url);
});

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: client_id,
        client_secret: client_secret,
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    .then(response => {
        const access_token = response.data.access_token;
        res.redirect(`${frontend_uri}/#${querystring.stringify({ access_token })}`);
    })
    .catch(error => {
        res.send('Error during token exchange');
    });
});

app.get('/refresh_token', (req, res) => {
    const refresh_token = req.query.refresh_token;
    axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: client_id,
        client_secret: client_secret,
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    .then(response => {
        res.send({ access_token: response.data.access_token });
    })
    .catch(error => {
        res.send('Error during token refresh');
    });
});

app.get('/recently_played', (req, res) => {
    const access_token = req.query.access_token;
    axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    .then(response => {
        res.send(response.data);
    })
    .catch(error => {
        res.send('Error fetching recently played tracks');
    });
});

app.get('/top_artists', (req, res) => {
    const access_token = req.query.access_token;
    axios.get('https://api.spotify.com/v1/me/top/artists?limit=5', {
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    .then(response => {
        res.send(response.data);
    })
    .catch(error => {
        res.send('Error fetching top artists');
    });
});

app.get('/top_albums', (req, res) => {
    const access_token = req.query.access_token;
    axios.get('https://api.spotify.com/v1/me/albums?limit=5', {
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    .then(response => {
        res.send(response.data);
    })
    .catch(error => {
        res.send('Error fetching top albums');
    });
});

app.get('/top_podcasts', (req, res) => {
    const access_token = req.query.access_token;
    axios.get('https://api.spotify.com/v1/me/top/shows?limit=5', {
        headers: { 'Authorization': 'Bearer ' + access_token }
    })
    .then(response => {
        res.send(response.data);
    })
    .catch(error => {
        res.send('Error fetching top podcasts');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
