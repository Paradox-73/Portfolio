let scene, camera, renderer, ceiling;
    let moveSpeedBase = 0.05; // Slower base speed as requested
    let speedMultiplier = 1;
    let isMusicPlaying = false;
    let isDetailedHintsOpen = false;
    let doorMesh;
    let isStarryNight = false;
    let recoFrame;                 // 3D "leave a recommendation" frame
    let recoFramePos = null;       // its world position, for proximity checks
    let isRecoFormOpen = false;

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : '';

    // Joystick variables
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    let joystickHandle = null;
    let joystickBase = null;
    let joystickRadius = 0;
    
    // Touch look variables
    let lastTouchX = 0;
    let lastTouchY = 0;
    let touchLookActive = false;

    // Helper to detect mobile devices
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }


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
        { url: 'assets/Art/ebc72607a942ea600e5ff072cf8ab589.jpg', position: [24, 2, -3.95], rotation: [0, 0, 0], description: '"The Unseen Audience" by Zdzisław Beksiński'},

        // --- Added from Pinterest board (in.pinterest.com/Paradox_73/art) ---
        { url: 'assets/Art/110b047759b03fc20a3ff67d05d431c1.jpg', position: [-3.95, 2, -30], rotation: [0, Math.PI/2, 0], description: '"Wheatfield with Crows" by Vincent van Gogh' },
        { url: 'assets/Art/166c129b38c0645895c9bab74b756472.jpg', position: [-3.95, 2, -27], rotation: [0, Math.PI/2, 0], description: "Ink drawing of a weary frog clutching a mug of coffee" },
        { url: 'assets/Art/1989e70a29bc6424bca707a0ee7a8cb9.jpg', position: [-3.95, 2, -5], rotation: [0, Math.PI/2, 0], description: '"Head of a Skeleton with a Burning Cigarette" by Vincent van Gogh' },
        { url: 'assets/Art/23ee6c6f5a5fe27c6a83089e5e0cc243.jpg', position: [-3.95, 2, 5], rotation: [0, Math.PI/2, 0], description: '"Soir Bleu" by Edward Hopper' },
        { url: 'assets/Art/281ad0d993f9d916d4d6153d0458695f.jpg', position: [3.95, 2, -30], rotation: [0, -Math.PI/2, 0], description: "Surrealist collage of a radiant eye: is it possible not to see your face in everything I see?" },
        { url: 'assets/Art/5f2129c2ef6bf1735c5143b8454d62d9.jpg', position: [3.95, 2, -27], rotation: [0, -Math.PI/2, 0], description: '"The Lovers" by René Magritte' },
        { url: 'assets/Art/6f344fa0a040d511f34904cf51760e05.jpg', position: [3.95, 2, -5], rotation: [0, -Math.PI/2, 0], description: "Ink sketch of a spiky-toothed monster" },
        { url: 'assets/Art/6fd91318fcd30cde8efda056b4c505ad.jpg', position: [3.95, 2, 5], rotation: [0, -Math.PI/2, 0], description: '"The Son of Man" by René Magritte' },
        { url: 'assets/Art/797a5e34678a68e1ee43d98928a94b1e.jpg', position: [-34, 2, -3.95], rotation: [0, 0, 0], description: "Painting of a black cat stretching on a windowsill as a distant blast lights up the city" },
        { url: 'assets/Art/9c55cc8ef717befd2784e9c7a09808e7.jpg', position: [-31, 2, -3.95], rotation: [0, 0, 0], description: '"Sunflowers" by Vincent van Gogh' },
        { url: 'assets/Art/9f8d481923c88118843ab411e137e036.jpg', position: [-21, 2, -3.95], rotation: [0, 0, 0], description: "Marker illustration of a rainbow-haired figure slumped over a bathtub" },
        { url: 'assets/Art/a7fb862f642a217049206c15f288e934.jpg', position: [-18, 2, -3.95], rotation: [0, 0, 0], description: "Illustrated poster: your suffering is not noble" },
        { url: 'assets/Art/a99eade643efe42ac177328675875287.jpg', position: [-12, 2, -3.95], rotation: [0, 0, 0], description: '"Café Terrace at Night" by Vincent van Gogh' },
        { url: 'assets/Art/b98988990fbc8c94a63e7c310e45593d.jpg', position: [-9, 2, -3.95], rotation: [0, 0, 0], description: "Palette-knife painting of a moonlit French Quarter street at night" },
        { url: 'assets/Art/c26f51fbb1787a2ab8f1f62accbec693.jpg', position: [-6, 2, -3.95], rotation: [0, 0, 0], description: '"Bedroom in Arles" by Vincent van Gogh' },
        { url: 'assets/Art/dd6837dc108fcdd98ff16b70530ea18e.jpg', position: [-29, 2, 3.95], rotation: [0, Math.PI, 0], description: "A collection of nine hand-drawn skull doodles" },
        { url: 'assets/Art/ed5f979520f63fc0193c0ed4825dc0ca.jpg', position: [-21, 2, 3.95], rotation: [0, Math.PI, 0], description: "Moody painting of two lovers beneath a crescent moon and shooting star" },
        { url: 'assets/Art/f5a97ab87476077cb98df759b4d899fe.jpg', position: [-18, 2, 3.95], rotation: [0, Math.PI, 0], description: "Photo-collage poster: I'm still trying to figure out who I really am" },
        { url: 'assets/Art/f84080b6d9d6559c8642e9d112bcb3e5.jpg', position: [-15, 2, 3.95], rotation: [0, Math.PI, 0], description: "Infographic on traditional Indian art forms: Madhubani, Kalamkari, Tanjore, Kalighat, Gond, and Cheriyal" },
        { url: 'assets/Art/fd65e370585738b637b7a1e517ccc7a8.jpg', position: [-7, 2, 3.95], rotation: [0, Math.PI, 0], description: "Surrealist allegory of a blindfolded winged figure balancing scales on a bull's horns" }
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

    // Builds the interactive "Leave a Recommendation" frame on the entrance wall.
    function createRecoFrame() {
        const group = new THREE.Group();
        const frameW = 2.2, frameH = 2.6;

        const borderMat = new THREE.MeshStandardMaterial({ color: 0x3a2a10, roughness: 0.6, metalness: 0.3 });
        const border = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.25, frameH + 0.25, 0.12), borderMat);
        group.add(border);

        // Canvas texture for the panel label.
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 600;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#26262e');
        grad.addColorStop(1, '#15151a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 6;
        ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = '120px serif';
        ctx.fillText('✒', canvas.width / 2, 210);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px Georgia, serif';
        ctx.fillText('Leave a', canvas.width / 2, 310);
        ctx.fillText('Recommendation', canvas.width / 2, 366);
        ctx.fillStyle = '#bbbbbb';
        ctx.font = '28px Georgia, serif';
        ctx.fillText('Walk up and press  R', canvas.width / 2, 480);

        const tex = new THREE.CanvasTexture(canvas);
        // Pre-mirror horizontally so the text reads correctly after the 180° Y rotation below.
        tex.center.set(0.5, 0.5);
        tex.repeat.x = -1;

        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(frameW, frameH),
            new THREE.MeshBasicMaterial({ map: tex })
        );
        panel.position.z = 0.07;
        group.add(panel);

        group.position.set(2, 2, 15.75); // entrance wall, right of the door
        group.rotation.y = Math.PI;       // face into the gallery
        scene.add(group);

        recoFrame = group;
        recoFramePos = group.position.clone();
    }

    function openRecoForm() {
        if (isRecoFormOpen) return;
        isRecoFormOpen = true;
        document.getElementById('reco-overlay').style.display = 'flex';
        document.getElementById('reco-status').textContent = '';
        document.exitPointerLock();
        // Stop any movement so the player doesn't drift while typing.
        Object.keys(keys).forEach(k => keys[k] = false);
        setTimeout(() => document.getElementById('reco-text').focus(), 50);
    }

    function closeRecoForm() {
        isRecoFormOpen = false;
        document.getElementById('reco-overlay').style.display = 'none';
        if (!isMobileDevice()) document.body.requestPointerLock();
    }

    async function submitReco() {
        const text = document.getElementById('reco-text').value.trim();
        const name = document.getElementById('reco-name').value.trim();
        const status = document.getElementById('reco-status');
        if (!text) {
            status.style.color = '#ff8888';
            status.textContent = 'Please enter a recommendation.';
            return;
        }
        const submitBtn = document.getElementById('reco-submit');
        submitBtn.disabled = true;
        status.style.color = '#ffd700';
        status.textContent = 'Sending...';
        try {
            const res = await fetch(`${API_BASE_URL}/api/art-recommendation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recommendation: text, name })
            });
            if (!res.ok) throw new Error('Request failed');
            status.style.color = '#88ff88';
            status.textContent = 'Thank you! Your recommendation was sent.';
            document.getElementById('reco-text').value = '';
            document.getElementById('reco-name').value = '';
            setTimeout(closeRecoForm, 1200);
        } catch (err) {
            console.error('Failed to send recommendation:', err);
            status.style.color = '#ff8888';
            status.textContent = 'Could not send. Please try again later.';
        } finally {
            submitBtn.disabled = false;
        }
    }

    // Shows a hint when the player is near the recommendation frame.
    function updateRecoHint() {
        const hint = document.getElementById('reco-hint');
        if (!hint || !recoFramePos) return;
        if (isRecoFormOpen) { hint.style.display = 'none'; return; }
        const near = camera.position.distanceTo(recoFramePos) < 6;
        hint.style.display = near ? 'block' : 'none';
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

        // --- Recommendation Frame (on the entrance wall, right of the door) ---
        createRecoFrame();

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
            const artMaterial = new THREE.MeshBasicMaterial({ map: loader.load(artwork.url, 
                    undefined, // onLoad
                    undefined, // onProgress
                    function (err) {
                        console.error('An error happened loading artwork texture:', artwork.url, err);
                    }
                ) });
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

        // Mobile joystick initialization
        if (isMobileDevice()) {
            joystickHandle = document.querySelector('#virtual-joystick-left .joystick-handle');
            joystickBase = document.getElementById('virtual-joystick-left');
            if (joystickBase && joystickHandle) {
                const rect = joystickBase.getBoundingClientRect();
                joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                joystickRadius = rect.width / 2;

                // Set initial handle position to center
                joystickHandle.style.transform = `translate(-50%, -50%)`;
                joystickHandle.style.left = '50%';
                joystickHandle.style.top = '50%';
            }
        }
    }

    // --- Texture Loading Helpers ---
    function loadCarpetTexture() {
        const loader = new THREE.TextureLoader();
        const t = loader.load('https://cms-assets.tutsplus.com/cdn-cgi/image/width=850/uploads/users/523/posts/27364/final_image/project-preview-large.png', undefined, undefined, function(err){console.error('Error loading carpet texture:', err);});
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1, 8); 
        return t;
    }

    function loadStarryNightTexture() {
        const loader = new THREE.TextureLoader();
        const t = loader.load('https://assets.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?cs=srgb&dl=pexels-kaip-1341279.jpg&fm=jpg', undefined, undefined, function(err){console.error('Error loading starry night texture:', err);});
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1, 4);
        return t;
    }

    function loadCloudySkyTexture() {
        const loader = new THREE.TextureLoader();
        const t = loader.load('https://cdn.mos.cms.futurecdn.net/FRdq8ZbPetwNDRV9R3hYpP-1200-80.jpg', undefined, undefined, function(err){console.error('Error loading cloudy sky texture:', err);});
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1, 4);
        return t;
    }

    // --- Movement & Logic ---
    const keys = { w: false, a: false, s: false, d: false };
    let doorOpen = false;
    // let doorAngle = 0; // Not used, can be removed
    
    // --- Action Functions (refactored for reusability) ---
    function toggleDoorMenu() {
        doorOpen = !doorOpen;
        if (doorOpen) {
            document.getElementById('nav-menu').style.display = 'block';
            document.exitPointerLock();
        } else {
            document.getElementById('nav-menu').style.display = 'none';
            // Only request pointer lock if on desktop (no virtual controls)
            if (!isMobileDevice()) {
                document.body.requestPointerLock();
            }
        }
    }

    function toggleCeiling() {
        isStarryNight = !isStarryNight;
        const newTexture = isStarryNight ? loadStarryNightTexture() : loadCloudySkyTexture();
        ceiling.children.forEach(c => { c.material.map = newTexture; c.material.needsUpdate = true; });
    }

    function toggleHints() {
        isDetailedHintsOpen = !isDetailedHintsOpen;
        const controlsDetailed = document.getElementById('controls-detailed');
        if (controlsDetailed) { // Check if desktop hints exist
            controlsDetailed.style.display = isDetailedHintsOpen ? 'block' : 'none';
        }
        // Also toggle visibility of virtual buttons if they exist
        const hiddenVirtualBtns = document.getElementById('hidden-virtual-btns');
        if (hiddenVirtualBtns && window.innerWidth <= 768) { // Only for mobile
             hiddenVirtualBtns.classList.toggle('visible', isDetailedHintsOpen);
        }
    }

    function toggleMusic() {
        const music = document.getElementById('music');
        music.muted = !music.muted;
        isMusicPlaying = !music.muted; // Update state
    }

    function toggleSpeed() {
        speedMultiplier = (speedMultiplier === 1) ? 2 : 1;
    }

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        // While the recommendation form is open, let the user type freely and
        // ignore movement / other shortcuts (Escape closes it).
        if (isRecoFormOpen) {
            if (e.key === 'Escape') closeRecoForm();
            return;
        }

        if (key in keys) keys[key] = true;

        if (key === 'o') toggleDoorMenu();
        if (key === 'n') toggleCeiling();
        if (key === 'h') toggleHints();
        if (key === 'm') toggleMusic();
        if (key === '2') toggleSpeed();
        if (key === 'r') openRecoForm();
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
    // Don't grab pointer lock while the recommendation form is open (let the user type).
    if (isRecoFormOpen) return;
    // For desktop, lock pointer on click
    if (!isMobileDevice() && !isMouseLocked) {
        document.body.requestPointerLock();
    }

    // For all devices, play music on the first interaction
    const music = document.getElementById('music');
    if (music.paused) {
        music.play().catch(e => console.log("Audio play failed. User interaction might be required.", e));
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
        updateRecoHint();
        renderer.render(scene, camera);
    }

    // Function to update joystick handle position and movement keys
    function updateJoystick(clientX, clientY) {
        if (!joystickHandle || !joystickBase || !joystickActive) return;

        const rect = joystickBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let offsetX = clientX - centerX;
        let offsetY = clientY - centerY;

        // Constrain handle within joystickRadius
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (distance > joystickRadius) {
            const angle = Math.atan2(offsetY, offsetX);
            offsetX = joystickRadius * Math.cos(angle);
            offsetY = joystickRadius * Math.sin(angle);
        }

        joystickHandle.style.left = `${50 + (offsetX / joystickRadius) * 50}%`;
        joystickHandle.style.top = `${50 + (offsetY / joystickRadius) * 50}%`;
        joystickHandle.style.transform = `translate(-50%, -50%)`;

        // Map joystick position to movement keys
        keys.w = keys.a = keys.s = keys.d = false; // Reset all

        const threshold = 0.2; // Sensitivity for movement
        const normalizedX = offsetX / joystickRadius;
        const normalizedY = offsetY / joystickRadius;

        if (normalizedY < -threshold) keys.w = true;
        if (normalizedY > threshold) keys.s = true;
        if (normalizedX < -threshold) keys.a = true;
        if (normalizedX > threshold) keys.d = true;
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

window.onload = function() {
    init(); // Call init only after all resources are loaded

    // Recommendation form buttons (all devices)
    document.getElementById('reco-submit')?.addEventListener('click', submitReco);
    document.getElementById('reco-cancel')?.addEventListener('click', closeRecoForm);

    // Mobile joystick initialization
    if (isMobileDevice()) {
        joystickHandle = document.querySelector('#virtual-joystick-left .joystick-handle');
        joystickBase = document.getElementById('virtual-joystick-left');
        if (joystickBase && joystickHandle) {
            const rect = joystickBase.getBoundingClientRect();
            joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            joystickRadius = rect.width / 2;

            // Set initial handle position to center
            joystickHandle.style.transform = `translate(-50%, -50%)`;
            joystickHandle.style.left = '50%';
            joystickHandle.style.top = '50%';
        }

        // --- Virtual Button Event Listeners (Mobile) ---
        const btnH = document.getElementById('btn-h');
        const hiddenVirtualBtns = document.getElementById('hidden-virtual-btns');

        if (btnH) {
            btnH.addEventListener('click', () => {
                hiddenVirtualBtns.classList.toggle('visible');
            });
        }

        document.getElementById('btn-2')?.addEventListener('click', toggleSpeed);
        document.getElementById('btn-m')?.addEventListener('click', toggleMusic);
        document.getElementById('btn-n')?.addEventListener('click', toggleCeiling);
        document.getElementById('btn-o')?.addEventListener('click', toggleDoorMenu);
        document.getElementById('btn-r')?.addEventListener('click', openRecoForm);

        // Virtual Joystick Movement
        if (joystickBase) {
            joystickBase.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent scrolling
                joystickActive = true;
                const touch = e.touches[0];
                updateJoystick(touch.clientX, touch.clientY);
            });

            joystickBase.addEventListener('touchmove', (e) => {
                e.preventDefault(); // Prevent scrolling
                if (joystickActive) {
                    const touch = e.touches[0];
                    updateJoystick(touch.clientX, touch.clientY);
                }
            });

            joystickBase.addEventListener('touchend', () => {
                joystickActive = false;
                // Reset keys
                keys.w = keys.a = keys.s = keys.d = false;
                // Snap handle back to center
                if (joystickHandle) {
                    joystickHandle.style.left = '50%';
                    joystickHandle.style.top = '50%';
                    joystickHandle.style.transform = `translate(-50%, -50%)`;
                }
            });
        }

        // Touch Look (on the canvas, excluding joystick and buttons)
        let lastTouchLookX = 0;
        let lastTouchLookY = 0;
        let touchLookIsActive = false;

        renderer.domElement.addEventListener('touchstart', (e) => {
            // Only activate touch look if not touching joystick or virtual buttons
            const target = e.target;
            if (target.closest('#virtual-joystick-left') || target.closest('#virtual-buttons-right')) {
                touchLookIsActive = false;
                return;
            }
            touchLookIsActive = true;
            lastTouchLookX = e.touches[0].clientX;
            lastTouchLookY = e.touches[0].clientY;
        });

        renderer.domElement.addEventListener('touchmove', (e) => {
            if (touchLookIsActive) {
                e.preventDefault(); // Prevent scrolling
                const touch = e.touches[0];
                const deltaX = touch.clientX - lastTouchLookX;
                const deltaY = touch.clientY - lastTouchLookY;

                yaw -= deltaX * 0.005; // Adjust sensitivity
                pitch -= deltaY * 0.005; // Adjust sensitivity
                pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

                lastTouchLookX = touch.clientX;
                lastTouchLookY = touch.clientY;
            }
        });

        renderer.domElement.addEventListener('touchend', () => {
            touchLookIsActive = false;
        });
        }
    }; // End of window.onload

    