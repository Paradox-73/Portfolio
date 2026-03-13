lucide.createIcons();

// --- STATE ---
let topArtistsData = [];
let myCollection = [];
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
    // Load Top Artists
    Papa.parse("../data/spotify_top_artists.csv", {
        download: true,
        header: true,
        complete: async function(results) {
            const rows = results.data.filter(row => row['Artist Name']).slice(0, 5);
            topArtistsData = await Promise.all(rows.map(async (row) => {
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
            renderPolaroids();
        }
    });

    // Load Saved Albums
    Papa.parse("../data/spotify_saved_albums.csv", {
        download: true,
        header: true,
        complete: async function(results) {
            const rows = results.data.filter(row => row['Album Name']).slice(0, 15);
            myCollection = await Promise.all(rows.map(async (row, i) => {
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
            buildCrateDOM();
        }
    });
}

function renderPolaroids() {
    const artistCol = document.getElementById('artists-col');
    const lyricCol = document.getElementById('lyrics-col');
    if (!artistCol || !lyricCol) return;

    artistCol.innerHTML = '';
    topArtistsData.forEach(item => {
        const el = document.createElement('div');
        el.className = 'polaroid w-28 xl:w-36';
        el.innerHTML = `
            <a href="${item.spotify_url}" target="_blank">
                <img src="${item.image}" class="w-full aspect-square object-cover grayscale mb-2 border border-black/10">
            </a>
            <p class="handwriting text-lg text-center text-black font-bold">${item.artist}</p>
        `;
        artistCol.appendChild(el);
    });

    const defaultLyrics = [
        { title: "COLLECTIVE", lyric: "Music is the wine that fills the cup of silence." },
        { title: "RHYTHM", lyric: "Life is one grand, sweet song, so just start the music." },
        { title: "HARMONY", lyric: "Where words fail, music speaks." },
        { title: "VIBE", lyric: "One good thing about music, when it hits you, you feel no pain." }
    ];

    lyricCol.innerHTML = '';
    defaultLyrics.forEach(item => {
        const el = document.createElement('div');
        el.className = 'polaroid w-36 xl:w-44';
        el.innerHTML = `
            <div class="w-full aspect-square bg-[#f8f5ee] flex items-center justify-center p-4 mb-2 border border-black/5 shadow-inner">
                <p class="handwriting text-sm xl:text-lg leading-tight text-black/80 text-center">"${item.lyric}"</p>
            </div>
            <p class="typewriter text-[9px] text-center text-black/40 font-bold tracking-widest">${item.title}</p>
        `;
        lyricCol.appendChild(el);
    });
}

// --- FLAWLESS PARALLEL CRATE DIGGING LOGIC ---
function buildCrateDOM() {
    if (!crate) return;
    crate.innerHTML = '<div class="crate-back"></div><div class="crate-front"><div class="crate-label">COLLECTION</div></div>';
    
    myCollection.forEach((record, i) => {
        const el = document.createElement('div');
        el.className = 'crate-record border border-black/40 bg-neutral-900';
        el.innerHTML = `<img src="${record.cover}" class="w-full h-full object-cover pointer-events-none">`;
        
        el.onclick = () => {
            if(i !== crateIndex) {
                crateIndex = i;
                updateCrateTransforms();
            }
            selectFromCrate(record);
        };
        
        crate.appendChild(el);
    });
    updateCrateTransforms();
}

function updateCrateTransforms() {
    const records = crate.querySelectorAll('.crate-record');
    records.forEach((el, i) => {
        if (i === crateIndex) {
            gsap.to(el, { z: 20, y: -240, rotationX: 0, rotationZ: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" });
            el.style.zIndex = 100;
        } 
        else if (i < crateIndex) {
            gsap.to(el, { z: 80 - ((crateIndex - i) * 2), y: 0, rotationX: -15, rotationZ: (i % 2 === 0 ? 1 : -1) * 1.5, opacity: 1, duration: 0.4, ease: "power2.out" });
            el.style.zIndex = 60 + i; 
        } 
        else {
            const pos = i - crateIndex;
            gsap.to(el, { z: -20 - (pos * 12), y: 0, rotationX: 12, rotationZ: (pos % 2 === 0 ? 1 : -1) * 0.4, opacity: 1, duration: 0.4, ease: "power2.out" });
            el.style.zIndex = 40 - pos;
        }
    });
}

// --- PLAYBACK SEQUENCE LOGIC ---
async function selectFromCrate(record) {
    if (currentRecord && record.id === currentRecord.id && isPlaying) return; 

    // Fetch track preview if available
    const info = await fetchSpotifyImage(`${record.title} ${record.artist}`, 'track');
    record.preview_url = info.preview_url;

    if (isPlaying) {
        stopPlayback(() => { swapVinylAndPlay(record); });
    } else {
        swapVinylAndPlay(record);
    }
}

function swapVinylAndPlay(record) {
    currentRecord = record;
    vinyl.style.backgroundImage = `url(${record.cover})`;
    
    // Add Spotify link and title/artist info
    let infoDisplay = document.getElementById('album-info');
    if (!infoDisplay) {
        infoDisplay = document.createElement('div');
        infoDisplay.id = 'album-info';
        infoDisplay.className = 'mt-8 text-center';
        vinyl.closest('.turntable-base').after(infoDisplay);
    }
    infoDisplay.innerHTML = `
        <h2 class="text-xl font-bold">${record.title}</h2>
        <p class="handwriting text-lg">${record.artist}</p>
        <a href="${record.spotify_url}" target="_blank" class="spotify-link justify-center">
            <i class="fa-brands fa-spotify"></i> View on Spotify
        </a>
    `;

    startPlayback();
}

function startPlayback() {
    isPlaying = true;
    
    gsap.fromTo(vinyl, { opacity: 0, scale: 0.9, y: -40, rotation: 0 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power2.out" });
    gsap.to(tonearm, { rotation: 12, duration: 0.8, delay: 0.8, ease: "power2.out" });

    if (!spinTween) {
        spinTween = gsap.to(vinyl, { rotation: 360, duration: 2.5, repeat: -1, ease: "none", paused: true });
    }
    spinTween.progress(0);
    setTimeout(() => spinTween.play(), 1600);

    // Audio preview
    if (currentRecord.preview_url) {
        audioPreview.src = currentRecord.preview_url;
        setTimeout(() => audioPreview.play(), 1600);
    }
}

function stopPlayback(onCompleteCallback) {
    isPlaying = false;
    audioPreview.pause();
    gsap.to(tonearm, { rotation: -25, duration: 0.6, ease: "power2.in" });

    if(spinTween) spinTween.pause();

    gsap.to(vinyl, {
        opacity: 0, scale: 0.9, y: 40, duration: 0.6, delay: 0.4, ease: "power2.in",
        onComplete: () => {
            if(onCompleteCallback) onCompleteCallback();
        }
    });
}

// --- HOVER, SCROLL & SWIPE LOGIC ---
if (crateScene) {
    crateScene.addEventListener('wheel', (e) => {
        e.preventDefault(); 
        if (isCrateAnimating) return;
        
        if (e.deltaY > 5 && crateIndex < myCollection.length - 1) { 
            isCrateAnimating = true;
            crateIndex++;
            updateCrateTransforms();
            setTimeout(() => isCrateAnimating = false, 200);
        } else if (e.deltaY < -5 && crateIndex > 0) { 
            isCrateAnimating = true;
            crateIndex--;
            updateCrateTransforms();
            setTimeout(() => isCrateAnimating = false, 200);
        }
    }, { passive: false });

    let touchStartY = 0;
    crateScene.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: false });
    crateScene.addEventListener('touchmove', e => { e.preventDefault(); }, { passive: false });
    crateScene.addEventListener('touchend', e => {
        let touchEndY = e.changedTouches[0].clientY;
        let diff = touchStartY - touchEndY;
        
        if (isCrateAnimating) return;

        if (diff > 40 && crateIndex < myCollection.length - 1) {
            isCrateAnimating = true;
            crateIndex++;
            updateCrateTransforms();
            setTimeout(() => isCrateAnimating = false, 200);
        } else if (diff < -40 && crateIndex > 0) {
            isCrateAnimating = true;
            crateIndex--;
            updateCrateTransforms();
            setTimeout(() => isCrateAnimating = false, 200);
        }
    });
}

// --- INIT ---
function init() {
    loadMusicData();
}

init();
