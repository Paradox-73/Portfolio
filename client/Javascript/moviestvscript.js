        // Define startApp globally first
        window.startApp = async function() {
            console.log("Starting App..."); // Debug log
            const profileLayer = document.getElementById('profileLayer');
            const app = document.getElementById('app');

            if (profileLayer) profileLayer.classList.add('hidden');
            if (app) app.classList.remove('hidden');

            initSeenList();
            await initRecommendedList(); // Await this async function
            await loadDataFromAPI();     // Await this async function
            renderRecommendedRow();
        };

        window.toggleMobileMenu = () => {
            const navLinks = document.getElementById('mainNavLinks');
            navLinks.classList.toggle('active');
        };

        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000'
            : '';

        

                // const TMDB_API_KEY = "REMOVED";

                // const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

                const IMG_URL = 'https://image.tmdb.org/t/p/w500';

                const SEEN_STORAGE_KEY = 'matv_seen_list';

                const RECOMMENDED_STORAGE_KEY = 'matv_recommended_list';

        

                // --- Global State ---

                

                let currentUser = null;

                let seenList = new Set(); 

                let recommendedList = [];

                

                let allMovies = []; 

                let allShows = [];

                let allAnime = [];

                let currentGridItems = []; 

                let posterQueue = []; 

                let isFetchingPoster = false;
        
        // Billboard State
        const billboardQueue = [
            { id: 569094, type: 'movie' }, // Spider-Man
            { id: 61889, type: 'tv' },     // Daredevil
            { id: 240411, type: 'tv' },    // Dandadan
            { id: 22538, type: 'movie' },  // Scott Pilgrim
            { id: 27205, type: 'movie' }   // Inception
        ];
        let billboardIndex = 0;
        let ytPlayer = null;
        let billboardTimeout = null;
        let userMutePreference = true; // True for muted (initial state)
        let pendingRecommendation = null;
        let currentOpenItem = null;
        let actionAfterPassword = null;

        // --- Seen List Management ---
        function initSeenList() {
            try {
                const stored = localStorage.getItem(SEEN_STORAGE_KEY);
                if (stored) seenList = new Set(JSON.parse(stored));
            } catch (e) { console.error("Seen list error", e); seenList = new Set(); }
        }

        function saveSeenList() {
            localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(seenList)));
        }

        function isItemSeen(item) {
            return seenList.has(String(item.tmdb_id || item.id)) || !!(item.user_rating || item.my_rating);
        }

        function markItemSeen(item) {
            const id = String(item.tmdb_id || item.id);
            if (!seenList.has(id)) {
                seenList.add(id);
                saveSeenList();
                return true;
            }
            return false;
        }

        function removeSeenItem(item) {
            const id = String(item.tmdb_id || item.id);
            if (seenList.delete(id)) {
                saveSeenList();
                return true;
            }
            return false;
        }

        // --- Recommended List Management (API-based) ---
        async function initRecommendedList() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/recommendations`);
                recommendedList = await response.json();
                console.log("Fetched recommendations:", recommendedList);
            } catch (e) { 
                console.error("Failed to fetch recommendations:", e); 
                recommendedList = []; 
            }
        }



        function isItemRecommended(item) {
            const id = String(item.tmdb_id || item.id);
            return recommendedList.some(rec => rec.itemId === id);
        }

        function getRecommendation(item) {
            const id = String(item.tmdb_id || item.id);
            return recommendedList.find(rec => rec.itemId === id);
        }

        async function markItemRecommended(item, recommenderName) {
            const id = String(item.tmdb_id || item.id);
            if (isItemRecommended(item)) {
                return false;
            }

            const payload = {
                itemId: id,
                itemType: item.media_type || 'movie',
                title: item.title || item.name,
                itemDetails: {
                    poster_path: item.poster_path,
                    overview: item.overview,
                    release_date: item.release_date
                },
                recommender: recommenderName
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Failed to save recommendation');
                
                // Add to local list to refresh UI without a full refetch
                recommendedList.unshift(payload);
                renderRecommendedRow();
                return true;
            } catch (error) {
                console.error("Could not save recommendation:", error);
                return false;
            }
        }

        // --- Billboard Logic ---
        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube API Ready");
            loadBillboardItem(0); 
            updateBillboardNavIndicator();
        };

        async function loadBillboardItem(index) {
            billboardIndex = index;
            const item = billboardQueue[index];
            try {
                const data = await fetchTmdbData(`${item.type}/${item.id}`, { append_to_response: 'videos' });
                
                document.getElementById('bbTitle').innerText = data.title || data.name;
                document.getElementById('bbDesc').innerText = data.overview;
                document.getElementById('bbPlayBtn').onclick = () => openDetails(data);
                document.getElementById('bbInfoBtn').onclick = () => openDetails(data);

                const trailer = data.videos?.results?.find(v => v.site==='YouTube' && v.type==='Trailer');
                if(trailer) {
                    if(ytPlayer) {
                        ytPlayer.loadVideoById(trailer.key);
                        if (userMutePreference) ytPlayer.mute(); else ytPlayer.unMute();
                    } else {
                        createPlayer(trailer.key);
                    }
                }
                updateBillboardNavIndicator();
            } catch(e) { console.error("Billboard Load Error:", e); }
        }

        function createPlayer(videoId) {
            ytPlayer = new YT.Player('ytPlayer', {
                height: '100%', width: '100%', videoId: videoId,
                playerVars: { 'autoplay': 1, 'controls': 0, 'mute': (userMutePreference ? 1 : 0), 'rel': 0, 'modestbranding': 1, 'loop': 0 },
                events: {
                    'onReady': (e) => {
                        e.target.playVideo();
                        updateMuteIcon();
                    },
                    'onStateChange': (e) => {
                        if (e.data === YT.PlayerState.ENDED) nextBillboard();
                    }
                }
            });
        }

        function updateMuteIcon() {
            if (userMutePreference) {
                 document.getElementById('muteIcon').innerHTML = '<path d="M11 5L6 9H2V15H6L11 19V5z"></path><path d="M23 9L17 15"></path><path d="M17 9L23 15"></path>';
            } else {
                 document.getElementById('muteIcon').innerHTML = '<path d="M11 5L6 9H2V15H6L11 19V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 0 0 1 0 14.14"></path>';
            }
        }

        function nextBillboard() {
            clearTimeout(billboardTimeout);
            let nextIndex = (billboardIndex + 1) % billboardQueue.length;
            loadBillboardItem(nextIndex);
        }

        function prevBillboard() {
            clearTimeout(billboardTimeout);
            let prevIndex = (billboardIndex - 1 + billboardQueue.length) % billboardQueue.length;
            loadBillboardItem(prevIndex);
        }

        function updateBillboardNavIndicator() {
            document.querySelectorAll('.billboard-nav-indicator .nav-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === billboardIndex);
            });
        }
        
        // Auto-advance billboard
        billboardTimeout = setInterval(nextBillboard, 45000);

        document.addEventListener('keydown', (event) => {
            if (document.getElementById('detailModal').style.display === 'flex' || 
                document.getElementById('searchOverlay').classList.contains('active')) return;
            if (event.key === 'ArrowRight') { nextBillboard(); event.preventDefault(); }
            else if (event.key === 'ArrowLeft') { prevBillboard(); event.preventDefault(); }
        });

        // --- Data Loading & CSV ---
        async function fetchTmdbData(endpoint, queryParams = {}) {
            let baseUrl = `${API_BASE_URL}/api/tmdb/${endpoint}`;
            if (!API_BASE_URL) { // If API_BASE_URL is empty, prepend window.location.origin
                baseUrl = `${window.location.origin}/api/tmdb/${endpoint}`;
            }
            const url = new URL(baseUrl);
            for (const key in queryParams) {
                if (queryParams[key]) url.searchParams.append(key, queryParams[key]);
            }
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`Proxy API error for ${endpoint}: ${response.status}`);
            const data = await response.json();
            if (data.fallback_warning) {
                alert("Warning: " + data.fallback_warning);
            }
            return data;
        }

        async function loadDataFromAPI() {
            try {
                console.log("Starting to load data from API...");
                const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : '';
                const [moviesRes, showsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/movies`).catch(() => null),
                    fetch(`${API_BASE_URL}/api/shows`).catch(() => null)
                ]);

                const moviesFromAPI = moviesRes ? await moviesRes.json() : [];
                const showsFromAPI = showsRes ? await showsRes.json() : [];

                console.log("Raw Movies from API (first 5):", moviesFromAPI.slice(0, 5));
                console.log("Raw Shows from API (first 5):", showsFromAPI.slice(0, 5));

                if (moviesFromAPI.length === 0 && showsFromAPI.length === 0) {
                    console.error("Both movie and show APIs returned no data.");
                    return;
                }

                // Map raw data from API, using lowercase properties based on original CSV headers
                const mappedMovies = moviesFromAPI.map(m => ({
                    title: m.title,
                    name: m.title,
                    tmdb_id: m.tmdb_id,
                    id: m.tmdb_id || `mov-${Math.random()}`,
                    poster_path: m.poster,
                    media_type: 'movie',
                    lang: m.language,
                    country: m.country,
                    genre_str: m.genre,
                    release_date: m.year,
                    user_rating: m.user_rating, // Add user_rating for movies
                    overview: m.overview || m.description || m.plot || "No description available."
                })).filter(m => m.title);

                const mappedShows = showsFromAPI.map(s => ({
                    title: s.title,
                    name: s.title,
                    tmdb_id: s.tmdb_id,
                    id: s.tmdb_id || `show-${Math.random()}`,
                    poster_path: s.poster,
                    media_type: 'tv',
                    lang: s.language,
                    country: s.country,
                    genre_str: s.genre,
                    release_date: s.year, // Or first_air_date
                    my_rating: s.my_rating, // Add my_rating for shows
                    overview: s.overview || s.description || s.plot || "No description available."
                })).filter(s => s.title);
                
                console.log(`Mapped and filtered ${mappedMovies.length} movies.`);
                console.log(`Mapped and filtered ${mappedShows.length} shows.`);

                allMovies = []; 
                allShows = []; 
                allAnime = [];

                const categorize = (item) => {
                    let isAnime = false;
                    if (item.country && (item.country.includes('Japan') || item.country.includes('JP'))) isAnime = true;
                    if (item.lang && (item.lang.includes('japanese') || item.lang === 'ja')) isAnime = true;
                    if (item.genre_str && item.genre_str.includes('Animation')) isAnime = true;

                    if (isAnime) {
                        item.is_anime = true;
                        allAnime.push(item);
                    } else if (item.media_type === 'tv') {
                        allShows.push(item);
                    } else {
                        allMovies.push(item);
                    }
                };

                mappedMovies.forEach(categorize);
                mappedShows.forEach(categorize);
                
                console.log("Final categorized counts:", { movies: allMovies.length, shows: allShows.length, anime: allAnime.length });
                
                // Mark loaded items as seen initially
                [...allMovies, ...allShows, ...allAnime].forEach(markItemSeen);

                const missingPosters = [...allMovies, ...allShows, ...allAnime].filter(i => !i.poster_path);
                posterQueue.push(...missingPosters);
                processPosterQueue();

                renderHomeRows();
                console.log("Render functions called successfully.");
            } catch (e) {
                console.error("API Data Load Error:", e);
            }
        }

        async function processPosterQueue() {
            if (isFetchingPoster || posterQueue.length === 0) return;
            isFetchingPoster = true;
            const item = posterQueue.shift();
            const cacheKey = `poster_${item.title}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (cached) {
                updateItemPoster(item, cached);
                isFetchingPoster = false; processPosterQueue(); return;
            }

            try {
                const data = await fetchTmdbData(`search/${item.media_type || 'movie'}`, { query: encodeURIComponent(item.title) });
                if (data.results && data.results.length > 0) {
                    const hit = data.results[0];
                    if (hit.poster_path) {
                        localStorage.setItem(cacheKey, hit.poster_path);
                        updateItemPoster(item, hit.poster_path);
                        item.tmdb_id = hit.id;
                    }
                }
            } catch (e) { console.warn("Poster fetch failed", item.title); }

            setTimeout(() => { isFetchingPoster = false; processPosterQueue(); }, 200); 
        }

        function updateItemPoster(item, path) {
            item.poster_path = path;
            const imgs = document.querySelectorAll(`img[data-title="${item.title || item.name}"]`);
            imgs.forEach(img => {
                img.src = IMG_URL + path;
                img.onload = () => {
                    img.classList.add('loaded');
                    if(img.nextElementSibling && img.nextElementSibling.classList.contains('placeholder-title')) {
                        img.nextElementSibling.style.display = 'none';
                    }
                };
            });
        }

        // --- Rendering ---
        async function renderRecommendedRow() {
            const row = document.getElementById('recommendedByYouRow');
            const track = document.getElementById('recommendedByYouTrack');
            track.innerHTML = ''; 

            if (recommendedList.length === 0) { row.style.display = 'none'; return; }
            row.style.display = 'block';

            for (const rec of recommendedList) {
                let item = rec.itemDetails;
                if (!item || !item.overview) {
                    try {
                        const type = rec.itemDetails.media_type || 'movie';
                        const tmdbData = await fetchTmdbData(`${type}/${rec.id}`);
                        rec.itemDetails = { ...rec.itemDetails, ...tmdbData };
                        item = rec.itemDetails;
                    } catch (e) { continue; }
                }
                createCard(rec, track, true, rec.recommender);
            }
        }

        function renderHomeRows() {
            const moviesTrack = document.getElementById('moviesTrack');
            const showsTrack = document.getElementById('showsTrack');
            const animeTrack = document.getElementById('animeTrack');
            moviesTrack.innerHTML = ''; showsTrack.innerHTML = ''; animeTrack.innerHTML = '';
            
            allMovies.forEach(m => createCard(m, moviesTrack));
            allShows.forEach(s => createCard(s, showsTrack));
            allAnime.forEach(a => createCard(a, animeTrack));
        }

        function createCard(item, track, isRec = false, recommender = '') {
            const div = document.createElement('div');
            div.className = 'movie-box';

            let displayId, displayTitle, displayPosterPath;

            if (isRec) { // Item is a recommendation object
                displayId = item.itemId || item.itemDetails.tmdb_id || item.itemDetails.id;
                displayTitle = item.title;
                displayPosterPath = item.itemDetails.poster_path;
            } else { // Item is a raw movie/show object
                displayId = item.tmdb_id || item.id;
                displayTitle = item.title || item.name;
                displayPosterPath = item.poster_path;
            }
            
            div.setAttribute('data-item-id', displayId);
            
            let src = displayPosterPath;
            if (src && !src.startsWith('http')) src = IMG_URL + src;
            
            let hoverText = displayTitle;

            div.innerHTML = `
                <img src="${src || ''}" class="${src ? 'loaded' : ''}" data-title="${displayTitle}">
                <div class="placeholder-title" ${src ? 'style="display:none"' : ''}>${displayTitle}</div>
                <div class="hover-details">${hoverText}</div>
            `;
            // Keep openDetails receiving the original 'item' so it has all necessary data
            div.onclick = () => openDetails(item); 
            track.appendChild(div);
        }

        // --- Details & Modal ---
        window.openDetails = async (item) => {
            currentOpenItem = item;
            let apiData = null;
            const searchId = item.tmdb_id || item.id; 
            const type = item.media_type || 'movie';

            // Fetch details
            if (searchId && !String(searchId).startsWith('mov-') && !String(searchId).startsWith('show-')) { 
                try {
                    apiData = await fetchTmdbData(`${type}/${searchId}`, { append_to_response: 'videos,credits,similar', title: item.title || item.name });
                } catch(e) { console.error("Error fetching details:", e); }
            }
            
            if (!apiData || !apiData.id) {
                try {
                    const sData = await fetchTmdbData(`search/${type==='tv'?'tv':'movie'}`, { query: encodeURIComponent(item.title||item.name) });
                    if (sData.results?.[0]) {
                        const hit = sData.results[0];
                        item.tmdb_id = hit.id; 
                        apiData = await fetchTmdbData(`${type}/${hit.id}`, { append_to_response: 'videos,credits,similar', title: item.title || item.name });
                    }
                } catch (e) { console.error("Fallback search error:", e); }
            }

            const d = apiData || item;
            // Transfer ratings from original item to the details object
            if (apiData) {
                d.user_rating = item.user_rating;
                d.my_rating = item.my_rating;
            }
            currentOpenItem.details = d;

            // Update UI
            document.getElementById('mTitle').innerText = d.title || d.name;
            const modalMeta = document.querySelector('#detailModal .modal-meta');
            const rating = d.user_rating || d.my_rating;
            const ratingStarsHtml = rating ? renderStars(rating) : '';
            
            modalMeta.innerHTML = `
                <span id="mMatch" class="match-text">98% Match</span>
                <span id="mYear">${(d.release_date||d.first_air_date||item.release_date||'').substring(0,4)}</span>
                <span style="border:1px solid #777; padding:0 5px;">HD</span>
                ${ratingStarsHtml}
                <span id="mEpisodesCount" style="color: #aaa; margin-left: 10px;"></span>
            `;

            let descText = d.overview;
            if (isItemRecommended(item)) {
                const rec = getRecommendation(item);
                if (rec) {
                    descText = rec.itemDetails.overview || rec.overview || "No description available."; // Prioritize itemDetails.overview
                    if (rec.recommender) {
                        descText += `<br><br><i style="color: #ccc;">Recommended by: ${rec.recommender}</i>`;
                    }
                }
            } else {
                descText = descText || "No description available."; // Fallback for non-recommended items
            }
            document.getElementById('mDesc').innerHTML = descText;
            document.getElementById('mCast').innerText = d.credits ? d.credits.cast.slice(0,3).map(c=>c.name).join(', ') : '-';
            document.getElementById('mGenres').innerText = d.genres ? d.genres.map(g=>g.name).join(', ') : (item.genre_str || '-');

            const trailer = d.videos?.results?.find(v => v.site==='YouTube' && v.type==='Trailer');
            const frame = document.getElementById('modalFrame');
            const poster = document.getElementById('modalPoster');
            
            if(trailer) { 
                frame.src=`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0&controls=0`; 
                frame.classList.remove('hidden'); poster.classList.add('hidden'); 
            } else { 
                frame.classList.add('hidden'); poster.classList.remove('hidden'); 
                let p = d.backdrop_path ? (IMG_URL + d.backdrop_path) : item.poster_path;
                if(p && !p.startsWith('http')) p = IMG_URL + p;
                poster.src = p || ''; 
            }

            renderUserActionSection(d, d.user_rating || d.my_rating);
            
            // Similar Items
            const mlt = document.getElementById('mltGrid'); mlt.innerHTML='';
            if(d.similar?.results) {
                d.similar.results.slice(0,6).forEach(s=>{
                    const div=document.createElement('div'); div.className='mlt-card';
                    div.innerHTML=`<img src="${IMG_URL}${s.backdrop_path || s.poster_path}" onerror="this.src='https://via.placeholder.com/300x170?text=No+Image'"><div class="hover-details">${s.title || s.name}</div>`;
                    div.onclick=() => openDetails(s);
                    mlt.appendChild(div);
                });
            }

            // Seasons
            const tabEp = document.getElementById('tabEpisodes');
            const sSel = document.getElementById('seasonSelect');
            if(d.seasons || type==='tv') {
                tabEp.classList.remove('hidden'); sSel.innerHTML='';
                if(d.seasons) {
                    d.seasons.forEach(s=>{ if(s.season_number>0){const o=document.createElement('option'); o.value=s.season_number; o.innerText=s.name; sSel.appendChild(o);} });
                }
            } else tabEp.classList.add('hidden');
            
            switchTab('MLT');
            document.getElementById('detailModal').style.display='flex';
        };

        function renderUserActionSection(item, rating) {
            const section = document.getElementById('userActionSection');
            section.innerHTML = ''; 

            const itemIsSeen = isItemSeen(item);
            const itemIsRec = isItemRecommended(item);

            if (itemIsSeen) {
                const seenDiv = document.createElement('div');
                let ratingStarsHtml = '';
                if (rating) {
                    ratingStarsHtml = renderStars(rating);
                }
                seenDiv.innerHTML = `<svg width="24" height="24" fill="none" stroke="#00e054" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> <span style="color:#00e054; font-weight:bold; margin-left:10px;">Kanav has seen this</span> ${ratingStarsHtml}`;
                section.appendChild(seenDiv);
                
            } else if (itemIsRec) {
                const rec = getRecommendation(item);
                const recDiv = document.createElement('div');
                recDiv.innerHTML = `<span style="color:white; font-weight:bold;">Recommended by ${rec.recommender}</span>`;
                section.appendChild(recDiv);

                const seenBtn = document.createElement('button');
                seenBtn.className = 'btn btn-grey';
                seenBtn.innerText = "I've Seen This";
                seenBtn.style.marginTop = '10px';
                seenBtn.style.marginLeft = '10px';
                seenBtn.onclick = () => {
                    actionAfterPassword = () => {
                        markItemSeen(item);
                        const id = String(item.tmdb_id || item.id);
                        recommendedList = recommendedList.filter(r => r.id !== id);
                        saveRecommendedList();
                        renderRecommendedRow();
                        renderHomeRows(); // Re-render all rows to move the item to the seen category
                        renderUserActionSection(item, rating); // Update the modal view
                    };
                    openAdminPasswordDialog();
                };
                section.appendChild(seenBtn);
            } else {
                const recBtn = document.createElement('button');
                recBtn.className = 'btn btn-white';
                recBtn.innerText = 'Recommend This';
                recBtn.onclick = () => {
                    pendingRecommendation = currentOpenItem.details; 
                    document.getElementById('recNameInput').value = '';
                    document.getElementById('recDialog').style.display = 'flex';
                };
                section.appendChild(recBtn);
            }
        }

        // --- Helpers ---
        function renderStars(rating) {
            if (rating === undefined || rating === null || isNaN(rating)) return '';
            const normalizedRating = rating; // Ratings are already out of 5
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (normalizedRating >= i) {
                    starsHtml += '<i class="fas fa-star"></i>'; // Full star
                } else if (normalizedRating >= i - 0.5) {
                    starsHtml += '<i class="fas fa-star-half-alt"></i>'; // Half star
                } else {
                    starsHtml += '<i class="far fa-star"></i>'; // Empty star
                }
            }
            return `<span class="rating-stars">${starsHtml}</span>`;
        }

        window.toggleMute = () => {
            if(ytPlayer) {
                if (ytPlayer.isMuted()) { ytPlayer.unMute(); userMutePreference = false; }
                else { ytPlayer.mute(); userMutePreference = true; }
                updateMuteIcon();
            }
        };

        window.showHome = () => { 
            document.getElementById('homeView').classList.remove('hidden'); 
            document.getElementById('gridView').classList.add('hidden'); 
            const navLinks = document.getElementById('mainNavLinks');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        };
        
        window.showGrid = (cat) => {
            document.getElementById('homeView').classList.add('hidden'); 
            document.getElementById('gridView').classList.remove('hidden');
            const navLinks = document.getElementById('mainNavLinks');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
            let items=[], title="";
            if(cat==='movies'){items=allMovies; title="Movies";}
            else if(cat==='shows'){items=allShows; title="TV Shows";}
            else if(cat==='anime'){items=allAnime; title="Anime";}
            document.getElementById('gridPageTitle').innerText=title;
            document.getElementById('gridCount').innerText=`(${items.length})`;
            currentGridItems=items;
            
            // Populate Genre Filter
            const genreCounts = {};
            items.forEach(i => {
                if (i.genre_str) i.genre_str.split(',').forEach(g => {
                    const gn = g.trim(); if(gn) genreCounts[gn] = (genreCounts[gn] || 0) + 1;
                });
            });
            let opts = `<option value="all">All Genres</option>`;
            Object.keys(genreCounts).sort().forEach(g => opts += `<option value="${g}">${g} (${genreCounts[g]})</option>`);
            document.getElementById('genreFilter').innerHTML = opts;

            // Sort Filter
            const headerDiv = document.querySelector('#gridView .grid-header > div');
            if (!document.getElementById('sortFilter')) {
                const sortSelect = document.createElement('select');
                sortSelect.id = 'sortFilter'; sortSelect.className = 'genre-select';
                sortSelect.innerHTML = `<option value="default">Sort By</option><option value="az">Title (A-Z)</option><option value="za">Title (Z-A)</option><option value="year_desc">Year (Newest)</option><option value="year_asc">Year (Oldest)</option>`;
                sortSelect.onchange = applyGridFilter;
                headerDiv.prepend(sortSelect);
            }
            renderGrid(items);
        };

        window.renderGrid = (items) => {
            const grid=document.getElementById('mediaGrid'); grid.innerHTML='';
            items.forEach(item => {
                const div=document.createElement('div'); div.className='grid-card';
                div.setAttribute('data-item-id', item.tmdb_id || item.id);
                let src=item.poster_path; if(src&&!src.startsWith('http')) src=IMG_URL+src;
                div.innerHTML=`<img src="${src||''}" class="${src?'loaded':''}" data-title="${item.title||item.name}"><div class="hover-details">${item.title||item.name}</div>`;
                div.onclick=()=>openDetails(item);
                grid.appendChild(div);
            });
        };

        window.applyGridFilter = () => {
            const sGenre = document.getElementById('genreFilter').value;
            const sSort = document.getElementById('sortFilter').value;
            let res = currentGridItems;
            if (sGenre !== 'all') res = res.filter(i => i.genre_str && i.genre_str.includes(sGenre));
            
            if(sSort === 'az') res.sort((a,b)=>(a.title||a.name).localeCompare(b.title||b.name));
            else if(sSort === 'za') res.sort((a,b)=>(b.title||b.name).localeCompare(a.title||a.name));
            else if(sSort === 'year_desc') res.sort((a,b)=> parseInt((b.release_date||'').substring(0,4)||0) - parseInt((a.release_date||'').substring(0,4)||0));
            else if(sSort === 'year_asc') res.sort((a,b)=> parseInt((a.release_date||'').substring(0,4)||0) - parseInt((b.release_date||'').substring(0,4)||0));
            
            renderGrid(res);
        };

        window.openSearch = () => { document.getElementById('searchOverlay').classList.add('active'); document.getElementById('fullSearchBar').focus(); };
        window.closeSearch = () => document.getElementById('searchOverlay').classList.remove('active');
        
        let searchTimeout;
        window.handleSearchKey = (e) => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => runSearch(e.target.value), 500); };
        
        async function runSearch(q) {
            if(!q) return;
            const data = await fetchTmdbData(`search/multi`, { query: q });
            const grid = document.getElementById('searchGrid'); grid.innerHTML = '';
            data.results.forEach(i => {
                if(!i.backdrop_path || (i.media_type !== 'movie' && i.media_type !== 'tv')) return; 
                const div = document.createElement('div'); div.className = 'search-card';
                div.innerHTML = `<img src="${IMG_URL}${i.backdrop_path}"><div class="search-card-title">${i.title||i.name}</div>`;
                div.onclick = () => openDetails(i);
                grid.appendChild(div);
            });
        }

        window.closeRecDialog = () => document.getElementById('recDialog').style.display = 'none';
        window.confirmRecommendation = async () => {
            const name = document.getElementById('recNameInput').value || 'Anonymous';
            if (pendingRecommendation) {
                const success = await markItemRecommended(pendingRecommendation, name);
                if (success) {
                    renderUserActionSection(pendingRecommendation); 
                    alert(`Recommended "${pendingRecommendation.title || pendingRecommendation.name}"!`);
                } else {
                    alert(`Already recommended or failed to save.`);
                }
            }
            closeRecDialog(); 
            if(window.closeSearch) closeSearch();
        };

        window.switchTab = (t) => {
            document.getElementById('mltGrid').classList.toggle('hidden', t!=='MLT');
            document.getElementById('episodesGrid').classList.toggle('hidden', t!=='EPISODES');
            document.getElementById('tabMLT').classList.toggle('active', t==='MLT');
            document.getElementById('tabEpisodes').classList.toggle('active', t==='EPISODES');
            document.getElementById('seasonSelect').classList.toggle('hidden', t!=='EPISODES');
            if(t==='EPISODES') fetchSeason(document.getElementById('seasonSelect').value||1);
        };

        window.fetchSeason = async (n) => {
            if(!currentOpenItem || !currentOpenItem.details) return;
            const id = currentOpenItem.details.id;
            const d = await fetchTmdbData(`tv/${id}/season/${n}`);
            const g = document.getElementById('episodesGrid'); g.innerHTML='';
            if(d.episodes) d.episodes.forEach(e=>{
                const div=document.createElement('div'); div.className='episode-card';
                div.innerHTML=`<img class="episode-img" src="${IMG_URL}${e.still_path}" onerror="this.src='https://via.placeholder.com/300x170?text=No+Image'"><div class="episode-info"><div class="episode-title"><span>${e.episode_number}. ${e.name}</span></div><div class="episode-desc">${e.overview}</div></div>`;
                g.appendChild(div);
            });
        };

        window.closeModal = () => { document.getElementById('detailModal').style.display='none'; document.getElementById('modalFrame').src=''; };
        window.scrollRow = (id, d) => document.getElementById(id).scrollBy({left:d*window.innerWidth*0.8, behavior:'smooth'});
        window.addEventListener('scroll', ()=>{ document.getElementById('mainHeader').classList.toggle('scrolled', window.scrollY>20); });

        // Admin Dialogs
        window.openAdminPasswordDialog = () => { document.getElementById('adminPasswordDialog').style.display = 'flex'; document.getElementById('adminPasswordInput').focus(); };
        window.closeAdminPasswordDialog = () => { document.getElementById('adminPasswordDialog').style.display = 'none'; document.getElementById('adminPasswordInput').value = ''; };
        window.confirmAdminPassword = async () => {
            const enteredPassword = document.getElementById('adminPasswordInput').value;
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/verify-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: enteredPassword })
                });
                const result = await response.json();

                if (result.success) {
                    alert('Admin Access Granted');
                    closeAdminPasswordDialog();
                    if (actionAfterPassword) {
                        actionAfterPassword();
                        actionAfterPassword = null;
                    } else if (currentOpenItem) {
                        renderUserActionSection(currentOpenItem, currentOpenItem.details.user_rating || currentOpenItem.details.my_rating);
                    }
                } else { 
                    alert('Access Denied');
                    closeAdminPasswordDialog();
                }
            } catch (error) {
                console.error('Error verifying admin password:', error);
                alert('An error occurred during password verification.');
                closeAdminPasswordDialog();
            }
        };

        // Fallback event listener in case onclick acts up
        document.addEventListener('DOMContentLoaded', () => {
            const profileCard = document.getElementById('profileCardKanav');
            if (profileCard) {
                profileCard.addEventListener('click', window.startApp);
            }
        });