"use strict";

(function() {

window.initGolf = function() {
    main();
};

function main() {
    const cv = document.getElementById('golf-cv');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, DPR = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
        W = window.innerWidth; H = window.innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        if (hole) setZoom();
    }
    window.addEventListener('resize', resize); resize();

    /* ---------- helpers ---------- */
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const lerp = (a, b, t) => a + (b - a) * t;
    function pip(px, py, poly) {
        let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
            if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-9) + xi)) c = !c;
        } return c;
    }
    function corridor(path, width) {
        const half = width / 2, left = [], right = [];
        for (let i = 0; i < path.length; i++) {
            const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
            let dx = b.x - a.x, dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const nx = -dy, ny = dx;
            left.push({ x: path[i].x + nx * half, y: path[i].y + ny * half }); right.push({ x: path[i].x - nx * half, y: path[i].y - ny * half });
        }
        return left.concat(right.reverse());
    }

    /* ---------- clubs ---------- */
    const CLUBS = [
        { name: 'DRIVER', dist: 280, hmax: 20, roll: 0.20 },
        { name: '3 WOOD', dist: 235, hmax: 19, roll: 0.17 },
        { name: '5 IRON', dist: 185, hmax: 23, roll: 0.12 },
        { name: '9 IRON', dist: 135, hmax: 29, roll: 0.07 },
        { name: 'WEDGE', dist: 95, hmax: 34, roll: 0.04 },
        { name: 'PUTTER', dist: 0, hmax: 0, roll: 0, putter: true },
    ];
    function recommend(d, onGreen) {
        if (onGreen) return 5; if (d <= 30) return 4;
        let best = 0, bestDiff = 1e9; for (let i = 0; i < CLUBS.length - 1; i++) { const diff = CLUBS[i].dist - d; if (diff >= -15 && Math.abs(diff) < bestDiff) { bestDiff = Math.abs(diff); best = i; } }
        if (d > 280) best = 0; return best;
    }

    /* ---------- holes ---------- */
    function mkH(par, tee, cup, fwPath, fwW, green, bunkers, water, trees, bounds, slope) {
        return { par, tee, cup, fairway: corridor(fwPath, fwW), green: { x: cup.x, y: cup.y, r: green }, bunkers: bunkers || [], water: water || [], trees: trees || [], bounds, slope: slope || { x: 0, y: 0 } };
    }
    const HOLES = [
        mkH(4, { x: 0, y: 0 }, { x: 0, y: -380 }, [{ x: 0, y: -20 }, { x: 0, y: -360 }], 46, 14, [{ x: -18, y: -360, r: 9 }, { x: 20, y: -366, r: 8 }], [], [{ x: -40, y: -200, r: 7 }, { x: 42, y: -150, r: 8 }, { x: 38, y: -258, r: 7 }], { minX: -70, maxX: 70, minY: -405, maxY: 22 }, { x: 0.8, y: 0.4 }),
        mkH(3, { x: 0, y: 0 }, { x: 0, y: -165 }, [{ x: 0, y: -110 }, { x: 0, y: -150 }], 40, 15, [{ x: -18, y: -168, r: 8 }, { x: 18, y: -168, r: 8 }], [{ x: 0, y: -134, r: 16 }, { x: -12, y: -138, r: 12 }, { x: 12, y: -138, r: 12 }], [{ x: -44, y: -80, r: 8 }, { x: 44, y: -90, r: 8 }], { minX: -60, maxX: 60, minY: -192, maxY: 22 }, { x: -0.6, y: 0.5 }),
        mkH(5, { x: 0, y: 0 }, { x: 30, y: -510 }, [{ x: 0, y: -20 }, { x: 10, y: -200 }, { x: 40, y: -360 }, { x: 30, y: -500 }], 44, 15, [{ x: -6, y: -250, r: 9 }, { x: 12, y: -505, r: 8 }, { x: 50, y: -505, r: 8 }], [{ x: 56, y: -380, r: 14 }, { x: 60, y: -360, r: 12 }], [{ x: -30, y: -150, r: 8 }, { x: -20, y: -262, r: 8 }, { x: 62, y: -200, r: 8 }, { x: 56, y: -300, r: 7 }], { minX: -70, maxX: 92, minY: -540, maxY: 22 }, { x: 1.0, y: 0.3 }),
        mkH(4, { x: 0, y: 0 }, { x: -30, y: -405 }, [{ x: 0, y: -20 }, { x: -8, y: -200 }, { x: -40, y: -360 }, { x: -30, y: -398 }], 42, 14, [{ x: 6, y: -250, r: 9 }, { x: -12, y: -403, r: 8 }], [], [{ x: 30, y: -160, r: 8 }, { x: 20, y: -262, r: 8 }, { x: -62, y: -220, r: 8 }], { minX: -92, maxX: 70, minY: -430, maxY: 22 }, { x: -0.9, y: 0.4 }),
        mkH(3, { x: 0, y: 0 }, { x: 0, y: -195 }, [{ x: 0, y: -130 }, { x: 0, y: -182 }], 40, 15, [{ x: -20, y: -196, r: 9 }, { x: 20, y: -196, r: 9 }, { x: 0, y: -176, r: 9 }], [], [{ x: -46, y: -100, r: 8 }, { x: 46, y: -110, r: 8 }], { minX: -62, maxX: 62, minY: -222, maxY: 22 }, { x: 0.6, y: 0.6 }),
        mkH(4, { x: 0, y: 0 }, { x: 0, y: -345 }, [{ x: 0, y: -20 }, { x: -4, y: -180 }, { x: 0, y: -330 }], 40, 14, [{ x: -16, y: -340, r: 8 }], [{ x: 34, y: -120, r: 12 }, { x: 34, y: -160, r: 12 }, { x: 34, y: -200, r: 12 }, { x: 34, y: -240, r: 12 }], [{ x: -40, y: -160, r: 8 }, { x: -42, y: -244, r: 8 }], { minX: -65, maxX: 62, minY: -372, maxY: 22 }, { x: 0.5, y: 0.5 }),
        mkH(5, { x: 0, y: 0 }, { x: 0, y: -548 }, [{ x: 0, y: -20 }, { x: 0, y: -200 }, { x: 6, y: -380 }, { x: 0, y: -538 }], 46, 15, [{ x: -18, y: -545, r: 8 }, { x: 18, y: -545, r: 8 }, { x: -10, y: -430, r: 9 }], [{ x: -20, y: -300, r: 14 }, { x: 0, y: -300, r: 14 }, { x: 20, y: -300, r: 14 }], [{ x: -40, y: -150, r: 8 }, { x: 42, y: -220, r: 8 }, { x: -44, y: -470, r: 8 }, { x: 44, y: -480, r: 8 }], { minX: -70, maxX: 70, minY: -580, maxY: 22 }, { x: -0.7, y: 0.4 }),
        mkH(4, { x: 0, y: 0 }, { x: 0, y: -430 }, [{ x: 0, y: -20 }, { x: 0, y: -420 }], 34, 13, [{ x: -15, y: -428, r: 8 }, { x: 16, y: -428, r: 8 }], [], [{ x: -26, y: -120, r: 8 }, { x: 28, y: -160, r: 8 }, { x: -28, y: -222, r: 8 }, { x: 30, y: -262, r: 8 }, { x: -26, y: -322, r: 8 }, { x: 28, y: -360, r: 8 }], { minX: -60, maxX: 60, minY: -455, maxY: 22 }, { x: 0.4, y: 0.7 }),
        mkH(4, { x: 0, y: 0 }, { x: 0, y: -390 }, [{ x: 0, y: -20 }, { x: 6, y: -200 }, { x: 0, y: -380 }], 42, 15, [{ x: 18, y: -388, r: 8 }, { x: 6, y: -372, r: 8 }], [{ x: -22, y: -385, r: 13 }, { x: -24, y: -366, r: 12 }], [{ x: -40, y: -150, r: 8 }, { x: 42, y: -180, r: 8 }, { x: 40, y: -300, r: 8 }], { minX: -65, maxX: 65, minY: -418, maxY: 22 }, { x: -0.6, y: 0.5 }),
    ];

    /* ---------- world / camera ---------- */
    let camX = 0, camY = 0, ppy = 8, targetPpy = 8;
    function setZoom() { const mn = Math.min(W, H); const d = toPin(); targetPpy = d < 34 ? mn / 46 : mn / 175; }
    function sx(wx) { return (wx - camX) * ppy + W / 2; }
    function sy(wy) { return (wy - camY) * ppy + H / 2; }
    function wX(px) { return (px - W / 2) / ppy + camX; }
    function wY(py) { return (py - H / 2) / ppy + camY; }

    /* ---------- state ---------- */
    let hole = null, holeIndex = 0, strokes = 0, totalStrokes = 0, scores = [];
    let aimAng = -Math.PI / 2, clubIndex = 0;
    const ball = { x: 0, y: 0, vx: 0, vy: 0, h: 0, phase: 'idle', ft: 0, fT: 1, gvel: { x: 0, y: 0 }, dir: { cos: 0, sin: 0 }, Hmax: 0, rollFactor: 0, lie: 'tee', start: { x: 0, y: 0 } };
    let wind = { ang: 0, spd: 0, ux: 0, uy: 0, driftx: 0, drifty: 0 };
    let prevPos = { x: 0, y: 0 };
    const trail = [];

    /* ---------- swing ---------- */
    const swing = { state: 'idle', needle: 0, power: 0 };
    const BACK_T = 1.05, DOWN_T = 0.55, IDEAL = 0.05;
    function swingPress() {
        if (state !== 'play' || ball.phase !== 'idle') return;
        if (swing.state === 'idle') { swing.state = 'back'; swing.needle = 0; }
        else if (swing.state === 'back') { swing.power = clamp(swing.needle, 0.05, 1); swing.state = 'down'; }
        else if (swing.state === 'down') { executeShot(swing.needle); swing.state = 'idle'; }
    }
    function updateSwing(dt) {
        if (swing.state === 'back') { swing.needle += dt / BACK_T; if (swing.needle >= 1) swing.needle = 1; }
        else if (swing.state === 'down') { swing.needle -= dt / DOWN_T; if (swing.needle <= -0.07) { executeShot(swing.needle); swing.state = 'idle'; } }
    }

    /* ---------- shot ---------- */
    function liePen(l) { return l === 'rough' ? 0.82 : l === 'bunker' ? 0.6 : 1; }
    function executeShot(snapNeedle) {
        const club = CLUBS[clubIndex]; const err = snapNeedle - IDEAL;
        const angOff = clamp(err * 70, -22, 22) * Math.PI / 180 * (club.putter ? 0.35 : 1);
        const distFactor = 1 - Math.min(0.26, Math.abs(err) * 0.72);
        const ang = aimAng + angOff;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        strokes++; prevPos = { x: ball.x, y: ball.y }; trail.length = 0; flashMsg('', 0);
        if (club.putter) {
            const spd = swing.power * 15 * (ball.lie === 'green' ? 1 : 0.7);
            ball.phase = 'roll'; ball.vx = cos * spd; ball.vy = sin * spd; ball.h = 0; SFX.putt();
        } else {
            let D = club.dist * swing.power * liePen(ball.lie) * distFactor; if (D < 6) D = 6;
            const T = 1.05 + club.hmax * 0.04;
            ball.phase = 'flight'; ball.ft = 0; ball.fT = T; ball.start = { x: ball.x, y: ball.y };
            ball.gvel = { x: cos * D / T, y: sin * D / T }; ball.Hmax = club.hmax * (0.6 + 0.4 * swing.power); ball.dir = { cos, sin }; ball.rollFactor = club.roll;
            SFX.swing(club.dist);
        }
    }
    function lieAt(x, y) {
        const b = hole.bounds; if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) return 'oob';
        for (const w of hole.water) { if (Math.hypot(x - w.x, y - w.y) < w.r) return 'water'; }
        for (const s of hole.bunkers) { if (Math.hypot(x - s.x, y - s.y) < s.r) return 'bunker'; }
        if (Math.hypot(x - hole.green.x, y - hole.green.y) < hole.green.r) return 'green';
        if (pip(x, y, hole.fairway)) return 'fairway';
        return 'rough';
    }
    function toPin() { return Math.round(Math.hypot(ball.x - hole.cup.x, ball.y - hole.cup.y)); }

    function updateBall(dt) {
        if (ball.phase === 'flight') {
            ball.ft += dt; const f = clamp(ball.ft / ball.fT, 0, 1);
            ball.x += ball.gvel.x * dt + wind.driftx * dt;
            ball.y += ball.gvel.y * dt + wind.drifty * dt;
            ball.h = 4 * ball.Hmax * f * (1 - f);
            trail.push({ x: ball.x, y: ball.y, h: ball.h });
            if (trail.length > 40) trail.shift();
            if (f >= 1) { land(); }
        } else if (ball.phase === 'roll') {
            const lie = lieAt(ball.x, ball.y);
            if (lie === 'green') { ball.vx += hole.slope.x * dt; ball.vy += hole.slope.y * dt; }
            ball.x += ball.vx * dt; ball.y += ball.vy * dt;
            let spd = Math.hypot(ball.vx, ball.vy);
            const fr = lie === 'green' ? 7 : lie === 'fairway' ? 11 : lie === 'bunker' ? 30 : lie === 'rough' ? 17 : 11;
            spd = Math.max(0, spd - fr * dt);
            if (spd > 0) { const a = Math.atan2(ball.vy, ball.vx); ball.vx = Math.cos(a) * spd; ball.vy = Math.sin(a) * spd; }
            else { ball.vx = ball.vy = 0; }
            trail.push({ x: ball.x, y: ball.y, h: 0 }); if (trail.length > 40) trail.shift();
            if (lie === 'water') { waterPenalty(); return; }
            if (lie === 'oob') { oobPenalty(); return; }
            for (const t of hole.trees) { if (Math.hypot(ball.x - t.x, ball.y - t.y) < t.r + 0.6) { ball.vx *= -0.25; ball.vy *= -0.25; ball.x += ball.vx * dt * 3; ball.y += ball.vy * dt * 3; SFX.tree(); flashMsg('IN THE TREES', 0.9); } }
            const dc = Math.hypot(ball.x - hole.cup.x, ball.y - hole.cup.y);
            if (lie === 'green' && dc < 0.8 && spd < 6) { holed(); return; }
            if (spd <= 0.25) { ball.phase = 'idle'; ball.vx = ball.vy = 0; afterStop(); }
        }
    }
    function land() {
        ball.h = 0; const lie = lieAt(ball.x, ball.y);
        if (lie === 'water') { waterPenalty(); return; }
        if (lie === 'oob') { oobPenalty(); return; }
        SFX.land(lie);
        const tr = lie === 'fairway' ? 1 : lie === 'green' ? 0.7 : lie === 'rough' ? 0.5 : lie === 'bunker' ? 0.15 : 0.6;
        const carrySpeed = Math.hypot(ball.gvel.x, ball.gvel.y);
        const rs = carrySpeed * ball.rollFactor * tr;
        ball.phase = 'roll'; ball.vx = ball.dir.cos * rs; ball.vy = ball.dir.sin * rs;
        if (lie === 'bunker') flashMsg('BUNKER', 0.9);
    }
    function waterPenalty() {
        strokes++; ball.phase = 'idle'; ball.vx = ball.vy = 0;
        const ang = Math.atan2(prevPos.y - ball.y, prevPos.x - ball.x);
        ball.x += Math.cos(ang) * 6; ball.y += Math.sin(ang) * 6;
        let guard = 0; while (lieAt(ball.x, ball.y) === 'water' && guard++ < 40) { ball.x += Math.cos(ang) * 3; ball.y += Math.sin(ang) * 3; }
        SFX.splash(); flashMsg('SPLASH! +1', 1.2); afterStop();
    }
    function oobPenalty() { strokes++; ball.phase = 'idle'; ball.vx = ball.vy = 0; ball.x = prevPos.x; ball.y = prevPos.y; SFX.tree(); flashMsg('OUT OF BOUNDS +1', 1.2); afterStop(); }
    function afterStop() { ball.lie = lieAt(ball.x, ball.y); clubIndex = recommend(toPin(), ball.lie === 'green'); setZoom(); }
    function holed() {
        ball.phase = 'holed'; ball.x = hole.cup.x; ball.y = hole.cup.y; SFX.hole();
        scores[holeIndex] = strokes; totalStrokes += strokes;
        const nm = scoreName(strokes, hole.par); flashMsg(nm.t, 2.0, nm.c);
        setTimeout(nextHole, 1500);
    }
    function scoreName(s, par) {
        const d = s - par;
        if (s === 1) return { t: 'HOLE IN ONE!', c: '#ffe27a' };
        if (d <= -3) return { t: 'ALBATROSS!', c: '#ffe27a' };
        if (d === -2) return { t: 'EAGLE!', c: '#ffe27a' };
        if (d === -1) return { t: 'BIRDIE', c: '#aaffcc' };
        if (d === 0) return { t: 'PAR', c: '#fff' };
        if (d === 1) return { t: 'BOGEY', c: '#ffd6a0' };
        if (d === 2) return { t: 'DOUBLE BOGEY', c: '#ffb0b0' };
        return { t: '+' + d, c: '#ffb0b0' };
    }

    /* ---------- hole load ---------- */
    function loadHole(i) {
        hole = HOLES[i]; holeIndex = i; strokes = 0;
        ball.x = hole.tee.x; ball.y = hole.tee.y; ball.vx = ball.vy = 0; ball.h = 0; ball.phase = 'idle'; ball.lie = 'tee';
        aimAng = Math.atan2(hole.cup.y - ball.y, hole.cup.x - ball.x);
        wind.ang = Math.random() * Math.PI * 2; wind.spd = Math.round(Math.random() * 16 + (i > 4 ? 4 : 0));
        wind.ux = Math.cos(wind.ang); wind.uy = Math.sin(wind.ang);
        wind.driftx = wind.ux * wind.spd * 0.4; wind.drifty = wind.uy * wind.spd * 0.4;
        clubIndex = recommend(toPin(), false);
        camX = ball.x; camY = ball.y; ppy = Math.min(W, H) / 175; setZoom();
        flashMsg('HOLE ' + (i + 1) + '  ·  PAR ' + hole.par, 1.6, '#aaffcc');
    }

    /* ---------- drawing ---------- */
    function drawCourse() {
        ctx.fillStyle = '#16321f'; ctx.fillRect(0, 0, W, H);
        const b = hole.bounds;
        ctx.fillStyle = '#2f7d45';
        ctx.fillRect(sx(b.minX), sy(b.minY), (b.maxX - b.minX) * ppy, (b.maxY - b.minY) * ppy);
        ctx.save(); ctx.beginPath(); ctx.rect(sx(b.minX), sy(b.minY), (b.maxX - b.minX) * ppy, (b.maxY - b.minY) * ppy); ctx.clip();
        ctx.globalAlpha = 0.06; ctx.fillStyle = '#1f5a30';
        for (let y = b.minY; y < b.maxY; y += 10) { ctx.fillRect(sx(b.minX), sy(y), (b.maxX - b.minX) * ppy, 5 * ppy); }
        ctx.globalAlpha = 1; ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.strokeRect(sx(b.minX), sy(b.minY), (b.maxX - b.minX) * ppy, (b.maxY - b.minY) * ppy); ctx.setLineDash([]);
        fillPoly(hole.fairway, '#49b96a');
        stripePoly(hole.fairway, '#3fa85f');
        diskGrad(hole.green.x, hole.green.y, hole.green.r, '#6ee089', '#54c873');
        stripeCircle(hole.green, '#62d47e');
        for (const s of hole.bunkers) { diskGrad(s.x, s.y, s.r, '#efd9a3', '#e3c989'); speckle(s, '#caa86a'); }
        for (const w of hole.water) { diskGrad(w.x, w.y, w.r, '#4aa6e0', '#2f7fc4'); ripple(w); }
        drawSlope();
        ctx.fillStyle = '#dfe'; for (const dx of [-2, 2]) { ctx.beginPath(); ctx.arc(sx(hole.tee.x + dx), sy(hole.tee.y), Math.max(2, 0.6 * ppy), 0, 7); ctx.fill(); }
        for (const t of hole.trees) { drawTree(t); }
        drawFlag();
    }
    function fillPoly(poly, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx(poly[0].x), sy(poly[0].y)); for (let i = 1; i < poly.length; i++)ctx.lineTo(sx(poly[i].x), sy(poly[i].y)); ctx.closePath(); ctx.fill(); }
    function stripePoly(poly, col) {
        ctx.save(); ctx.beginPath(); ctx.moveTo(sx(poly[0].x), sy(poly[0].y)); for (let i = 1; i < poly.length; i++)ctx.lineTo(sx(poly[i].x), sy(poly[i].y)); ctx.closePath(); ctx.clip();
        let minY = 1e9, maxY = -1e9; for (const p of poly) { minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
        ctx.globalAlpha = 0.5; ctx.fillStyle = col; for (let y = minY; y < maxY; y += 14) { ctx.fillRect(0, sy(y), W, 7 * ppy); } ctx.globalAlpha = 1; ctx.restore();
    }
    function diskGrad(x, y, r, c1, c2) {
        const g = ctx.createRadialGradient(sx(x) - r * ppy * 0.3, sy(y) - r * ppy * 0.3, 2, sx(x), sy(y), r * ppy); g.addColorStop(0, c1); g.addColorStop(1, c2);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx(x), sy(y), r * ppy, 0, 7); ctx.fill();
    }
    function stripeCircle(c, col) { ctx.save(); ctx.beginPath(); ctx.arc(sx(c.x), sy(c.y), c.r * ppy, 0, 7); ctx.clip(); ctx.globalAlpha = 0.5; ctx.fillStyle = col; for (let y = c.y - c.r; y < c.y + c.r; y += 8) { ctx.fillRect(0, sy(y), W, 4 * ppy); } ctx.globalAlpha = 1; ctx.restore(); }
    function speckle(s, col) { ctx.save(); ctx.beginPath(); ctx.arc(sx(s.x), sy(s.y), s.r * ppy, 0, 7); ctx.clip(); ctx.fillStyle = col; for (let i = 0; i < s.r * 3; i++) { const a = Math.random() * 6.28, rr = Math.random() * s.r; ctx.fillRect(sx(s.x + Math.cos(a) * rr), sy(s.y + Math.sin(a) * rr), 2, 2); } ctx.restore(); }
    function ripple(w) {
        ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.5; const t = performance.now() / 700;
        for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(sx(w.x), sy(w.y), (w.r * 0.3 * i + (t % 1) * w.r * 0.3) * ppy, 0, 7); ctx.stroke(); }
    }
    function drawSlope() {
        if (Math.hypot(hole.slope.x, hole.slope.y) < 0.2) return; const a = Math.atan2(hole.slope.y, hole.slope.x);
        const cx = sx(hole.green.x), cy = sy(hole.green.y); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); ctx.lineTo(cx + Math.cos(a - 0.4) * 12, cy + Math.sin(a - 0.4) * 12); ctx.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); ctx.lineTo(cx + Math.cos(a + 0.4) * 12, cy + Math.sin(a + 0.4) * 12); ctx.stroke();
    }
    function drawTree(t) {
        const x = sx(t.x), y = sy(t.y), r = t.r * ppy;
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.4, r, r * 0.55, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x - 2, y, 4, r * 0.5);
        for (const [dx, dy, rr, c] of [[0, 0, 1, '#1f6e34'], [-0.4, -0.3, 0.7, '#2a854220'], [0.35, -0.2, 0.6, '#36a050']]) {
            ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, 7); ctx.fill();
        }
    }
    function drawFlag() {
        const x = sx(hole.cup.x), y = sy(hole.cup.y);
        ctx.fillStyle = '#13321d'; ctx.beginPath(); ctx.arc(x, y, Math.max(2, 0.7 * ppy), 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 28); ctx.stroke();
        const wv = Math.sin(performance.now() / 200) * 3 + (wind.ux * 4);
        ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x + 18 + wv, y - 23); ctx.lineTo(x, y - 18); ctx.closePath(); ctx.fill();
    }
    function drawAim() {
        if (ball.phase !== 'idle' || state !== 'play') return;
        const club = CLUBS[clubIndex];
        const len = club.putter ? Math.min(toPin(), 28) : club.dist * 0.9;
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.setLineDash([5, 7]);
        ctx.beginPath(); ctx.moveTo(sx(ball.x), sy(ball.y)); ctx.lineTo(sx(ball.x + Math.cos(aimAng) * len), sy(ball.y + Math.sin(aimAng) * len)); ctx.stroke(); ctx.setLineDash([]);
        if (!club.putter) {
            const D = club.dist * liePen(ball.lie); const lx = ball.x + Math.cos(aimAng) * D + wind.driftx * (1.05 + club.hmax * 0.04);
            const ly = ball.y + Math.sin(aimAng) * D + wind.drifty * (1.05 + club.hmax * 0.04);
            ctx.strokeStyle = 'rgba(255,226,122,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(lx), sy(ly), Math.max(6, 2.5 * ppy), 0, 7); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx(lx) - 8, sy(ly)); ctx.lineTo(sx(lx) + 8, sy(ly)); ctx.moveTo(sx(lx), sy(ly) - 8); ctx.lineTo(sx(lx), sy(ly) + 8); ctx.stroke();
        }
    }
    function drawBall() {
        const bx = sx(ball.x), by = sy(ball.y);
        const lift = ball.h * ppy * 0.5;
        for (let i = 0; i < trail.length; i++) { const a = i / trail.length * 0.35; ctx.fillStyle = 'rgba(255,255,255,' + a + ')'; ctx.beginPath(); ctx.arc(sx(trail[i].x), sy(trail[i].y) - trail[i].h * ppy * 0.5, Math.max(1.5, ppy * 0.3), 0, 7); ctx.fill(); }
        const sr = Math.max(2, ppy * 0.5) * clamp(1 - ball.h / 30, 0.3, 1);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(bx, by, sr, sr * 0.6, 0, 0, 7); ctx.fill();
        const r = Math.max(3, ppy * 0.5);
        const g = ctx.createRadialGradient(bx - r * 0.3, by - lift - r * 0.3, 1, bx, by - lift, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#c9d2cf');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by - lift, r, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(120,140,130,.6)'; ctx.lineWidth = 1; ctx.stroke();
    }
    function drawWindArrow() {
        const cx = W - 58, cy = H - 58, R = 30;
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
        const a = wind.ang; const col = wind.spd > 10 ? '#ff7a7a' : wind.spd > 5 ? '#ffd86b' : '#aaffcc';
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * R * 0.7, cy - Math.sin(a) * R * 0.7); ctx.lineTo(cx + Math.cos(a) * R * 0.7, cy + Math.sin(a) * R * 0.7); ctx.stroke();
        const hx = cx + Math.cos(a) * R * 0.7, hy = cy + Math.sin(a) * R * 0.7;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - Math.cos(a - 0.5) * 9, hy - Math.sin(a - 0.5) * 9); ctx.lineTo(hx - Math.cos(a + 0.5) * 9, hy - Math.sin(a + 0.5) * 9); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = "9px 'Press Start 2P',monospace"; ctx.textAlign = 'center'; ctx.fillText('WIND', cx, cy + R + 20);
    }
    function drawSwingMeter() {
        if (state !== 'play') return;
        const mw = 30, mh = 210, mx = 40, my = H / 2 - mh / 2;
        ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(mx - 5, my - 5, mw + 10, mh + 10, 8); ctx.fill();
        ctx.fillStyle = '#0c2a18'; rr(mx, my, mw, mh, 5); ctx.fill();
        const zc = my + mh - (IDEAL * mh), zh = 0.06 * mh;
        ctx.fillStyle = 'rgba(80,255,140,.4)'; ctx.fillRect(mx, zc - zh / 2, mw, zh);
        ctx.strokeStyle = '#7CFF6B'; ctx.lineWidth = 2; ctx.strokeRect(mx, zc - zh / 2, mw, zh);
        const showVal = swing.state === 'down' ? swing.power : swing.needle;
        if (swing.state !== 'idle' || showVal > 0) {
            const fh = clamp(showVal, 0, 1) * mh; const g = ctx.createLinearGradient(0, my + mh, 0, my);
            g.addColorStop(0, '#7CFF6B'); g.addColorStop(0.6, '#ffd86b'); g.addColorStop(1, '#ff5a5a');
            ctx.fillStyle = g; ctx.fillRect(mx, my + mh - fh, mw, fh);
        }
        if (swing.state === 'down') { const ny = my + mh - clamp(swing.needle, -0.07, 1) * mh; ctx.fillStyle = '#fff'; ctx.fillRect(mx - 4, ny - 2, mw + 8, 4); }
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(mx, my, mw, mh);
        ctx.fillStyle = '#dfe'; ctx.font = "8px 'Press Start 2P',monospace"; ctx.textAlign = 'center';
        ctx.fillText(swing.state === 'back' ? 'POWER' : swing.state === 'down' ? 'SNAP!' : 'SWING', mx + mw / 2, my - 12);
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    function drawMinimap() {
        const mw = Math.min(170, W * 0.22), pad = 14; const b = hole.bounds;
        const bw = b.maxX - b.minX, bh = b.maxY - b.minY; const mh = mw * (bh / bw);
        const mx = W - mw - pad, my = 58;
        ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(mx - 4, my - 4, mw + 8, mh + 8, 8); ctx.fill();
        const MX = x => mx + (x - b.minX) / bw * mw, MY = y => my + (y - b.minY) / bh * mh, MS = v => v / bw * mw;
        ctx.fillStyle = '#2f7d45'; ctx.fillRect(mx, my, mw, mh);
        ctx.fillStyle = '#49b96a'; ctx.beginPath(); ctx.moveTo(MX(hole.fairway[0].x), MY(hole.fairway[0].y)); for (let i = 1; i < hole.fairway.length; i++)ctx.lineTo(MX(hole.fairway[i].x), MY(hole.fairway[i].y)); ctx.closePath(); ctx.fill();
        for (const w of hole.water) { ctx.fillStyle = '#2f7fc4'; ctx.beginPath(); ctx.arc(MX(w.x), MY(w.y), MS(w.r), 0, 7); ctx.fill(); }
        for (const s of hole.bunkers) { ctx.fillStyle = '#e3c989'; ctx.beginPath(); ctx.arc(MX(s.x), MY(s.y), MS(s.r), 0, 7); ctx.fill(); }
        ctx.fillStyle = '#6ee089'; ctx.beginPath(); ctx.arc(MX(hole.green.x), MY(hole.green.y), MS(hole.green.r), 0, 7); ctx.fill();
        for (const t of hole.trees) { ctx.fillStyle = '#1f6e34'; ctx.beginPath(); ctx.arc(MX(t.x), MY(t.y), Math.max(1.5, MS(t.r)), 0, 7); ctx.fill(); }
        ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(MX(hole.cup.x), MY(hole.cup.y), 2.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(MX(ball.x), MY(ball.y), 2.5, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(MX(ball.x), MY(ball.y)); ctx.lineTo(MX(ball.x + Math.cos(aimAng) * 40), MY(ball.y + Math.sin(aimAng) * 40)); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.strokeRect(mx, my, mw, mh);
    }

    /* ---------- render ---------- */
    function render() {
        if (!hole) { ctx.fillStyle = '#0a1f12'; ctx.fillRect(0, 0, W, H); return; }
        drawCourse();
        drawAim();
        drawBall();
        drawMinimap();
        drawWindArrow();
        drawSwingMeter();
    }

    /* ---------- HUD ---------- */
    const $ = id => document.getElementById(id);
    function updateHUD() {
        if (!hole) return;
        if ($('golf-holeN')) $('golf-holeN').textContent = holeIndex + 1;
        if ($('golf-par')) $('golf-par').textContent = hole.par;
        if ($('golf-strokes')) $('golf-strokes').textContent = strokes;
        if ($('golf-topin')) $('golf-topin').textContent = toPin();
        if ($('golf-club')) $('golf-club').textContent = CLUBS[clubIndex].name;
        if ($('golf-lie')) $('golf-lie').textContent = (ball.lie || 'tee').toUpperCase();
        if ($('golf-windtxt')) $('golf-windtxt').textContent = wind.spd + ' mph';
        const played = scores.filter(s => s !== undefined).length;
        const parPlayed = HOLES.slice(0, played).reduce((s, h) => s + h.par, 0);
        const diff = totalStrokes - parPlayed;
        if ($('golf-totalvp')) $('golf-totalvp').textContent = 'TOTAL ' + (diff === 0 ? 'E' : diff > 0 ? '+' + diff : diff);
    }
    let msgT = 0;
    function flashMsg(t, dur, col) { 
        const m = $('golf-msg'); 
        if (!m) return;
        if (!t) { m.classList.remove('show'); msgT = 0; return; } 
        m.textContent = t; m.style.color = col || '#fff'; m.classList.add('show'); msgT = dur; 
    }

    /* ---------- input ---------- */
    const keys = {};
    window.addEventListener('keydown', e => {
        if (!document.getElementById('golf-game').classList.contains('active')) return;
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
        if (!keys[k]) {
            if (k === ' ') swingPress();
            if (k === 'arrowup' || k === '[') changeClub(-1);
            if (k === 'arrowdown' || k === ']') changeClub(1);
            if (k >= '1' && k <= '6') { clubIndex = Math.min(5, parseInt(k) - 1); }
            if (k === 'p' || k === 'escape') togglePause();
        }
        keys[k] = true;
    });
    window.addEventListener('keyup', e => { if (!document.getElementById('golf-game').classList.contains('active')) return; keys[e.key.toLowerCase()] = false; });
    function changeClub(d) { clubIndex = (clubIndex + d + CLUBS.length) % CLUBS.length; }
    cv.addEventListener('mousemove', e => {
        if (!document.getElementById('golf-game').classList.contains('active')) return;
        if (ball.phase !== 'idle') return; const r = cv.getBoundingClientRect();
        const mx = (e.clientX - r.left) * (W / r.width), my = (e.clientY - r.top) * (H / r.height);
        aimAng = Math.atan2(wY(my) - ball.y, wX(mx) - ball.x);
    });
    cv.addEventListener('mousedown', () => { if (!document.getElementById('golf-game').classList.contains('active')) return; swingPress(); });
    function keyAim(dt) { if (ball.phase !== 'idle') return; const s = 1.1 * dt; if (keys['arrowleft'] || keys['a']) aimAng -= s; if (keys['arrowright'] || keys['d']) aimAng += s; }

    /* ---------- gamepad ---------- */
    let padPrev = {};
    function pollPad(dt) {
        if (!document.getElementById('golf-game').classList.contains('active')) return;
        const gps = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null; for (const g of gps) { if (g) { gp = g; break; } }
        if (!gp) return;
        if (ball.phase === 'idle') { const lx = gp.axes[0] || 0, ly = gp.axes[1] || 0; if (Math.hypot(lx, ly) > 0.3) aimAng = Math.atan2(ly, lx); }
        const edge = i => { const p = gp.buttons[i] && gp.buttons[i].pressed; const w = padPrev[i]; padPrev[i] = p; return p && !w; };
        if (edge(0)) swingPress();
        if (edge(4)) changeClub(-1); if (edge(5)) changeClub(1);
        if (edge(9)) togglePause();
    }

    /* ---------- audio ---------- */
    const SFX = (() => {
        let ac = null, noise = null;
        function C() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return ac; }
        function mk() { const c = C(); if (!c) return null; const b = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
        function init() { const c = C(); if (c && !noise) noise = mk(); if (c && c.state === 'suspended') c.resume(); }
        function tone(f, d, t, v) { const c = C(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = t || 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(v || .2, c.currentTime + .006); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); o.start(); o.stop(c.currentTime + d); }
        function nz(d, f, q, v) { const c = C(); if (!c || !noise) return; const s = c.createBufferSource(); s.buffer = noise; const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 3; const g = c.createGain(); s.connect(fl); fl.connect(g); g.connect(c.destination); g.gain.setValueAtTime(v || .3, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); s.start(); s.stop(c.currentTime + d); }
        return {
            init,
            swing(d) { nz(0.08, 1400, 2, 0.18); tone(d > 200 ? 160 : 240, 0.09, 'sine', 0.12); },
            putt() { tone(420, 0.06, 'sine', 0.16); },
            land(l) { if (l === 'water') return; nz(0.06, l === 'bunker' ? 300 : 600, 2, 0.12); },
            splash() { nz(0.3, 500, 1, 0.25); tone(180, 0.2, 'sine', 0.12); },
            tree() { tone(150, 0.1, 'square', 0.16); nz(0.06, 400, 3, 0.12); },
            hole() { tone(660, 0.1, 'sine', 0.2); setTimeout(() => tone(990, 0.18, 'sine', 0.2), 90); }
        };
    })();

    /* ---------- state machine ---------- */
    let state = 'menu';
    function startRound() { 
        scores = []; totalStrokes = 0; holeIndex = 0; loadHole(0); state = 'play'; 
        if ($('golf-start')) $('golf-start').classList.add('hidden'); 
        if ($('golf-pause')) $('golf-pause').classList.remove('hidden'); // Wait, should be add('hidden')
        if ($('golf-pause')) $('golf-pause').classList.add('hidden');
        if ($('golf-card')) $('golf-card').classList.add('hidden'); 
        SFX.init(); 
    }
    function togglePause() { 
        if (state === 'play') { 
            state = 'pause'; 
            if ($('golf-pause')) $('golf-pause').classList.remove('hidden'); 
        } else if (state === 'pause') { 
            state = 'play'; 
            if ($('golf-pause')) $('golf-pause').classList.add('hidden'); 
        } 
    }
    function nextHole() { if (holeIndex >= 8) { showCard(); } else { loadHole(holeIndex + 1); } }
    function showCard() {
        state = 'card';
        let outPar = HOLES.slice(0, 9).reduce((s, h) => s + h.par, 0);
        let rows1 = '<tr><th>HOLE</th>', rows2 = '<tr><th>PAR</th>', rows3 = '<tr><th>YOU</th>';
        for (let i = 0; i < 9; i++) { rows1 += '<td>' + (i + 1) + '</td>'; rows2 += '<td>' + HOLES[i].par + '</td>'; const sc = scores[i] !== undefined ? scores[i] : '-'; const d = scores[i] !== undefined ? scores[i] - HOLES[i].par : 0; const col = d < 0 ? '#aaffcc' : d > 0 ? '#ffb0b0' : '#fff'; rows3 += '<td style="color:' + col + '">' + sc + '</td>'; }
        rows1 += '<th>TOT</th></tr>'; rows2 += '<th>' + outPar + '</th></tr>'; rows3 += '<th class="tot">' + totalStrokes + '</th></tr>';
        const diff = totalStrokes - outPar; const dtxt = diff === 0 ? 'EVEN PAR' : diff > 0 ? '+' + diff : '' + diff;
        if ($('golf-cardBody')) $('golf-cardBody').innerHTML = '<table>' + rows1 + rows2 + rows3 + '</table><div class="keys" style="margin-top:14px">FINAL: <b>' + totalStrokes + '</b> &nbsp; (' + dtxt + ')</div>';
        if ($('golf-card')) $('golf-card').classList.remove('hidden');
    }
    if ($('golf-startBtn')) $('golf-startBtn').onclick = startRound;
    if ($('golf-resumeBtn')) $('golf-resumeBtn').onclick = togglePause;
    if ($('golf-restartBtn')) $('golf-restartBtn').onclick = startRound;
    if ($('golf-againBtn')) $('golf-againBtn').onclick = startRound;

    /* ---------- loop ---------- */
    let last = performance.now();
    function loop(now) {
        const dt = Math.min(0.04, (now - last) / 1000); last = now;
        pollPad(dt);
        if (state === 'play') {
            keyAim(dt); updateSwing(dt); updateBall(dt);
            let tx = ball.x, ty = ball.y;
            if (ball.phase === 'idle') { tx = ball.x + Math.cos(aimAng) * 8; ty = ball.y + Math.sin(aimAng) * 8; }
            camX = lerp(camX, tx, 0.12); camY = lerp(camY, ty, 0.12);
            setZoom(); ppy = lerp(ppy, targetPpy, 0.08);
        }
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) if ($('golf-msg')) $('golf-msg').classList.remove('show'); }
        render(); updateHUD();
        requestAnimationFrame(loop);
    }
    loadHole(0); state = 'menu'; ppy = Math.min(W, H) / 175;
    requestAnimationFrame(loop);
}

})();
