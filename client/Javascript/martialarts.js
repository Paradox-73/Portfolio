"use strict";

(function() {

window.initMartialArts = function() {
    main();
};

function main() {
    const cv = document.getElementById('ma-cv');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, DPR = Math.min(2, window.devicePixelRatio || 1);
    function resize() { W = window.innerWidth; H = window.innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); layout(); }
    window.addEventListener('resize', resize);

    /* ---------- helpers ---------- */
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const lerp = (a, b, t) => a + (b - a) * t;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function darken(hex, f) { const c = h2r(hex); return `rgb(${cl(c.r * f)},${cl(c.g * f)},${cl(c.b * f)})`; }
    function cl(v) { return Math.max(0, Math.min(255, v | 0)); }
    function h2r(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; }

    /* ---------- layout ---------- */
    let floorY = 0, pivot = { x: 0, y: 0 };
    const BAG = { topD: 0, botD: 0, midD: 0, len: 0, bodyLen: 0, r: 30 };
    function layout() {
        floorY = H * 0.82; pivot = { x: W * 0.62, y: H * 0.05 };
        const bottom = floorY - 30;
        BAG.len = bottom - pivot.y;
        BAG.bodyLen = Math.min(220, BAG.len * 0.5);
        BAG.botD = BAG.len; BAG.topD = BAG.len - BAG.bodyLen; BAG.midD = (BAG.topD + BAG.botD) / 2; BAG.r = 30;
    }
    layout(); resize();

    /* ---------- fighter rig constants (local units, y-up) ---------- */
    const SC = 1.18;
    const RIG = { pelvisH: 54, torso: 46, neckHead: 15, headR: 13, uArm: 24, fArm: 22, thigh: 31, shin: 31 };
    const STANCE = {
        lean: 11, headTilt: 0, crouch: 0,
        handR: { x: 20, y: 40 }, handL: { x: 6, y: 42 }, footR: { x: 24, y: -54 }, footL: { x: -22, y: -54 }
    };

    /* ---------- action table ---------- */
    const ACT = {
        jab: { dur: .22, type: 'punch', limb: 'handR', reach: 74, h: 'mid', dmg: 5, knock: 55, kf: [{ t: 0, p: { handR: { x: 14, y: 42 } } }, { t: .35, p: { handR: { x: 78, y: 41 }, lean: 16 } }, { t: .6, p: { handR: { x: 78, y: 41 } } }, { t: 1, p: { handR: { x: 20, y: 40 }, lean: 11 } }], hit: [.32, .55] },
        cross: { dur: .34, type: 'punch', limb: 'handL', reach: 84, h: 'mid', dmg: 11, knock: 120, kf: [{ t: 0, p: { handL: { x: 2, y: 44 }, lean: 6 } }, { t: .45, p: { handL: { x: 90, y: 42 }, lean: 21, handR: { x: 30, y: 46 } } }, { t: .66, p: { handL: { x: 90, y: 42 } } }, { t: 1, p: { handL: { x: 6, y: 42 }, lean: 11 } }], hit: [.40, .62] },
        hook: { dur: .36, type: 'punch', limb: 'handR', reach: 70, h: 'mid', dmg: 13, knock: 150, kf: [{ t: 0, p: { handR: { x: 34, y: 30 } } }, { t: .5, p: { handR: { x: 74, y: 50 }, lean: 18 } }, { t: .68, p: { handR: { x: 74, y: 50 } } }, { t: 1, p: { handR: { x: 20, y: 40 }, lean: 11 } }], hit: [.44, .64] },
        uppercut: { dur: .40, type: 'punch', limb: 'handR', reach: 58, h: 'low', dmg: 15, knock: 80, launch: 1, kf: [{ t: 0, p: { handR: { x: 18, y: 8 }, crouch: .5 } }, { t: .46, p: { handR: { x: 46, y: 72 }, crouch: .1, lean: 5 } }, { t: .66, p: { handR: { x: 46, y: 72 } } }, { t: 1, p: { handR: { x: 20, y: 40 }, crouch: 0 } }], hit: [.32, .58] },
        lowkick: { dur: .26, type: 'kick', limb: 'footR', reach: 80, h: 'low', dmg: 7, knock: 90, kf: [{ t: 0, p: { footR: { x: 24, y: -50 } } }, { t: .42, p: { footR: { x: 84, y: -38 }, lean: -6 } }, { t: .62, p: { footR: { x: 84, y: -38 } } }, { t: 1, p: { footR: { x: 24, y: -54 } } }], hit: [.34, .58] },
        highkick: { dur: .34, type: 'kick', limb: 'footR', reach: 82, h: 'high', dmg: 12, knock: 140, kf: [{ t: 0, p: { footR: { x: 18, y: -46 } } }, { t: .46, p: { footR: { x: 90, y: 30 }, lean: -10 } }, { t: .66, p: { footR: { x: 90, y: 30 } } }, { t: 1, p: { footR: { x: 24, y: -54 }, lean: 11 } }], hit: [.36, .62] },
        roundhouse: { dur: .44, type: 'kick', limb: 'footR', reach: 88, h: 'high', dmg: 17, knock: 185, kf: [{ t: 0, p: { footR: { x: 10, y: -40 }, lean: 0 } }, { t: .3, p: { footR: { x: 60, y: -8 } } }, { t: .56, p: { footR: { x: 96, y: 34 }, lean: -15 } }, { t: .72, p: { footR: { x: 96, y: 30 } } }, { t: 1, p: { footR: { x: 24, y: -54 }, lean: 11 } }], hit: [.42, .66] },
        sweep: { dur: .36, type: 'kick', limb: 'footR', reach: 90, h: 'low', dmg: 9, knock: 165, kf: [{ t: 0, p: { footR: { x: 20, y: -52 }, crouch: .6 } }, { t: .5, p: { footR: { x: 96, y: -50 }, crouch: .7, lean: -4 } }, { t: .7, p: { footR: { x: 96, y: -50 } } }, { t: 1, p: { footR: { x: 24, y: -54 }, crouch: 0 } }], hit: [.36, .62] },
        flyingkick: { dur: .42, type: 'kick', limb: 'footR', reach: 74, h: 'high', dmg: 16, knock: 200, air: 1, kf: [{ t: 0, p: { footR: { x: 58, y: -20 }, lean: 24 } }, { t: .5, p: { footR: { x: 92, y: -30 }, lean: 28 } }, { t: 1, p: { footR: { x: 30, y: -50 }, lean: 12 } }], hit: [.1, .7] },
        fireball: { dur: .5, type: 'special', limb: 'handR', reach: 0, proj: 1, kf: [{ t: 0, p: { handR: { x: 6, y: 24 }, handL: { x: 0, y: 28 }, crouch: .2 } }, { t: .4, p: { handR: { x: 72, y: 30 }, handL: { x: 66, y: 30 }, lean: 16 } }, { t: 1, p: { handR: { x: 20, y: 40 }, handL: { x: 6, y: 42 }, crouch: 0 } }], hit: [-1, -1], projAt: .4 },
        dragon: { dur: .5, type: 'special', limb: 'handR', reach: 72, h: 'mid', dmg: 22, knock: 120, launch: 1, dash: 140, kf: [{ t: 0, p: { handR: { x: 20, y: 10 }, crouch: .3 } }, { t: .42, p: { handR: { x: 52, y: 80 }, lean: 8, crouch: 0 } }, { t: .62, p: { handR: { x: 52, y: 80 } } }, { t: 1, p: { handR: { x: 20, y: 40 } } }], hit: [.2, .56] },
        spinkick: { dur: .5, type: 'special', limb: 'footR', reach: 90, h: 'high', dmg: 19, knock: 205, air: 1, dash: 120, kf: [{ t: 0, p: { footR: { x: 10, y: -30 }, lean: 0 } }, { t: .35, p: { footR: { x: 70, y: 10 }, lean: -8 } }, { t: .6, p: { footR: { x: 98, y: 36 }, lean: -16 } }, { t: 1, p: { footR: { x: 26, y: -50 }, lean: 11 } }], hit: [.25, .62] },
    };

    /* ---------- per-field interpolation ---------- */
    function fieldAt(kf, name, t, isPt) {
        const fr = []; for (const k of kf) { if (k.p[name] !== undefined) fr.push({ t: k.t, v: k.p[name] }); }
        if (fr.length === 0) return null;
        if (t <= fr[0].t) return fr[0].v;
        if (t >= fr[fr.length - 1].t) return fr[fr.length - 1].v;
        for (let i = 0; i < fr.length - 1; i++) {
            if (t >= fr[i].t && t <= fr[i + 1].t) {
                const u = (t - fr[i].t) / ((fr[i + 1].t - fr[i].t) || 1);
                if (isPt) return { x: lerp(fr[i].v.x, fr[i + 1].v.x, u), y: lerp(fr[i].v.y, fr[i + 1].v.y, u) };
                return lerp(fr[i].v, fr[i + 1].v, u);
            }
        }
        return fr[fr.length - 1].v;
    }
    function poseAt(name, t) {
        const a = ACT[name]; const pose = {
            lean: STANCE.lean, headTilt: STANCE.headTilt, crouch: STANCE.crouch,
            handR: { ...STANCE.handR }, handL: { ...STANCE.handL }, footR: { ...STANCE.footR }, footL: { ...STANCE.footL }
        };
        if (!a) return pose;
        for (const f of ['lean', 'headTilt', 'crouch']) { const v = fieldAt(a.kf, f, t, false); if (v !== null) pose[f] = v; }
        for (const f of ['handR', 'handL', 'footR', 'footL']) { const v = fieldAt(a.kf, f, t, true); if (v !== null) pose[f] = v; }
        return pose;
    }

    /* ---------- IK ---------- */
    function ik(root, target, l1, l2, bend) {
        let dx = target.x - root.x, dy = target.y - root.y; let d = Math.hypot(dx, dy);
        const maxd = l1 + l2 - 0.5, mind = Math.abs(l1 - l2) + 0.5; d = clamp(d, mind, maxd);
        const ang = Math.atan2(dy, dx);
        let c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d); c = clamp(c, -1, 1); const A = Math.acos(c);
        const ja = ang + bend * A;
        return { x: root.x + Math.cos(ja) * l1, y: root.y + Math.sin(ja) * l1 };
    }

    /* ---------- player ---------- */
    const player = {
        x: 0, y: 0, vx: 0, air: 0, vair: 0, grounded: true, faceDir: 1,
        action: null, at: 0, hitDone: false, projDone: false,
        hp: 100, blocking: false, crouchHeld: false, hitstun: 0, knockdown: 0, trail: []
    };
    function resetPlayer() { player.x = W * 0.34; player.air = 0; player.vair = 0; player.vx = 0; player.grounded = true; player.action = null; player.at = 0; player.hp = 100; player.hitstun = 0; player.knockdown = 0; player.trail.length = 0; }

    /* ---------- bag ---------- */
    const bag = { ang: 0, vel: 0, hp: 120, maxHp: 120, lift: 0, liftV: 0, flash: 0, broken: 0, respawn: 0 };
    let level = 1;
    function resetBag(lv) { level = lv; bag.maxHp = 80 + lv * 40; bag.hp = bag.maxHp; bag.ang = 0; bag.vel = 0; bag.lift = 0; bag.liftV = 0; bag.flash = 0; bag.broken = 0; bag.respawn = 0; }
    function bagCenter() { const d = { x: Math.sin(bag.ang), y: Math.cos(bag.ang) }; return { x: pivot.x + d.x * BAG.midD, y: pivot.y + d.y * BAG.midD + bag.lift }; }

    /* ---------- combat state ---------- */
    let combo = 0, comboTimer = 0, maxCombo = 0, score = 0, superC = 0, bagsKO = 0;
    let timeLeft = 99, shake = 0;
    const parts = [], floats = [], projectiles = [], impacts = [];
    let superActive = 0, superHitTimer = 0, superHits = 0;

    /* ---------- input ---------- */
    const keys = {}; const dirHist = [];
    function pushDir(d) { const now = performance.now(); if (dirHist.length && dirHist[dirHist.length - 1].d === d && now - dirHist[dirHist.length - 1].t < 60) return; dirHist.push({ d, t: now }); if (dirHist.length > 10) dirHist.shift(); }
    function matchSeq(seq, win) {
        const now = performance.now(); let idx = dirHist.length - 1, need = seq.length - 1;
        for (let i = dirHist.length - 1; i >= 0 && need >= 0; i--) { if (dirHist[i].d === seq[need]) { need--; if (need < 0) { return (now - dirHist[i].t) < win; } } }
        return false;
    }
    window.addEventListener('keydown', e => {
        if (!document.getElementById('martialarts-game').classList.contains('active')) return;
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
        if (!keys[k]) {
            if (k === 'a' || k === 'arrowleft') pushDir('L');
            if (k === 'd' || k === 'arrowright') pushDir('R');
            if (k === 'w' || k === 'arrowup') pushDir('U');
            if (k === 's' || k === 'arrowdown') pushDir('D');
            if (k === 'j') attack('LP'); if (k === 'k') attack('HP'); if (k === 'l') attack('LK'); if (k === 'i') attack('HK');
            if (k === 'enter') trySuper();
            if (k === 'p' || k === 'escape') togglePause();
        }
        keys[k] = true;
    });
    window.addEventListener('keyup', e => { if (!document.getElementById('martialarts-game').classList.contains('active')) return; keys[e.key.toLowerCase()] = false; });

    function dirToward() { return player.faceDir > 0 ? 'R' : 'L'; }
    function dirAway() { return player.faceDir > 0 ? 'L' : 'R'; }

    function attack(btn) {
        if (state !== 'play') return;
        if (player.knockdown > 0 || player.hitstun > 0 || superActive > 0) return;
        if (player.action) { const a = ACT[player.action]; if (player.at < a.dur * 0.62) return; }
        const isPunch = (btn === 'LP' || btn === 'HP'), isKick = (btn === 'LK' || btn === 'HK');
        const fwd = dirToward();
        if (isPunch && matchSeq(['D', fwd], 360)) { start('fireball'); return; }
        if (isPunch && matchSeq([fwd, fwd], 340)) { start('dragon'); return; }
        if (isKick && matchSeq([fwd, fwd], 340)) { start('spinkick'); return; }
        if (!player.grounded && isKick) { start('flyingkick'); return; }
        const crouch = player.crouchHeld;
        const fwdHeld = (keys['d'] || keys['arrowright']) && player.faceDir > 0 || (keys['a'] || keys['arrowleft']) && player.faceDir < 0;
        if (crouch) {
            if (btn === 'LK') { start('sweep'); return; }
            if (btn === 'HP') { start('uppercut'); return; }
            if (btn === 'LP') { start('jab'); return; }
            if (btn === 'HK') { start('sweep'); return; }
        }
        if (btn === 'LP') start('jab');
        else if (btn === 'HP') start(fwdHeld ? 'hook' : 'cross');
        else if (btn === 'LK') start('lowkick');
        else if (btn === 'HK') start(fwdHeld ? 'roundhouse' : 'highkick');
    }
    function start(name) {
        player.action = name; player.at = 0; player.hitDone = false; player.projDone = false; const a = ACT[name];
        if (a.air) { if (player.grounded) { player.vair = 420; player.grounded = false; } }
        SFX.whoosh(a.type);
    }
    function trySuper() { if (state !== 'play' || superC < 100 || superActive > 0) return; superActive = 1.5; superHitTimer = 0; superHits = 0; superC = 0; player.action = null; SFX.superStart(); shake = 14; }

    /* ---------- update ---------- */
    function update(dt) {
        if (state !== 'play') return;
        timeLeft -= dt; if (timeLeft <= 0) { timeLeft = 0; endGame('TIME!'); }
        const bc = bagCenter();
        if (!player.action && superActive <= 0 && player.hitstun <= 0 && player.knockdown <= 0) { player.faceDir = bc.x >= player.x ? 1 : -1; }
        player.crouchHeld = (keys['s'] || keys['arrowdown']) && player.grounded && !player.action;

        let move = 0;
        if (player.knockdown <= 0 && player.hitstun <= 0 && superActive <= 0) {
            if (!player.action || (ACT[player.action] && ACT[player.action].air)) {
                if (keys['a'] || keys['arrowleft']) move -= 1;
                if (keys['d'] || keys['arrowright']) move += 1;
            }
            if ((keys['w'] || keys['arrowup']) && player.grounded && !player.action) { player.vair = 560; player.grounded = false; SFX.jump(); }
        }
        const speed = player.crouchHeld ? 70 : 230;
        player.vx = move * speed;
        player.x += player.vx * dt;
        player.x = clamp(player.x, 50, W - 50);

        if (!player.grounded) { player.vair -= 1500 * dt; player.air += player.vair * dt; if (player.air <= 0) { player.air = 0; player.vair = 0; player.grounded = true; } }
        if (player.action) { const a = ACT[player.action]; if (a.dash && player.at < a.dur * 0.5) { player.x += player.faceDir * a.dash * dt; player.x = clamp(player.x, 50, W - 50); } }
        if (player.hitstun > 0) player.hitstun -= dt;
        if (player.knockdown > 0) { player.knockdown -= dt; if (player.knockdown <= 0) { player.hp = Math.max(player.hp, 55); } }
        if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) { if (combo > 1) addFloat((combo) + ' HITS', '#ffcf3f', player.x, floorY - 200, 1.0, 18); combo = 0; } }
        if (shake > 0) shake = Math.max(0, shake - dt * 60);
        superC = clamp(superC, 0, 100);

        if (player.action) {
            const a = ACT[player.action]; player.at += dt;
            const ph = player.at / a.dur;
            if (a.hit && a.hit[0] >= 0 && !player.hitDone && ph >= a.hit[0] && ph <= a.hit[1]) { tryHit(a); }
            if (a.proj && !player.projDone && ph >= a.projAt) { spawnFireball(); player.projDone = true; }
            if (a.hit && a.hit[0] >= 0 && ph >= a.hit[0] - 0.05 && ph <= a.hit[1] + 0.1) { const tip = limbTip(a.limb); player.trail.push({ x: tip.x, y: tip.y, t: 0.18 }); }
            if (player.at >= a.dur) { player.action = null; }
        }
        for (let i = player.trail.length - 1; i >= 0; i--) { player.trail[i].t -= dt; if (player.trail[i].t <= 0) player.trail.splice(i, 1); }

        if (superActive > 0) {
            superActive -= dt; superHitTimer -= dt;
            if (superHitTimer <= 0 && superHits < 8) {
                superHitTimer = 0.14; superHits++;
                const big = superHits >= 8; applyBagHit(big ? 60 : 14, big ? 260 : 120, true, superHits % 2 === 0 ? 1 : 0);
            }
            if (superActive <= 0) { player.action = null; }
        }

        const aAcc = -(2400 / BAG.len) * Math.sin(bag.ang) - 1.0 * bag.vel;
        bag.vel += aAcc * dt; bag.ang += bag.vel * dt;
        bag.liftV += (-bag.lift) * 60 * dt - bag.liftV * 5 * dt; bag.lift += bag.liftV * dt;
        if (bag.flash > 0) bag.flash -= dt * 4;

        if (bag.broken <= 0 && player.knockdown <= 0) {
            const bc2 = bagCenter(); const dx = bc2.x - player.x;
            const swingSpeed = Math.abs(bag.vel) * BAG.midD;
            if (Math.abs(dx) < 40 && swingSpeed > 140) {
                if (player.air < 60) {
                    if (player.blocking) { addFloat('BLOCK', '#7ad7ff', player.x, floorY - 150, 0.7, 16); SFX.block(); player.vx = 0; bag.vel *= -0.4; }
                    else {
                        const dmg = 6 + level; player.hp -= dmg; player.hitstun = 0.35; player.x -= Math.sign(dx) * 26; player.x = clamp(player.x, 50, W - 50);
                        combo = 0; comboTimer = 0; shake = 8; SFX.hurt(); addFloat('-' + dmg, '#ff6b6b', player.x, floorY - 150, 0.8, 16); bag.vel *= 0.5;
                        if (player.hp <= 0) { player.hp = 0; player.knockdown = 1.6; addFloat('DOWN!', '#ff2d55', player.x, floorY - 170, 1.2, 30); SFX.ko(); shake = 16; }
                    }
                }
            }
        }
        player.blocking = (keys[' '] || keys['shift']) && player.grounded && player.knockdown <= 0 && !player.action && superActive <= 0;

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i]; p.x += p.vx * dt; p.life -= dt; p.spin += dt * 12;
            const bc3 = bagCenter(); if (bag.broken <= 0 && Math.abs(p.x - bc3.x) < BAG.r + 14 && Math.sign(p.vx) === Math.sign(bc3.x - p.sx)) { applyBagHit(p.dmg, p.knock, false, 1); spawnImpact(bc3.x - Math.sign(p.vx) * BAG.r, bc3.y, '#ffd86b'); projectiles.splice(i, 1); continue; }
            if (p.life <= 0 || p.x < -40 || p.x > W + 40) projectiles.splice(i, 1);
        }

        if (bag.broken > 0) { bag.respawn -= dt; if (bag.respawn <= 0) { resetBag(level + 1); bagsKO++; announce('ROUND ' + (level)); } }

        for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
        for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.life -= dt; f.y -= f.rise * dt; if (f.life <= 0) floats.splice(i, 1); }
        for (let i = impacts.length - 1; i >= 0; i--) { impacts[i].t -= dt * 5; if (impacts[i].t <= 0) impacts.splice(i, 1); }
    }

    function tryHit(a) {
        if (bag.broken > 0) { player.hitDone = true; return; }
        const bc = bagCenter(); const dx = bc.x - player.x;
        if (Math.sign(dx) === player.faceDir && Math.abs(dx) <= a.reach * SC * 0.7 + BAG.r) {
            player.hitDone = true;
            applyBagHit(a.dmg, a.knock, a.type === 'kick', a.launch ? 1 : 0);
            spawnImpact(bc.x - player.faceDir * BAG.r, bc.y - (a.h === 'high' ? 40 : a.h === 'low' ? -30 : 0), a.type === 'kick' ? '#ffd86b' : '#fff');
        }
    }
    function applyBagHit(dmg, knock, kick, launch) {
        if (bag.broken > 0) return;
        if (comboTimer > 0) combo++; else combo = 1; comboTimer = 1.2; if (combo > maxCombo) maxCombo = combo;
        const mult = 1 + (combo - 1) * 0.14;
        const real = dmg * mult;
        bag.hp -= real; bag.flash = 1; bag.vel += player.faceDir * knock * 0.0016; if (launch) { bag.liftV -= launch * 120; }
        superC += 4 + (kick ? 1 : 0); score += Math.round(real * (1 + combo * 0.05));
        shake = Math.max(shake, kick ? 7 : 5);
        addFloat('-' + Math.round(real), combo >= 4 ? '#ffcf3f' : '#fff', bagCenter().x, bagCenter().y - 40, 1.0, 30);
        SFX.impact(kick, combo);
        if (bag.hp <= 0) { bag.hp = 0; bag.broken = 1; bag.respawn = 1.8; score += 200 + level * 50; burstBag(); addFloat('BAG DOWN! +' + (200 + level * 50), '#ff2d55', bagCenter().x, bagCenter().y - 60, 1.4, 26); SFX.bagbreak(); shake = 16; }
    }
    function spawnFireball() { const tip = limbTip('handR'); projectiles.push({ x: tip.x, y: tip.y, sx: tip.x, vx: player.faceDir * 560, dmg: 18, knock: 130, life: 2.2, spin: 0, r: 16 }); SFX.fire(); }
    function spawnImpact(x, y, color) { impacts.push({ x, y, t: 1, color }); for (let i = 0; i < 10; i++) { const a = Math.random() * 6.28, s = 80 + Math.random() * 180; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: .4 + Math.random() * .3, color, sz: 2 + Math.random() * 3 }); } }
    function burstBag() { const c = bagCenter(); for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, s = 100 + Math.random() * 260; parts.push({ x: c.x, y: c.y - Math.random() * BAG.bodyLen * 0.6, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, life: .6 + Math.random() * .6, color: Math.random() < .5 ? '#c0392b' : '#ffd86b', sz: 3 + Math.random() * 4 }); } }
    function addFloat(t, c, x, y, life, rise) { floats.push({ t, c, x, y, life: life || 1, maxlife: life || 1, rise: rise || 24 }); }
    let announceText = '', announceT = 0;
    function announce(t) { announceText = t; announceT = 1.4; }

    /* ---------- rig computation ---------- */
    let RIGW = {};
    function computeRig() {
        const pose = player.knockdown > 0 ? knockdownPose() : player.hitstun > 0 ? hitPose() : superActive > 0 ? superPose() : player.action ? poseAt(player.action, player.at / ACT[player.action].dur) : walkPose();
        const lean = pose.lean * Math.PI / 180;
        const crouchDrop = pose.crouch * 22;
        const pelvisY = floorY - RIG.pelvisH * SC - player.air + crouchDrop * SC;
        const px = player.x, fd = player.faceDir;
        const T = (p) => ({ x: px + fd * p.x * SC, y: pelvisY - p.y * SC });
        const neck = { x: Math.sin(lean) * RIG.torso, y: Math.cos(lean) * RIG.torso };
        const ux = Math.sin(lean), uy = Math.cos(lean);
        const head = { x: neck.x + ux * (RIG.neckHead), y: neck.y + uy * (RIG.neckHead) };
        const headC = { x: head.x + ux * RIG.headR, y: head.y + uy * RIG.headR };
        const shR = { x: neck.x + 5, y: neck.y - 3 }, shL = { x: neck.x - 7, y: neck.y - 3 };
        const hipR = { x: 6, y: 2 }, hipL = { x: -6, y: 2 };
        const elbR = ik(shR, pose.handR, RIG.uArm, RIG.fArm, -1);
        const elbL = ik(shL, pose.handL, RIG.uArm, RIG.fArm, -1);
        const knR = ik(hipR, pose.footR, RIG.thigh, RIG.shin, 1);
        const knL = ik(hipL, pose.footL, RIG.thigh, RIG.shin, 1);
        RIGW = {
            pelvis: T({ x: 0, y: 0 }), neck: T(neck), head: T(head), headC: T(headC), headR: RIG.headR * SC,
            shR: T(shR), shL: T(shL), hipR: T(hipR), hipL: T(hipL),
            handR: T(pose.handR), handL: T(pose.handL), footR: T(pose.footR), footL: T(pose.footL),
            elbR: T(elbR), elbL: T(elbL), knR: T(knR), knL: T(knL), lean, ux: fd * ux, uy
        };
    }
    function walkPose() {
        const pose = poseAt(null, 0);
        const t = performance.now() / 1000;
        if (Math.abs(player.vx) > 10) { const s = Math.sin(t * 12); pose.footR = { x: 24 + s * 10, y: -54 + Math.max(0, s) * 8 }; pose.footL = { x: -22 - s * 10, y: -54 + Math.max(0, -s) * 8 }; pose.handR = { x: 20 + s * 4, y: 40 }; pose.handL = { x: 6 - s * 4, y: 42 }; }
        else { const b = Math.sin(t * 2.5) * 1.5; pose.handR = { x: 20, y: 40 + b }; pose.handL = { x: 6, y: 42 + b }; }
        if (player.crouchHeld) { pose.crouch = 0.7; pose.handR = { x: 18, y: 30 }; pose.handL = { x: 6, y: 32 }; }
        if (player.blocking) { pose.crouch = 0.18; pose.handR = { x: 14, y: 44 }; pose.handL = { x: 8, y: 46 }; pose.lean = 4; }
        if (!player.grounded) { pose.footR = { x: 18, y: -30 }; pose.footL = { x: -16, y: -28 }; pose.lean = 6; }
        return pose;
    }
    function hitPose() { const pose = poseAt(null, 0); pose.lean = -18; pose.headTilt = -10; pose.handR = { x: 10, y: 30 }; pose.handL = { x: -2, y: 32 }; pose.footR = { x: 18, y: -54 }; pose.footL = { x: -26, y: -54 }; return pose; }
    function knockdownPose() { const pose = poseAt(null, 0); const k = clamp(1 - player.knockdown / 1.6, 0, 1); pose.lean = -60 * Math.min(1, k * 2); pose.crouch = 0.9; pose.handR = { x: 30, y: 6 }; pose.handL = { x: -10, y: 8 }; pose.footR = { x: 40, y: -54 }; pose.footL = { x: -30, y: -50 }; return pose; }
    function superPose() { const t = 1 - superActive / 1.5; const s = Math.sin(t * 40); const pose = poseAt(null, 0); pose.lean = 14; if (s > 0) { pose.handR = { x: 84, y: 42 }; pose.handL = { x: 20, y: 44 }; } else { pose.handL = { x: 84, y: 40 }; pose.handR = { x: 20, y: 46 }; } pose.footR = { x: 24 + s * 6, y: -54 }; return pose; }
    function limbTip(name) { computeRig(); return RIGW[name] || RIGW.handR; }

    /* ---------- drawing fighter ---------- */
    const COL = { skin: '#e3a368', skinD: '#9c5f2e', pants: '#16161f', pantsD: '#05050a', belt: '#d11f2a', band: '#d11f2a', accent: '#ffcf3f' };
    function blob(a, b, r1, r2, col) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(a.x, a.y, r1, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(b.x, b.y, r2, 0, 7); ctx.fill();
        const ang = Math.atan2(b.y - a.y, b.x - a.x), px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(a.x + px * r1, a.y + py * r1); ctx.lineTo(a.x - px * r1, a.y - py * r1); ctx.lineTo(b.x - px * r2, b.y - py * r2); ctx.lineTo(b.x + px * r2, b.y + py * r2); ctx.closePath(); ctx.fill();
    }
    function limb(a, b, r1, r2, col, colD) { blob(a, b, r1 + 1.8, r2 + 1.8, colD); blob(a, b, r1, r2, col); }
    function drawArm(s, e, h, col, colD, band) { limb(s, e, 7, 5.5, col, colD); limb(e, h, 5.5, 4.5, col, colD); ctx.fillStyle = band; ctx.beginPath(); ctx.arc(h.x, h.y, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = colD; ctx.beginPath(); ctx.arc(h.x, h.y, 4.2, 0, 7); ctx.fill(); }
    function drawLeg(hip, kn, ft, col, colD) { limb(hip, kn, 9, 7, col, colD); limb(kn, ft, 7, 5, col, colD); ctx.fillStyle = COL.skin; ctx.save(); ctx.translate(ft.x, ft.y); ctx.beginPath(); ctx.ellipse(player.faceDir * 5, 2, 9, 5, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.fillStyle = COL.skinD; ctx.beginPath(); ctx.arc(ft.x, ft.y, 5, 0, 7); ctx.fill(); }
    function drawTorso(R) {
        const fd = player.faceDir; const hipL = R.hipL, hipR = R.hipR, shL = R.shL, shR = R.shR;
        ctx.fillStyle = COL.skinD; ctx.beginPath(); ctx.moveTo(hipL.x - 2, hipL.y); ctx.lineTo(hipR.x + 2, hipR.y); ctx.lineTo(shR.x + 11 * SC, shR.y); ctx.lineTo(shL.x - 11 * SC, shL.y); ctx.closePath(); ctx.fill();
        const g = ctx.createLinearGradient(R.pelvis.x, R.pelvis.y, R.neck.x, R.neck.y); g.addColorStop(0, darken(COL.skin, 0.9)); g.addColorStop(1, COL.skin); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hipL.x, hipL.y); ctx.lineTo(hipR.x, hipR.y); ctx.lineTo(shR.x + 9 * SC, shR.y + 2); ctx.lineTo(shL.x - 9 * SC, shL.y + 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = darken(COL.skin, 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(R.neck.x, R.neck.y + 2); ctx.lineTo((R.pelvis.x + R.neck.x) / 2, (R.pelvis.y + R.neck.y) / 2); ctx.stroke();
        ctx.fillStyle = COL.belt; ctx.save(); ctx.translate(R.pelvis.x, R.pelvis.y - 1); ctx.rotate(R.lean * 0.4 * fd); ctx.fillRect(-12 * SC, -4, 24 * SC, 9); ctx.restore();
        ctx.fillStyle = darken(COL.belt, 0.7); ctx.beginPath(); ctx.arc(R.pelvis.x, R.pelvis.y, 4, 0, 7); ctx.fill();
    }
    function drawHead(R) {
        const fd = player.faceDir; ctx.fillStyle = COL.skinD; ctx.beginPath(); ctx.arc(R.headC.x, R.headC.y, R.headR + 1.6, 0, 7); ctx.fill();
        const g = ctx.createRadialGradient(R.headC.x - fd * 4, R.headC.y - 4, 2, R.headC.x, R.headC.y, R.headR); g.addColorStop(0, '#f0b87a'); g.addColorStop(1, COL.skin); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(R.headC.x, R.headC.y, R.headR, 0, 7); ctx.fill();
        ctx.strokeStyle = COL.band; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(R.headC.x, R.headC.y, R.headR - 0.5, -2.5 + (fd < 0 ? Math.PI : 0), -0.6 + (fd < 0 ? Math.PI : 0)); ctx.stroke();
        ctx.fillStyle = COL.band; const bx = R.headC.x - fd * (R.headR - 2), by = R.headC.y - 4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - fd * 10, by + 4); ctx.lineTo(bx - fd * 8, by + 12); ctx.lineTo(bx, by + 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(R.headC.x + fd * 5, R.headC.y + 1, 2, 0, 7); ctx.fill(); ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(R.headC.x + fd * 2, R.headC.y - 3); ctx.lineTo(R.headC.x + fd * 9, R.headC.y - 1); ctx.stroke();
    }
    function drawPlayer() {
        computeRig(); const R = RIGW;
        ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(player.x, floorY + 4, 38, 9, 0, 0, 7); ctx.fill();
        for (const tr of player.trail) { ctx.globalAlpha = tr.t / 0.18 * 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(tr.x, tr.y, 12, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1;
        drawLeg(R.hipL, R.knL, R.footL, darken(COL.pants, 0.8), COL.pantsD); drawArm(R.shL, R.elbL, R.handL, darken(COL.skin, 0.82), COL.skinD, darken(COL.band, 0.8));
        drawTorso(R); drawHead(R);
        drawLeg(R.hipR, R.knR, R.footR, COL.pants, COL.pantsD); drawArm(R.shR, R.elbR, R.handR, COL.skin, COL.skinD, COL.band);
    }

    /* ---------- bag ---------- */
    function drawBag() {
        if (bag.broken > 0 && bag.respawn < 1.0) { return; }
        const dir = { x: Math.sin(bag.ang), y: Math.cos(bag.ang) }; const perp = { x: -dir.y, y: dir.x }; const w = BAG.r;
        const top = { x: pivot.x + dir.x * BAG.topD, y: pivot.y + dir.y * BAG.topD + bag.lift };
        const bot = { x: pivot.x + dir.x * BAG.botD, y: pivot.y + dir.y * BAG.botD + bag.lift };
        ctx.fillStyle = '#3a3f47'; ctx.fillRect(pivot.x - 24, pivot.y - 12, 48, 12);
        const chainLen = BAG.topD, links = Math.max(7, Math.round(chainLen / 18)), ls = chainLen / links; ctx.lineWidth = 3.5;
        for (let i = 0; i < links; i++) { const u = (i + 0.5) / links; const c = { x: pivot.x + dir.x * chainLen * u, y: pivot.y + dir.y * chainLen * u + bag.lift * u }; ctx.strokeStyle = i % 2 ? '#d3d8e0' : '#969ca6'; ctx.beginPath(); ctx.ellipse(c.x, c.y, i % 2 ? 4 : 7, ls * 0.62, bag.ang, 0, 7); ctx.stroke(); }
        const flash = bag.flash > 0; const grad = ctx.createLinearGradient(top.x - perp.x * w, top.y - perp.y * w, top.x + perp.x * w, top.y + perp.y * w); grad.addColorStop(0, flash ? '#fff' : '#e05540'); grad.addColorStop(0.5, flash ? '#ffd' : '#c0392b'); grad.addColorStop(1, flash ? '#fff' : '#7a1f17');
        ctx.fillStyle = grad; ctx.strokeStyle = '#4a120c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(top.x - perp.x * w, top.y - perp.y * w); ctx.lineTo(bot.x - perp.x * w, bot.y - perp.y * w); ctx.arc(bot.x, bot.y, w, Math.atan2(-perp.y, -perp.x), Math.atan2(perp.y, perp.x), false); ctx.lineTo(top.x + perp.x * w, top.y + perp.y * w); ctx.arc(top.x, top.y, w, Math.atan2(perp.y, perp.x), Math.atan2(-perp.y, -perp.x), false); ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    /* ---------- background ---------- */
    function drawBG() {
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0d12'); g.addColorStop(0.6, '#1a070b'); g.addColorStop(1, '#0c0406'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        const sunR = Math.min(W, H) * 0.32; const rg = ctx.createRadialGradient(W * 0.5, floorY * 0.62, 10, W * 0.5, floorY * 0.62, sunR); rg.addColorStop(0, 'rgba(220,90,40,.55)'); rg.addColorStop(0.6, 'rgba(150,40,30,.30)'); rg.addColorStop(1, 'rgba(150,40,30,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(W * 0.5, floorY * 0.62, sunR, 0, 7); ctx.fill();
        ctx.fillStyle = '#15060a'; ctx.fillRect(0, 0, W * 0.06, floorY); ctx.fillRect(W * 0.94, 0, W * 0.06, floorY);
        const fg = ctx.createLinearGradient(0, floorY, 0, H); fg.addColorStop(0, '#3a241a'); fg.addColorStop(1, '#1c1008'); ctx.fillStyle = fg; ctx.fillRect(0, floorY, W, H - floorY);
    }

    /* ---------- effects draw ---------- */
    function drawProjectiles() { for (const p of projectiles) { const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r); g.addColorStop(0, '#fff'); g.addColorStop(0.4, '#ffd86b'); g.addColorStop(1, 'rgba(255,120,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); } }
    function drawImpacts() { for (const im of impacts) { const r = (1 - im.t) * 40 + 6; ctx.globalAlpha = im.t; ctx.strokeStyle = im.color; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(im.x, im.y, r * 0.3, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
    function drawParticles() { for (const p of parts) { ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = p.color; ctx.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz); } ctx.globalAlpha = 1; }
    function drawFloats() { ctx.textAlign = 'center'; for (const f of floats) { const a = clamp(f.life / f.maxlife, 0, 1); ctx.globalAlpha = a; ctx.font = "bold 24px 'Russo One',sans-serif"; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(f.t, f.x + 2, f.y + 2); ctx.fillStyle = f.c; ctx.fillText(f.t, f.x, f.y); } ctx.globalAlpha = 1; }
    function drawCombo() { if (combo >= 2) { ctx.textAlign = 'center'; ctx.font = "bold 54px 'Russo One',sans-serif"; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(combo + ' HIT', W / 2 + 3, H * 0.30 + 3); ctx.fillStyle = '#ffcf3f'; ctx.fillText(combo + ' HIT', W / 2, H * 0.30); } }
    function drawAnnounce() { if (announceT > 0) { ctx.textAlign = 'center'; ctx.globalAlpha = clamp(announceT, 0, 1); ctx.font = "bold 70px 'Russo One',sans-serif"; ctx.fillStyle = '#ff2d55'; ctx.fillText(announceText, W / 2, H * 0.48); } }

    /* ---------- render ---------- */
    function render() {
        ctx.save(); if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        drawBG(); drawProjectiles(); const bc = bagCenter(); if (player.x < bc.x) { drawPlayer(); drawBag(); } else { drawBag(); drawPlayer(); }
        drawImpacts(); drawParticles(); drawFloats(); drawCombo(); drawAnnounce(); ctx.restore();
    }

    /* ---------- HUD ---------- */
    const $ = id => document.getElementById(id);
    function updateHUD() {
        if ($('ma-hp')) $('ma-hp').style.width = clamp(player.hp, 0, 100) + '%'; 
        if ($('ma-bag')) $('ma-bag').style.width = (bag.maxHp ? clamp(bag.hp / bag.maxHp * 100, 0, 100) : 0) + '%';
        if ($('ma-bagname')) $('ma-bagname').textContent = 'HEAVY BAG · LV ' + level; 
        if ($('ma-timer')) $('ma-timer').textContent = Math.ceil(timeLeft); 
        if ($('ma-score')) $('ma-score').textContent = 'SCORE ' + score; 
        if ($('ma-sup')) $('ma-sup').style.width = superC + '%';
    }

    /* ---------- gamepad ---------- */
    let padPrev = {};
    function pollPad(dt) {
        if (!document.getElementById('martialarts-game').classList.contains('active')) return;
        const gps = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null; for (const g of gps) { if (g) { gp = g; break; } }
        if (!gp) return;
        const lx = gp.axes[0] || 0; const dl = (gp.buttons[14] && gp.buttons[14].pressed) || lx < -0.4; const dr = (gp.buttons[15] && gp.buttons[15].pressed) || lx > 0.4; const du = (gp.buttons[12] && gp.buttons[12].pressed) || (gp.axes[1] || 0) < -0.5; const dd = (gp.buttons[13] && gp.buttons[13].pressed) || (gp.axes[1] || 0) > 0.5; keys['arrowleft'] = dl; keys['arrowright'] = dr; keys['arrowup'] = du; keys['arrowdown'] = dd;
        const edge = (i) => { const p = gp.buttons[i] && gp.buttons[i].pressed; const was = padPrev[i]; padPrev[i] = p; return p && !was; };
        if (edge(2)) attack('LP'); if (edge(3)) attack('HP'); if (edge(0)) attack('LK'); if (edge(1)) attack('HK');
        if ((gp.buttons[6] && gp.buttons[6].pressed) && (gp.buttons[7] && gp.buttons[7].pressed)) trySuper();
        if (edge(9)) togglePause();
    }

    /* ---------- audio ---------- */
    const SFX = (() => {
        let ac = null, noise = null;
        function C() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return ac; }
        function mk() { const c = C(); if (!c) return null; const b = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
        function init() { const c = C(); if (c && !noise) noise = mk(); if (c && c.state === 'suspended') c.resume(); }
        function tone(f, d, t, v) { const c = C(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = t || 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(v || .2, c.currentTime + .006); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); o.start(); o.stop(c.currentTime + d); }
        function nz(d, f, q, v) { const c = C(); if (!c || !noise) return; const s = c.createBufferSource(); s.buffer = noise; const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 3; const g = c.createGain(); s.connect(fl); fl.connect(g); g.connect(c.destination); g.gain.setValueAtTime(v ||.3, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); s.start(); s.stop(c.currentTime + d); }
        return { init, whoosh(t) { nz(0.12, t === 'kick' ? 700 : 1100, 1.4, 0.12); }, impact(kick, combo) { tone(kick ? 120 : 160, 0.12, 'square', 0.22); nz(0.08, kick ? 260 : 380, 2, 0.18); }, fire() { nz(0.3, 500, 1.2, 0.18); tone(220, 0.3, 'sawtooth', 0.12); }, jump() { tone(300, 0.12, 'sine', 0.12); }, block() { tone(900, 0.08, 'square', 0.14); nz(0.05, 1500, 3, 0.1); }, hurt() { tone(140, 0.18, 'sawtooth', 0.16); }, ko() { tone(90, 0.5, 'square', 0.22); }, bagbreak() { nz(0.5, 300, 0.8, 0.3); tone(110, 0.4, 'square', 0.2); }, superStart() { tone(400, 0.3, 'sawtooth', 0.18); } };
    })();

    /* ---------- state machine ---------- */
    let state = 'menu';
    function startGame() { 
        resetPlayer(); resetBag(1); combo = 0; comboTimer = 0; score = 0; superC = 0; timeLeft = 99; 
        parts.length = 0; floats.length = 0; projectiles.length = 0; impacts.length = 0; superActive = 0; 
        if ($('ma-start')) $('ma-start').classList.add('hidden'); 
        if ($('ma-pause')) $('ma-pause').classList.add('hidden'); 
        if ($('ma-over')) $('ma-over').classList.add('hidden'); 
        state = 'play'; SFX.init(); announce('FIGHT!'); 
    }
    function togglePause() { 
        if (state === 'play') { 
            state = 'pause'; 
            if ($('ma-pause')) $('ma-pause').classList.remove('hidden'); 
        } else if (state === 'pause') { 
            state = 'play'; 
            if ($('ma-pause')) $('ma-pause').classList.add('hidden'); 
        } 
    }
    function endGame(title) { 
        state = 'over'; 
        if ($('ma-overTitle')) $('ma-overTitle').textContent = title; 
        if ($('ma-overStats')) $('ma-overStats').innerHTML = 'FINAL SCORE: ' + score; 
        if ($('ma-over')) $('ma-over').classList.remove('hidden'); 
    }
    if ($('ma-startBtn')) $('ma-startBtn').onclick = startGame;
    if ($('ma-resumeBtn')) $('ma-resumeBtn').onclick = togglePause;
    if ($('ma-restartBtn')) $('ma-restartBtn').onclick = startGame;
    if ($('ma-againBtn')) $('ma-againBtn').onclick = startGame;

    /* ---------- loop ---------- */
    let last = performance.now();
    function loop(now) { const dt = Math.min(0.04, (now - last) / 1000); last = now; pollPad(dt); if (announceT > 0) announceT -= dt; if (state === 'play') update(dt); render(); updateHUD(); requestAnimationFrame(loop); }
    resetPlayer(); resetBag(1); requestAnimationFrame(loop);
}

})();
