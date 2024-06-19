// auth.js
const clientId = "2ea5d386e3354b15b876e71dfc811a0c";
const clientSecret = '36d0f54ddd474aa8856ba24fe124a2fe';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const apiBaseEndpoint = 'https://api.spotify.com/v1';

// DOM elements
const profileImage = document.getElementById('profile-image');
const displayName = document.getElementById('display-name');
const genre = document.getElementById('genre');
const artists = document.getElementById('artists');
const albums = document.getElementById('albums');
const tracks = document.getElementById('tracks');
const recentlyPlayed = document.getElementById('recently-played');

// Get access token
async function getAccessToken() {
	const response = await fetch(tokenEndpoint, {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${btoa(`${clientID}:${clientSecret}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
	});

	const data = await response.json();
	return data.access_token;
}

// Get user profile
async function getUserProfile(accessToken) {
	const response = await fetch(`${apiBaseEndpoint}/me`, {
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});

	const data = await response.json();
	return data;
}

// Get top artists, albums, and tracks
async function getTopItems(accessToken) {
	const response = await fetch(`${apiBaseEndpoint}/me/top/artists?time_range=medium_term&limit=5`, {
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});

	const data = await response.json();
	displayTopItems(data.items, artists);

	const albumsResponse = await fetch(`${apiBaseEndpoint}/me/top/albums?time_range=medium_term&limit=5`, {
	headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});

	const albumsData = await albumsResponse.json();
	displayTopItems(albumsData.items, albums);

	const tracksResponse = await fetch(`${apiBaseEndpoint}/me/top/tracks?time_range=medium_term&limit=5`, {
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});

	const tracksData = await tracksResponse.json();
	displayTopItems(tracksData.items, tracks);
}

// Get recently played items
async function getRecentlyPlayedItems(accessToken) {
	const response = await fetch(`${apiBaseEndpoint}/me/player/recently-played?limit=5`, {
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});

	const data = await response.json();
	displayRecentlyPlayedItems(data.items, recentlyPlayed);
}

// Display top items
function displayTopItems(items, list) {
	items.forEach(item => {
		const li = document.createElement('li');
		li.innerHTML = `<img src="${item.images[0].url}" alt="${item.name}">
						<p>${item.name}</p>`;
		list.appendChild(li);
	});
}

// Display recently played items
function displayRecentlyPlayedItems(items, list) {
	items.forEach(item => {
		const li = document.createElement('li');
		li.innerHTML = `<p>${item.track.name} - ${item.track.artists[0].name}</p>`;
		list.appendChild(li);
	});
}

// Run the code
(async () => {
	const accessToken = await getAccessToken();
	const userProfile = await getUserProfile(accessToken);
	profileImage.src = userProfile.images[0].url;
	displayName.innerText = userProfile.display_name;
	genre.innerText = userProfile.genres[0];
	await getTopItems(accessToken);
	await getRecentlyPlayedItems(accessToken);
})();