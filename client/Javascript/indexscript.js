        // Global YouTube player variable
        let player;
        let autoplayBlockedMessageActive = false; // Flag to track if the fallback message is displayed

        // Function to show dialogue (global scope)
        function showDialogue(message) {
            const dialogueBox = document.getElementById('dialogue-box');
            const dialogueText = document.getElementById('dialogue-text');
            if (dialogueText && dialogueBox) {
                dialogueText.textContent = message;
                dialogueBox.style.visibility = 'visible';
                dialogueBox.style.opacity = '1';
            }
        }

        // Function to hide dialogue (global scope)
        function hideDialogue() {
            const dialogueBox = document.getElementById('dialogue-box');
            if (dialogueBox) {
                dialogueBox.style.opacity = '0';
                dialogueBox.style.visibility = 'hidden';
            }
        }

                    // This function will be called when the YouTube IFrame API is ready
                    function onYouTubeIframeAPIReady() {            player = new YT.Player('youtube-player-container', {
                videoId: 'pWJ_OAP-iWQ', // The extracted video ID from https://youtu.be/t8NqwxeGVyY
                playerVars: {
                    'autoplay': 1,      // Autoplay the video
                    'controls': 0,      // Hide player controls
                    'loop': 1,          // Loop the video
                    'modestbranding': 1, // Remove YouTube logo
                    'showinfo': 0,      // Hide video title and uploader info
                    'rel': 0,           // Do not show related videos
                    'disablekb': 1,     // Disable keyboard controls
                    'fs': 0,            // Disable fullscreen button
                    'iv_load_policy': 3, // Do not show video annotations
                    'playlist': 'yajJ_QVIKwU', // Required for looping single video
                    'origin': window.location.origin // Crucial for local development CORS issues
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        // This function fires once the video player is ready
        function onPlayerReady(event) {
            event.target.playVideo();
            event.target.setVolume(50); // Ensure volume is set to a reasonable level

            // Give it a moment to try autoplay and then check its state
            setTimeout(() => {
                const playerState = event.target.getPlayerState();
                const speaker = document.getElementById('speaker'); // Get speaker here for check

                // If not playing, or if it's playing but muted due to policy, then autoplay failed user expectation
                if (playerState !== YT.PlayerState.PLAYING || (playerState === YT.PlayerState.PLAYING && event.target.isMuted())) {
                    autoplayBlockedMessageActive = true;
                    if (speaker) {
                        speaker.classList.add('speaker-active-feedback'); // Add a class for visual feedback
                    }
                    event.target.mute(); // Ensure it's muted if it started playing silently
                } else {
                    // Autoplay successful and unmuted, music is playing
                    autoplayBlockedMessageActive = false;
                    hideDialogue(); // Ensure dialogue is hidden if it was showing for other reasons
                }
            }, 1000); // 1 second to allow autoplay to attempt and browser to set state
        }

        // This function fires when the player's state changes
        function onPlayerStateChange(event) {
            // We can add logic here if needed for state changes, e.g., if video ends, ensure it loops.
            // However, 'loop: 1' and 'playlist: VIDEO_ID' in playerVars should handle looping.
        }

        // Floating, mouse-reactive page icons for the loading screen.
        // Icons drift via Brownian motion in light grey; near the cursor they are
        // pulled toward it and light up to their page's accent color.
        // Returns a stop() function that halts animation and detaches listeners.
        function startLoaderIconField(canvas) {
            if (!canvas || !canvas.getContext) return function () {};
            const ctx = canvas.getContext('2d');

            // One Font Awesome 6 (Solid) glyph per page + its accent colour — same icons the site nav uses.
            const FA_FONT = '900 24px "Font Awesome 6 Free"';
            const ICONS = [
                { color: '#1DB954', glyph: '' }, // Music       fa-music      (Spotify green)
                { color: '#E50914', glyph: '' }, // Movies/TV   fa-film       (red)
                { color: '#006FCD', glyph: '' }, // Games       fa-gamepad    (PlayStation blue)
                { color: '#9B51E0', glyph: '' }, // Art         fa-brush      (purple)
                { color: '#F2C94C', glyph: '' }, // Food        fa-utensils   (yellow)
                { color: '#00B8D4', glyph: '' }, // Travel      fa-suitcase   (cyan)
                { color: '#8D6E63', glyph: '' }, // Literature  fa-book       (brown)
                { color: '#FF7A00', glyph: '' }, // Sport       fa-basketball (orange)
                { color: '#FF4FA3', glyph: '' }  // Projects    fa-code       (magenta)
            ];
            const BASE_GREY = [150, 150, 150]; // Light grey on the dark backdrop

            // Make sure the icon font is loaded before we paint glyphs on the canvas.
            let fontReady = false;
            if (document.fonts && document.fonts.load) {
                document.fonts.load(FA_FONT).then(function () { fontReady = true; }, function () { fontReady = true; });
            } else {
                fontReady = true;
            }

            const rgb = ICONS.map(function (i) {
                return [parseInt(i.color.slice(1, 3), 16), parseInt(i.color.slice(3, 5), 16), parseInt(i.color.slice(5, 7), 16)];
            });

            let w = 0, h = 0;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const mouse = { x: -9999, y: -9999 };
            const RADIUS = 200; // px influence radius around the cursor
            let particles = [];
            let rafId = null;

            function rand(min, max) { return min + Math.random() * (max - min); }

            const SIZE = 52;          // Uniform icon size (bigger than before)
            const RAD = SIZE * 0.42;  // Collision radius
            const SPEED = 0.7;        // DVD-style cruising speed

            function buildParticles() {
                // Repeat icons randomly; denser count scaled to the viewport area.
                const count = Math.max(50, Math.min(160, Math.round((w * h) / 11000)));
                particles = [];
                for (let k = 0; k < count; k++) {
                    const ang = rand(0, Math.PI * 2);
                    particles.push({
                        icon: Math.floor(Math.random() * ICONS.length),
                        x: rand(RAD, w - RAD), y: rand(RAD, h - RAD),
                        vx: Math.cos(ang) * SPEED, vy: Math.sin(ang) * SPEED,
                        size: SIZE,
                        lit: 0
                    });
                }
            }

            function resize() {
                const r = canvas.getBoundingClientRect();
                w = r.width; h = r.height;
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                if (!particles.length) buildParticles();
            }

            function frame() {
                ctx.clearRect(0, 0, w, h);

                // Icon-vs-icon collisions (equal-mass elastic) — they clash and ricochet
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const a = particles[i], b = particles[j];
                        const dx = b.x - a.x, dy = b.y - a.y;
                        const d = Math.hypot(dx, dy);
                        const minD = RAD * 2;
                        if (d > 0 && d < minD) {
                            const nx = dx / d, ny = dy / d;
                            // Separate the overlap
                            const overlap = (minD - d) / 2;
                            a.x -= nx * overlap; a.y -= ny * overlap;
                            b.x += nx * overlap; b.y += ny * overlap;
                            // Exchange velocity along the normal only if closing
                            const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                            if (rel < 0) {
                                a.vx += rel * nx; a.vy += rel * ny;
                                b.vx -= rel * nx; b.vy -= rel * ny;
                            }
                        }
                    }
                }

                for (let p of particles) {
                    // A touch of Brownian jitter so paths aren't perfectly straight
                    p.vx += rand(-0.04, 0.04);
                    p.vy += rand(-0.04, 0.04);

                    // Mouse attraction — stronger the closer the icon is
                    const dx = mouse.x - p.x, dy = mouse.y - p.y;
                    const dist = Math.hypot(dx, dy);
                    let target = 0;
                    if (dist < RADIUS) {
                        target = 1 - dist / RADIUS;
                        const pull = target * 0.005;
                        p.vx += (dx / (dist || 1)) * pull;
                        p.vy += (dy / (dist || 1)) * pull;
                    }
                    // Ease the "lit" factor toward the proximity target
                    p.lit += (target - p.lit) * 0.12;

                    // Keep a steady DVD-like cruising speed (let collisions/mouse steer direction)
                    const sp = Math.hypot(p.vx, p.vy) || 1;
                    const targetSp = SPEED * (1 + target * 0.6);
                    p.vx += (p.vx / sp) * (targetSp - sp) * 0.08;
                    p.vy += (p.vy / sp) * (targetSp - sp) * 0.08;

                    p.x += p.vx; p.y += p.vy;

                    // Bounce off the walls like a DVD logo
                    if (p.x < RAD) { p.x = RAD; p.vx = Math.abs(p.vx); }
                    else if (p.x > w - RAD) { p.x = w - RAD; p.vx = -Math.abs(p.vx); }
                    if (p.y < RAD) { p.y = RAD; p.vy = Math.abs(p.vy); }
                    else if (p.y > h - RAD) { p.y = h - RAD; p.vy = -Math.abs(p.vy); }

                    // Colour: grey -> accent by the lit factor
                    const c = rgb[p.icon], t = p.lit;
                    const cr = Math.round(BASE_GREY[0] + (c[0] - BASE_GREY[0]) * t);
                    const cg = Math.round(BASE_GREY[1] + (c[1] - BASE_GREY[1]) * t);
                    const cb = Math.round(BASE_GREY[2] + (c[2] - BASE_GREY[2]) * t);

                    if (!fontReady) continue; // wait until the Font Awesome glyphs can be drawn
                    const fontSize = p.size * (1 + t * 0.35);
                    ctx.save();
                    ctx.globalAlpha = 0.5 + t * 0.5;
                    ctx.shadowColor = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
                    ctx.shadowBlur = t * 18;
                    ctx.font = '900 ' + fontSize + 'px "Font Awesome 6 Free"';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
                    ctx.fillText(ICONS[p.icon].glyph, p.x, p.y);
                    ctx.restore();
                }
                rafId = requestAnimationFrame(frame);
            }

            function onMove(e) {
                const r = canvas.getBoundingClientRect();
                const pt = e.touches ? e.touches[0] : e;
                mouse.x = pt.clientX - r.left;
                mouse.y = pt.clientY - r.top;
            }
            function onLeave() { mouse.x = -9999; mouse.y = -9999; }

            window.addEventListener('resize', resize);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('touchmove', onMove, { passive: true });
            window.addEventListener('mouseout', onLeave);

            resize();
            frame();

            return function stop() {
                if (rafId) cancelAnimationFrame(rafId);
                window.removeEventListener('resize', resize);
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('touchmove', onMove);
                window.removeEventListener('mouseout', onLeave);
            };
        }

        window.onload = function() {
            const loader = document.getElementById('loader');
            const progressBarFill = document.querySelector('.progress-bar-fill');
            const ellipsisSpan = document.getElementById('ellipsis');
            const dialogueBox = document.getElementById('dialogue-box');
            const beanBag = document.getElementById('bean-bag');
            const speaker = document.getElementById('speaker');

            // ---- Loading-screen enhancements ----
            // Floating, mouse-reactive page icons behind the loader content.
            const stopLoaderBg = startLoaderIconField(document.getElementById('loader-bg'));

            // Escalating "he's busy" messages while the wait drags on.
            const busyText = document.getElementById('busy-text');
            const busyTimers = [];
            let busyInterval = null;

            function showBusyMessage(msg) {
                if (!busyText) return;
                busyText.classList.remove('visible'); // brief dip so each message re-fades in
                const t = setTimeout(() => {
                    busyText.textContent = msg;
                    busyText.classList.add('visible');
                }, 180);
                busyTimers.push(t);
            }

            function clearBusyMessages() {
                busyTimers.forEach(clearTimeout);
                if (busyInterval) clearInterval(busyInterval);
            }

            // 15s: "He's kinda busy right now…". 30s: "Ok, really busy…". Every +30s after: add a "really".
            busyTimers.push(setTimeout(() => {
                showBusyMessage("He's kinda busy right now…");
            }, 15000));
            busyTimers.push(setTimeout(() => {
                let reallyCount = 1;
                showBusyMessage("Ok, really busy…");
                busyInterval = setInterval(() => {
                    reallyCount++;
                    showBusyMessage("Ok, " + "really ".repeat(reallyCount) + "busy…");
                }, 30000);
            }, 30000));

            const images = document.querySelectorAll('img');
            let imagesLoaded = 0;
            const totalImages = images.length;
            let actualLoadingComplete = false; // True when all images are reported loaded (or window.load fires)
            let minTimeElapsed = false; // True when minDisplayTime has passed
            let loaderHidden = false; // Flag to ensure loader is hidden only once

            const minDisplayTime = 1500; // Minimum 1.5 seconds display time for the loader
            let startTime = Date.now();

            // Function to check if all conditions are met to hide the loader
            function checkAndHideLoader() {
                if (actualLoadingComplete && minTimeElapsed && !loaderHidden) {
                    loaderHidden = true;
                    clearBusyMessages();      // stop the escalating busy timers
                    if (stopLoaderBg) stopLoaderBg(); // stop & detach the icon field
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        loader.style.display = 'none';
                    }, 500); // Allow time for fade-out transition
                    clearInterval(ellipsisInterval); // Stop ellipsis animation

                    // Initial welcome message sequence
                    const welcomeMessages = [
                        "Welcome to my digital room. I'm Kanav.",
                        "Every item here tells a story, and some lead to pages I've crafted.",
                        "Hover over objects that subtly shift, then click to explore them!"
                    ];
                    const messageDisplayDuration = 4000; // 4 seconds per message

                    let currentMessageIndex = 0;

                    function displayNextWelcomeMessage() {
                        if (currentMessageIndex < welcomeMessages.length) {
                            showDialogue(welcomeMessages[currentMessageIndex]);
                            currentMessageIndex++;
                            setTimeout(displayNextWelcomeMessage, messageDisplayDuration);
                        } else {
                            hideDialogue();
                            beanBag.src = 'assets/Home/bean bag2.png'; // Revert bean bag after welcome sequence
                            // After welcome messages, check if autoplay was blocked and display the message
                            if (autoplayBlockedMessageActive) {
                                showDialogue("Autoplay blocked. Click the speaker for ambient music!");
                            }
                        }
                    }

                    // Start with bean bag3 for the welcome message
                    beanBag.src = 'assets/Home/bean bag3.png';
                    displayNextWelcomeMessage(); // Start the welcome message sequence
                }
            }

            function updateProgressBar() {
                let progress = 0;
                if (totalImages === 0) {
                    progress = 100; // No images, so consider it loaded
                } else {
                    progress = (imagesLoaded / totalImages) * 100;
                }
                progressBarFill.style.width = `${progress}%`;

                // Update ellipsis animation manually
                const dotCount = Math.floor((Date.now() / 500) % 3); // Cycle every 500ms
                if (dotCount === 0) ellipsisSpan.textContent = '.';
                else if (dotCount === 1) ellipsisSpan.textContent = '..';
                else if (dotCount === 2) ellipsisSpan.textContent = '...';
            }

            // Set up a continuous ellipsis animation and progress check
            const ellipsisInterval = setInterval(() => {
                updateProgressBar();
                // Check if minimum display time has passed
                if (Date.now() - startTime >= minDisplayTime) {
                    minTimeElapsed = true;
                }
                checkAndHideLoader();
            }, 160); // Roughly 60fps for visual updates

            images.forEach(image => {
                if (image.complete) {
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                        actualLoadingComplete = true;
                        updateProgressBar();
                        checkAndHideLoader();
                    }
                } else {
                    image.addEventListener('load', () => {
                        imagesLoaded++;
                        updateProgressBar();
                        if (imagesLoaded === totalImages) {
                            actualLoadingComplete = true;
                            checkAndHideLoader();
                        }
                    });
                    image.addEventListener('error', () => {
                        imagesLoaded++;
                        updateProgressBar();
                        if (imagesLoaded === totalImages) {
                            actualLoadingComplete = true;
                            checkAndHideLoader();
                        }
                    });
                }
            });

            // Initial progress bar update for already loaded images
            updateProgressBar();

            // Use window.addEventListener('load') for final completion check of all assets
            window.addEventListener('load', () => {
                actualLoadingComplete = true;
                // Force imagesLoaded to totalImages to ensure progress reaches 100%
                imagesLoaded = totalImages;
                updateProgressBar(); // Update progress bar to 100% visually
                checkAndHideLoader(); // Attempt to hide loader
            });

            // Also check if minDisplayTime has already passed on initial load
            if (Date.now() - startTime >= minDisplayTime) {
                minTimeElapsed = true;
                checkAndHideLoader();
            }

            // Preload the hover images to prevent a flash on first hover
            const hoverImageBeanBag3 = new Image();
            hoverImageBeanBag3.src = 'assets/Home/bean bag3.png';

            const hoverImageBeanBag2 = new Image();
            hoverImageBeanBag2.src = 'assets/Home/bean bag2.png';

            // Re-introduce bean-bag hover effect
            beanBag.addEventListener('mouseenter', () => {
                beanBag.src = 'assets/Home/bean bag3.png';
            });
            beanBag.addEventListener('mouseleave', () => {
                // Only revert if no dialogue is active from other assets
                if (dialogueBox.style.visibility === 'hidden') {
                    beanBag.src = 'assets/Home/bean bag2.png';
                }
            });

            // Speaker click listener for music toggle
            if (speaker) {
                speaker.addEventListener('click', () => {
                    if (player) {
                        if (player.isMuted()) {
                            player.unMute();
                            player.setVolume(50); // Ensure volume is set upon unmuting
                            player.playVideo(); // Always attempt to play on unMute click
                        } else {
                            player.mute();
                        }
                    }

                    // If the autoplay blocked message was active, hide it and remove speaker feedback
                    if (autoplayBlockedMessageActive) {
                        showDialogue("Music playing! Click again to mute."); // Give feedback that it's now playing
                        autoplayBlockedMessageActive = false;
                        speaker.classList.remove('speaker-active-feedback');
                        // Hide the dialogue after a short delay so it doesn't persist
                        setTimeout(hideDialogue, 2000);
                    }
                });
            }

            // Map asset IDs to their messages and links
            const interactiveAssets = {
                'ukulele': { message: "My music journey. Click to explore my sonic world!", link: "Music.html" },
                'posters': { message: "Movie & TV shows I've enjoyed. Click to see what's on!", link: "MoviesTV.html" },
                'ps5': { message: "Dive into my gaming adventures. Click to start the quest!", link: "Games.html" },
                'painting': { message: "My art inspirations. Click to discover my fav creative works!", link: "art.html" },
                'noodles': { message: "Food: more than just fuel. Click to savor my culinary recipes!", link: "Food.html" },
                'polaroids': { message: "Travel memories and destinations. Click to journey with me!", link: "Travel.html" },
                'bookshelf': { message: "My literary escape. Click to browse my favorite reads!", link: "Literature.html" },
                'dumbell': { message: "My sports journey. Click to play the sports I have played!", link: "Sport.html" },
                'monitor': { message: "Projects I have made. Click to see my work!", link: "Projects.html" },
                'phone-container': { message: "Connect with me! Click to explore my links.", link: "#"},  // Link handled by hologram links
                'dog': { message: "Don't disturb him." }
            };

            const assets = document.querySelectorAll('.asset');
            assets.forEach(asset => {
                const assetId = asset.id;
                const assetData = interactiveAssets[assetId];

                // Only apply hover effects to interactive assets
                if (assetData) {
                    asset.addEventListener('mouseenter', () => {
                        showDialogue(assetData.message);
                    });
                    asset.addEventListener('mouseleave', () => {
                        hideDialogue();
                    });
                    asset.addEventListener('click', (event) => {
                        if (assetData.link) { // Ensure there is a link to navigate to
                            if (event.ctrlKey || event.metaKey) { // Check for Ctrl (Windows/Linux) or Cmd (macOS) key
                                window.open(assetData.link, '_blank');
                                event.preventDefault(); // Prevent default link behavior if any
                            } else {
                                window.location.href = assetData.link;
                            }
                        }
                    });
                } else if (assetId === 'bean-bag') {
                    // Do nothing for bean-bag specific hover, as it's now controlled by others
                    // or the initial state. Its 'click' functionality is still implicitly handled if it were interactive.
                } else {
                    asset.addEventListener('click', () => {
                    });
                }
            });
        };