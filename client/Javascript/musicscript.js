document.addEventListener('DOMContentLoaded', () => {
    // --- BASE SETUP ---
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((navItem, i) => {
        navItem.addEventListener("click", () => {
            navItems.forEach((item, j) => {
                item.className = "nav-item";
            });
            navItem.className = "nav-item active";
        });
    });

    const containers = document.querySelectorAll(".containers");
    containers.forEach((container) => {
        let isDragging = false, startX, scrollLeft;
        container.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });
        container.addEventListener("mouseup", () => isDragging = false);
        container.addEventListener("mouseleave", () => isDragging = false);
        container.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const step = (x - startX) * 0.6;
            container.scrollLeft = scrollLeft - step;
        });
    });

    var swiper = new Swiper(".swiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        speed: 600,
        slidesPerView: "auto",
        initialSlide: 2,
        coverflowEffect: {
            rotate: 10,
            stretch: 120,
            depth: 200,
            modifier: 1,
            slideShadows: false,
        },
        pagination: { el: ".swiper-pagination" },
    });


    // --- MUSIC PLAYER & DATA ---
    const progress = document.getElementById("progress");
    const song = document.getElementById("song");
    const controlIcon = document.getElementById("controlIcon");
    const playPauseButton = document.querySelector(".play-pause-btn");
    const forwardButton = document.querySelector(".controls button.forward");
    const backwardButton = document.querySelector(".controls button.backward");
    const rotatingImage = document.getElementById("rotatingImage");
    const songName = document.querySelector(".music-player h2");
    const artistName = document.querySelector(".music-player p");

    let songs = []; // Will be populated from API
    let currentSongIndex = 0;
    let rotating = false;
    let currentRotation = 0;
    let rotationInterval;

    // --- DATA FETCHING AND POPULATION ---

    async function loadMusicData() {
        try {
            const [tracksRes, artistsRes, albumsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/music/tracks`),
                fetch(`${API_BASE_URL}/api/music/artists`),
                fetch(`${API_BASE_URL}/api/music/albums`)
            ]);

            const tracks = await tracksRes.json();
            const artists = await artistsRes.json();
            const albums = await albumsRes.json();

            // Populate all sections
            if (tracks && tracks.length > 0) {
                initializePlayer(tracks);
                populateRecommendedSongs(tracks);
            }
            if (artists && artists.length > 0) {
                populateArtists(artists);
            }
            if (albums && albums.length > 0) {
                populateAlbums(albums);
            }

        } catch (error) {
            console.error("Failed to load music data:", error);
        }
    }

    function populateArtists(artists) {
        const container = document.querySelector('.artist-container');
        if (!container) return;
        container.innerHTML = ''; // Clear hardcoded artists
        artists.forEach(artist => {
            const artistEl = document.createElement('div');
            artistEl.className = 'artist';
            artistEl.innerHTML = `
                <img src="${artist.Image_URL || 'assets/profile.jpg'}" alt="${artist.Artist}">
                <p>${artist.Artist}</p>
            `;
            container.appendChild(artistEl);
        });
    }

    function populateAlbums(albums) {
        const container = document.querySelector('.album-container');
        if (!container) return;
        container.innerHTML = ''; // Clear hardcoded albums
        albums.forEach(album => {
            const albumEl = document.createElement('div');
            albumEl.className = 'album';
            albumEl.innerHTML = `
                <div class="album-frame">
                  <img src="${album.Image_URL || 'assets/nectar.png'}" alt="${album.Album}">
                </div>
                <div>
                  <h2>${album.Album}</h2>
                  <p>${album.Artist}</p>
                </div>
            `;
            container.appendChild(albumEl);
        });
    }

    function populateRecommendedSongs(tracks) {
        const container = document.querySelector('.song-container');
        if (!container) return;
        container.innerHTML = ''; // Clear hardcoded songs
        tracks.slice(0, 9).forEach(track => {
            const songEl = document.createElement('div');
            songEl.className = 'song';
            songEl.innerHTML = `
                <div class="song-img">
                  <img src="${track.Image_URL || 'assets/igor.jpg'}" alt="">
                  <div class="overlay"><i class="fa-solid fa-play"></i></div>
                </div>
                <div class="song-title">
                  <h2>${track.Track}</h2>
                  <p>${track.Artist}</p>
                </div>
                <span>${track.Duration || '3:00'}</span>
            `;
            container.appendChild(songEl);
        });
    }
    
    function initializePlayer(tracks) {
        songs = tracks.map(track => ({
            title: track.Track,
            name: track.Artist,
            source: track.Preview_URL, // IMPORTANT: Requires a valid audio URL
            cover: track.Image_URL
        })).filter(song => song.source); // Only include songs with a preview URL

        if (songs.length > 0) {
            updateSongInfo();
        } else {
            console.warn("No playable tracks found after filtering.");
        }
    }


    // --- PLAYER CONTROLS (Largely unchanged) ---

    function startRotation() {
        if (!rotating) {
            rotating = true;
            rotationInterval = setInterval(() => {
                currentRotation += 1;
                rotatingImage.style.transform = `rotate(${currentRotation}deg)`;
            }, 40);
        }
    }

    function pauseRotation() {
        clearInterval(rotationInterval);
        rotating = false;
    }

    function updateSongInfo() {
        if (!songs || songs.length === 0) return;
        songName.textContent = songs[currentSongIndex].title;
        artistName.textContent = songs[currentSongIndex].name;
        song.src = songs[currentSongIndex].source;
        rotatingImage.src = songs[currentSongIndex].cover;
    }

    song.addEventListener("loadedmetadata", () => {
        progress.max = song.duration;
        progress.value = song.currentTime;
    });

    song.addEventListener("ended", () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        updateSongInfo();
        playPause();
    });

    song.addEventListener("timeupdate", () => {
        if (!song.paused) {
            progress.value = song.currentTime;
        }
    });

    function playPause() {
        if (song.paused) {
            song.play();
            controlIcon.classList.add("fa-pause");
            controlIcon.classList.remove("fa-play");
            startRotation();
        } else {
            song.pause();
            controlIcon.classList.remove("fa-pause");
            controlIcon.classList.add("fa-play");
            pauseRotation();
        }
    }

    playPauseButton.addEventListener("click", playPause);

    progress.addEventListener("input", () => {
        song.currentTime = progress.value;
    });

    progress.addEventListener("change", () => {
        song.play();
        controlIcon.classList.add("fa-pause");
        controlIcon.classList.remove("fa-play");
        startRotation();
    });

    forwardButton.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        updateSongInfo();
        playPause();
    });

    backwardButton.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        updateSongInfo();
        playPause();
    });

    // --- INITIAL LOAD ---
    loadMusicData();
});

