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
        function onYouTubeIframeAPIReady() {
            console.log("YouTube IFrame API is ready. Initializing player.");
            player = new YT.Player('youtube-player-container', {
                videoId: 'yajJ_QVIKwU', // The extracted video ID from https://youtu.be/t8NqwxeGVyY
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
            console.log("Player is ready. Attempting to play video.");
            event.target.playVideo();
            event.target.setVolume(50); // Ensure volume is set to a reasonable level

            // Give it a moment to try autoplay and then check its state
            setTimeout(() => {
                const playerState = event.target.getPlayerState();
                const speaker = document.getElementById('speaker'); // Get speaker here for check

                console.log(`Initial player state after 1s: ${playerState}, isMuted: ${event.target.isMuted()}`);

                // If not playing, or if it's playing but muted due to policy, then autoplay failed user expectation
                if (playerState !== YT.PlayerState.PLAYING || (playerState === YT.PlayerState.PLAYING && event.target.isMuted())) {
                    autoplayBlockedMessageActive = true;
                    if (speaker) {
                        speaker.classList.add('speaker-active-feedback'); // Add a class for visual feedback
                    }
                    event.target.mute(); // Ensure it's muted if it started playing silently
                    console.log("Autoplay blocked. Fallback message will be displayed after welcome messages.");
                } else {
                    // Autoplay successful and unmuted, music is playing
                    autoplayBlockedMessageActive = false;
                    hideDialogue(); // Ensure dialogue is hidden if it was showing for other reasons
                    console.log("Autoplay successful. Music playing.");
                }
            }, 1000); // 1 second to allow autoplay to attempt and browser to set state
        }

        // This function fires when the player's state changes
        function onPlayerStateChange(event) {
            console.log(`Player state changed to: ${event.data}`);
            // We can add logic here if needed for state changes, e.g., if video ends, ensure it loops.
            // However, 'loop: 1' and 'playlist: VIDEO_ID' in playerVars should handle looping.
        }

        window.onload = function() {
            const loader = document.getElementById('loader');
            const dialogueBox = document.getElementById('dialogue-box'); // Reintroduced
            const dialogueText = document.getElementById('dialogue-text'); // Reintroduced
            const beanBag = document.getElementById('bean-bag'); // The cyborg on the bean bag
            const speaker = document.getElementById('speaker'); // Get the speaker element once here

            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);

            // Initial welcome message sequence
            const welcomeMessages = [
                "Welcome to my digital room. I'm Kanav.",
                "Every item here tells a story, and some lead to pages I've crafted.",
                "Hover over objects that subtly shift, then click to explore them!"
            ];
            const messageDisplayDuration = 4000; // 2 seconds per message

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
                    console.log("Speaker clicked.");
                    if (player) {
                        if (player.isMuted()) {
                            player.unMute();
                            player.setVolume(50); // Ensure volume is set upon unmuting
                            player.playVideo(); // Always attempt to play on unMute click
                            console.log("Player unmuted and playing.");
                            console.log(`State after playVideo call: ${player.getPlayerState()}, isMuted: ${player.isMuted()}`);
                        } else {
                            player.mute();
                            console.log("Player muted.");
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
                        console.log(`You clicked on: ${asset.alt}`);
                    });
                }
            });
        };