let scene, camera, renderer, ceiling;
    let moveSpeedBase = 0.05; // Slower base speed as requested
    let speedMultiplier = 1;
    let isMusicPlaying = false; 
    let isDetailedHintsOpen = false;
    let doorMesh;
    let isStarryNight = false;

    // Artwork positions
    const artworks = [
        // Front wall
        { url: 'assets/Art/0d9751c4b474cd30a5464ca6a08460b7.jpg', position: [3.95, 2, -16], rotation: [0, -Math.PI/2, 0], description: "Kalighat painting of Durga and Ganesha" },
        // Main corridor
        { url: 'assets/Art/29b579009736ba1a4124dcd8e693c707.jpg', position: [-3.95, 2, 12], rotation: [0, Math.PI/2, 0], description: "Kerala mural of Goddess Saraswati" },
        { url: 'assets/Art/2b53d595396155221db770b5a43a013f.jpg', position: [-3.95, 2, 8], rotation: [0, Math.PI/2, 0], description: "Self-Portrait with Death Playing the Fiddle by Arnold Böcklin" },
        { url: 'assets/Art/3a4b19402702fe6c850aa9c3e1ad8df8.jpg', position: [3.95, 2, 12], rotation: [0, -Math.PI/2, 0], description: "Madhubani painting of Goddess Saraswati" },
        { url: 'assets/Art/3f97f8fe0fd4aa838d59254fb86caa4f.jpg', position: [3.95, 2, 8], rotation: [0, -Math.PI/2, 0], description: "Pichwai painting of Lord Krishna" },
        { url: 'assets/Art/4a1b34277f57d76ad39319bfa0c2f33c.jpg', position: [-3.95, 2, -8], rotation: [0, Math.PI/2, 0], description: "Kalamkari painting of a peacock" },
        { url: 'assets/Art/4c464d27af88e5b585d20bd14d9c32db.jpg', position: [-3.95, 2, -12], rotation: [0, Math.PI/2, 0], description: "The Starry Night by Vincent van Gogh" },
        { url: 'assets/Art/55cc861c2fb256374909075c7565213e.jpg', position: [3.95, 2, -8], rotation: [0, -Math.PI/2, 0], description: "The Scream by Edvard Munch" },
        { url: 'assets/Art/57fec982857a92197f37c99c678d4292.jpg', position: [3.95, 2, -12], rotation: [0, -Math.PI/2, 0], description: "Surrealist collage of a giant hand with eyes" },
        // Left corridor
        { url: 'assets/Art/58185744677dbc93a3b7f9d811f0a8d6.jpg', position: [-3.95, 2, -16], rotation: [0, Math.PI/2, 0], description: "Watercolor painting of an anthropomorphic frog" },
        { url: 'assets/Art/583f05668d784a35c96fce0103795a69.jpg', position: [-10, 2, 3.95], rotation: [0, Math.PI, 0], description: "Untitled painting by Zdzisław Beksiński" },
        { url: 'assets/Art/65d00b5ddf7b0995fe4c0a202a7eccc4.jpg', position: [-15, 2, -3.95], rotation: [0, 0, 0], description: "Punk rock flyer art" },
        // Right corridor
        { url: 'assets/Art/7c979e15347fda9e8b1be83f93c58d94.jpg', position: [9, 2, -3.95], rotation: [0, 0, 0], description: "Untitled drawing by Zdzisław Beksiński" },
        { url: "assets/Art/7d005a1f9aaca273002612f3f3ef3c46 (1).jpg", position: [10, 2, 3.95], rotation: [0, Math.PI, 0], description: "Staring into the Abyss by u/Alogrithm" },
        { url: 'assets/Art/862a483af92b31db4311ce4aa5f5c07f.jpg', position: [15, 2, -3.95], rotation: [0, 0, 0], description: "Thinker by Zdzisław Beksiński" },
        // Extended Main corridor
        { url: 'assets/Art/99d788b8893c2718aa2cba01f4525d5e.jpg', position: [-3.95, 2, -20], rotation: [0, Math.PI/2, 0], description: '"The Great Wave off Kanagawa" by Hokusai' },
        { url: 'assets/Art/9c643f1601fcd1a882a7e52e85476b26.jpg', position: [3.95, 2, -20], rotation: [0, -Math.PI/2, 0], description: 'Indian traditional painting of a dancing woman' },
        { url: 'assets/Art/9f56995878b4203186f1e14b550a2120.jpg', position: [-3.95, 2, -24], rotation: [0, Math.PI/2, 0], description: '"The Maharashtrian Lady" by Raja Ravi Varma' },
        { url: 'assets/Art/a3038baa440dce02104ff83495d7b813.jpg', position: [3.95, 2, -24], rotation: [0, -Math.PI/2, 0], description: 'Surrealist painting of heart and brain playing chess' },
        { url: 'assets/Art/a403329a65dc0225570465d3cda26830.jpg', position: [0, 2, -31.9], rotation: [0, 0, 0], description: '"Stańczyk" by Jan Matejko' },
        // Extended Left corridor
        { url: 'assets/Art/a74afc202465d7c50ffcc3b3c95e3d3d.jpg', position: [-24, 2, 3.95], rotation: [0, Math.PI, 0], description: 'Surrealist painting by Mark Bryan' },
        { url: 'assets/Art/ae22a63deaab13e14f8c89f46094131b.jpg', position: [-28, 2, -3.95], rotation: [0, 0, 0], description: 'Pattachitra painting of Rama, Sita, and Lakshmana' },
        { url: 'assets/Art/aefa787541b3553272be4c54eb689b3d.jpg', position: [-32, 2, 3.95], rotation: [0, Math.PI, 0], description: 'Kalighat painting of the goddess Durga' },
        { url: 'assets/Art/b90518e597dcf620e860a31740b54949.jpg', position: [-35.95, 2, 0], rotation: [0, Math.PI/2, 0], description: 'Indian miniature painting of a royal hunting scene'},
        { url: 'assets/Art/bbf45af49c3a3fcce342677fb759025b.jpg', position: [-24, 2, -3.95], rotation: [0, 0, 0], description: '"Isle of the Dead" by Arnold Böcklin' },
        // Extended Right corridor
        { url: 'assets/Art/bd90dd6ca4392196fdc71a080546141e.jpg', position: [24, 2, 3.95], rotation: [0, Math.PI, 0], description: 'Ink drawing of a person with an umbrella' },
        { url: 'assets/Art/c09fbc89defa3423ea3dcbc454ca91eb.jpg', position: [28, 2, -3.95], rotation: [0, 0, 0], description: 'Gond painting of a tree of life' },
        { url: 'assets/Art/d8bc8c943f69263eb4d633707a4da70e.jpg', position: [32, 2, 3.95], rotation: [0, Math.PI, 0], description: 'Painting of a suffering figure' },
        { url: 'assets/Art/e6bfeaed6e6753892197a86295f4bd28.jpg', position: [35.95, 2, 0], rotation: [0, -Math.PI/2, 0], description: '"The Persistence of Memory" by Salvador Dalí'},
        { url: 'assets/Art/ebc72607a942ea600e5ff072cf8ab589.jpg', position: [24, 2, -3.95], rotation: [0, 0, 0], description: '"The Unseen Audience" by Zdzisław Beksiński'}
    ];

    // Helper function to wrap text on canvas
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let metrics;
        let testLine;
        let testWidth;
        let currentY = y;
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            testLine = line + words[n] + ' ';
            metrics = context.measureText(testLine);
            testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, currentY);
                currentY += lineHeight;
                line = words[n] + ' ';
                lineCount++;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, currentY);
        lineCount++;
        return lineCount * lineHeight; // Return total height used
    }

    function init() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.02);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        
        const lightPositions = [
            [0, 4, 10], [0, 4, 0], [0, 4, -10], [0, 4, -20], [0, 4, -30],
            [-12, 4, 0], [-24, 4, 0], [-34, 4, 0],
            [12, 4, 0], [24, 4, 0], [34, 4, 0]
        ];
        lightPositions.forEach(pos => {
            const pointLight = new THREE.PointLight(0xffaa00, 0.6, 15);
            pointLight.position.set(...pos);
            scene.add(pointLight);
        });

        // --- Door (Centered) ---
        const doorGeometry = new THREE.BoxGeometry(2, 4, 0.1); 
        doorGeometry.translate(-1, 0, 0); 
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.8 });
        doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        doorMesh.position.set(-1, 2, 15.9); 
        doorMesh.rotation.y = Math.PI; // Face inwards
        scene.add(doorMesh);

        // --- Floors ---
        const carpetTexture = loadCarpetTexture();
        const floorMaterial = new THREE.MeshStandardMaterial({ map: carpetTexture, roughness: 0.8 });
        
        const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(8, 48), floorMaterial);
        mainFloor.rotation.x = -Math.PI / 2;
        mainFloor.position.z = -8;
        scene.add(mainFloor);

        const leftTexture = new THREE.TextureLoader().load('https://cms-assets.tutsplus.com/cdn-cgi/image/width=850/uploads/users/523/posts/27364/final_image/project-preview-large.png');
        leftTexture.wrapS = THREE.RepeatWrapping;
        leftTexture.wrapT = THREE.RepeatWrapping;
        leftTexture.rotation = Math.PI / 2;
        leftTexture.center.set(0.5, 0.5);
        leftTexture.repeat.set(1, 8);
        const leftFloorMaterial = new THREE.MeshStandardMaterial({ map: leftTexture, roughness: 0.8 });
        const leftFloor = new THREE.Mesh(new THREE.PlaneGeometry(32, 8), leftFloorMaterial);
        leftFloor.rotation.x = -Math.PI/2;
        leftFloor.position.set(-20, 0, 0);
        scene.add(leftFloor);
        
        const rightTexture = new THREE.TextureLoader().load('https://cms-assets.tutsplus.com/cdn-cgi/image/width=850/uploads/users/523/posts/27364/final_image/project-preview-large.png');
        rightTexture.wrapS = THREE.RepeatWrapping;
        rightTexture.wrapT = THREE.RepeatWrapping;
        rightTexture.rotation = Math.PI / 2;
        rightTexture.center.set(0.5, 0.5);
        rightTexture.repeat.set(1, 8);
        const rightFloorMaterial = new THREE.MeshStandardMaterial({ map: rightTexture, roughness: 0.8 });
        const rightFloor = new THREE.Mesh(new THREE.PlaneGeometry(32, 8), rightFloorMaterial);
        rightFloor.rotation.x = -Math.PI/2;
        rightFloor.position.set(20, 0, 0);
        scene.add(rightFloor);


        // --- Walls ---
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5, side: THREE.DoubleSide });
        
        const wallData = [
            // Main corridor
            { size: [12, 5], pos: [-4, 2.5, 10], rot: [0, Math.PI/2, 0] },
            { size: [28, 5], pos: [-4, 2.5, -18], rot: [0, Math.PI/2, 0] },
            { size: [12, 5], pos: [4, 2.5, 10], rot: [0, -Math.PI/2, 0] },
            { size: [28, 5], pos: [4, 2.5, -18], rot: [0, -Math.PI/2, 0] },
            { size: [8, 5], pos: [0, 2.5, -32], rot: [0, 0, 0] },
            { size: [8, 5], pos: [0, 2.5, 16], rot: [0, Math.PI, 0] },
            // Left corridor
            { size: [32, 5], pos: [-20, 2.5, 4], rot: [0, 0, 0] },
            { size: [32, 5], pos: [-20, 2.5, -4], rot: [0, Math.PI, 0] },
            { size: [8, 5], pos: [-36, 2.5, 0], rot: [0, Math.PI/2, 0] },
            // Right corridor
            { size: [32, 5], pos: [20, 2.5, 4], rot: [0, 0, 0] },
            { size: [32, 5], pos: [20, 2.5, -4], rot: [0, Math.PI, 0] },
            { size: [8, 5], pos: [36, 2.5, 0], rot: [0, -Math.PI/2, 0] },
        ];

        wallData.forEach(data => {
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(...data.size), wallMaterial);
            wall.position.set(...data.pos);
            wall.rotation.set(...data.rot);
            scene.add(wall);
        });


        // --- Ceilings ---
        const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: loadCloudySkyTexture() });
        ceiling = new THREE.Group();
        
        const mainCeiling = new THREE.Mesh(new THREE.PlaneGeometry(8, 48), ceilingMaterial);
        mainCeiling.rotation.x = Math.PI/2;
        mainCeiling.position.z = -8;
        
        const leftCeiling = new THREE.Mesh(new THREE.PlaneGeometry(32, 8), ceilingMaterial);
        leftCeiling.position.set(-20, 0, 0);
        leftCeiling.rotation.x = Math.PI/2;

        const rightCeiling = new THREE.Mesh(new THREE.PlaneGeometry(32, 8), ceilingMaterial);
        rightCeiling.position.set(20, 0, 0);
        rightCeiling.rotation.x = Math.PI/2;
        
        ceiling.add(mainCeiling, leftCeiling, rightCeiling);
        ceiling.position.y = 5;
        scene.add(ceiling);

        // --- Artworks & Hollow Frames ---
        const loader = new THREE.TextureLoader();
        
        const goldMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xD4AF37, 
            metalness: 0.6, 
            roughness: 0.3 
        });

        artworks.forEach(artwork => {
            const group = new THREE.Group();

            // 1. The Art Image
            const artWidth = 2;
            const artHeight = 1.5;
            const artGeometry = new THREE.PlaneGeometry(artWidth, artHeight);
            const artMaterial = new THREE.MeshBasicMaterial({ map: loader.load(artwork.url) });
            const artMesh = new THREE.Mesh(artGeometry, artMaterial);
            
            // 2. The Hollow Frame
            const frameThick = 0.15;
            const frameDepth = 0.1; 
            const frameOffset = 0.05;
            const horizGeo = new THREE.BoxGeometry(artWidth + (frameThick*2), frameThick, frameDepth);
            const vertGeo = new THREE.BoxGeometry(frameThick, artHeight, frameDepth);
            const topBar = new THREE.Mesh(horizGeo, goldMaterial);
            topBar.position.set(0, (artHeight/2) + (frameThick/2), frameOffset);
            const bottomBar = new THREE.Mesh(horizGeo, goldMaterial);
            bottomBar.position.set(0, -(artHeight/2) - (frameThick/2), frameOffset);
            const leftBar = new THREE.Mesh(vertGeo, goldMaterial);
            leftBar.position.set(-(artWidth/2) - (frameThick/2), 0, frameOffset);
            const rightBar = new THREE.Mesh(vertGeo, goldMaterial);
            rightBar.position.set((artWidth/2) + (frameThick/2), 0, frameOffset);

            // 3. Description Tag
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const font = 'bold 24px "Times New Roman"';
            context.font = font;
            
            const padding = 20;
            const lineHeight = 30;
            const maxWidth = 280; // Max width for text before wrapping

            // Measure text and calculate required height
            const words = artwork.description.split(' ');
            let testLine = '';
            let metrics;
            let currentLine = '';
            let lineCount = 0;

            for (let n = 0; n < words.length; n++) {
                testLine = currentLine + words[n] + ' ';
                metrics = context.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lineCount++;
                    currentLine = words[n] + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            lineCount++; // For the last line

            const textWidth = Math.min(maxWidth, context.measureText(artwork.description).width);
            const dynamicCanvasWidth = textWidth + (padding * 2);
            const dynamicCanvasHeight = (lineCount * lineHeight) + (padding * 2);

            canvas.width = dynamicCanvasWidth;
            canvas.height = dynamicCanvasHeight;

            context.fillStyle = '#1a1a1a';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#D4AF37';
            context.font = font;
            context.textAlign = 'center';

            const startX = canvas.width / 2;
            const startY = padding + (lineHeight / 2);
            wrapText(context, artwork.description, startX, startY, maxWidth, lineHeight);

            context.strokeStyle = "#D4AF37";
            context.lineWidth = 5;
            context.strokeRect(0, 0, canvas.width, canvas.height);

            const descTexture = new THREE.CanvasTexture(canvas);
            
            // Adjust PlaneGeometry width and height proportionally
            // Assuming 300x80 canvas maps to 1.5x0.4 plane (ratio ~200:200)
            const planeScale = 200; 
            const dynamicPlaneWidth = dynamicCanvasWidth / planeScale;
            const dynamicPlaneHeight = dynamicCanvasHeight / planeScale;

            const descGeometry = new THREE.PlaneGeometry(dynamicPlaneWidth, dynamicPlaneHeight);
            const descMaterial = new THREE.MeshBasicMaterial({ map: descTexture, side: THREE.DoubleSide });
            const descMesh = new THREE.Mesh(descGeometry, descMaterial);
            descMesh.position.y = -1.1 - ((dynamicPlaneHeight - 0.4) / 2); // Adjust vertical position if height changes
            descMesh.position.z = 0.02;

            group.add(artMesh, topBar, bottomBar, leftBar, rightBar, descMesh);
            group.position.set(...artwork.position);
            group.rotation.set(...artwork.rotation);
            scene.add(group);
        });

        camera.position.set(0, 1.6, 14); 
        animate();
    }

    // --- Texture Loading Helpers ---
    function loadCarpetTexture() {
        const loader = new THREE.TextureLoader();
        const t = loader.load('https://cms-assets.tutsplus.com/cdn-cgi/image/width=850/uploads/users/523/posts/27364/final_image/project-preview-large.png');
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1, 8); 
        return t;
    }

    function loadStarryNightTexture() {
        const loader = new THREE.TextureLoader();
        const t = loader.load('https://assets.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?cs=srgb&dl=pexels-kaip-1341279.jpg&fm=jpg');
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1, 4);
        return t;
    }

    function loadCloudySkyTexture() {
        const loader = new THREE.TextureLoader();
        const t = loader.load('https://cdn.mos.cms.futurecdn.net/FRdq8ZbPetwNDRV9R3hYpP-1200-80.jpg');
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1, 4);
        return t;
    }

    // --- Movement & Logic ---
    const keys = { w: false, a: false, s: false, d: false };
    let doorOpen = false;
    let doorAngle = 0;
    
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) keys[key] = true;

        if (key === 'o') {
            doorOpen = !doorOpen;
            if (doorOpen) {
                document.getElementById('nav-menu').style.display = 'block';
                document.exitPointerLock();
            } else {
                document.getElementById('nav-menu').style.display = 'none';
                document.body.requestPointerLock();
            }
        }
        if (key === 'n') {
            isStarryNight = !isStarryNight;
            const newTexture = isStarryNight ? loadStarryNightTexture() : loadCloudySkyTexture();
            ceiling.children.forEach(c => { c.material.map = newTexture; c.material.needsUpdate = true; });
        }
        if (key === 'h') {
            isDetailedHintsOpen = !isDetailedHintsOpen;
            document.getElementById('controls-detailed').style.display = isDetailedHintsOpen ? 'block' : 'none';
        }
        if (key === 'm') {
            document.getElementById('music').muted = !document.getElementById('music').muted;
        }
        if (key === '2') {
            speedMultiplier = (speedMultiplier === 1) ? 2 : 1;
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) keys[key] = false;
    });

    // --- Mouse Controls ---
    let isMouseLocked = false;
    let pitch = 0;
    let yaw = 0;

    document.addEventListener('click', () => {
        if (!isMouseLocked) {
            document.body.requestPointerLock();
            const music = document.getElementById('music');
            if (music.paused) music.play().catch(e => console.log("Audio play failed", e));
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isMouseLocked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (e) => {
        if (isMouseLocked) {
            yaw -= e.movementX * 0.002;
            pitch -= e.movementY * 0.002;
            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        }
    });

    function updatePosition() {
        const currentSpeed = moveSpeedBase * speedMultiplier;
        const moveVector = new THREE.Vector3(0, 0, 0);

        if (keys.w) {
            moveVector.x -= Math.sin(yaw) * currentSpeed;
            moveVector.z -= Math.cos(yaw) * currentSpeed;
        }
        if (keys.s) {
            moveVector.x += Math.sin(yaw) * currentSpeed;
            moveVector.z += Math.cos(yaw) * currentSpeed;
        }
        if (keys.a) {
            moveVector.x -= Math.cos(yaw) * currentSpeed;
            moveVector.z += Math.sin(yaw) * currentSpeed;
        }
        if (keys.d) {
            moveVector.x += Math.cos(yaw) * currentSpeed;
            moveVector.z -= Math.sin(yaw) * currentSpeed;
        }
        
        const checkCollision = (pos) => {
            const inMain = pos.x > -3.5 && pos.x < 3.5 && pos.z > -31.5 && pos.z < 15.5;
            const inCross = pos.x > -35.5 && pos.x < 35.5 && pos.z > -3.5 && pos.z < 3.5;
            return inMain || inCross;
        };

        const futurePosition = camera.position.clone().add(moveVector);

        if (checkCollision(futurePosition)) {
            camera.position.copy(futurePosition);
        } else {
            const futurePosX = camera.position.clone();
            futurePosX.x += moveVector.x;
            if (checkCollision(futurePosX)) {
                camera.position.copy(futurePosX);
            } else {
                const futurePosZ = camera.position.clone();
                futurePosZ.z += moveVector.z;
                if (checkCollision(futurePosZ)) {
                    camera.position.copy(futurePosZ);
                }
            }
        }

        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
    }

    function updateDoor() {
        if (doorOpen) {
            doorMesh.rotation.y = Math.min(Math.PI / 2 + Math.PI, doorMesh.rotation.y + 0.05);
        } else {
            doorMesh.rotation.y = Math.max(Math.PI, doorMesh.rotation.y - 0.05);
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        updatePosition();
        updateDoor();
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    init();