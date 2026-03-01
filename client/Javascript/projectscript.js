    /** --- FILE SYSTEM & DATA --- */
    const fileSystem = {
        "Desktop": {
            "My Computer": { 
                type: "system", 
                icon: "assets/projects/My Computer.ico",
                content: {
                    "Local Disk (C:)": { type: "folder", icon: "fas fa-hdd", color: "#7F8C8D", content: {} },
                    "CD Drive (D:)": { type: "folder", icon: "fas fa-compact-disc", color: "#7F8C8D", content: {} },
                    "Desktop": { type: "folder", icon: "fas fa-desktop", color: "#3593FF", content: "Desktop" }
                }
            },
            "Recycle Bin": { type: "system", icon: "fas fa-trash-alt", color: "#95A5A6" },
            "Chimera": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Blog Post.html": {
                        type: "notepad_render",
                        html: `
                            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:14px; line-height:1.4;">
                                <h2>Chimera: Elevating Large-Scale Neural Network Training</h2>
                                <p>Chimera is a groundbreaking framework designed for the efficient training of large-scale neural networks using bidirectional pipelines. This project addresses computational challenges in distributed AI systems by optimizing data flow and resource utilization.</p>
                                <h3>Key Innovations:</h3>
                                <ul>
                                    <li><strong>Bidirectional Pipelines:</strong> Implemented a novel approach to pipeline parallelism that significantly enhances data flow efficiency.</li>
                                    <li><strong>Resource Optimization:</strong> Maximizes GPU/CPU utilization across multiple distributed nodes.</li>
                                </ul>
                            </div>
                        `
                    },
                    "Github Link.url": {
                        type: "url_redirect",
                        url: "https://github.com/nikunj169/Chimera-Efficiently-Training-Large-Scale-Neural-Networks-with-Bidirectional-Pipelines",
                        icon: "assets/projects/exe-icon.png"
                    },
                    "Video Demo.mp4": { type: "app", appId: "wmp", path: "Chimera_Demo.mp4", icon: "fas fa-film", color: "#9B59B6" }
                }
            },
            "8BIT": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Blog Post.html": {
                        type: "notepad_render",
                        html: `
                            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:14px; line-height:1.4;">
                                <h2>8BIT: Collaborative Club Website</h2>
                                <p>Developed as a team project, the 8BIT website serves as a digital hub for a student club, focusing on community engagement and responsive design.</p>
                                <h3>Contributions:</h3>
                                <ul>
                                    <li><strong>Front-End Development:</strong> Built interactive UI components using HTML5, CSS3, and JavaScript.</li>
                                    <li><strong>Content Management:</strong> Implemented a flexible system for updating club events and resources.</li>
                                </ul>
                            </div>
                        `
                    },
                    "Github Link.url": {
                        type: "url_redirect",
                        url: "https://github.com/PVSSukeerthi/8BIT",
                        icon: "assets/projects/exe-icon.png"
                    },
                    "Video Demo.mp4": { type: "app", appId: "wmp", path: "8BIT_Demo.mp4", icon: "fas fa-film", color: "#9B59B6" }
                }
            },
            "MusicBucket": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Blog Post.html": {
                        type: "notepad_render",
                        html: `
                            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:14px; line-height:1.4;">
                                <h2>MusicBucket: Personalized Music Discovery</h2>
                                <p>MusicBucket transforms how enthusiasts interact with music by providing detailed habit tracking and discovery tools through the Spotify API.</p>
                                <h3>Technical Stack:</h3>
                                <ul>
                                    <li><strong>Frontend:</strong> React.js and TypeScript for a robust, type-safe user experience.</li>
                                    <li><strong>Backend:</strong> Supabase and PostgreSQL for real-time data storage and analytics.</li>
                                    <li><strong>API Integration:</strong> Seamlessly manages data synchronization with the Spotify Web API.</li>
                                </ul>
                            </div>
                        `
                    },
                    "Github Link.url": {
                        type: "url_redirect",
                        url: "https://github.com/Paradox-73/MusicBucket",
                        icon: "assets/projects/exe-icon.png"
                    },
                    "Video Demo.mp4": { type: "app", appId: "wmp", path: "MusicBucket_Demo.mp4", icon: "fas fa-film", color: "#9B59B6" }
                }
            },
            "Personal Media Intelligence Hub": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Blog Post.html": {
                        type: "notepad_render",
                        html: `
                            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:14px; line-height:1.4;">
                                <h2>Personal Media Intelligence Hub (PMIH)</h2>
                                <p>PMIH is a hyper-personalized ML-powered recommendation engine that predicts personal ratings across diverse media domains including games, movies, and music.</p>
                                <h3>ML Innovations:</h3>
                                <ul>
                                    <li><strong>XGBoost Models:</strong> Fine-tuned models for accurate rating prediction based on personal consumption data.</li>
                                    <li><strong>Semantic Embeddings:</strong> Utilized Sentence-Transformers to grasp nuanced relationships between media titles and descriptions.</li>
                                </ul>
                            </div>
                        `
                    },
                    "Github Link.url": {
                        type: "url_redirect",
                        url: "https://github.com/Paradox-73/Personal_Media_Intelligence_Hub.git",
                        icon: "assets/projects/exe-icon.png"
                    },
                    "Video Demo.mp4": { type: "app", appId: "wmp", path: "PMIH_Demo.mp4", icon: "fas fa-film", color: "#9B59B6" }
                }
            },
            "WhatsApp Chat Analyzer": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Blog Post.html": {
                        type: "notepad_render",
                        html: `
                            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:14px; line-height:1.4;">
                                <h2>WhatsApp Chat Analyzer: Private Data Insights</h2>
                                <p>A privacy-first analytics tool designed to visualize social dynamics and communication patterns in WhatsApp group chats.</p>
                                <h3>Key Features:</h3>
                                <ul>
                                    <li><strong>Local Analysis:</strong> Ensures user privacy by processing all data 100% locally.</li>
                                    <li><strong>Psychometric Metrics:</strong> Extracts insights like response speeds and conversational dominance patterns.</li>
                                </ul>
                            </div>
                        `
                    },
                    "Github Link.url": {
                        type: "url_redirect",
                        url: "https://github.com/Paradox-73/Whatsapp-Chat-Analyzer",
                        icon: "assets/projects/exe-icon.png"
                    },
                    "Video Demo.mp4": { type: "app", appId: "wmp", path: "WhatsappChatInsider_Demo.mp4", icon: "fas fa-film", color: "#9B59B6" }
                }
            },
            "Inji Verify": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Blog Post.html": {
                        type: "notepad_render",
                        html: `
                            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:14px; line-height:1.4;">
                                <h2>Inji Verify: Secure Offline Identity</h2>
                                <p>An advanced cryptographic solution addressing the need for secure, offline identity verification with full privacy preservation.</p>
                                <h3>Cryptography:</h3>
                                <ul>
                                    <li><strong>Zero-Knowledge Proofs:</strong> Processes sensitive data locally to ensure Decentralized Identity (DID) compliance.</li>
                                    <li><strong>High Speed:</strong> Achieved rapid verification speeds of less than 200ms directly on-device.</li>
                                </ul>
                            </div>
                        `
                    },
                    "Github Link.url": {
                        type: "url_redirect",
                        url: "https://github.com/Paradox-73/Inji-Verify-Offline-Verification",
                        icon: "assets/projects/exe-icon.png"
                    },
                    "Video Demo.mp4": { type: "app", appId: "wmp", path: "InjiVerify_Demo.mp4", icon: "fas fa-film", color: "#9B59B6" }
                }
            },
            "Predictive Auto-Scaling": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Blog Post.html": {
                        type: "notepad_render",
                        html: `
                            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:14px; line-height:1.4;">
                                <h2>Predictive Auto-Scaling for ML Applications</h2>
                                <p>Optimizes resource management in MLOps by predicting resource load for Dockerized machine learning applications.</p>
                                <h3>MLOps Advancements:</h3>
                                <ul>
                                    <li><strong>Time-Series Forecasting:</strong> Employs historical data to proactively scale containers before demand spikes occur.</li>
                                    <li><strong>Cost Efficiency:</strong> Significantly reduces operational infrastructure costs by preventing over-provisioning.</li>
                                </ul>
                            </div>
                        `
                    },
                    "Github Link.url": {
                        type: "url_redirect",
                        url: "https://github.com/Ivan825/Predictive-Auto-Scaling-of-Dockerized-ML-Applications",
                        icon: "assets/projects/exe-icon.png"
                    },
                    "Video Demo.mp4": { type: "app", appId: "wmp", path: "PredictiveAutoScaling_Demo.mp4", icon: "fas fa-film", color: "#9B59B6" }
                }
            },
            "My Resume.doc": {
                type: "app",
                appId: "pdfViewer",
                path: "assets/Resume.pdf",
                icon: "assets/projects/notepad.png",
                color: "#2B579A"
            },
            "Contact Me": {
                type: "app",
                appId: "contactForm",
                icon: "fas fa-envelope",
                color: "#0072C6"
            },
            "Paint": { type: "app", appId: "paint", icon: "fas fa-paint-brush", color: "#C0392B", side: "right" },
            "Command Prompt": { type: "app", appId: "cmd", icon: "fas fa-terminal", color: "#333", side: "right" },
            "Minesweeper": { type: "app", appId: "minesweeper", icon: "fas fa-bomb", color: "black", side: "right" },
            "Calculator": { type: "app", appId: "calc", icon: "fas fa-calculator", color: "#27AE60", side: "right" },
            "Internet Explorer": { type: "app", appId: "ie", icon: "assets/projects/Internet Explorer 6.png" },
            "Menu": {
                type: "folder",
                icon: "assets/projects/folder.png",
                content: {
                    "Home.html": { type: "external_link", url: "index.html", icon: "fas fa-home" },
                    "Music.html": { type: "external_link", url: "Music.html", icon: "fas fa-music" },
                    "MoviesTV.html": { type: "external_link", url: "MoviesTV.html", icon: "fas fa-film" },
                    "Games.html": { type: "external_link", url: "Games.html", icon: "fas fa-gamepad" },
                    "Art.html": { type: "external_link", url: "art.html", icon: "fas fa-palette" },
                    "Food.html": { type: "external_link", url: "Food.html", icon: "fas fa-utensils" },
                    "Travel.html": { type: "external_link", url: "Travel.html", icon: "fas fa-plane" },
                    "Literature.html": { type: "external_link", url: "Literature.html", icon: "fas fa-book" },
                    "Sport.html": { type: "external_link", url: "Sport.html", icon: "fas fa-running" },
                    "Projects.html": { type: "external_link", url: "Projects.html", icon: "fas fa-code" }
                }
            }
        },
        "My Documents": {
            "Notes": { "todo.txt": "1. Buy milk\n2. Code XP clone" },
            "Images": { "sunset.jpg": "image_data" }
        },
        "My Computer": {
            "Local Disk (C:)": { type: "folder", icon: "fas fa-hdd", color: "#7F8C8D", content: {} },
            "CD Drive (D:)": { type: "folder", icon: "fas fa-compact-disc", color: "#7F8C8D", content: {} },
            "Desktop": { type: "folder", icon: "fas fa-desktop", color: "#3593FF", content: "Desktop" }
        }
    };

    /** --- STATE MANAGEMENT --- */
    let windows = [];
    let windowIdCounter = 0;
    let zIndexCounter = 100;
    let activeWindow = null;
    let clipboard = "";
    
    function openExternalURLSafely(url) {
        window.open(url, '_blank');
    }

    function showWelcomeWindow() {
        const isMobile = window.innerWidth <= 768;
        const welcomeContent = `
            <div style="padding: 20px; font-family: 'Tahoma', sans-serif; height: 100%; display: flex; flex-direction: column;">
                <div style="flex: 1;">
                    <h1 style="margin-top: 0; font-size: ${isMobile ? '24px' : '32px'}">Hi, I'm Kanav.</h1>
                    <p style="font-size: 16px; line-height: 1.5;">
                        I'm a CSE student building scalable systems and intelligent models.
                        ${isMobile ? '<br><br><i>(Tap "Projects" to see my work!)</i>' : ''}
                    </p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: auto; margin-bottom: 20px;">
                    <button class="calc-btn" style="padding: 15px; font-weight: bold; background: #27AE60; color: white;" onclick="openPath('Desktop')">
                        📂 View Projects
                    </button>
                    <button class="calc-btn" style="padding: 15px; font-weight: bold;" onclick="openExternalURLSafely('assets/Resume.pdf')">
                        📄 Download Resume
                    </button>
                    <button class="calc-btn" style="padding: 15px; font-weight: bold;" onclick="window.location.href='index.html'">
                        🏠 Go to Homepage
                    </button>
                </div>
            </div>
        `;

        const width = isMobile ? window.innerWidth : 500;
        const height = isMobile ? window.innerHeight - 30 : 450;

        const win = createWindow("Welcome - Kanav's Portfolio", width, height, "fas fa-user-circle");
        win.innerHTML = welcomeContent;

        if (!isMobile) {
            const winEl = win.parentElement.parentElement;
            winEl.style.top = "15%";
            winEl.style.left = "calc(50% - " + (width / 2) + "px)";
        }
    }

    window.onload = function() {
        renderDesktop();
        updateClock();
        setInterval(updateClock, 1000);
        showWelcomeWindow();
    };


    /** --- CORE FUNCTIONS --- */
    
    function updateClock() {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function toggleStartMenu() {
        const menu = document.getElementById('start-menu');
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        // Also hide All Programs menu if Start Menu is closing
        if (menu.style.display === 'none') {
            const allProgramsMenu = document.getElementById('all-programs-menu');
            if (allProgramsMenu) allProgramsMenu.style.display = 'none';
        }
    }

    function toggleAllProgramsMenu() {
        const allProgramsMenu = document.getElementById('all-programs-menu');
        const allProgramsBtn = document.getElementById('all-programs-btn');
        
        if (allProgramsMenu.style.display === 'flex') {
            allProgramsMenu.style.display = 'none';
        } else {
            allProgramsMenu.style.display = 'flex';
            
            const btnRect = allProgramsBtn.getBoundingClientRect();
            const startMenuRect = document.getElementById('start-menu').getBoundingClientRect();

            // Position it to the right of the button
            allProgramsMenu.style.left = (btnRect.width - 5) + 'px';
            // Align bottom with the button's bottom
            allProgramsMenu.style.bottom = (startMenuRect.height - (btnRect.top - startMenuRect.top) - btnRect.height) + 'px';
        }
        if (typeof event !== 'undefined') event.stopPropagation();
    }

    // Global click listener to close things
    document.addEventListener('click', (e) => {
        // Close start menu
        const menu = document.getElementById('start-menu');
        const btn = document.getElementById('start-btn');
        if (!menu.contains(e.target) && !btn.contains(e.target) && menu.style.display === 'flex') {
            menu.style.display = 'none';
        }

        // Close dropdown menus
        if (!e.target.classList.contains('menu-btn')) {
            document.querySelectorAll('.menu-dropdown').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.menu-btn').forEach(el => el.classList.remove('active'));
        }
    });

    function toggleMenu(id, btn) {
        // Close others
        const allMenus = document.querySelectorAll('.menu-dropdown');
        const allBtns = document.querySelectorAll('.menu-btn');
        let wasVisible = false;
        
        const target = document.getElementById(id);
        if(target.style.display === 'block') wasVisible = true;

        allMenus.forEach(el => el.style.display = 'none');
        allBtns.forEach(el => el.classList.remove('active'));

        if (!wasVisible) {
            target.style.display = 'block';
            btn.classList.add('active');
        }
        
        // Stop propagation to prevent immediate close by global listener
        event.stopPropagation();
    }

    function renderDesktop() {
        const desktop = document.getElementById('desktop');
        desktop.innerHTML = "";
        
        // Detect mobile
        const isMobile = window.innerWidth <= 768;

        const leftSide = document.createElement('div');
        leftSide.id = 'desktop-left';
        leftSide.style.cssText = "height: 100%; display: flex; flex-direction: column; flex-wrap: wrap; align-content: flex-start;";
        
        const rightSide = document.createElement('div');
        rightSide.id = 'desktop-right';
        rightSide.style.cssText = "height: 100%; position: absolute; right: 10px; top: 10px; display: flex; flex-direction: column; align-items: flex-end;";
        
        desktop.appendChild(leftSide);
        desktop.appendChild(rightSide);

        const root = fileSystem["Desktop"];
        Object.keys(root).forEach(key => {
            const item = root[key];
            const el = document.createElement('div');
            el.className = 'desktop-icon';
            
            // Icon Selection Logic
            let iconHtml = '';
            let onClick = () => openFile('Desktop', key);

            if (item.icon) {
                if (item.icon.startsWith('assets/') || item.icon.startsWith('http')) {
                    iconHtml = `<img src="${item.icon}" alt="${key}" width="32" height="32">`;
                } else {
                    iconHtml = `<i class="${item.icon}" style="color: ${item.color || 'white'};"></i>`;
                }
            } else if (typeof item === 'string' && key.endsWith('.txt')) {
                iconHtml = `<img src="assets/projects/notepad.png" alt="Text File" width="32" height="32">`;
            } else if (item.type === 'folder') {
                iconHtml = `<img src="assets/projects/folder.png" alt="Folder" width="32" height="32">`;
            } else if (item.type === 'app') {
                iconHtml = `<i class="fas fa-cog" style="color: ${item.color || 'white'};"></i>`;
            } else {
                iconHtml = `<i class="fas fa-file" style="color: white;"></i>`;
            }

            if (item.type === 'system' && key === 'My Computer') {
                onClick = () => openExplorer('My Computer');
            } else if (key === 'Recycle Bin') {
                onClick = () => alert('Recycle Bin is empty!');
            } else if (item.type === 'external_link') {
                onClick = () => window.open(item.url, '_blank');
            } else if (item.type === 'folder') {
                onClick = () => openExplorer('Desktop/' + key);
            } else if (item.type === 'app') {
                if (item.appId === 'pdfViewer') onClick = () => openExternalURLSafely(item.path);
                else if (item.appId === 'emailClient') onClick = () => openExternalURLSafely('mailto:kanavbhardwaj5150@gmail.com');
                else onClick = () => openApp(item.appId);
            }

            el.innerHTML = `${iconHtml}<div class="icon-text">${key}</div>`;
            
            if (isMobile) {
                el.onclick = onClick;
            } else {
                el.onclick = () => {
                    document.querySelectorAll('.desktop-icon').forEach(i => i.style.background = 'transparent');
                    el.style.background = 'rgba(255,255,255,0.2)';
                };
                el.ondblclick = onClick;
            }

            const targetContainer = (item.side === 'right') ? rightSide : leftSide;
            targetContainer.appendChild(el);
        });
    }
            
            window.addEventListener('resize', renderDesktop); // Add this line
    /** --- WINDOW MANAGER LOGIC --- */

    function createWindow(title, width, height, iconClass = "fas fa-window-maximize") {
        const id = windowIdCounter++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `win-${id}`;
        win.style.width = width + 'px';
        win.style.height = height + 'px';
        win.style.top = (50 + (id * 20)) + 'px';
        win.style.left = (50 + (id * 20)) + 'px';
        win.style.zIndex = ++zIndexCounter;

        win.innerHTML = `
            <div class="title-bar" onmousedown="startDrag(event, '${id}')">
                <div class="title-text"><i class="${iconClass}"></i> ${title}</div>
                <div class="window-controls">
                    <button class="control-btn" onclick="minimizeWindow('${id}')">_</button>
                    <button class="control-btn" onclick="toggleMaximize('${id}')">□</button>
                    <button class="control-btn btn-close" onclick="closeWindow('${id}')">X</button>
                </div>
            </div>
            <div class="window-body">
                <div class="window-content" id="win-content-${id}"></div>
            </div>
            <div class="resize-handle" onmousedown="startResize(event, '${id}')"></div>
        `;

        win.onmousedown = () => focusWindow(id);
        document.body.appendChild(win);
        
        // Add to Taskbar
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item active';
        taskItem.id = `task-${id}`;
        taskItem.innerHTML = `<i class="${iconClass}" style="margin-right:5px"></i> ${title}`;
        taskItem.onclick = () => focusWindow(id);
        document.getElementById('task-list').appendChild(taskItem);

        windows.push({ id, title, minimized: false, maximized: false, lastRect: null });
        focusWindow(id);
        
        // Return content div specifically
        return document.getElementById(`win-content-${id}`);
    }

    function closeWindow(id) {
        const win = document.getElementById(`win-${id}`);
        if(win) win.remove();
        const task = document.getElementById(`task-${id}`);
        if(task) task.remove();
        windows = windows.filter(w => w.id != id);
    }

    function focusWindow(id) {
        const win = document.getElementById(`win-${id}`);
        if(win) {
            win.style.zIndex = ++zIndexCounter;
            win.style.display = 'flex';
            document.querySelectorAll('.task-item').forEach(t => t.classList.remove('active'));
            const task = document.getElementById(`task-${id}`);
            if(task) task.classList.add('active');
            activeWindow = id;
        }
    }

    function minimizeWindow(id) {
        const win = document.getElementById(`win-${id}`);
        win.style.display = 'none';
        document.getElementById(`task-${id}`).classList.remove('active');
    }

    function toggleMaximize(id) {
        const win = document.getElementById(`win-${id}`);
        const obj = windows.find(w => w.id == id);
        if (!obj.maximized) {
            obj.lastRect = { top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height };
            win.style.top = '0px';
            win.style.left = '0px';
            win.style.width = '100%';
            win.style.height = 'calc(100% - 30px)'; // Account for taskbar
            obj.maximized = true;
        } else {
            win.style.top = obj.lastRect.top;
            win.style.left = obj.lastRect.left;
            win.style.width = obj.lastRect.width;
            win.style.height = obj.lastRect.height;
            obj.maximized = false;
        }
    }

    // Dragging Logic
    let dragObj = null;
    let offsetX, offsetY;
    function startDrag(e, id) {
        // Prevent drag if maximizing
        const wObj = windows.find(w => w.id == id);
        if (wObj && wObj.maximized) return;

        dragObj = document.getElementById(`win-${id}`);
        const rect = dragObj.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }
    function doDrag(e) {
        if (!dragObj) return;
        dragObj.style.top = (e.clientY - offsetY) + 'px';
        dragObj.style.left = (e.clientX - offsetX) + 'px';
    }
    function stopDrag() {
        dragObj = null;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // Resizing Logic
    let resizeObj = null;
    let startWidth, startHeight, startMouseX, startMouseY;

    function startResize(e, id) {
        // Prevent drag from interfering with resize
        e.stopPropagation();
        
        resizeObj = document.getElementById(`win-${id}`);
        startWidth = parseInt(document.defaultView.getComputedStyle(resizeObj).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(resizeObj).height, 10);
        startMouseX = e.clientX;
        startMouseY = e.clientY;

        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
    }

    function doResize(e) {
        if (!resizeObj) return;

        const minWidth = 200; // Minimum width for a window
        const minHeight = 150; // Minimum height for a window

        let newWidth = startWidth + (e.clientX - startMouseX);
        let newHeight = startHeight + (e.clientY - startMouseY);

        resizeObj.style.width = Math.max(minWidth, newWidth) + 'px';
        resizeObj.style.height = Math.max(minHeight, newHeight) + 'px';
    }

    function stopResize() {
        resizeObj = null;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
    }

    /** --- APP LAUNCHERS --- */

    function openApp(appId) {
        document.getElementById('start-menu').style.display = 'none';
        if (appId === 'cmd') launchCMD();
        else if (appId === 'notepad') launchNotepad();
        else if (appId === 'calc') launchCalculator();
        else if (appId === 'paint') launchPaint();
        else if (appId === 'ie') launchIE();
        else if (appId === 'wmp') launchWMP();
        else if (appId === 'minesweeper') launchMinesweeper();
        else if (appId === 'pdfViewer') window.open(fileSystem.Desktop["My Resume.doc"].path, '_blank');
        else if (appId === 'contactForm') launchContactForm();
        else alert('Application not installed.');
    }

    function openPath(path) {
        document.getElementById('start-menu').style.display = 'none';
        openExplorer(path);
    }

    // Helper to find file object by path string (e.g., "Desktop/My Documents/Notes/todo.txt")
    function getPathObject(pathString) {
        if (pathString === 'Desktop') return fileSystem.Desktop;
        const parts = pathString.split('/');
        let current = fileSystem;
        for (const part of parts) {
            if (!current || typeof current !== 'object') {
                return undefined; // Current segment is not an object or null/undefined
            }
            if (current[part]) { // Direct property
                current = current[part];
            } else if (current.content && current.content[part]) { // Property inside a 'content' object (for folders)
                current = current.content[part];
            } else {
                return undefined; // Path segment not found
            }
            // Follow Desktop shortcut
            if (current && current.content === "Desktop") {
                return fileSystem.Desktop;
            }
        }
        return current;
    }

    function openFile(parentPath, filename) {
        const parentDir = getPathObject(parentPath);
        if (!parentDir) {
            console.error(`Parent directory not found for path: ${parentPath}`);
            alert('Error: Parent directory not found.');
            return;
        }

        const fileObj = (parentDir.content && parentDir.content[filename]) ? parentDir.content[filename] : parentDir[filename];

        if (!fileObj) {
            alert(`File "${filename}" not found in "${parentPath}".`);
            return;
        }
        
        // Find file content
        // Simple traversal for demo
        let content = "Error: Could not read file content.";
        if (typeof fileObj === 'string') {
            content = fileObj; // Direct string content
        } else if (fileObj.html) { // For ie_render type
            content = fileObj.html;
        } else if (fileObj.path) { // For app types like PDF viewer
            content = fileObj.path;
        }
        
        if (fileObj.type === 'notepad_render' && fileObj.html) {
            launchNotepad(filename, fileObj.html); // Pass HTML content to Notepad
        } else if (filename.endsWith('.txt') || filename.endsWith('.js') || filename.endsWith('.py')) {
            launchNotepad(filename, content);
        } else if (filename.endsWith('.mp4') || filename === 'demo.mp4') {
            launchWMP(filename);
        } else if (filename.endsWith('.url')) {
            // If it's a .url file that is an ie_render type, then launch with its HTML
            if (fileObj.type === 'ie_render' && fileObj.html) {
                launchIE(fileObj.html, filename.replace(/\.url$/i, ''));
            } else {
                launchIE("about:blank", filename); // Fallback
            }
        } else if (fileObj.type === 'external_link') {
            window.open(fileObj.url, '_blank');
        } else if (fileObj.type === 'url_redirect') {
            window.open(fileObj.url, '_blank');
        } else if (fileObj.type === 'app' && fileObj.appId === 'wmp') {
            launchWMP(fileObj.path || "Video Demo"); // Pass the path for the WMP
        } else if (fileObj.type === 'app' && fileObj.appId === 'pdfViewer') {
            window.open(fileObj.path, '_blank');
        } else {
            alert(`No default application for ${filename}.`);
        }
    }

    function openProject(projectName) {
        let projectEntry = null;
        const desktopItems = fileSystem.Desktop;
        
        // Find the project by name (case-insensitive)
        for (const key in desktopItems) {
            if (key.toLowerCase() === projectName.toLowerCase()) {
                projectEntry = desktopItems[key];
                break;
            }
        }

        if (projectEntry && projectEntry.type === 'folder') {
            openExplorer(`Desktop/${projectName}`); // Open the project folder in explorer
        } else {
            alert(`Project '${projectName}' not found or cannot be opened as a folder.`);
        }
    }

    /** --- APP IMPLEMENTATIONS --- */

    // 1. EXPLORER
    function openExplorer(path) {
        const container = createWindow(path, 600, 400, "fas fa-folder-open");
        
        const currentDirObject = getPathObject(path);

        if (!currentDirObject || (currentDirObject.type === 'system' && path !== 'My Computer')) {
            container.innerHTML = `<div style="padding:15px;">Error: Path "${path}" not found or cannot be opened.</div>`;
            return;
        }

        const items = currentDirObject.content || currentDirObject; // Use content if it's a folder, otherwise the object itself

        let itemsHtml = '';
        Object.keys(items).forEach(key => {
            if(key === 'type' || key === 'icon' || key === 'color' || key === 'path' || key === 'appId' || key === 'html') return; // Exclude metadata
            
            const item = items[key];
            let icon = "fas fa-file";
            let color = "#333";
            let typeClass = "text";
            let dblClick = `openFile('${path}', '${key}')`;

            let iconRender = '';
            if (item.icon) {
                if (item.icon.startsWith('assets/') || item.icon.startsWith('http')) { // Assume it's an image path
                    iconRender = `<img src="${item.icon}" alt="${key}" width="32" height="32">`;
                } else { // Assume it's a Font Awesome class
                    iconRender = `<i class="${item.icon}" style="color: ${item.color || 'white'};"></i>`;
                }
            } else if (item.type === 'system' && key === 'My Computer') {
                icon = "assets/projects/My Computer.ico"; // Example system icon
                iconRender = `<img src="${icon}" alt="${key}" width="32" height="32">`;
            } else if (item.type === 'folder' || (typeof item === 'object' && item.content)) { // Explicit folder or object with content
                icon = "fas fa-folder";
                color = "#EBC657";
                iconRender = `<i class="${icon}" style="color: ${color};"></i>`;
            } else if (key.endsWith('.js')) { 
                icon = "fab fa-js"; 
                color = "#F1C40F"; 
                typeClass="code";
                iconRender = `<i class="${icon}" style="color: ${color};"></i>`;
            } else if (key.endsWith('.mp4')) { 
                icon = "fas fa-film"; 
                color = "#9B59B6";
                iconRender = `<i class="${icon}" style="color: ${color};"></i>`;
            } else if (key.endsWith('.url')) { 
                icon = "assets/projects/exe-icon.png"; 
                typeClass="app";
                iconRender = `<img src="${icon}" alt="${key}" width="32" height="32">`;
            } else if (item.type === 'ie_render') { 
                icon = "assets/projects/notepad.png"; 
                typeClass="text";
                iconRender = `<img src="${icon}" alt="${key}" width="32" height="32">`;
            } else if (item.type === 'url_redirect') { 
                icon = item.icon || "assets/projects/Internet Explorer 6.png"; 
                typeClass="link";
                iconRender = `<img src="${icon}" alt="${key}" width="32" height="32">`;
            } else if (item.type === 'app' && item.appId === 'wmp') { 
                icon = item.icon || "fas fa-film"; 
                typeClass="video";
                iconRender = `<i class="${icon}" style="color: ${item.color || '#333'};"></i>`;
            } else if (item.type === 'app' && item.appId === 'pdfViewer') { 
                icon = "assets/projects/notepad.png"; 
                typeClass="pdf";
                iconRender = `<img src="${icon}" alt="${key}" width="32" height="32">`;
            } else if (item.type === 'app') { 
                icon = item.icon || "fas fa-cog"; 
                color = "#777"; 
                typeClass="app";
                iconRender = `<i class="${icon}" style="color: ${color};"></i>`;
            } else {
                iconRender = `<i class="${icon}" style="color: ${color};"></i>`;
            }

            if (item.type === 'system' && key === 'My Computer') {
                dblClick = `openExplorer('${path}/${key}')`;
            } else if (item.type === 'external_link') {
                dblClick = `window.open('${item.url}', '_blank')`;
            } else if (item.type === 'folder' || (typeof item === 'object' && item.content)) {
                dblClick = `openExplorer('${path}/${key}')`;
            }

            itemsHtml += item.type === 'url_redirect' ? `
                <a href="${item.url}" target="_blank" class="file-item" style="text-decoration: none; color: inherit;" onclick="this.style.background='#CCE8FF'; this.style.border='1px solid #99D1FF'">
                    ${iconRender}
                    <div style="font-size:11px; word-break: break-all;">${key}</div>
                </a>
            ` : `
                <div class="file-item" onclick="this.style.background='#CCE8FF'; this.style.border='1px solid #99D1FF'" ondblclick="${dblClick}">
                    ${iconRender}
                    <div style="font-size:11px; word-break: break-all;">${key}</div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="explorer-toolbar">
                <div class="control-btn" style="color:black; border:1px solid #ccc; width:60px;">Back</div>
                <div class="explorer-address">
                    <span>Address</span>
                    <input type="text" class="address-bar" value="${path}" onkeydown="if(event.key==='Enter') openExplorer(this.value)">
                </div>
            </div>
            <div class="explorer-view">
                ${itemsHtml}
            </div>
        `;
    }

    // 2. CMD
    function launchCMD() {
        const container = createWindow("C:\\WINDOWS\\system32\\cmd.exe", 500, 300, "fas fa-terminal");
        container.innerHTML = `
            <div class="cmd-body" id="cmd-out">
                <div>Microsoft Windows XP [Version 5.1.2600]</div>
                <div>(C) Copyright 1985-2001 Microsoft Corp.</div>
                <br>
                <div id="cmd-history"></div>
                <div>C:\\Documents and Settings\\Administrator> <input type="text" class="cmd-input" id="cmd-in" autofocus></div>
            </div>
        `;
        const input = container.querySelector('#cmd-in');
        const history = container.querySelector('#cmd-history');
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                const line = document.createElement('div');
                line.innerHTML = `C:\\Documents and Settings\\Administrator> ${cmd}`;
                history.appendChild(line);
                
                // Process Command
                const response = document.createElement('div');
                response.style.marginBottom = "10px";
                
                if (cmd === 'help') response.innerText = "Supported commands: dir, cls, help, ver, echo, exit, type skills.txt";
                else if (cmd === 'type skills.txt') response.innerText = "Skills: Python, JavaScript, HTML, CSS, React, Node.js, Express, MongoDB, SQL, Git, Docker, Machine Learning (Scikit-Learn, TensorFlow), RESTful APIs, UI/UX Design, Problem Solving";
                else if (cmd === 'dir') response.innerHTML = " Volume in drive C has no label.<br> Directory of C:\\Desktop<br><br>My Projects &lt;DIR&gt;<br>My Computer &lt;LNK&gt;<br>Recycle Bin &lt;LNK&gt;<br>My Resume.doc &lt;DOC&gt;<br>Contact Me &lt;APP&gt;";
                else if (cmd === 'ver') response.innerText = "Microsoft Windows XP [Version 5.1.2600]";
                else if (cmd === 'cls') { history.innerHTML = ""; response.innerText = ""; }
                else if (cmd.startsWith('echo ')) response.innerText = cmd.substring(5);
                else if (cmd === 'exit') closeWindow(container.parentElement.parentElement.id.replace('win-', ''));
                else if (cmd !== '') response.innerText = `'${cmd}' is not recognized as an internal or external command.`;
                
                if(cmd !== 'cls') history.appendChild(response);
                input.value = "";
                container.querySelector('.cmd-body').scrollTop = container.querySelector('.cmd-body').scrollHeight;
            }
        });
    }

    // 3. NOTEPAD
    function launchNotepad(filename = "Untitled", content = "") {
        const container = createWindow(`${filename} - Notepad`, 400, 300, "fas fa-file-alt");
        // Get window ID for menus
        const winId = container.parentElement.parentElement.id.split('-')[1];
        
        container.innerHTML = `
            <div class="menubar">
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('np-file-${winId}', this)">File</div>
                    <div class="menu-dropdown" id="np-file-${winId}">
                        <div class="menu-item" onclick="closeWindow('${winId}')">Exit</div>
                    </div>
                </div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('np-edit-${winId}', this)">Edit</div>
                    <div class="menu-dropdown" id="np-edit-${winId}">
                        <div class="menu-item menu-disabled">Undo</div>
                        <div class="menu-separator"></div>
                        <div class="menu-item menu-disabled">Cut</div>
                        <div class="menu-item menu-disabled">Copy</div>
                        <div class="menu-item menu-disabled">Paste</div>
                        <div class="menu-item menu-disabled">Delete</div>
                        <div class="menu-separator"></div>
                        <div class="menu-item">Select All</div>
                    </div>
                </div>
                <div class="menu-wrap"><div class="menu-btn">Format</div></div>
                <div class="menu-wrap"><div class="menu-btn">View</div></div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('np-help-${winId}', this)">Help</div>
                    <div class="menu-dropdown" id="np-help-${winId}">
                        <div class="menu-item" onclick="alert('Notepad v1.0\\nWindows XP Clone')">About Notepad</div>
                    </div>
                </div>
            </div>
            <div class="notepad-area" style="white-space: pre-wrap; word-wrap: break-word;" spellcheck="false" contenteditable="false">${content}</div>
        `;
    }

    // 4. CALCULATOR
    function launchCalculator() {
        const container = createWindow("Calculator", 250, 300, "fas fa-calculator");
        let expr = "";
        const btns = [
            '7','8','9','/',
            '4','5','6','*',
            '1','2','3','-',
            '0','.','=','+'
        ];
        
        let btnHtml = btns.map(b => `<button class="calc-btn" onclick="calcInput('${b}')">${b}</button>`).join('');
        
        container.innerHTML = `
            <div class="menubar">
                <div class="menu-wrap"><div class="menu-btn">Edit</div></div>
                <div class="menu-wrap"><div class="menu-btn">View</div></div>
                <div class="menu-wrap"><div class="menu-btn">Help</div></div>
            </div>
            <div class="calc-grid">
                <input type="text" class="calc-display" id="calc-disp" value="0" readonly>
                <button class="calc-btn" onclick="calcClear()" style="grid-column: span 2; color: red;">C</button>
                <button class="calc-btn" onclick="calcInput('BS')" style="grid-column: span 2;">Backspace</button>
                ${btnHtml}
            </div>
        `;
        
        const disp = container.querySelector('#calc-disp');

        // Logic
        window.calcInput = (val) => {
            if(val === '=') {
                try { disp.value = eval(expr); expr = disp.value; } catch { disp.value = 'Error'; expr = ""; }
            } else if (val === 'BS') {
                disp.value = disp.value.slice(0, -1);
                expr = disp.value;
            } else {
                if(disp.value === '0' || disp.value === 'Error') { disp.value = ""; expr = ""; }
                expr += val;
                disp.value += val;
            }
        };
        window.calcClear = () => { disp.value = "0"; expr = ""; };

        // Keyboard Support
        container.tabIndex = 0; // Make focusable
        container.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = e.key;
            if (/[0-9]/.test(key)) calcInput(key);
            else if (['+', '-', '*', '/'].includes(key)) calcInput(key);
            else if (key === 'Enter') calcInput('=');
            else if (key === 'Backspace') calcInput('BS');
            else if (key === 'Escape') calcClear();
        });
        container.focus();
    }

    // 5. PAINT (Enhanced)
    function launchPaint() {
        const container = createWindow("untitled - Paint", 600, 480, "fas fa-paint-brush");
        const winId = container.parentElement.parentElement.id.split('-')[1];
        
        // Extended Tools
        const tools = [
            {id: 'free', icon: 'fas fa-star-of-life'},
            {id: 'select', icon: 'far fa-square-full'},
            {id: 'eraser', icon: 'fas fa-eraser'},
            {id: 'fill', icon: 'fas fa-fill-drip'}, // Bucket
            {id: 'picker', icon: 'fas fa-eye-dropper'},
            {id: 'zoom', icon: 'fas fa-search'},
            {id: 'pencil', icon: 'fas fa-pencil-alt'},
            {id: 'brush', icon: 'fas fa-paint-brush'},
            {id: 'spray', icon: 'fas fa-spray-can'}, // Spray
            {id: 'text', icon: 'fas fa-font'},
            {id: 'line', icon: 'fas fa-slash'},
            {id: 'curve', icon: 'fas fa-bezier-curve'},
            {id: 'rect', icon: 'far fa-square'}, 
            {id: 'poly', icon: 'fas fa-draw-polygon'},
            {id: 'ellipse', icon: 'far fa-circle'}, // Ellipse
            {id: 'roundrect', icon: 'far fa-square'}
        ];
        
        const colors = ['#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080FF', '#004080', '#4000FF', '#804000',
                        '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF80', '#00FF80', '#80FFFF', '#8080FF', '#FF0080', '#FF8040'];

        container.innerHTML = `
            <div class="menubar">
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('paint-file-${winId}', this)">File</div>
                    <div class="menu-dropdown" id="paint-file-${winId}">
                        <div class="menu-item" onclick="paintNew('${winId}')">New</div>
                        <div class="menu-item">Open...</div>
                        <div class="menu-item">Save</div>
                        <div class="menu-separator"></div>
                        <div class="menu-item" onclick="closeWindow('${winId}')">Exit</div>
                    </div>
                </div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('paint-edit-${winId}', this)">Edit</div>
                    <div class="menu-dropdown" id="paint-edit-${winId}">
                        <div class="menu-item menu-disabled">Undo</div>
                        <div class="menu-item menu-disabled">Repeat</div>
                        <div class="menu-separator"></div>
                        <div class="menu-item" onclick="paintNew('${winId}')">Clear Image</div>
                    </div>
                </div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('paint-view-${winId}', this)">View</div>
                    <div class="menu-dropdown" id="paint-view-${winId}">
                        <div class="menu-item">Tool Box</div>
                        <div class="menu-item">Color Box</div>
                        <div class="menu-item">Status Bar</div>
                    </div>
                </div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('paint-image-${winId}', this)">Image</div>
                    <div class="menu-dropdown" id="paint-image-${winId}">
                        <div class="menu-item menu-disabled">Flip/Rotate...</div>
                        <div class="menu-item menu-disabled">Stretch/Skew...</div>
                        <div class="menu-item" onclick="paintInvert('${winId}')">Invert Colors</div>
                        <div class="menu-item menu-disabled">Attributes...</div>
                    </div>
                </div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('paint-colors-${winId}', this)">Colors</div>
                    <div class="menu-dropdown" id="paint-colors-${winId}">
                        <div class="menu-item" onclick="paintCustomColor('${winId}')">Edit Colors...</div>
                    </div>
                </div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('paint-help-${winId}', this)">Help</div>
                    <div class="menu-dropdown" id="paint-help-${winId}">
                        <div class="menu-item">Help Topics</div>
                        <div class="menu-separator"></div>
                        <div class="menu-item" onclick="alert('MS Paint\\nWindows XP Clone')">About Paint</div>
                    </div>
                </div>
            </div>
            <div class="paint-container">
                <div class="paint-main">
                    <div class="paint-sidebar">
                        ${tools.map(t => `<div class="paint-tool" id="tool-${t.id}-${winId}" onclick="setTool('${t.id}', '${winId}')"><i class="${t.icon}" style="font-size:12px;"></i></div>`).join('')}
                    </div>
                    <div class="paint-workspace">
                        <canvas id="paint-canvas-${winId}" width="600" height="400"></canvas>
                    </div>
                </div>
                <div class="paint-footer">
                    <!-- Hidden Custom Picker -->
                    <input type="color" id="paint-picker-${winId}" style="display:none" onchange="setPaintColor(this.value, '${winId}', 0)">
                    
                    <div class="current-colors" ondblclick="paintCustomColor('${winId}')" title="Double click to edit color">
                        <div class="color-front" id="fg-color-${winId}"></div>
                        <div class="color-back" id="bg-color-${winId}"></div>
                    </div>
                    <div class="paint-palette">
                        ${colors.map(c => `<div class="color-swatch" style="background:${c}" onmousedown="handleSwatchClick(event, '${c}', '${winId}')" oncontextmenu="return false;"></div>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        const canvas = container.querySelector(`#paint-canvas-${winId}`);
        const ctx = canvas.getContext('2d');
        let painting = false;
        let fgColor = "black";
        let bgColor = "white";
        let tool = "pencil";
        let startX, startY;
        let snapshot;
        let sprayInterval;

        // --- SCOPED HELPERS ---

        window.setTool = (t, wid) => {
            tool = t;
            const cnt = document.getElementById(`win-content-${wid}`);
            cnt.querySelectorAll('.paint-tool').forEach(el => el.classList.remove('active'));
            const btn = cnt.querySelector(`#tool-${t}-${wid}`);
            if(btn) btn.classList.add('active');
        };

        window.handleSwatchClick = (e, color, wid) => {
            if(e.button === 0) setPaintColor(color, wid, 0); // Left Click -> FG
            else if (e.button === 2) setPaintColor(color, wid, 2); // Right Click -> BG
        }

        window.setPaintColor = (c, wid, button) => {
            const cnt = document.getElementById(`win-content-${wid}`);
            if(button === 0) {
                fgColor = c;
                cnt.querySelector(`#fg-color-${wid}`).style.background = c;
            } else {
                bgColor = c;
                cnt.querySelector(`#bg-color-${wid}`).style.background = c;
            }
        };

        window.paintCustomColor = (wid) => {
            document.getElementById(`paint-picker-${wid}`).click();
        }

        window.paintNew = (wid) => {
             const cvs = document.getElementById(`paint-canvas-${wid}`);
             const c = cvs.getContext('2d');
             c.fillStyle = "white";
             c.fillRect(0,0, cvs.width, cvs.height);
        };

        window.paintInvert = (wid) => {
            const cvs = document.getElementById(`paint-canvas-${wid}`);
            const c = cvs.getContext('2d');
            const imgData = c.getImageData(0,0, cvs.width, cvs.height);
            const data = imgData.data;
            for(let i=0; i < data.length; i+=4) {
                data[i] = 255 - data[i];     
                data[i+1] = 255 - data[i+1]; 
                data[i+2] = 255 - data[i+2]; 
            }
            c.putImageData(imgData, 0, 0);
        };
        
        // --- FLOOD FILL ALGORITHM (Stack Based) ---
        function floodFill(x, y, fillColor) {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            
            // Hex to RGBA
            const r = parseInt(fillColor.slice(1,3), 16);
            const g = parseInt(fillColor.slice(3,5), 16);
            const b = parseInt(fillColor.slice(5,7), 16);
            const a = 255;

            const startIdx = (y * canvas.width + x) * 4;
            const startR = data[startIdx], startG = data[startIdx+1], startB = data[startIdx+2], startA = data[startIdx+3];

            if(startR === r && startG === g && startB === b && startA === a) return;

            const matchStartColor = (idx) => {
                return data[idx] === startR && data[idx+1] === startG && data[idx+2] === startB && data[idx+3] === startA;
            }
            
            const colorPixel = (idx) => {
                data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = a;
            }

            const stack = [[x, y]];
            
            while(stack.length) {
                const [cx, cy] = stack.pop();
                const idx = (cy * canvas.width + cx) * 4;
                
                if(matchStartColor(idx)) {
                    colorPixel(idx);
                    if(cx > 0) stack.push([cx-1, cy]);
                    if(cx < canvas.width - 1) stack.push([cx+1, cy]);
                    if(cy > 0) stack.push([cx, cy-1]);
                    if(cy < canvas.height - 1) stack.push([cx, cy+1]);
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

        // --- DRAWING LOGIC ---
        // Init defaults
        window.setTool('pencil', winId);
        window.setPaintColor('black', winId, 0);
        window.setPaintColor('white', winId, 2);
        ctx.fillStyle = "white";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            return { x: Math.floor(e.clientX - rect.left), y: Math.floor(e.clientY - rect.top) };
        }

        function draw(e) {
            if(!painting) return;
            const pos = getPos(e);
            
            // Logic for Eraser: uses BG color
            const isEraser = tool === 'eraser';
            const currentColor = isEraser ? bgColor : fgColor;

            ctx.lineWidth = tool === 'brush' ? 6 : (isEraser ? 15 : 1);
            ctx.lineCap = 'round';
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;

            if (tool === 'pencil' || tool === 'brush' || isEraser) {
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (tool === 'line') {
                ctx.putImageData(snapshot, 0, 0);
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (tool === 'rect') {
                ctx.putImageData(snapshot, 0, 0);
                ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
            } else if (tool === 'ellipse') {
                ctx.putImageData(snapshot, 0, 0);
                ctx.beginPath();
                // Ellipse logic using scaling
                let radiusX = (pos.x - startX) * 0.5;
                let radiusY = (pos.y - startY) * 0.5;
                let centerX = startX + radiusX;
                let centerY = startY + radiusY;
                ctx.ellipse(centerX, centerY, Math.abs(radiusX), Math.abs(radiusY), 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }

        function spray() {
            if(!painting) return;
            ctx.fillStyle = fgColor;
            for(let i=0; i<10; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * 10; // Spray radius
                const x = startX + radius * Math.cos(angle);
                const y = startY + radius * Math.sin(angle);
                ctx.fillRect(x, y, 1, 1);
            }
        }

        canvas.addEventListener('mousedown', (e) => { 
            const pos = getPos(e);
            startX = pos.x; startY = pos.y;
            
            if (tool === 'fill') {
                floodFill(startX, startY, e.button === 2 ? bgColor : fgColor);
                return;
            }

            painting = true;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            if(tool === 'line' || tool === 'rect' || tool === 'ellipse') {
                snapshot = ctx.getImageData(0,0, canvas.width, canvas.height);
            }
            
            if(tool === 'spray') {
                 sprayInterval = setInterval(() => {
                     // Update startX/Y to current mouse pos if moving
                     // But here we rely on mousemove updating a global or similar.
                     // Simple Spray: just spray at initial click, and update in mousemove
                     spray(); 
                 }, 50);
                 spray(); // Initial burst
            }
        });
        
        canvas.addEventListener('mouseup', () => { 
            painting = false; 
            ctx.beginPath();
            if(sprayInterval) clearInterval(sprayInterval);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const pos = getPos(e);
            if(tool === 'spray' && painting) {
                startX = pos.x; 
                startY = pos.y;
            } else {
                draw(e);
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
             painting = false;
             if(sprayInterval) clearInterval(sprayInterval);
        });
    }

    // 6. INTERNET EXPLORER
    function launchIE(contentOrUrl = "https://www.google.com/webhp?igu=1", windowTitle = "Internet Explorer") {
        const winId = windowIdCounter -1; // Get the ID of the newly created window
        const container = createWindow(windowTitle, 700, 500, "fab fa-internet-explorer");
        
        // Check if contentOrUrl is likely HTML (starts with <div, <p, etc. or contains line breaks)
        // A more robust check might be needed if URLs can legitimately start with < or contain newlines in specific ways.
        const isHtmlContent = contentOrUrl.trim().startsWith('<') || contentOrUrl.includes('\n');

        if (isHtmlContent) {
            container.innerHTML = `
                <div class="explorer-toolbar">
                    <div class="control-btn" style="color:black; border:1px solid #ccc;">Back</div>
                    <div class="explorer-address">
                        <span>Address</span>
                        <input type="text" class="address-bar" value="about:blank" readonly>
                    </div>
                </div>
                <div style="width:100%; height: calc(100% - 35px); overflow: auto;">
                    ${contentOrUrl}
                </div>
            `;
        } else {
            // Original URL loading behavior
            container.innerHTML = `
                <div class="explorer-toolbar">
                    <div class="control-btn" style="color:black; border:1px solid #ccc;">Back</div>
                    <div class="explorer-address">
                        <span>Address</span>
                        <input type="text" class="address-bar" value="${contentOrUrl}" id="ie-url-${winId}">
                        <button onclick="document.getElementById('ie-frame-${winId}').src = document.getElementById('ie-url-${winId}').value">Go</button>
                    </div>
                </div>
                <iframe id="ie-frame-${winId}" src="${contentOrUrl}" style="width:100%; height: calc(100% - 35px); border:none;"></iframe>
            `;
        }
    }

    // 7. WINDOWS MEDIA PLAYER
    function launchWMP(file = "Sample Video") {
        const container = createWindow("Windows Media Player", 400, 350, "fas fa-film");
        container.style.background = "black";
        container.innerHTML = `
            <div style="height: calc(100% - 50px); display:flex; align-items:center; justify-content:center; color:white;">
                ${file === "video" || file.endsWith('.mp4') 
                  ? '<div style="text-align:center"><i class="fas fa-play-circle" style="font-size:50px; opacity:0.5;"></i><br>Playing Project Demo...</div>' 
                  : '<div style="background: linear-gradient(to bottom, #000, #003366); width:100%; height:100%; display:flex; align-items:center; justify-content:center;"><i class="fas fa-music" style="font-size:60px; color:#ff9900;"></i></div>'}
            </div>
            <div style="height: 50px; background: #silver; display:flex; align-items:center; justify-content:center; gap:10px; background: linear-gradient(#eee, #ccc);">
                <i class="fas fa-stop-circle" style="font-size:24px; cursor:pointer"></i>
                <i class="fas fa-play-circle" style="font-size:32px; color: #245edb; cursor:pointer"></i>
                <i class="fas fa-pause-circle" style="font-size:24px; cursor:pointer"></i>
                <div style="width: 100px; height: 5px; background: #555; border-radius:3px;">
                    <div style="width: 40%; height: 100%; background: #27AE60;"></div>
                </div>
            </div>
        `;
    }

    // 8. MINESWEEPER
    function launchMinesweeper() {
        const container = createWindow("Minesweeper", 250, 300, "fas fa-bomb");
        const winId = container.parentElement.parentElement.id.split('-')[1];
        let gameOver = false;
        
        container.innerHTML = `
            <div class="menubar">
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('mine-game-${winId}', this)">Game</div>
                    <div class="menu-dropdown" id="mine-game-${winId}">
                        <div class="menu-item" onclick="resetMinesweeper('${winId}')">New Game</div>
                        <div class="menu-separator"></div>
                        <div class="menu-item" onclick="closeWindow('${winId}')">Exit</div>
                    </div>
                </div>
                <div class="menu-wrap">
                    <div class="menu-btn" onclick="toggleMenu('mine-help-${winId}', this)">Help</div>
                    <div class="menu-dropdown" id="mine-help-${winId}">
                         <div class="menu-item" onclick="alert('Minesweeper\\nWindows XP Clone')">About Minesweeper</div>
                    </div>
                </div>
            </div>
            <div style="background:#C0C0C0; padding:10px; flex:1; display:flex; flex-direction:column; align-items:center; overflow: auto;">
                <div class="mine-header" style="width: 100%;">
                    <div class="mine-counter">010</div>
                    <div class="mine-face" onclick="resetMinesweeper('${winId}')"><i class="fas fa-smile" style="color:#FFFF00; text-shadow:1px 1px 0 #000; -webkit-text-stroke: 1px black;"></i></div>
                    <div class="mine-counter">000</div>
                </div>
                <div id="mine-grid-${winId}" style="display:grid; grid-template-columns:repeat(8, 20px); gap:1px; border:3px inset white; background:#7b7b7b;">
                    <!-- Grid Generated via JS -->
                </div>
            </div>
        `;
        
        window.resetMinesweeper = (wid) => {
            gameOver = false;
            const cnt = document.getElementById(`win-content-${wid}`);
            cnt.querySelector('.mine-face i').className = "fas fa-smile";
            const grid = cnt.querySelector(`#mine-grid-${wid}`);
            grid.innerHTML = "";
            
            // Create 64 cells
            for(let i=0; i<64; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.cssText = "width:20px; height:20px; background:#C0C0C0; border:2px outset white; cursor:pointer; font-size:12px; text-align:center; line-height:16px; font-weight:bold;";
                
                // Mine Logic
                const isMine = Math.random() > 0.85; 
                cell.dataset.mine = isMine;
                
                cell.onclick = function() {
                    if(gameOver) return;
                    this.style.border = '1px solid #7b7b7b';
                    if(this.dataset.mine === 'true') {
                        this.innerHTML = '<i class="fas fa-bomb"></i>';
                        this.style.background = "red";
                        gameOver = true;
                        cnt.querySelector('.mine-face i').className = "fas fa-dizzy";
                        // Reveal all mines
                        cnt.querySelectorAll('.cell').forEach(c => {
                            if(c.dataset.mine === 'true') {
                                c.style.border = '1px solid #7b7b7b';
                                c.innerHTML = '<i class="fas fa-bomb"></i>';
                            }
                        });
                    } else {
                        const num = Math.floor(Math.random() * 3);
                        if(num > 0) {
                            this.innerText = num;
                            this.style.color = ['blue', 'green', 'red'][num-1];
                        }
                    }
                };
                grid.appendChild(cell);
            }
        };

        window.resetMinesweeper(winId);
    }

    // 9. CONTACT FORM
    function launchContactForm() {
        const container = createWindow("Contact Me", 450, 400, "fas fa-envelope");
        const winId = container.parentElement.parentElement.id.split('-')[1];

        container.innerHTML = `
            <div style="padding:15px; font-family:'Tahoma', sans-serif; font-size:13px; display:flex; flex-direction:column; height:100%;">
                <p>Send me a message directly!</p>
                <div style="margin-bottom: 10px;">
                    <label for="contact-name-${winId}">Name:</label><br>
                    <input type="text" id="contact-name-${winId}" style="width:100%; padding:5px; border:1px solid #7F9DB9;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label for="contact-email-${winId}">Email:</label><br>
                    <input type="email" id="contact-email-${winId}" style="width:100%; padding:5px; border:1px solid #7F9DB9;">
                </div>
                <div style="margin-bottom: 10px; flex:1; display:flex; flex-direction:column;">
                    <label for="contact-message-${winId}">Message:</label><br>
                    <textarea id="contact-message-${winId}" style="width:100%; flex:1; padding:5px; border:1px solid #7F9DB9; resize: vertical; min-height: 80px;"></textarea>
                </div>
                <button id="send-contact-btn-${winId}" class="calc-btn" style="padding: 8px 15px; margin-top: 10px; background:#245EDB; color:white; border:none; border-radius:3px;">Send Message</button>
                <div id="contact-status-${winId}" style="margin-top: 10px; font-weight: bold; text-align: center;"></div>
            </div>
        `;

        const nameInput = document.getElementById(`contact-name-${winId}`);
        const emailInput = document.getElementById(`contact-email-${winId}`);
        const messageInput = document.getElementById(`contact-message-${winId}`);
        const sendBtn = document.getElementById(`send-contact-btn-${winId}`);
        const statusDiv = document.getElementById(`contact-status-${winId}`);

        sendBtn.onclick = async () => {
            statusDiv.style.color = 'black';
            statusDiv.innerText = 'Sending...';
            sendBtn.disabled = true;

            const name = nameInput.value;
            const email = emailInput.value;
            const message = messageInput.value;

            try {
                const response = await fetch('/api/contact', { // Use your backend URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, message }),
                });

                const data = await response.json();

                if (response.ok) {
                    statusDiv.style.color = 'green';
                    statusDiv.innerText = data.message;
                    // Clear form on success
                    nameInput.value = '';
                    emailInput.value = '';
                    messageInput.value = '';
                } else {
                    statusDiv.style.color = 'red';
                    statusDiv.innerText = data.message || 'Failed to send message.';
                }
            } catch (error) {
                console.error('Frontend contact form error:', error);
                statusDiv.style.color = 'red';
                statusDiv.innerText = 'An unexpected error occurred.';
            } finally {
                sendBtn.disabled = false;
            }
        };
    }
