// --- MODAL HELPER FUNCTIONS ---
    function showInputModal(title, label, placeholder = '', inputType = 'text') {
        return new Promise((resolve) => {
            const modal = document.getElementById('input-modal');
            document.getElementById('input-modal-title').innerText = title;
            document.getElementById('input-modal-label').innerText = label;
            const inputField = document.getElementById('input-modal-field');
            inputField.value = ''; // Clear previous input
            inputField.placeholder = placeholder;
            inputField.type = inputType; // Set input type (text, password, etc.)
            
            // Focus on the input field after a slight delay to ensure it's visible
            setTimeout(() => inputField.focus(), 100);

            modal.style.display = 'flex';

            const handleSubmit = () => {
                modal.style.display = 'none';
                document.getElementById('input-modal-submit').removeEventListener('click', handleSubmit);
                document.getElementById('input-modal-cancel').removeEventListener('click', handleCancel);
                inputField.removeEventListener('keydown', handleKeyDown);
                resolve(inputField.value);
            };

            const handleCancel = () => {
                modal.style.display = 'none';
                document.getElementById('input-modal-submit').removeEventListener('click', handleSubmit);
                document.getElementById('input-modal-cancel').removeEventListener('click', handleCancel);
                inputField.removeEventListener('keydown', handleKeyDown);
                resolve(null); // Resolve with null if cancelled
            };

            const handleKeyDown = (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSubmit();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    handleCancel();
                }
            };

            document.getElementById('input-modal-submit').addEventListener('click', handleSubmit);
            document.getElementById('input-modal-cancel').addEventListener('click', handleCancel);
            inputField.addEventListener('keydown', handleKeyDown);
        });
    }

    function showAlertModal(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('alert-modal');
            document.getElementById('alert-modal-title').innerText = title;
            document.getElementById('alert-modal-message').innerText = message;
            modal.style.display = 'flex';

            const handleOk = () => {
                modal.style.display = 'none';
                document.getElementById('alert-modal-ok').removeEventListener('click', handleOk);
                resolve();
            };

            const handleKeyDown = (event) => {
                if (event.key === 'Enter' || event.key === 'Escape') {
                    event.preventDefault();
                    handleOk();
                }
            };

            document.getElementById('alert-modal-ok').addEventListener('click', handleOk);
            modal.addEventListener('keydown', handleKeyDown);
        });
    }

    function generateStarRatingHTML(rating) {
        if (rating === undefined || rating === null || rating === '' || isNaN(parseFloat(rating))) {
            return '<span style="font-size: 0.9em; opacity: 0.7;">No Rating</span>';
        }
        const normalizedRating = parseFloat(rating);
        const maxRating = 5;
        let starsHtml = '';
        
        for (let i = 1; i <= maxRating; i++) {
            if (normalizedRating >= i) {
                starsHtml += '<i class="fas fa-star" style="color: gold;"></i>';
            } else if (normalizedRating >= i - 0.5) {
                starsHtml += '<i class="fas fa-star-half-alt" style="color: gold;"></i>';
            } else {
                starsHtml += '<i class="far fa-star" style="color: gold;"></i>';
            }
        }
        return starsHtml;
    }

    const navTabs = document.querySelectorAll('.nav-tab');
    const carouselSection = document.getElementById('carousel-section');
    const gameInfo = document.getElementById('game-info');
    const mainContainer = document.getElementById('main-container');
    const mainPlayBtn = document.getElementById('main-play-btn'); // Add this for easier access

    let currentView = 'games'; // New state variable

    navTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.innerText === 'Games') {
                currentView = 'games';
                renderCarouselAndInfo(gameLibrary, 'HOME', 'Welcome back. Select a game to begin.');
            } else { // Wishlist tab
                currentView = 'wishlist';
                await loadWishlistData(); // Load wishlist data
                renderCarouselAndInfo(wishlist, 'WISHLIST', 'Select an item from your wishlist.');
            }
        });
    });

    // --- mainPlayBtn event listener ---
    mainPlayBtn.addEventListener('click', async () => {
        const activeItem = container.querySelector('.game-item.active');
        if (!activeItem) return;

                    const title = activeItem.dataset.title;
                    const itemId = activeItem.dataset.id;
        
                    if (currentView === 'wishlist') {
                        console.log('--- Wishlist: Mark Played/Unplayed button clicked ---');
                        const itemData = wishlist.find(w => String(w._id) === itemId);
                        if (!itemData) {
                            console.log('Wishlist item not found for ID:', itemId);
                            return;
                        }
        
                        console.log('Calling showInputModal for password...');
                        const password = await showInputModal('Enter Password', 'To toggle "Played" status, please enter your password:', '', 'password');
                        console.log('showInputModal returned:', password ? 'password entered' : 'password cancelled');
                        if (!password) {
                            await showAlertModal('Action Cancelled', 'Password entry cancelled. "Played" status not changed.');
                            return;
                        }
        
                        try {
                            console.log(`Attempting to toggle played status for ${title} (ID: ${itemId})...`);
                            const response = await fetch(`/api/wishlist/games/${itemId}/togglePlayed`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ password: password }),
                            });
        
                            if (response.ok) {
                                const result = await response.json();
                                itemData.played = result.played; // Update local state
                                if (result.played) {
                                    console.log(`${title} marked as played. Reloading data.`);
                                    // Move game from wishlist to main library if marked as played
                                    await loadGamesFromAPI(); // Re-load main games library
                                    await loadWishlistData(); // Re-load wishlist
                                    // Switch to Games tab and select the newly played game if possible
                                    navTabs.forEach(t => {
                                        if (t.innerText === 'Games') {
                                            t.classList.add('active');
                                        } else {
                                            t.classList.remove('active');
                                        }
                                    });
                                    currentView = 'games';
                                    renderCarouselAndInfo(gameLibrary, 'HOME', 'Welcome back. Select a game to begin.');
                                    // Attempt to select the newly played game in the Games carousel
                                    setTimeout(() => {
                                        const newActiveGame = Array.from(container.children).find(c => c.dataset.title === title);
                                        if (newActiveGame) selectItem(newActiveGame);
                                    }, 100);
                                    await showAlertModal('Success', `${title} has been moved to your main library and marked as played!`);
                                } else {
                                    console.log(`${title} marked as unplayed.`);
                                    await showAlertModal('Success', `"${title}" played status updated to Unplayed.`);
                                }
                                updateUI(); // Re-render button text
                            } else {
                                const errorData = await response.json();
                                console.error('API Error:', errorData);
                                await showAlertModal('Error', `Failed to update played status: ${errorData.message}`);
                            }
                        } catch (error) {
                            console.error('Error toggling played status:', error);
                            await showAlertModal('Error', `An unexpected error occurred while updating played status.`);
                        }
                    } else if (currentView === 'games') {            // This is where "Play" button logic or "Rating" display would go
            // For now, if it's a game, the button either acts as "Play" or shows rating.
            // No action needed for "Play" besides showing rating.
        }
    });


    let gameLibrary = [];
    let wishlist = [];
    let playedGameTitles = new Set();
    let wishlistGameTitles = new Set();


    async function loadGamesFromAPI() {
        try {
            const response = await fetch('/api/games');
            const fetchedGames = await response.json();
            playedGameTitles.clear();
            gameLibrary = fetchedGames.map(game => {
                playedGameTitles.add(game.name.toLowerCase());
                return {
                    title: game.name || 'Untitled',
                    description: game.description_raw || game.description || 'No description available.',
                    cover: game.cover || game.background_image || 'https://via.placeholder.com/100x100?text=No+Image',
                    id: game.id, // Keep RAWG ID for API interaction
                    my_rating: game.my_rating, // Include my_rating from the fetched game data
                    trailer: '' // will be fetched later
                };
            }).filter(g => g.title);
            init();
        } catch (error) {
            console.error('Failed to load game library from API:', error);
        }
    }

    async function loadWishlistData() { // Renamed and refactored
        try {
            const response = await fetch('/api/wishlist/games');
            if (response.ok) {
                const fetchedWishlist = await response.json();
                wishlist = fetchedWishlist.map(item => ({
                    title: item.title || item.name || 'Untitled',
                    description: item.description || item.description_raw || 'No description available.',
                    cover: item.cover || item.background_image || 'https://via.placeholder.com/100x100?text=No+Image',
                    _id: item._id, // Keep MongoDB ID for backend interaction
                    played: item.played || false // Ensure 'played' status is present
                }));
                wishlistGameTitles.clear();
                wishlist.forEach(g => wishlistGameTitles.add(g.title.toLowerCase()));
            } else {
                console.error('Failed to load wishlist:', response.statusText);
                wishlist = []; // Clear wishlist on failure
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
            wishlist = []; // Clear wishlist on error
        }
    }
    










    function getYoutubeTrailer(gameTitle) {
        // This is a placeholder as I cannot make external API calls.
        // You would use the YouTube Data API to search for a trailer.
        console.log(`[YouTube] Searching for YouTube trailer for: ${gameTitle}`);
        // In a real application, you'd make an API call here.
        // For now, return a placeholder or an empty string if no actual trailer is found.
        const knownTrailers = {
            "Grand Theft Auto V": "QkkoH_yXwms",
            "The Witcher 3: Wild Hunt": "c0i88t0Kacs",
            "Red Dead Redemption 2": "gmA6MrX81z4",
            "Cyberpunk 2077": "L_R0n8hL5nU",
            "ELDEN RING": "E3Hk0uP_z_4",
            // Add more specific trailers for your games if you have them
        };
        const videoId = knownTrailers[gameTitle] || 'gHzuHo80U2M'; // Default placeholder trailer
        console.log(`[YouTube] Returning video ID for ${gameTitle}: ${videoId}`);
        return videoId;
    }



    const container = document.getElementById('carousel-container');
    const bgImg = document.getElementById('dynamic-bg-img');
    const youtubeContainer = document.getElementById('youtube-bg-container');
    const clockEl = document.getElementById('clock');
    const settingsMenu = document.getElementById('settings-menu');
    const searchInput = document.getElementById('search-input');
    const searchWrapper = document.getElementById('search-input-wrapper');
    const searchResults = document.getElementById('search-results');
    
    let ytPlayer;
    let holdTimer = null;
    let hideUITimer = null;
    let isMoving = false;
    let dashboardStarted = false;
    let isYoutubePlayerReady = false; // New flag
    let currentDetailGame = null;

    // --- INTRO CANVAS (BOKEH SPARK EFFECT) ---
    const canvas = document.getElementById('intro-canvas');
    const ctx = canvas.getContext('2d');
    let sparks = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Spark {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 0.5;
            this.alpha = Math.random() * 0.4;
            this.targetAlpha = Math.random() * 0.6 + 0.2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha += (this.targetAlpha - this.alpha) * 0.01;
            if (this.alpha > 0.8) this.targetAlpha = 0;
            if (this.alpha < 0.05) this.reset();
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    for (let i = 0; i < 150; i++) sparks.push(new Spark());

    function animateIntro() {
        if (dashboardStarted) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sparks.forEach(s => { s.update(); s.draw(); });
        requestAnimationFrame(animateIntro);
    }
    animateIntro();

    window.addEventListener('keydown', (e) => {
        if (dashboardStarted) {
            showUI(); // Key movement brings back UI
            return;
        }
        // Use SPACEBAR to start
        if (e.code === 'Space') {
            startGamepadDashboard();
        }
    });

    // Add click/tap listener for intro screen
    document.getElementById('intro-container').addEventListener('click', () => {
        if (!dashboardStarted) {
            startGamepadDashboard();
        }
    });

    // Gamepad API
    let gamepadIndex = null;
    let gamepadConnected = false;
    let prevGamepadButtons = {};
    const GAMEPAD_THRESHOLD = 0.5; // For joystick sensitivity

    window.addEventListener("gamepadconnected", (e) => {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length);
        gamepadIndex = e.gamepad.index;
        gamepadConnected = true;
        // Optionally, immediately start the dashboard if 'A' is pressed on connect
        const gp = navigator.getGamepads()[gamepadIndex];
        if (gp && gp.buttons[0] && gp.buttons[0].pressed) { // Button A
            if (!dashboardStarted) {
                startGamepadDashboard();
            }
        }
        gameLoop(); // Start gamepad polling
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        console.log("Gamepad disconnected from index %d: %s",
            e.gamepad.index, e.gamepad.id);
        if (gamepadIndex === e.gamepad.index) {
            gamepadIndex = null;
            gamepadConnected = false;
        }
    });

    function gameLoop() {
        if (!gamepadConnected || gamepadIndex === null) {
            requestAnimationFrame(gameLoop);
            return;
        }

        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (!gamepad) {
            gamepadConnected = false;
            requestAnimationFrame(gameLoop);
            return;
        }

        processGamepadInput(gamepad);
        requestAnimationFrame(gameLoop);
    }

    // Function to start dashboard via gamepad
    function startGamepadDashboard() {
        dashboardStarted = true;
        document.getElementById('intro-container').style.opacity = '0';
        mainContainer.style.opacity = '1';
        setTimeout(() => { document.getElementById('intro-container').style.display = 'none'; }, 1500);
                    loadGamesFromAPI();
    }

    // placeholder for gamepad input processing
    function processGamepadInput(gamepad) {
        // Debounce button presses
        const handleButtonPress = (buttonIndex, action) => {
            if (gamepad.buttons[buttonIndex].pressed && !prevGamepadButtons[buttonIndex]) {
                action();
            }
        };

        // Start Dashboard (A button)
        if (!dashboardStarted) {
            handleButtonPress(0, startGamepadDashboard); // Button A
        } else {
            // Carousel Navigation (unified)
            // Left (L1, D-pad Left, Left Joystick Left)
            handleButtonPress(4, moveLeft); // L1
            handleButtonPress(14, moveLeft); // D-pad Left
            if (gamepad.axes[0] < -GAMEPAD_THRESHOLD && prevGamepadButtons['axis0_left'] === false) {
                moveLeft();
                prevGamepadButtons['axis0_left'] = true;
            } else if (gamepad.axes[0] > -GAMEPAD_THRESHOLD) {
                prevGamepadButtons['axis0_left'] = false;
            }

            // Right (R1, D-pad Right, Left Joystick Right)
            handleButtonPress(5, moveRight); // R1
            handleButtonPress(15, moveRight); // D-pad Right
            if (gamepad.axes[0] > GAMEPAD_THRESHOLD && prevGamepadButtons['axis0_right'] === false) {
                moveRight();
                prevGamepadButtons['axis0_right'] = true;
            } else if (gamepad.axes[0] < GAMEPAD_THRESHOLD) {
                prevGamepadButtons['axis0_right'] = false;
            }

            // Select/Open Details (A button)
            handleButtonPress(0, () => { // Button A
                const active = container.children[1];
                if (active) {
                    const title = active.dataset.title;
                    showDetailsFromUI(encodeURIComponent(title));
                }
            });

            // Close Details/Settings (B button)
            handleButtonPress(1, () => { // Button B
                const detailOverlay = document.getElementById('detail-overlay');
                if (detailOverlay.style.display === 'flex') {
                    document.getElementById('btn-close-details').click();
                }
            });

            // Toggle Settings Menu (Start button - index 9, or Menu button - index 16)
            handleButtonPress(9, () => { // Start button
                settingsMenu.classList.toggle('open');
            });
            handleButtonPress(16, () => { // Menu button (for some controllers)
                settingsMenu.classList.toggle('open');
            });

            // Search Input Focus/Collapse (Y button)
            handleButtonPress(3, () => {
                if (searchWrapper.classList.contains('expanded')) {
                    collapseSearch();
                    searchInput.blur();
                } else {
                    searchWrapper.click();
                }
            });
            
            // Show UI on any gamepad input
            if (gamepad.buttons.some(b => b.pressed) || gamepad.axes.some(a => Math.abs(a) > 0.1)) {
                showUI();
            }
        }

        // Store current button states for debouncing
        for (let i = 0; i < gamepad.buttons.length; i++) {
            prevGamepadButtons[i] = gamepad.buttons[i].pressed;
        }
        // Store current axis states for debouncing (specifically for d-pad/joystick)
        // prevGamepadButtons['axis0_left'] and 'axis0_right'] are handled above
    }
    let scrollTimeout;
    carouselSection.addEventListener('wheel', (e) => {
        e.preventDefault();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Unified movement for carousel
            if (e.deltaY < 0) { // Scroll up (or wheel up)
                moveLeft();
            } else { // Scroll down (or wheel down)
                moveRight();
            }
        }, 100); // Debounce time
    });

    // --- Touch/Swipe for Carousel ---
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // Minimum distance for a swipe

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    container.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });

    container.addEventListener('touchend', () => {
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped left
            moveRight();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped right
            moveLeft();
        }
        // Reset touch positions
        touchStartX = 0;
        touchEndX = 0;
    });

    let queuedTrailer = null; // New variable to queue trailers

    function onYouTubeIframeAPIReady() {
        ytPlayer = new YT.Player('youtube-bg-container', {
            height: '100%',
            width: '100%',
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'showinfo': 0,
                'rel': 0,
                'loop': 1,
                'mute': 1,
                'origin': window.location.origin
            },
            events: {
                'onReady': (e) => {
                    e.target.mute();
                    isYoutubePlayerReady = true;
                    console.log("[YouTube] Player is ready.");
                    if (queuedTrailer) {
                        loadQueuedTrailer();
                    }
                }
            }
        });
    }

    async function fetchGameDetails(gameName) {
        try {
            // First call to search for the game by name
            const searchRes = await fetch(`/api/rawg/games?search=${encodeURIComponent(gameName)}&page_size=1`);
            const searchData = await searchRes.json();

            if (searchData.results && searchData.results.length > 0) {
                const id = searchData.results[0].id;
                // Second call to get full details by ID
                const detailsRes = await fetch(`/api/rawg/games?id=${id}`);
                return await detailsRes.json();
            }
        } catch (e) {
            console.error('Error fetching game details via proxy:', e);
        }
        return null;
    }

    function init() {
        renderCarouselAndInfo(gameLibrary, 'HOME', 'Welcome back. Select a game to begin.');
        updateClock();
        setInterval(updateClock, 1000);
        updateUI(); // Initial UI update
        window.addEventListener('mousemove', showUI);
    }

    function showUI() {
        document.body.classList.remove('ui-hidden');
        resetHideTimer();
    }

    function resetHideTimer() {
        clearTimeout(hideUITimer);
        if (settingsMenu.classList.contains('open') || searchWrapper.classList.contains('expanded')) return;
        
        hideUITimer = setTimeout(() => {
            document.body.classList.add('ui-hidden');
        }, 10000);
    }

    // Unified render function
    function renderCarouselAndInfo(data, defaultLogoText, defaultTaglineText) {
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<p style="color:white; text-align:center;">No items to display.</p>';
            document.getElementById('game-logo').innerText = defaultLogoText;
            document.getElementById('game-tagline').innerText = defaultTaglineText;
            mainPlayBtn.style.display = 'none'; // Hide play button if no items
            return;
        }

        data.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = `game-item`; // Use generic class
            div.dataset.id = String(item._id || item.id); // Use _id for wishlist, id for games API
            div.dataset.title = item.title;
            div.innerHTML = `<img src="${item.cover || item.background_image || 'https://via.placeholder.com/100x100?text=No+Image'}" alt="${item.title}">`;
            div.onclick = () => { 
                if(!isMoving) {
                    selectItem(div);
                    setTimeout(() => {
                        const activeItem = container.children[1];
                        if (activeItem) showDetailsFromUI(encodeURIComponent(activeItem.dataset.title));
                    }, 500); // Small delay to allow carousel transition
                }
            };
            container.appendChild(div);
        });
        updateItemStates(); // Update active class for carousel items
        updateUI(); // Update info panel and button for the newly rendered carousel
    }

    function updateClock() {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function selectItem(el) {
        const children = Array.from(container.children);
        const index = children.indexOf(el);
        if (index === 1) return;
        if (index === 0) moveLeft();
        else {
            const diff = index - 1;
            for (let i = 0; i < diff; i++) setTimeout(() => moveRight(), i * 150);
        }
    }

    function moveRight() {
        if (isMoving) return;
        isMoving = true;
        container.classList.add('scrolling');
        const width = 80 + 14;
        container.style.transition = 'transform var(--carousel-transition)';
        container.style.transform = `translateX(-${width}px)`;
        
        container.addEventListener('transitionend', function handler() {
            container.removeEventListener('transitionend', handler);
            container.style.transition = 'none';
            container.appendChild(container.firstElementChild);
            container.style.transform = 'translateX(0)';
            isMoving = false;
            container.classList.remove('scrolling');
            updateUI();
        });
    }

    function moveLeft() {
        if (isMoving) return;
        isMoving = true;
        container.classList.add('scrolling');
        const width = 80 + 14;
        container.style.transition = 'none';
        container.insertBefore(container.lastElementChild, container.firstElementChild);
        container.style.transform = `translateX(-${width}px)`;
        container.offsetHeight; 
        container.style.transition = 'transform var(--carousel-transition)';
        container.style.transform = 'translateX(0)';
        
        container.addEventListener('transitionend', function handler() {
            container.removeEventListener('transitionend', handler);
            isMoving = false;
            container.classList.remove('scrolling');
            updateUI();
        });
    }

    function updateItemStates() {
        const children = Array.from(container.children);
        children.forEach((item, idx) => {
            if (children.length === 1) {
                item.classList.toggle('active', true); // Mark the single item as active
            } else {
                item.classList.toggle('active', idx === 1);
            }
        });
    }

    async function updateUI() {
        showUI();
        updateItemStates(); // This will ensure the correct item has the 'active' class

        // Explicitly handle empty wishlist case
        if (currentView === 'wishlist' && wishlist.length === 0) {
            document.getElementById('game-logo').innerText = 'WISHLIST';
            document.getElementById('game-tagline').innerText = 'Your wishlist is empty. Recommend some games!';
            mainPlayBtn.style.display = 'none';
            clearTimeout(holdTimer);
            youtubeContainer.style.opacity = '0';
            if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
            return;
        }

        // Find the actually active item, which could be children[0] if there's only one.
        const active = container.querySelector('.game-item.active');
        
        // If there are items, but somehow none is active (shouldn't happen with updated updateItemStates, but as a fallback)
        if (!active && container.children.length > 0) {
            // Default to the first item if no active one is found but items exist.
            document.getElementById('game-logo').innerText = currentView === 'games' ? 'HOME' : 'WISHLIST';
            document.getElementById('game-tagline').innerText = currentView === 'games' ? 'Welcome back. Select a game to begin.' : 'Select an item from your wishlist.';
            mainPlayBtn.style.display = 'none';
            clearTimeout(holdTimer);
            youtubeContainer.style.opacity = '0';
            if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
            return;
        } else if (!active && container.children.length === 0 && currentView === 'games') {
            // This handles the case where the games library is empty.
            document.getElementById('game-logo').innerText = 'HOME';
            document.getElementById('game-tagline').innerText = 'Welcome back. Select a game to begin.';
            mainPlayBtn.style.display = 'none';
            clearTimeout(holdTimer);
            youtubeContainer.style.opacity = '0';
            if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
            return;
        } else if (!active) {
            return; // No active item, and not empty wishlist, do nothing to prevent overwriting
        }


        const title = active.dataset.title;
        const itemId = active.dataset.id; // Get item ID
        
        let itemData;
        if (currentView === 'games') {
            itemData = gameLibrary.find(g => g.title === title);
            const ratingHtml = generateStarRatingHTML(itemData ? itemData.my_rating : null);
            mainPlayBtn.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 5px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa fa-check-circle" style="color: var(--ps-light-blue); font-size: 1rem;"></i>
                        <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #fff;">Kanav has played this</span>
                    </div>
                    <div style="font-size: 1.2rem; display: flex; align-items: center; gap: 5px;">${ratingHtml}</div>
                </div>
            `;
            mainPlayBtn.style.display = 'inline-flex';
            mainPlayBtn.style.background = 'transparent'; // Make background transparent
            mainPlayBtn.style.color = 'white'; // Change text color to white
            mainPlayBtn.style.boxShadow = 'none'; // Remove box shadow
            mainPlayBtn.style.cursor = 'default'; // Change cursor
            mainPlayBtn.onmouseover = null; // Remove hover effects
            mainPlayBtn.onmouseout = null; // Remove hover effects
            mainPlayBtn.style.transition = 'none'; // Remove transition
            mainPlayBtn.style.padding = '0'; // Reset padding
        } else { // currentView === 'wishlist'
            itemData = wishlist.find(w => String(w._id) === itemId);
            if (itemData) {
                mainPlayBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ${itemData.played ? 'Mark Unplayed' : 'Mark Played'}`;
                mainPlayBtn.style.display = 'inline-flex';
                // Reset styles for wishlist button
                mainPlayBtn.style.background = '#fff';
                mainPlayBtn.style.color = '#000';
                mainPlayBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                mainPlayBtn.style.cursor = 'pointer';
                mainPlayBtn.style.padding = '12px 45px'; // Restore padding
                mainPlayBtn.onmouseover = function() { this.style.background = 'var(--ps-light-blue)'; this.style.color = '#fff'; this.style.transform = 'scale(1.05)'; };
                mainPlayBtn.onmouseout = function() { this.style.background = '#fff'; this.style.color = '#000'; this.style.transform = 'scale(1)'; };
                mainPlayBtn.style.transition = '0.2s';
            } else {
                mainPlayBtn.style.display = 'none';
            }
        }

        document.getElementById('game-logo').innerText = itemData ? itemData.title : (currentView === 'games' ? 'HOME' : 'WISHLIST');
        
        if (itemData && itemData.description) {
            const truncatedDescription = itemData.description.substring(0, 140);
            if (itemData.description.length > 140) {
                document.getElementById('game-tagline').innerHTML = `${truncatedDescription}... <span style="color:white; cursor:pointer; text-decoration: underline;" onclick="showDetailsFromUI('${encodeURIComponent(title)}')">Read More</span>`;
            } else {
                document.getElementById('game-tagline').innerText = truncatedDescription;
            }
            bgImg.src = itemData.cover || itemData.background_image || 'https://via.placeholder.com/100x100?text=No+Image';
            bgImg.style.opacity = '1';
        } else {
            document.getElementById('game-tagline').innerText = "No description available.";
            bgImg.src = itemData ? (itemData.cover || itemData.background_image || 'https://via.placeholder.com/100x100?text=No+Image') : 'https://via.placeholder.com/100x100?text=No+Image';
            bgImg.style.opacity = '1';
        }

        clearTimeout(holdTimer);
        youtubeContainer.style.opacity = '0';
        if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();

        if (itemData) {
            holdTimer = setTimeout(() => playTrailer(itemData.title), 3000);
        }
    }

    function playTrailer(gameTitle) {
        console.log(`[YouTube] Attempting to play trailer for: ${gameTitle}`);
        const game = gameLibrary.find(g => g.title === gameTitle);
        console.log(`[YouTube] Game object found: ${!!game}`);
        let videoId = 'gHzuHo80U2M'; // default
        if (game && game.trailer) {
            videoId = game.trailer;
            console.log(`[YouTube] Using pre-fetched trailer ID: ${videoId}`);
        } else {
            videoId = getYoutubeTrailer(gameTitle);
            if(game) game.trailer = videoId;
            console.log(`[YouTube] Fetched new trailer ID: ${videoId}`);
        }

        if (isYoutubePlayerReady && ytPlayer && ytPlayer.loadVideoById) {
            ytPlayer.loadVideoById({ videoId: videoId, startSeconds: 0 });
            youtubeContainer.style.opacity = '1';
            resetHideTimer();
            console.log(`[YouTube] Loading video ID: ${videoId}`);
        } else {
            console.log(`[YouTube] YouTube player not ready, queuing trailer: ${videoId} for ${gameTitle}`);
            queuedTrailer = { videoId: videoId, gameTitle: gameTitle };
        }
    }

    function loadQueuedTrailer() {
        if (queuedTrailer && isYoutubePlayerReady && ytPlayer && ytPlayer.loadVideoById) {
            console.log(`[YouTube] Playing queued trailer: ${queuedTrailer.videoId} for ${queuedTrailer.gameTitle}`);
            ytPlayer.loadVideoById({ videoId: queuedTrailer.videoId, startSeconds: 0 });
            youtubeContainer.style.opacity = '1';
            resetHideTimer();
            queuedTrailer = null; // Clear the queue
        }
    }

    document.getElementById('recommend-btn').onclick = async () => {
        if (!currentDetailGame) {
            console.error("No game selected to recommend.");
            return;
        }

        const gameTitle = currentDetailGame.title;
        // Check if it's already in the library (played) or wishlist
        if (playedGameTitles.has(gameTitle.toLowerCase())) {
            await showAlertModal('Recommendation Failed', `${gameTitle} is already in your library!`);
            return;
        }
        if (wishlistGameTitles.has(gameTitle.toLowerCase())) {
            await showAlertModal('Recommendation Failed', `${gameTitle} is already in your wishlist!`);
            return;
        }

        const recommendedBy = await showInputModal('Recommend Game', 'Your Name:', 'Enter your name');
        if (!recommendedBy) {
            await showAlertModal('Recommendation Cancelled', 'You cancelled the recommendation.');
            return;
        }

        try {
            const response = await fetch('/api/wishlist/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ game: currentDetailGame, recommendedBy: recommendedBy }),
            });

            if (response.ok) {
                const newWishlistItem = await response.json();
                wishlist.push(newWishlistItem);
                wishlistGameTitles.add(gameTitle.toLowerCase());
                // wishlistCarouselContainer is not defined here in the original script provided, 
                // but renderWishlist is. I'll stick to what was there.
                // renderWishlist(); 
                await showAlertModal('Success', `${gameTitle} has been added to your wishlist by ${recommendedBy}!`);
            } else {
                const errorData = await response.json();
                await showAlertModal('Error', `Failed to add ${gameTitle} to wishlist: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            await showAlertModal('Error', `An unexpected error occurred while adding ${gameTitle} to wishlist.`);
        }
    };

    async function loadWishlistData() { 
        try {
            const response = await fetch('/api/wishlist/games');
            if (response.ok) {
                wishlist = await response.json();
                wishlistGameTitles.clear();
                wishlist.forEach(g => wishlistGameTitles.add((g.title || g.name).toLowerCase()));
            } else {
                console.error('Failed to load wishlist:', response.statusText);
                wishlist = []; 
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
            wishlist = []; 
        }
    }

    searchWrapper.onclick = (e) => {
        e.stopPropagation();
        searchWrapper.classList.add('expanded');
        searchInput.focus();
        showUI();
    };

    // Collapse search when clicking away
    document.addEventListener('click', () => {
        if (searchWrapper.classList.contains('expanded') && document.activeElement !== searchInput) {
            collapseSearch();
        }
    });

    function collapseSearch() {
        searchWrapper.classList.remove('expanded');
        searchResults.style.display = 'none';
        searchInput.value = '';
    }

    searchInput.oninput = async (e) => {
        const v = e.target.value.toLowerCase();
        if (!v) { searchResults.style.display = 'none'; return; }
        searchResults.style.display = 'block';
        searchResults.innerHTML = '';

        // Owned Search
        const owned = gameLibrary.filter(g => g.title.toLowerCase().includes(v));
        owned.forEach(g => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `<span>[Owned] ${g.title}</span>`;
            div.onclick = () => {
                const el = Array.from(container.children).find(c => c.dataset.title === g.title);
                if (el) selectItem(el);
                collapseSearch();
            };
            searchResults.appendChild(div);
        });

        // Global Search
        if (v.length > 2) {
            try {
                const res = await fetch(`/api/rawg/games?search=${encodeURIComponent(v)}&page_size=5`);
                const data = await res.json();
                data.results.forEach(g => {
                    if (owned.some(o => o.title.toLowerCase() === g.name.toLowerCase())) return;
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `<img src="${g.background_image}"> <span>${g.name}</span>`;
                    div.onclick = () => {
                        showDetails(g);
                        collapseSearch();
                    };
                    searchResults.appendChild(div);
                });
            } catch (err) {
                console.error('Error in global search via proxy:', err);
            }
        }
    };

    async function showDetails(gameDataOrTitle) {
        const recommendBtn = document.getElementById('recommend-btn');
        let gameTitle;
        currentDetailGame = null;

        if (typeof gameDataOrTitle === 'string') {
            gameTitle = decodeURIComponent(gameDataOrTitle);
            const gameInLibrary = gameLibrary.find(g => g.title === gameTitle);
            if (gameInLibrary) {
                currentDetailGame = gameInLibrary;
                const fullGameDetails = await fetchGameDetails(gameTitle);
                if (fullGameDetails) {
                    Object.assign(currentDetailGame, {
                        title: fullGameDetails.name,
                        description: fullGameDetails.description_raw,
                        cover: fullGameDetails.background_image,
                        genres: fullGameDetails.genres,
                        platforms: fullGameDetails.platforms,
                        released: fullGameDetails.released
                    });
                }
            }
        } else {
            currentDetailGame = { ...gameDataOrTitle };
            gameTitle = currentDetailGame.name || currentDetailGame.title;

            if ((!currentDetailGame.description_raw && !currentDetailGame.description) && gameTitle) {
                 const fullGameDetails = await fetchGameDetails(gameTitle);
                if (fullGameDetails) {
                    Object.assign(currentDetailGame, {
                        title: fullGameDetails.name,
                        description: fullGameDetails.description_raw,
                        cover: fullGameDetails.background_image,
                        genres: fullGameDetails.genres,
                        platforms: fullGameDetails.platforms,
                        released: fullGameDetails.released
                    });
                }
            } else {
                currentDetailGame.title = currentDetailGame.title || currentDetailGame.name;
                currentDetailGame.cover = currentDetailGame.cover || currentDetailGame.background_image;
            }
        }

        if (!currentDetailGame || !currentDetailGame.title) {
            console.error("Could not determine game details for display.");
            await showAlertModal('Error', 'Failed to load game details.');
            return;
        }

        const isInWishlist = wishlistGameTitles.has(currentDetailGame.title.toLowerCase());
        const isInLibrary = playedGameTitles.has(currentDetailGame.title.toLowerCase());
        
        if (isInLibrary || isInWishlist) {
            recommendBtn.style.display = 'none';
        } else {
            recommendBtn.style.display = 'inline-flex';
        }

        document.getElementById('detail-title').innerText = currentDetailGame.title;
        document.getElementById('detail-img').src = currentDetailGame.cover || currentDetailGame.background_image || 'https://via.placeholder.com/600x400?text=No+Image';
        
        let detailDescHTML = '';
        const description = currentDetailGame.description_raw || currentDetailGame.description || 'No detailed description available.';
        
        if (currentDetailGame.my_rating) {
            const stars = generateStarRatingHTML(currentDetailGame.my_rating);
            detailDescHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; border-left: 4px solid var(--ps-light-blue);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <i class="fa fa-check-circle" style="color: var(--ps-light-blue);"></i>
                        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Kanav has played this</span>
                    </div>
                    <div style="font-size: 1.2rem;">${stars}</div>
                </div>
            `;
        }

        detailDescHTML += `<p>${description}</p>`;

        if (currentDetailGame.genres && currentDetailGame.genres.length > 0) {
            detailDescHTML += `<p style="margin-top:15px;"><strong>Genres:</strong> ${currentDetailGame.genres.map(g => g.name).join(', ')}</p>`;
        }
        if (currentDetailGame.platforms && currentDetailGame.platforms.length > 0) {
            detailDescHTML += `<p><strong>Platforms:</strong> ${currentDetailGame.platforms.map(p => p.platform.name).join(', ')}</p>`;
        }
        if (currentDetailGame.released) {
            detailDescHTML += `<p><strong>Release Date:</strong> ${currentDetailGame.released}</p>`;
        }
        if (currentDetailGame.recommendedBy) { 
            detailDescHTML += `<p><strong>Recommended By:</strong> ${currentDetailGame.recommendedBy}</p>`;
        }

        document.getElementById('detail-desc').innerHTML = detailDescHTML;

        const overlay = document.getElementById('detail-overlay');
        overlay.style.display = 'flex';
        setTimeout(() => overlay.style.opacity = '1', 10);
    }

    function showDetailsFromUI(encodedTitle) {
        showDetails(encodedTitle);
    }

    document.getElementById('btn-close-details').onclick = () => {
        const o = document.getElementById('detail-overlay');
        o.style.opacity = '0';
        setTimeout(() => o.style.display = 'none', 400);
    };

    document.getElementById('btn-settings').onclick = () => {
        settingsMenu.classList.add('open');
        showUI();
    };
    document.getElementById('btn-close-settings').onclick = () => settingsMenu.classList.remove('open');

    window.addEventListener('keydown', (e) => {
        if (!dashboardStarted) return;
        showUI();

        const inputModal = document.getElementById('input-modal');
        const alertModal = document.getElementById('alert-modal');
        if (inputModal.style.display === 'flex' || alertModal.style.display === 'flex') {
            return;
        }

        if (document.activeElement === searchInput) {
            if (e.key === 'Escape') {
                collapseSearch();
                searchInput.blur();
            }
            return;
        }

        switch(e.key) {
            case 'ArrowRight': moveRight(); break;
            case 'ArrowLeft': moveLeft(); break;
            case 'Escape': 
                settingsMenu.classList.remove('open'); 
                const o = document.getElementById('detail-overlay');
                if(o.style.display === 'flex') document.getElementById('btn-close-details').click();
                break;
        }
    });
