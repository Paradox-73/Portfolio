lucide.createIcons();

// --- STATE ---
let topTracksData = [];
let rawTracksData = []; 
let topArtistsData = [];
let rawArtistsData = []; 
let myCollection = [];
let rawCollectionData = []; 
let currentRecord = null;
let isPlaying = false;
let spinTween; 
let crateIndex = 0; 
let isCrateAnimating = false;
let audioPreview = new Audio();

// --- DOM Elements ---
const crate = document.getElementById('crate');
const crateScene = document.getElementById('crate-scene');
const vinyl = document.getElementById('active-vinyl');
const tonearm = document.getElementById('tonearm');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const sortTracksSelect = document.getElementById('sort-tracks');
const sortArtistsSelect = document.getElementById('sort-artists');
const sortAlbumsSelect = document.getElementById('sort-albums');
const turntableContainer = document.getElementById('turntable-container');
const turntableDisplay = document.getElementById('turntable-display');
const displayTitle = document.getElementById('display-title');
const displayArtist = document.getElementById('display-artist');
const ejectBtn = document.getElementById('eject-btn');

// --- Turntable Control ---
vinyl.onclick = () => {
    if (!currentRecord) return;
    if (isPlaying) {
        pausePlayback();
    } else {
        resumePlayback();
    }
};

if (ejectBtn) {
    ejectBtn.onclick = (e) => {
        e.stopPropagation();
        ejectVinyl();
    };
}

function pausePlayback() {
    isPlaying = false;
    audioPreview.pause();
    gsap.to(tonearm, { rotation: -10, duration: 0.6, ease: "power2.inOut" });
    if(spinTween) spinTween.pause();
    updatePlayOverlay();
}

function resumePlayback() {
    isPlaying = true;
    if (currentRecord.preview_url) audioPreview.play();
    gsap.to(tonearm, { rotation: 12, duration: 0.6, ease: "power2.inOut" });
    if(spinTween) spinTween.play();
    updatePlayOverlay();
}

function updatePlayOverlay() {
    const overlay = vinyl.querySelector('.play-overlay i');
    if (overlay) {
        overlay.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
        lucide.createIcons();
    }
}

function ejectVinyl() {
    if (!currentRecord) return;
    
    stopPlayback(() => {
        currentRecord = null;
        vinyl.style.backgroundImage = 'none';
        vinyl.style.opacity = 0;
        
        // Reset Turntable Position
        turntableContainer.classList.remove('turntable-active');
        
        // Hide Integrated Display
        turntableDisplay.style.opacity = 0;
        
        // Hide Eject Button
        ejectBtn.style.opacity = 0;
        ejectBtn.style.pointerEvents = 'none';
    });
}

// --- Navigation Logic ---
navToggle.onclick = (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('active');
};
document.onclick = () => navMenu.classList.remove('active');

// --- DATA Loading ---
async function fetchSpotifyImage(query, type) {
    try {
        const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=1`);
        const data = await response.json();
        if (type === 'artist') {
            return {
                url: data.artists.items[0]?.images[0]?.url || 'https://via.placeholder.com/400',
                spotify_url: data.artists.items[0]?.external_urls.spotify
            };
        } else if (type === 'album') {
            return {
                url: data.albums.items[0]?.images[0]?.url || 'https://via.placeholder.com/800',
                spotify_url: data.albums.items[0]?.external_urls.spotify
            };
        } else if (type === 'track') {
            return {
                url: data.tracks.items[0]?.album.images[0]?.url || 'https://via.placeholder.com/800',
                preview_url: data.tracks.items[0]?.preview_url,
                spotify_url: data.tracks.items[0]?.external_urls.spotify
            };
        }
    } catch (e) {
        console.error("Spotify fetch failed:", e);
        return { url: 'https://via.placeholder.com/400' };
    }
}

function loadMusicData() {
    Papa.parse("../data/spotify_top_tracks.csv", {
        download: true,
        header: true,
        complete: async function(results) {
            const rows = results.data.filter(row => row['Track Name']).slice(0, 10);
            rawTracksData = await Promise.all(rows.map(async (row) => {
                let imageUrl = row['Image_URL'];
                let trackUrl = row['Track URL'];
                if (!imageUrl) {
                    const info = await fetchSpotifyImage(`${row['Track Name']} ${row['Artist(s)']}`, 'track');
                    imageUrl = info.url;
                    if (!trackUrl) trackUrl = info.spotify_url;
                }
                return {
                    name: row['Track Name'],
                    artist: row['Artist(s)'],
                    album: row['Album Name'],
                    popularity: parseInt(row['Popularity']) || 0,
                    image: imageUrl,
                    track_url: trackUrl || `https://open.spotify.com/search/${encodeURIComponent(row['Track Name'])}`
                };
            }));
            topTracksData = [...rawTracksData];
            renderTracksQueue();
        }
    });

    Papa.parse("../data/spotify_top_artists.csv", {
        download: true,
        header: true,
        complete: async function(results) {
            const rows = results.data.filter(row => row['Artist Name']).slice(0, 10);
            rawArtistsData = await Promise.all(rows.map(async (row) => {
                let imageUrl = row['Image_URL'];
                let spotifyUrl = row['Artist URL'];
                if (!imageUrl) {
                    const info = await fetchSpotifyImage(row['Artist Name'], 'artist');
                    imageUrl = info.url;
                    if (!spotifyUrl) spotifyUrl = info.spotify_url;
                }
                return {
                    artist: row['Artist Name'],
                    image: imageUrl,
                    spotify_url: spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(row['Artist Name'])}`
                };
            }));
            topArtistsData = [...rawArtistsData];
            renderArtistsGrid();
        }
    });

    Papa.parse("../data/spotify_saved_albums.csv", {
        download: true,
        header: true,
        complete: async function(results) {
            const rows = results.data.filter(row => row['Album Name']);
            rawCollectionData = await Promise.all(rows.map(async (row, i) => {
                let imageUrl = row['Image_URL'];
                let spotifyUrl = row['Album URL'];
                if (!imageUrl) {
                    const info = await fetchSpotifyImage(`${row['Album Name']} ${row['Artist(s)']}`, 'album');
                    imageUrl = info.url;
                    if (!spotifyUrl) spotifyUrl = info.spotify_url;
                }
                return {
                    id: i,
                    title: row['Album Name'],
                    artist: row['Artist(s)'],
                    cover: imageUrl,
                    spotify_url: spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(row['Album Name'])}`
                };
            }));
            myCollection = [...rawCollectionData];
            buildCrateDOM();
        }
    });
}

function renderTracksQueue() {
    const queue = document.getElementById('tracks-queue');
    if (!queue) return;
    queue.innerHTML = '';
    topTracksData.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'track-bar group';
        el.innerHTML = `
            <span class="text-xs typewriter opacity-20 w-4">${String(i + 1).padStart(2, '0')}</span>
            <img src="${item.image}" class="track-bar-img">
            <div class="track-bar-info">
                <p class="font-bold text-[#f4ebd8] truncate text-sm">${item.name}</p>
                <p class="handwriting text-xs text-[#a89f91] truncate">${item.artist}</p>
            </div>
            <div class="flex items-center gap-4">
                <div class="hidden md:block w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-[#1DB954] opacity-50" style="width: ${item.popularity}%"></div>
                </div>
                <a href="${item.track_url}" target="_blank" class="p-2 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fa-brands fa-spotify text-lg"></i>
                </a>
            </div>
        `;
        queue.appendChild(el);
    });
}

function renderArtistsGrid() {
    const grid = document.getElementById('artists-grid');
    if (!grid) return;
    grid.innerHTML = '';
    topArtistsData.forEach(item => {
        const el = document.createElement('div');
        el.className = 'group flex flex-col items-center text-center space-y-3 p-4 hover:bg-white/5 rounded-lg transition-all duration-300 pointer-events-auto';
        el.innerHTML = `
            <a href="${item.spotify_url}" target="_blank" class="block w-full">
                <div class="relative w-full aspect-square overflow-hidden rounded-full border-2 border-transparent group-hover:border-[#1DB954] transition-colors">
                    <img src="${item.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <i class="fa-brands fa-spotify text-3xl text-[#1DB954]"></i>
                    </div>
                </div>
            </a>
            <div class="w-full">
                <p class="font-bold text-[#f4ebd8] group-hover:text-[#1DB954] transition-colors truncate w-full px-2">${item.artist}</p>
                <p class="typewriter text-[10px] text-[#a89f91] opacity-60">Artist</p>
            </div>
        `;
        grid.appendChild(el);
    });
}

// --- Sorting Logic ---
if (sortTracksSelect) {
    sortTracksSelect.onchange = (e) => {
        const val = e.target.value;
        if (val === 'name') topTracksData.sort((a, b) => a.name.localeCompare(b.name));
        else if (val === 'popularity') topTracksData.sort((a, b) => b.popularity - a.popularity);
        else topTracksData = [...rawTracksData];
        renderTracksQueue();
    };
}

if (sortArtistsSelect) {
    sortArtistsSelect.onchange = (e) => {
        const val = e.target.value;
        if (val === 'name') topArtistsData.sort((a, b) => a.artist.localeCompare(b.artist));
        else topArtistsData = [...rawArtistsData];
        renderArtistsGrid();
    };
}

if (sortAlbumsSelect) {
    sortAlbumsSelect.onchange = (e) => {
        const val = e.target.value;
        if (val === 'title') myCollection.sort((a, b) => a.title.localeCompare(b.title));
        else if (val === 'artist') myCollection.sort((a, b) => a.artist.localeCompare(b.artist));
        else myCollection = [...rawCollectionData];
        renderAlbumGrid();
        buildCrateDOM(); 
    };
}

// --- CRATE LOGIC ---
function buildCrateDOM() {
    if (!crate) return;
    crate.innerHTML = `
        <div class="crate-back"></div>
        <div class="crate-front">
            <div id="collection-trigger" class="crate-label cursor-pointer hover:scale-110 transition-transform">COLLECTION</div>
            <div id="crate-active-title" class="absolute bottom-4 w-full text-center typewriter text-[10px] text-[#f4ebd8] opacity-60 px-2 truncate"></div>
        </div>
    `;
    const newTrigger = document.getElementById('collection-trigger');
    if (newTrigger) newTrigger.onclick = (e) => { e.stopPropagation(); openCollectionOverlay(); };

    myCollection.slice(0, 50).forEach((record, i) => {
        const el = document.createElement('div');
        el.className = 'crate-record border border-black/40 bg-neutral-900';
        el.innerHTML = `<img src="${record.cover}" class="w-full h-full object-cover pointer-events-none">`;
        el.onclick = () => {
            if(i !== crateIndex) { crateIndex = i; updateCrateTransforms(); }
            selectFromCrate(record);
        };
        crate.appendChild(el);
    });
    updateCrateTransforms();
}

function updateCrateTransforms() {
    const records = crate.querySelectorAll('.crate-record');
    const titleDisplay = document.getElementById('crate-active-title');
    records.forEach((el, i) => {
        if (i === crateIndex) {
            gsap.to(el, { z: 20, y: -140, scale: 1, rotationX: 0, rotationZ: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" });
            el.style.zIndex = 100;
            if (titleDisplay && myCollection[i]) titleDisplay.innerText = myCollection[i].title;
        } 
        else if (i < crateIndex) {
            const dist = crateIndex - i;
            gsap.to(el, { z: 20 - (dist * 2), y: 40, scale: 0.75, rotationX: -20, rotationZ: (i % 2 === 0 ? 1 : -1) * 2, opacity: 1, duration: 0.4, ease: "power2.out" });
            el.style.zIndex = 80 + i; 
        } 
        else {
            const pos = i - crateIndex;
            gsap.to(el, { z: -30 - (pos * 15), y: 0, scale: 0.95, rotationX: 15, rotationZ: (pos % 2 === 0 ? 1 : -1) * 0.5, opacity: 1, duration: 0.4, ease: "power2.out" });
            el.style.zIndex = 40 - pos;
        }
    });
}

// --- PLAYBACK LOGIC ---
async function selectFromCrate(record) {
    if (currentRecord && record.id === currentRecord.id) {
        if (!isPlaying) resumePlayback();
        return;
    }
    const info = await fetchSpotifyImage(`${record.title} ${record.artist}`, 'track');
    record.preview_url = info.preview_url;
    if (isPlaying || audioPreview.src) stopPlayback(() => { swapVinylAndPlay(record); });
    else swapVinylAndPlay(record);
}

function swapVinylAndPlay(record) {
    currentRecord = record;
    vinyl.style.backgroundImage = `url(${record.cover})`;
    
    // Update Integrated Display
    displayTitle.innerText = record.title;
    displayArtist.innerText = record.artist;
    turntableDisplay.style.opacity = 1;

    // Turntable Shift Animation
    turntableContainer.classList.add('turntable-active');
    
    // Show Eject Button
    ejectBtn.style.opacity = 1;
    ejectBtn.style.pointerEvents = 'auto';

    startPlayback();
}

function startPlayback() {
    isPlaying = true;
    updatePlayOverlay();
    gsap.fromTo(vinyl, { opacity: 0, scale: 0.9, y: -40, rotation: 0 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power2.out" });
    gsap.to(tonearm, { rotation: 12, duration: 0.8, delay: 0.8, ease: "power2.out" });
    if (!spinTween) spinTween = gsap.to(vinyl, { rotation: 360, duration: 2.5, repeat: -1, ease: "none", paused: true });
    spinTween.progress(0);
    setTimeout(() => spinTween.play(), 1600);
    if (currentRecord.preview_url) {
        audioPreview.src = currentRecord.preview_url;
        setTimeout(() => { if (isPlaying) audioPreview.play(); }, 1600);
    }
}

function stopPlayback(onCompleteCallback) {
    isPlaying = false;
    audioPreview.pause();
    audioPreview.src = '';
    gsap.to(tonearm, { rotation: -25, duration: 0.6, ease: "power2.in" });
    if(spinTween) spinTween.pause();
    gsap.to(vinyl, { opacity: 0, scale: 0.9, y: 40, duration: 0.6, delay: 0.4, ease: "power2.in", onComplete: () => { if(onCompleteCallback) onCompleteCallback(); } });
}

// --- SCROLL & SWIPE ---
if (crateScene) {
    crateScene.addEventListener('wheel', (e) => {
        e.preventDefault(); 
        if (isCrateAnimating) return;
        if (e.deltaY > 5 && crateIndex < myCollection.length - 1) { isCrateAnimating = true; crateIndex++; updateCrateTransforms(); setTimeout(() => isCrateAnimating = false, 200); } 
        else if (e.deltaY < -5 && crateIndex > 0) { isCrateAnimating = true; crateIndex--; updateCrateTransforms(); setTimeout(() => isCrateAnimating = false, 200); }
    }, { passive: false });
}

// --- OVERLAY ---
const collectionOverlay = document.getElementById('collection-overlay');
const closeCollectionBtn = document.getElementById('close-collection');
const albumGrid = document.getElementById('album-grid');
if (closeCollectionBtn) closeCollectionBtn.onclick = closeCollectionOverlay;

function openCollectionOverlay() {
    if (!albumGrid.children.length) renderAlbumGrid();
    document.body.style.overflow = 'hidden';
    collectionOverlay.classList.remove('hidden');
    gsap.fromTo(collectionOverlay, { opacity: 0, backdropFilter: "blur(0px)" }, { opacity: 1, backdropFilter: "blur(10px)", duration: 0.5, ease: "power2.out" });
}

function closeCollectionOverlay() {
    gsap.to(collectionOverlay, { opacity: 0, backdropFilter: "blur(0px)", duration: 0.4, ease: "power2.in", onComplete: () => { collectionOverlay.classList.add('hidden'); document.body.style.overflow = ''; } });
}

function renderAlbumGrid() {
    if (!myCollection.length) return;
    albumGrid.innerHTML = '';
    myCollection.forEach((record, i) => {
        const tile = document.createElement('div');
        tile.className = 'album-tile';
        tile.innerHTML = `<img src="${record.cover}" alt="${record.title}" loading="lazy"><div class="album-info-overlay"><p class="album-info-title">${record.title}</p><p class="album-info-artist">${record.artist}</p></div>`;
        tile.onclick = () => { crateIndex = i; updateCrateTransforms(); selectFromCrate(record); closeCollectionOverlay(); };
        albumGrid.appendChild(tile);
    });
}

function init() { loadMusicData(); }
init();
