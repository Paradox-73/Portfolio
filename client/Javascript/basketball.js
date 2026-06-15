"use strict";

(function() {

window.initBasketball = function() {
    if (typeof THREE === 'undefined') {
        const gameDiv = document.getElementById('basketball-game');
        if (gameDiv) {
            gameDiv.insertAdjacentHTML('beforeend', '<div class="err" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);padding:20px;border:2px solid red;text-align:center;">Could not load the 3D engine (three.js).<br>Check your internet connection and reload.</div>');
        }
        return;
    }
    main();
};

function main() {
    const host = document.getElementById('bb-three');
    if (!host) return;
    
    // Clear previous if any
    host.innerHTML = '';
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(window.innerWidth, window.innerHeight);
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 600);
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const G = 9.8, RIMR = 0.23, BALLR = 0.122, HOOP = new THREE.Vector3(0, 3.05, 0), BOARDZ = -0.45;
    let rimScale = 1;

    /* ---------- textures ---------- */
    function canvasTex(w, h, draw) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        draw(c.getContext('2d'), w, h);
        return new THREE.CanvasTexture(c);
    }
    function skyTex(stops) {
        return canvasTex(16, 256, (g, w, h) => {
            const gr = g.createLinearGradient(0, 0, 0, h);
            stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s));
            g.fillStyle = gr;
            g.fillRect(0, 0, w, h);
        });
    }
    const ballTex = canvasTex(256, 256, (g, w, h) => {
        const rg = g.createRadialGradient(w * 0.35, h * 0.32, 10, w * 0.5, h * 0.5, w * 0.62); rg.addColorStop(0, '#ffae5e'); rg.addColorStop(1, '#c4520a'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
        g.strokeStyle = '#2a1402'; g.lineWidth = 5;
        g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
        g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
        g.beginPath(); g.arc(-w * 0.15, h / 2, w * 0.55, -1, 1); g.stroke();
        g.beginPath(); g.arc(w * 1.15, h / 2, w * 0.55, Math.PI - 1, Math.PI + 1); g.stroke();
    });
    function chainTex() {
        return canvasTex(64, 64, (g, w, h) => {
            g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(205,212,220,0.95)'; g.lineWidth = 3;
            g.beginPath();
            g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h);
            g.moveTo(w / 2, -h / 2); g.lineTo(w * 1.5, h / 2); g.moveTo(w / 2, h * 1.5); g.lineTo(w * 1.5, h / 2);
            g.moveTo(-w / 2, h / 2); g.lineTo(w / 2, -h / 2); g.moveTo(-w / 2, h / 2); g.lineTo(w / 2, h * 1.5);
            g.stroke();
        });
    }
    function windowTex(cols, rows, seed) {
        return canvasTex(128, 256, (g, w, h) => {
            g.fillStyle = '#0a0a14'; g.fillRect(0, 0, w, h); const cw = w / cols, ch = h / rows;
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const lit = (Math.sin((c * 12.9 + r * 78.2 + seed) * 43.7) * 0.5 + 0.5) > 0.45;
                g.fillStyle = lit ? '#ffe7a0' : '#1a2236'; g.fillRect(c * cw + cw * 0.18, r * ch + ch * 0.16, cw * 0.64, ch * 0.6);
            }
        });
    }

    /* ---------- lights ---------- */
    const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 0.9); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.0); sun.position.set(-30, 40, -20); scene.add(sun);
    const amb = new THREE.AmbientLight(0xffffff, 0.5); scene.add(amb);
    const flood = new THREE.PointLight(0xcfe0ff, 0, 40); flood.position.set(0, 9, 6); scene.add(flood);

    /* ---------- sky / sun / stars ---------- */
    const skyMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16), skyMat));
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(8, 18, 18), new THREE.MeshBasicMaterial({ color: 0xfff0c0 })); scene.add(sunDisc);
    let stars = null;
    (function () {
        const N = 600, pos = []; for (let i = 0; i < N; i++) {
            const u = Math.random() * Math.PI * 2, v = Math.random() * 0.5, r = 250;
            pos.push(Math.cos(u) * Math.cos(v) * r, Math.sin(v) * r + 30, Math.sin(u) * Math.cos(v) * r);
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.9 })); stars.visible = false; scene.add(stars);
    })();

    /* ---------- floor + markings ---------- */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x55555f, roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const lines = new THREE.Group(); scene.add(lines);
    function addLine(x1, z1, x2, z2, th) {
        const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(len, th || 0.08), lineMat); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(dz, dx);
        m.position.set((x1 + x2) / 2, 0.012, (z1 + z2) / 2); lines.add(m);
    }
    function addArc(cx, cz, r, a0, a1, th) {
        const m = new THREE.Mesh(new THREE.RingGeometry(r - (th || 0.08) / 2, r + (th || 0.08) / 2, 64, 1, a0, a1 - a0), lineMat);
        m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.012, cz); lines.add(m);
    }
    addLine(-7, -1.5, 7, -1.5, 0.1);
    addLine(-1.8, -1.5, -1.8, 4.0); addLine(1.8, -1.5, 1.8, 4.0); addLine(-1.8, 4.0, 1.8, 4.0);
    addArc(0, 4.0, 1.8, 0, Math.PI * 2, 0.08);
    addArc(0, 0, 1.25, Math.PI, Math.PI * 2, 0.08);
    addArc(0, 0, 6.7, Math.PI, Math.PI * 2, 0.1);
    addLine(-6.7, 0, -6.7, -1.5, 0.1); addLine(6.7, 0, 6.7, -1.5, 0.1);

    /* ---------- hoop ---------- */
    const hoopGroup = new THREE.Group(); scene.add(hoopGroup);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a9099, metalness: 0.6, roughness: 0.4 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.6, 12), poleMat); pole.position.set(0, 1.8, -1.1); hoopGroup.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.7), poleMat); arm.position.set(0, 3.4, -0.78); hoopGroup.add(arm);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, 0.04), new THREE.MeshStandardMaterial({
        color: 0xffffff, transparent: true, opacity: 0.88, roughness: 0.3,
        map: canvasTex(256, 150, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#ff7a1a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.strokeRect(w * 0.34, h * 0.30, w * 0.32, h * 0.5); })
    }));
    board.position.set(0, 3.4, BOARDZ); hoopGroup.add(board);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(RIMR, 0.02, 10, 32), new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0x501500, metalness: 0.7, roughness: 0.4 }));
    rim.rotation.x = Math.PI / 2; rim.position.copy(HOOP); hoopGroup.add(rim);
    const netMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const netGroup = new THREE.Group(); hoopGroup.add(netGroup);
    function buildNet(squeeze) {
        while (netGroup.children.length) { const c = netGroup.children[0]; c.geometry.dispose(); netGroup.remove(c); }
        const N = 12, top = HOOP.y, bot = HOOP.y - 0.45, rTop = RIMR * rimScale, rBot = RIMR * rimScale * (0.5 - squeeze * 0.18), pos = [];
        for (let i = 0; i < N; i++) {
            const a = i / N * Math.PI * 2, a2 = (i + 1) / N * Math.PI * 2;
            const tx = Math.cos(a) * rTop, tz = Math.sin(a) * rTop, bx = Math.cos(a) * rBot, bz = Math.sin(a) * rBot, bx2 = Math.cos(a2) * rBot, bz2 = Math.sin(a2) * rBot;
            pos.push(tx, top, tz, bx, bot, bz); pos.push(tx, top, tz, bx2, bot, bz2);
        }
        for (const t of [0.34, 0.67, 1.0]) {
            const y = top + (bot - top) * t, r = rTop + (rBot - rTop) * t;
            for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, a2 = (i + 1) / N * Math.PI * 2; pos.push(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(a2) * r, y, Math.sin(a2) * r); }
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); netGroup.add(new THREE.LineSegments(g, netMat));
    }
    buildNet(0);

    /* ---------- fence ---------- */
    const fenceG = new THREE.Group(); scene.add(fenceG);
    function addFence(cx, cy, cz, w, h, ry) {
        const t = chainTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w * 1.1, h * 1.1);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, color: 0xaab0b8, metalness: 0.3, roughness: 0.7, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }));
        m.position.set(cx, cy, cz); m.rotation.y = ry; fenceG.add(m);
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, w, 8), poleMat); rail.rotation.z = Math.PI / 2; rail.rotation.y = ry; rail.position.set(cx, cy + h / 2, cz); fenceG.add(rail);
    }
    addFence(0, 2.2, -3.2, 30, 4.4, 0);
    addFence(-13, 2.2, 5, 18, 4.4, Math.PI / 2);
    addFence(13, 2.2, 5, 18, 4.4, Math.PI / 2);

    /* ---------- buildings ---------- */
    const buildings = [];
    function addBuilding(x, z, w, d, h, seed, cols, rows) {
        const colsD = Math.max(2, Math.round(cols * d / w));               // keep window cells ~square on each face
        const texW = windowTex(cols, rows, seed), texD = windowTex(colsD, rows, seed + 7);
        const matW = new THREE.MeshStandardMaterial({ color: 0x3a3550, map: texW, emissive: 0xffffff, emissiveMap: texW, emissiveIntensity: 0, roughness: 0.85 });
        const matD = new THREE.MeshStandardMaterial({ color: 0x3a3550, map: texD, emissive: 0xffffff, emissiveMap: texD, emissiveIntensity: 0, roughness: 0.85 });
        const roof = new THREE.MeshStandardMaterial({ color: 0x24202c, roughness: 0.95 });
        // BoxGeometry face order: +x,-x,+y,-y,+z,-z  -> windows on the 4 walls, plain roof/floor
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [matD, matD, roof, roof, matW, matW]);
        m.position.set(x, h / 2, z); scene.add(m); buildings.push(matW, matD);
    }
    addBuilding(-9, -9, 6, 5, 14, 3, 4, 8); addBuilding(-3, -13, 6.5, 5, 20, 11, 4, 11);
    addBuilding(4, -11, 7, 5, 17, 7, 5, 9); addBuilding(11, -8, 6, 5, 12, 19, 4, 7);
    addBuilding(-16, -14, 7, 6, 24, 5, 4, 13); addBuilding(17, -13, 7, 6, 22, 9, 4, 12);

    /* ---------- cars ---------- */
    function addCar(x, z, color) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 1.0), new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.5 })); body.position.y = 0.5; g.add(body);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.92), new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.3 })); cab.position.set(-0.1, 0.95, 0); g.add(cab);
        for (const wx of [-0.7, 0.7]) for (const wz of [-0.5, 0.5]) { const wm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 12), new THREE.MeshStandardMaterial({ color: 0x0a0a0a })); wm.rotation.x = Math.PI / 2; wm.position.set(wx, 0.25, wz); g.add(wm); }
        g.position.set(x, 0, z); scene.add(g);
    }
    addCar(-7, -4.5, 0xc0392b); addCar(7, -4.7, 0x2c6fb0);

    /* ---------- ball + shadow + trajectory ---------- */
    const ball = new THREE.Mesh(new THREE.SphereGeometry(BALLR, 24, 18), new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.6 })); scene.add(ball);
    const ballShadow = new THREE.Mesh(new THREE.CircleGeometry(BALLR * 1.4, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })); ballShadow.rotation.x = -Math.PI / 2; ballShadow.position.y = 0.02; scene.add(ballShadow);
    const trajMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    let trajLine = new THREE.Line(new THREE.BufferGeometry(), trajMat); scene.add(trajLine);

    /* ---------- spots / camera look ---------- */
    const SPOTS = (() => {
        const A = [-70, -45, -22, 0, 22, 45, 70], R = [4.4, 5.2, 6.2, 6.7, 6.2, 5.2, 4.4], out = [];
        for (let i = 0; i < A.length; i++) { const a = A[i] * Math.PI / 180; out.push(new THREE.Vector3(R[i] * Math.sin(a), 1.7, R[i] * Math.cos(a))); } return out;
    })();
    let spotIndex = 0; const eye = new THREE.Vector3(); let baseYaw = 0, basePitch = 0, lookYaw = 0, lookPitch = 0;
    function setSpot(i) { eye.copy(SPOTS[i]); const dir = new THREE.Vector3().subVectors(HOOP, eye).normalize(); basePitch = Math.asin(dir.y); baseYaw = Math.atan2(dir.x, -dir.z); lookYaw = 0; lookPitch = 0; resetBall(); }
    function forwardVec() {
        const yaw = baseYaw + lookYaw, pitch = THREE.MathUtils.clamp(basePitch + lookPitch, -0.2, 1.2);
        return new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    }

    /* ---------- ball state ---------- */
    const bs = { vel: new THREE.Vector3(), state: 'ready', scored: false, rim: false, bank: false, prevY: 0, rest: 0, trail: [] };
    let chargeT = 0, charging = false, charge = 0; const PERIOD = 1.15, MINV = 5.2, MAXV = 11.5;
    function heldStart() { const f = forwardVec(); return new THREE.Vector3(eye.x + f.x * 0.5, eye.y - 0.32 + f.y * 0.5, eye.z + f.z * 0.5); }
    function resetBall() { const s = heldStart(); ball.position.copy(s); bs.vel.set(0, 0, 0); bs.state = 'ready'; bs.scored = false; bs.rim = false; bs.bank = false; bs.prevY = s.y; bs.rest = 0; bs.trail.length = 0; chargeT = 0; charging = false; charge = 0; }
    function idealSpeed() {
        const s = heldStart(); const D = Math.hypot(HOOP.x - s.x, HOOP.z - s.z), h = HOOP.y - s.y; const f = forwardVec();
        const ch = Math.hypot(f.x, f.z) || 0.001; const denom = D * (f.y / ch) - h; if (denom <= 0) return MAXV + 2; return Math.sqrt(0.5 * G * D * D / (ch * ch * denom));
    }
    function shoot() { if (bs.state !== 'ready') return; const f = forwardVec(); const v = MINV + (MAXV - MINV) * charge; bs.vel.copy(f).multiplyScalar(v); bs.state = 'flight'; bs.prevY = ball.position.y; bs.trail.length = 0; SFX.swoosh(); }

    /* ---------- physics ---------- */
    function stepPhys(dt) {
        bs.prevY = ball.position.y; bs.vel.y -= G * dt; bs.vel.x -= bs.vel.x * 0.02 * dt; bs.vel.z -= bs.vel.z * 0.02 * dt;
        ball.position.addScaledVector(bs.vel, dt); const p = ball.position;
        if (bs.prevY > 2.9 && p.z < BOARDZ + 0.03 && bs.vel.z < 0 && p.x > -0.9 && p.x < 0.9 && p.y > 2.9 && p.y < 4.0) { p.z = BOARDZ + 0.03; bs.vel.z *= -0.55; bs.vel.x *= 0.7; bs.vel.y *= 0.85; bs.bank = true; SFX.board(); }
        const rr = RIMR * rimScale, hd = Math.hypot(p.x - HOOP.x, p.z - HOOP.z);
        if (p.y > 2.78 && p.y < 3.32 && hd > 0.02) {
            const nx = (p.x - HOOP.x) / hd, nz = (p.z - HOOP.z) / hd;
            const ring = new THREE.Vector3(HOOP.x + nx * rr, 3.05, HOOP.z + nz * rr); const del = new THREE.Vector3().subVectors(p, ring); const dl = del.length(), tube = 0.03;
            if (dl < BALLR + tube) { const n = del.normalize(); const vn = bs.vel.dot(n); if (vn < 0) { bs.vel.addScaledVector(n, -vn * 1.55); bs.vel.multiplyScalar(0.78); p.addScaledVector(n, BALLR + tube - dl + 0.005); if (!bs.scored) { bs.rim = true; SFX.rim(); } } }
        }
        if (!bs.scored && bs.prevY > 3.05 && p.y <= 3.05 && bs.vel.y < 0) { if (Math.hypot(p.x - HOOP.x, p.z - HOOP.z) < rr - BALLR * 0.35) { onMake(); } }
        if (p.y - BALLR <= 0 && bs.vel.y < 0) { p.y = BALLR; bs.vel.y *= -0.55; bs.vel.x *= 0.72; bs.vel.z *= 0.72; if (Math.abs(bs.vel.y) > 0.7) SFX.bounce(Math.min(1, Math.abs(bs.vel.y) / 4)); }
    }

    /* ---------- game ---------- */
    let score = 0, streak = 0, level = 1, makes = 0, attempts = 0, shotClock = 24, netPulse = 0, cooldown = 0, shake = 0;
    function onMake() {
        if (bs.scored) return; bs.scored = true; attempts++; makes++; netPulse = 1; shake = 0.12;
        const swish = !bs.rim && !bs.bank; let pts = 100 + streak * 20 + (swish ? 75 : 0) + (bs.bank ? 25 : 0); pts = Math.round(pts * (1 + (level - 1) * 0.1));
        score += pts; streak++; addFloat((swish ? 'SWISH! ' : bs.bank ? 'BANK! ' : 'BUCKET! ') + '+' + pts, swish ? '#ffd34d' : '#fff'); burst(HOOP, swish ? 0xffd34d : 0xff8a3d, swish ? 28 : 18);
        SFX.score(swish); if (streak > 0 && streak % 3 === 0) SFX.cheer();
        spotIndex++; if (spotIndex > SPOTS.length - 1) { level++; spotIndex = 0; rimScale = Math.max(0.82, rimScale - 0.04); buildNet(0); addFloat('★ AROUND THE WORLD ★', '#22d3ee'); SFX.cheer(); SFX.buzzer(); shake = 0.2; }
        autoTheme();
    }
    function onMiss() { attempts++; streak = 0; addFloat('MISS', '#ff6b6b'); SFX.miss(); }
    function airball() { attempts++; streak = 0; addFloat('SHOT CLOCK!', '#ff4d4d'); SFX.buzzer(); bs.state = 'cooldown'; cooldown = 0.7; }
    function resolveShot() { if (!bs.scored) onMiss(); bs.state = 'cooldown'; cooldown = 0.6; }
    function nextShot() { setSpot(spotIndex); shotClock = 24; }

    /* ---------- particles / floats ---------- */
    const parts = [], floats = []; const partGeo = new THREE.SphereGeometry(0.05, 6, 6);
    function burst(pos, color, n) {
        for (let i = 0; i < n; i++) {
            const m = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ color, transparent: true }));
            m.position.copy(pos); const a = Math.random() * 6.28, sp = 1.5 + Math.random() * 3.5; m.userData = { v: new THREE.Vector3(Math.cos(a) * sp, Math.random() * 3 + 1, Math.sin(a) * sp), life: 0.7 + Math.random() * 0.4 }; scene.add(m); parts.push(m);
        }
    }
    function updateParts(dt) { for (let i = parts.length - 1; i >= 0; i--) { const m = parts[i]; m.userData.life -= dt; if (m.userData.life <= 0) { scene.remove(m); m.material.dispose(); parts.splice(i, 1); continue; } m.userData.v.y -= 9 * dt; m.position.addScaledVector(m.userData.v, dt); m.material.opacity = Math.max(0, m.userData.life); } }
    function addFloat(t, c) { floats.push({ t, c, life: 1.6, y: 46 }); }

    /* ---------- themes ---------- */
    const THEMES = {
        morning: { sky: ['#ff9e6d', '#ffd9a0', '#bfe3ff'], sun: 0xffe0b0, sunPos: [-50, 40, -30], hemiSky: 0xffd9a0, hemiGround: 0x5a503a, hemiI: 0.9, sunI: 1.0, ambI: 0.5, fog: 0xcfd9e8, win: 0, stars: false, flood: 0, line: 0.9, name: 'MORNING' },
        noon: { sky: ['#2f74d6', '#73b2f0', '#d6efff'], sun: 0xffffff, sunPos: [20, 80, -10], hemiSky: 0xbfe0ff, hemiGround: 0x6b6b5a, hemiI: 1.0, sunI: 1.25, ambI: 0.6, fog: 0xcfe0f0, win: 0, stars: false, flood: 0, line: 0.95, name: 'AFTERNOON' },
        night: { sky: ['#05060f', '#0a1030', '#16204a'], sun: 0xaebfff, sunPos: [30, 50, -40], hemiSky: 0x223066, hemiGround: 0x05060a, hemiI: 0.25, sunI: 0.25, ambI: 0.18, fog: 0x0a0e22, win: 1.2, stars: true, flood: 2.2, line: 0.6, name: 'NIGHT' }
    };
    let themeKeys = ['morning', 'noon', 'night'], curThemeKey = 'morning', manualTheme = false;
    function applyTheme(key) {
        curThemeKey = key; const t = THEMES[key];
        skyMat.map = skyTex(t.sky); skyMat.needsUpdate = true;
        sunDisc.position.set(t.sunPos[0], t.sunPos[1], t.sunPos[2]); sunDisc.material.color.set(t.sun);
        sun.position.set(t.sunPos[0], t.sunPos[1], t.sunPos[2]); sun.color.set(t.sun); sun.intensity = t.sunI;
        hemi.color.set(t.hemiSky); hemi.groundColor.set(t.hemiGround); hemi.intensity = t.hemiI; amb.intensity = t.ambI;
        scene.fog = new THREE.Fog(t.fog, 18, 130); scene.background = new THREE.Color(t.fog);
        for (const m of buildings) m.emissiveIntensity = t.win;
        stars.visible = t.stars; flood.intensity = t.flood; lineMat.opacity = t.line;
    }
    function autoTheme() { if (manualTheme) return; applyTheme(themeKeys[Math.floor(makes / 3) % 3]); }
    function cycleTheme() { manualTheme = true; const i = themeKeys.indexOf(curThemeKey); applyTheme(themeKeys[(i + 1) % 3]); showBadge(THEMES[curThemeKey].name); }

    /* ---------- HUD ---------- */
    const $ = id => document.getElementById(id);
    const floatLayer = document.createElement('div'); floatLayer.style.cssText = 'position:absolute;inset:0;z-index:7;pointer-events:none;'; 
    const gameContainer = document.getElementById('basketball-game');
    if (gameContainer) gameContainer.appendChild(floatLayer);
    
    function updateHUD() {
        if ($('bb-score')) $('bb-score').textContent = score;
        if ($('bb-streak')) $('bb-streak').textContent = streak;
        if ($('bb-level')) $('bb-level').textContent = level;
        if ($('bb-spotn')) $('bb-spotn').textContent = spotIndex + 1;
        if ($('bb-acc')) $('bb-acc').textContent = (attempts ? Math.round(makes / attempts * 100) : 0) + '%';
        
        const cl = $('bb-clock');
        if (cl) {
            cl.textContent = Math.ceil(shotClock);
            cl.classList.toggle('warn', shotClock <= 5);
        }
        
        const pips = $('bb-pips');
        if (pips) {
            if (pips.childElementCount !== SPOTS.length) {
                pips.innerHTML = '';
                for (let i = 0; i < SPOTS.length; i++) {
                    const d = document.createElement('div');
                    d.className = 'pip';
                    pips.appendChild(d);
                }
            }
            [...pips.children].forEach((d, i) => {
                d.className = 'pip' + (i < spotIndex ? ' done' : '') + (i === spotIndex ? ' cur' : '');
            });
        }
        
        const iv = idealSpeed();
        const ivf = THREE.MathUtils.clamp((iv - MINV) / (MAXV - MINV), 0, 1);
        const zone = $('bb-pzone');
        if (zone) zone.style.bottom = 'calc(' + (ivf * 100) + '% - 11px)';
        
        if ($('bb-pfill')) $('bb-pfill').style.height = (charge * 100) + '%';
        
        if ($('bb-cross')) $('bb-cross').classList.toggle('good', bs.state === 'ready' && Math.abs(charge - ivf) < 0.06 && Math.abs(lookYaw) < 0.04);
        if ($('bb-pmeter')) $('bb-pmeter').style.opacity = (bs.state === 'ready') ? 1 : 0.3;
        
        floatLayer.innerHTML = floats.map(f => '<div style="position:absolute;left:50%;top:' + (f.y / 100 * window.innerHeight) + 'px;transform:translateX(-50%);opacity:' + Math.min(1, f.life) + ';font-family:Russo One,sans-serif;font-size:40px;color:' + f.c + ';text-shadow:0 0 18px ' + f.c + ',0 2px 0 #000;white-space:nowrap">' + f.t + '</div>').join('');
    }
    let badgeTimer = 0;
    function showBadge(t) {
        const b = $('bb-badge');
        if (b) {
            b.textContent = t;
            b.classList.remove('hidden');
            badgeTimer = 1.6;
        }
    }

    /* ---------- input ---------- */
    const keys = {};
    window.addEventListener('keydown', e => {
        if (!document.getElementById('basketball-game').classList.contains('active')) return;
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') { if (state === 'play' && bs.state === 'ready' && !charging) { charging = true; chargeT = 0; } }
        if (e.key === 't' || e.key === 'T') cycleTheme();
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
        if (e.key === 'r' || e.key === 'R') { if (state === 'play') { shotClock = 24; resetBall(); } }
    });
    window.addEventListener('keyup', e => {
        if (!document.getElementById('basketball-game').classList.contains('active')) return;
        keys[e.key.toLowerCase()] = false; if (e.key === ' ') { if (charging) { charging = false; shoot(); } }
    });
    window.addEventListener('mousemove', e => {
        if (!document.getElementById('basketball-game').classList.contains('active')) return;
        const nx = e.clientX / window.innerWidth * 2 - 1, ny = e.clientY / window.innerHeight * 2 - 1; lookYaw = nx * 0.5; lookPitch = -ny * 0.42;
    });
    window.addEventListener('mousedown', () => {
        if (!document.getElementById('basketball-game').classList.contains('active')) return;
        if (state === 'play' && bs.state === 'ready' && !charging) { charging = true; chargeT = 0; }
    });
    window.addEventListener('mouseup', () => {
        if (!document.getElementById('basketball-game').classList.contains('active')) return;
        if (charging) { charging = false; shoot(); }
    });
    function keyboardAim(dt) {
        const s = 0.9 * dt;
        if (keys['arrowleft'] || keys['a']) lookYaw -= s; if (keys['arrowright'] || keys['d']) lookYaw += s;
        if (keys['arrowup'] || keys['w']) lookPitch += s; if (keys['arrowdown'] || keys['s']) lookPitch -= s;
        lookYaw = THREE.MathUtils.clamp(lookYaw, -0.7, 0.7); lookPitch = THREE.MathUtils.clamp(lookPitch, -0.4, 0.8);
    }

    /* ---------- gamepad ---------- */
    let padStartPrev = false, padTimePrev = false;
    function pollPad(dt) {
        if (!document.getElementById('basketball-game').classList.contains('active')) return;
        const gps = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null; for (const g of gps) { if (g) { gp = g; break; } } if (!gp) return;
        const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0, lx = gp.axes[0] || 0, ly = gp.axes[1] || 0; const dz = v => Math.abs(v) > 0.16 ? v : 0;
        lookYaw += dz(rx) * 1.0 * dt + dz(lx) * 0.6 * dt; lookPitch -= dz(ry) * 1.0 * dt + dz(ly) * 0.6 * dt;
        lookYaw = THREE.MathUtils.clamp(lookYaw, -0.7, 0.7); lookPitch = THREE.MathUtils.clamp(lookPitch, -0.4, 0.8);
        const fire = (gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[7] && gp.buttons[7].pressed);
        if (state === 'play' && bs.state === 'ready') { if (fire && !charging) { charging = true; chargeT = 0; } if (!fire && charging) { charging = false; shoot(); } }
        const y = gp.buttons[3] && gp.buttons[3].pressed; if (y && !padTimePrev) cycleTheme(); padTimePrev = y;
        const st = gp.buttons[9] && gp.buttons[9].pressed; if (st && !padStartPrev) togglePause(); padStartPrev = st;
    }

    /* ---------- audio ---------- */
    const SFX = (() => {
        let ac = null, noise = null;
        function C() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return ac; }
        function mk() { const c = C(); if (!c) return null; const b = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
        function init() { const c = C(); if (c && !noise) noise = mk(); if (c && c.state === 'suspended') c.resume(); }
        function tone(f, d, t, v) { const c = C(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = t || 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(v ||.2, c.currentTime + .008); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); o.start(); o.stop(c.currentTime + d); }
        function nz(d, f, q, v) { const c = C(); if (!c || !noise) return; const s = c.createBufferSource(); s.buffer = noise; const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 4; const g = c.createGain(); s.connect(fl); fl.connect(g); g.connect(c.destination); g.gain.setValueAtTime(v ||.3, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); s.start(); s.stop(c.currentTime + d); }
        return {
            init, swoosh() { nz(0.18, 1200, 1.5, 0.18); }, bounce(v) { tone(90 + v * 40, 0.12, 'sine', 0.2 * v + 0.05); }, rim() { tone(760, 0.09, 'square', 0.12); tone(520, 0.12, 'triangle', 0.08); }, board() { tone(220, 0.12, 'square', 0.14); }, score(s) { tone(660, 0.1, 'sine', 0.18); setTimeout(() => tone(880, 0.16, 'sine', 0.18), 80); if (s) nz(0.25, 2600, 2, 0.16); }, miss() { tone(160, 0.18, 'sawtooth', 0.1); }, cheer() { nz(0.5, 900, 0.7, 0.18); }, buzzer() { tone(180, 0.4, 'square', 0.18); }
        };
    })();

    /* ---------- trajectory ---------- */
    function updateTraj() {
        if (bs.state !== 'ready') { trajLine.visible = false; return; } trajLine.visible = true;
        const f = forwardVec(); const v = f.clone().multiplyScalar(MINV + (MAXV - MINV) * charge); let p = heldStart(); const y0 = p.y; const pts = [];
        for (let i = 0; i < 60; i++) { v.y -= G * 0.04; p = p.clone().addScaledVector(v, 0.04); pts.push(p.clone()); if (p.y < y0 - 1.4 || p.z < BOARDZ - 0.2) break; }
        trajLine.geometry.dispose(); trajLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
        trajMat.color.set(charging ? 0xffd24d : 0xffffff); trajMat.opacity = charging ? 0.85 : 0.4;
    }

    /* ---------- state ---------- */
    let state = 'menu';
    function startGame() {
        score = 0; streak = 0; level = 1; makes = 0; attempts = 0; rimScale = 1; spotIndex = 0; manualTheme = false; shotClock = 24;
        for (const m of parts) scene.remove(m); parts.length = 0; floats.length = 0; buildNet(0); applyTheme('morning');
        setSpot(0); state = 'play'; 
        if ($('bb-start')) $('bb-start').classList.add('hidden'); 
        if ($('bb-pause')) $('bb-pause').classList.add('hidden'); 
        SFX.init();
    }
    function togglePause() { 
        if (state === 'play') { 
            state = 'pause'; 
            if ($('bb-pause')) $('bb-pause').classList.remove('hidden'); 
        } else if (state === 'pause') { 
            state = 'play'; 
            if ($('bb-pause')) $('bb-pause').classList.add('hidden'); 
        } 
    }
    if ($('bb-startBtn')) $('bb-startBtn').onclick = startGame;
    if ($('bb-resumeBtn')) $('bb-resumeBtn').onclick = togglePause;
    if ($('bb-restartBtn')) $('bb-restartBtn').onclick = startGame;

    /* ---------- update + loop ---------- */
    function update(dt) {
        if (state !== 'play') return;
        if (bs.state === 'ready') {
            shotClock -= dt; if (shotClock <= 0) { shotClock = 0; airball(); }
            if (charging) { chargeT += dt; const ph = (chargeT / PERIOD) % 1; charge = ph < 0.5 ? ph * 2 : 2 - ph * 2; }
            ball.position.copy(heldStart());
        }
        if (bs.state === 'flight') {
            let rem = Math.min(dt, 0.05); while (rem > 0) { const s = Math.min(rem, 1 / 240); stepPhys(s); rem -= s; }
            bs.trail.push(ball.position.clone()); if (bs.trail.length > 16) bs.trail.shift();
            const sp = bs.vel.length(); if (ball.position.y <= BALLR + 0.02 && sp < 0.7) bs.rest += dt; else bs.rest = 0;
            if (bs.rest > 0.4 || Math.abs(ball.position.z) > 20 || Math.abs(ball.position.x) > 20 || ball.position.z > eye.z + 1.5) resolveShot();
        }
        if (bs.state === 'cooldown') { cooldown -= dt; if (cooldown <= 0) nextShot(); }
        if (netPulse > 0) { netPulse = Math.max(0, netPulse - dt * 2.6); buildNet(netPulse); }
        ball.rotation.x += bs.vel.z * dt * 2; ball.rotation.z -= bs.vel.x * dt * 2;
        ballShadow.position.set(ball.position.x, 0.02, ball.position.z); const sc = THREE.MathUtils.clamp(1 - ball.position.y / 8, 0.3, 1); ballShadow.scale.set(sc, sc, sc); ballShadow.material.opacity = 0.3 * sc;
        updateParts(dt);
        for (let i = floats.length - 1; i >= 0; i--) { floats[i].life -= dt; floats[i].y -= 14 * dt; if (floats[i].life <= 0) floats.splice(i, 1); }
        if (shake > 0) shake = Math.max(0, shake - dt * 0.6);
    }
    let last = performance.now();
    function loop(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        pollPad(dt); if (state === 'play') keyboardAim(dt); update(dt);
        if (badgeTimer > 0) { badgeTimer -= dt; if (badgeTimer <= 0) if ($('bb-badge')) $('bb-badge').classList.add('hidden'); }
        const f = forwardVec(); camera.position.copy(eye);
        if (shake > 0) { camera.position.x += (Math.random() - 0.5) * shake; camera.position.y += (Math.random() - 0.5) * shake; }
        camera.lookAt(eye.x + f.x, eye.y + f.y, eye.z + f.z);
        updateTraj(); renderer.render(scene, camera); updateHUD();
        requestAnimationFrame(loop);
    }
    applyTheme('morning'); setSpot(0); state = 'menu';
    requestAnimationFrame(loop);
}

})();
