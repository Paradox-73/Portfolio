/* ------------------------------------------------------------------------
   SIGNAL BREACH — the index.html loading-screen mini-game.

   While the room's assets download, the nav icons of every page drift
   through the void. You are the cyborg's targeting turret at the centre of
   the screen: aim with the pointer, click (or tap, or hold Space) to fire.

   A big icon splits into two mediums, a medium into two smalls, a small
   pops for the most points — classic Asteroids scoring, in-theme sprites.
   Let one reach the turret and you lose a shield; lose all three and the
   signal drops until you click to retry.

   The turret auto-locks the icon nearest your aim ray and brackets it, so
   the field doubles as an attract-mode screensaver before the first shot.

   Exposes window.startLoaderGame(canvas, hud) -> { stop, isPlaying }.
   `hud` is optional: { score, best, lives, message } DOM elements.
   The loader keeps itself on screen for as long as isPlaying() is true.
------------------------------------------------------------------------ */
(function (global) {
    'use strict';

    // One Font Awesome 6 (Solid) glyph per page + its accent colour — the
    // same icons and colours the site nav uses. Escapes rather than literal
    // private-use characters so the file survives any encoding round-trip.
    var ICONS = [
        { color: '#1DB954', glyph: '\uf001' }, // Music       fa-music      (Spotify green)
        { color: '#E50914', glyph: '\uf008' }, // Movies/TV   fa-film       (red)
        { color: '#006FCD', glyph: '\uf11b' }, // Games       fa-gamepad    (PlayStation blue)
        { color: '#9B51E0', glyph: '\uf55d' }, // Art         fa-brush      (purple)
        { color: '#F2C94C', glyph: '\uf2e7' }, // Food        fa-utensils   (yellow)
        { color: '#00B8D4', glyph: '\uf0f2' }, // Travel      fa-suitcase   (cyan)
        { color: '#8D6E63', glyph: '\uf02d' }, // Literature  fa-book       (brown)
        { color: '#FF7A00', glyph: '\uf434' }, // Sport       fa-basketball (orange)
        { color: '#FF4FA3', glyph: '\uf121' }  // Projects    fa-code       (magenta)
    ];

    var BASE_GREY = [150, 150, 150];   // Idle icon colour on the dark backdrop
    var BEST_KEY = 'kb.loader.best';   // localStorage slot for the high score

    var TIER_SIZE = [56, 36, 23];      // Glyph size per tier: big, medium, small
    var TIER_SPEED = [0.55, 0.9, 1.35]; // Base drift speed per tier
    var TIER_SCORE = [20, 50, 100];    // Points per tier — smaller is worth more
    var TIER_SPARKS = [22, 14, 9];     // Debris particles released per tier

    var FIRE_INTERVAL = 150;           // ms between shots while held
    var BULLET_SPEED = 9;
    var BULLET_LIFE = 1100;            // ms
    var INVULN_TIME = 1600;            // ms of blinking grace after a hit
    var MAX_LIVES = 3;

    function rand(min, max) { return min + Math.random() * (max - min); }
    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    function startLoaderGame(canvas, hud) {
        var noop = { stop: function () {}, isPlaying: function () { return false; } };
        if (!canvas || !canvas.getContext) return noop;

        var ctx = canvas.getContext('2d');
        hud = hud || {};

        // Pre-split the accent colours so per-frame drawing stays arithmetic only.
        var rgb = ICONS.map(function (i) {
            return [
                parseInt(i.color.slice(1, 3), 16),
                parseInt(i.color.slice(3, 5), 16),
                parseInt(i.color.slice(5, 7), 16)
            ];
        });

        // Glyphs cannot be painted until the icon font is available.
        var fontReady = false;
        if (global.document.fonts && global.document.fonts.load) {
            global.document.fonts.load('900 24px "Font Awesome 6 Free"').then(
                function () { fontReady = true; },
                function () { fontReady = true; }
            );
        } else {
            fontReady = true;
        }

        var reduceMotion = global.matchMedia
            && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ---- state -------------------------------------------------------
        var w = 0, h = 0;
        var dpr = Math.min(global.devicePixelRatio || 1, 2);
        var scale = 1;                 // Shrinks everything on small screens
        var rocks = [], bullets = [], sparks = [], pops = [], stars = [];
        var aim = { x: 0, y: -1 };     // Pointer position, canvas-space
        var hasPointer = false;
        var turret = { angle: -Math.PI / 2, recoil: 0, invuln: 0, radius: 20 };
        var lives = MAX_LIVES, score = 0, best = 0;
        var started = false;           // True from the first shot onward
        var over = false;
        var shake = 0;
        var firing = false, lastShot = 0;
        var rafId = null, lastFrame = 0, clock = 0;
        var stopped = false;

        try { best = parseInt(global.localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { best = 0; }

        // ---- HUD ---------------------------------------------------------
        function paintHud() {
            if (hud.score) hud.score.textContent = 'SCORE ' + score;
            if (hud.best) hud.best.textContent = 'BEST ' + Math.max(best, score);
            if (hud.lives) {
                // Shield pips, spent ones hollowed out. Kept to plain ASCII —
                // Press Start 2P has no box-drawing or geometric glyphs and
                // would silently fall back to a different face.
                var pips = '';
                for (var i = 0; i < MAX_LIVES; i++) pips += (i < lives ? '#' : '.');
                hud.lives.textContent = 'SHIELD ' + pips;
            }
            if (hud.message) {
                // ASCII only: Press Start 2P covers little beyond it.
                hud.message.textContent = over
                    ? 'SIGNAL LOST - CLICK TO RETRY'
                    : (started ? '' : 'AIM - CLICK TO FIRE');
                hud.message.classList.toggle('is-alert', over);
            }
        }

        function saveBest() {
            if (score <= best) return;
            best = score;
            try { global.localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* private mode */ }
        }

        // ---- world building ----------------------------------------------
        function sizeOf(tier) { return TIER_SIZE[tier] * scale; }
        function radiusOf(rock) { return rock.size * 0.42; }

        // How many big icons the field should hold, scaled to the viewport.
        function targetBigCount() {
            return clamp(Math.round((w * h) / 130000), 4, 9);
        }

        // Spawn a big icon just off a random edge, heading inward.
        function spawnEdgeRock() {
            var size = sizeOf(0);
            var edge = Math.floor(Math.random() * 4);
            var x, y, ang;
            if (edge === 0) { x = rand(0, w); y = -size; ang = rand(0.2, Math.PI - 0.2); }
            else if (edge === 1) { x = w + size; y = rand(0, h); ang = rand(Math.PI * 0.7, Math.PI * 1.3); }
            else if (edge === 2) { x = rand(0, w); y = h + size; ang = rand(Math.PI + 0.2, Math.PI * 2 - 0.2); }
            else { x = -size; y = rand(0, h); ang = rand(-Math.PI * 0.3, Math.PI * 0.3); }
            rocks.push(makeRock(x, y, ang, 0, Math.floor(Math.random() * ICONS.length)));
        }

        function makeRock(x, y, ang, tier, icon) {
            var sp = TIER_SPEED[tier] * scale * rand(0.85, 1.2);
            return {
                icon: icon,
                tier: tier,
                x: x, y: y,
                vx: Math.cos(ang) * sp,
                vy: Math.sin(ang) * sp,
                size: sizeOf(tier),
                spin: rand(-0.5, 0.5),   // Slow tumble, radians/sec
                rot: rand(0, Math.PI * 2),
                lit: 0                   // Eases toward 1 while target-locked
            };
        }

        // Seed the attract-mode field: a full set of bigs plus a few mediums
        // so the screen is busy the instant the loader appears.
        function buildField() {
            rocks = [];
            var n = targetBigCount();
            for (var i = 0; i < n; i++) {
                var ang = rand(0, Math.PI * 2);
                var pt = pointAwayFromTurret(sizeOf(0));
                rocks.push(makeRock(pt.x, pt.y, ang, 0, Math.floor(Math.random() * ICONS.length)));
            }
            for (var j = 0; j < 3; j++) {
                var a2 = rand(0, Math.PI * 2);
                var p2 = pointAwayFromTurret(sizeOf(1));
                rocks.push(makeRock(p2.x, p2.y, a2, 1, Math.floor(Math.random() * ICONS.length)));
            }
        }

        // A random spot that is not on top of the turret (nothing should spawn
        // already touching the player).
        function pointAwayFromTurret(pad) {
            var cx = w / 2, cy = h / 2;
            var safe = 190 * scale;
            for (var tries = 0; tries < 24; tries++) {
                var x = rand(pad, w - pad), y = rand(pad, h - pad);
                if (Math.hypot(x - cx, y - cy) > safe) return { x: x, y: y };
            }
            return { x: pad, y: pad };
        }

        function buildStars() {
            // A faint parallax dust field so the void has depth behind the icons.
            var count = clamp(Math.round((w * h) / 26000), 20, 70);
            stars = [];
            for (var i = 0; i < count; i++) {
                stars.push({
                    x: rand(0, w), y: rand(0, h),
                    r: rand(0.6, 1.7),
                    a: rand(0.05, 0.22),
                    drift: rand(0.02, 0.09)
                });
            }
        }

        function resize() {
            var r = canvas.getBoundingClientRect();
            w = r.width; h = r.height;
            if (!w || !h) return;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            scale = w < 480 ? 0.62 : (w < 768 ? 0.8 : 1);
            turret.radius = 20 * scale;

            if (!rocks.length) buildField();
            else rocks.forEach(function (rk) { rk.size = sizeOf(rk.tier); });
            buildStars();
        }

        // ---- gameplay ----------------------------------------------------
        function reset() {
            score = 0;
            lives = MAX_LIVES;
            over = false;
            turret.invuln = 0;
            bullets = []; sparks = []; pops = [];
            buildField();
            paintHud();
        }

        function fire(now) {
            if (over || now - lastShot < FIRE_INTERVAL) return;
            lastShot = now;
            started = true;
            // Re-aim from the live pointer rather than trusting the angle the
            // last frame computed. A touch tap sets its aim and fires in the
            // same event, so without this the first shot flies at whatever the
            // previous frame was pointing at.
            if (hasPointer) turret.angle = Math.atan2(aim.y - h / 2, aim.x - w / 2);
            var muzzle = turret.radius + 8 * scale;
            bullets.push({
                x: w / 2 + Math.cos(turret.angle) * muzzle,
                y: h / 2 + Math.sin(turret.angle) * muzzle,
                vx: Math.cos(turret.angle) * BULLET_SPEED * scale,
                vy: Math.sin(turret.angle) * BULLET_SPEED * scale,
                life: BULLET_LIFE
            });
            turret.recoil = 5 * scale;
            paintHud();
        }

        function burst(x, y, icon, tier) {
            var n = TIER_SPARKS[tier];
            for (var i = 0; i < n; i++) {
                var a = rand(0, Math.PI * 2), sp = rand(0.8, 4) * scale;
                sparks.push({
                    x: x, y: y,
                    vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                    life: rand(280, 620),
                    max: 620,
                    size: rand(1.5, 3.6) * scale,
                    icon: icon
                });
            }
        }

        // Destroy a rock: award points, throw debris, and split it if it can.
        function shatter(index, awardPoints) {
            var rk = rocks[index];
            rocks.splice(index, 1);
            burst(rk.x, rk.y, rk.icon, rk.tier);

            if (awardPoints) {
                var pts = TIER_SCORE[rk.tier];
                score += pts;
                pops.push({ x: rk.x, y: rk.y, text: '+' + pts, life: 700, icon: rk.icon });
            }

            if (rk.tier < 2) {
                var base = Math.atan2(rk.vy, rk.vx);
                for (var s = -1; s <= 1; s += 2) {
                    var child = makeRock(rk.x, rk.y, base + s * rand(0.5, 1.15), rk.tier + 1, rk.icon);
                    // Nudge the halves apart so they do not overlap on frame one.
                    child.x += Math.cos(base + s * Math.PI / 2) * rk.size * 0.3;
                    child.y += Math.sin(base + s * Math.PI / 2) * rk.size * 0.3;
                    rocks.push(child);
                }
            }
            paintHud();
        }

        function loseShield(index) {
            var rk = rocks[index];
            rocks.splice(index, 1);
            burst(rk.x, rk.y, rk.icon, 0);
            lives--;
            shake = 16;
            turret.invuln = INVULN_TIME;
            if (lives <= 0) {
                over = true;
                saveBest();
                burst(w / 2, h / 2, rk.icon, 0);
            }
            paintHud();
        }

        // Wrap an icon around the screen edges, Asteroids-style.
        function wrap(rk) {
            var m = rk.size;
            if (rk.x < -m) rk.x = w + m;
            else if (rk.x > w + m) rk.x = -m;
            if (rk.y < -m) rk.y = h + m;
            else if (rk.y > h + m) rk.y = -m;
        }

        // The icon closest along the aim ray — brackets as the locked target.
        function findTarget() {
            var cx = w / 2, cy = h / 2;
            var dx = Math.cos(turret.angle), dy = Math.sin(turret.angle);
            var bestIdx = -1, bestDist = Infinity;
            for (var i = 0; i < rocks.length; i++) {
                var rk = rocks[i];
                var along = (rk.x - cx) * dx + (rk.y - cy) * dy;
                if (along <= 0) continue;                       // Behind the muzzle
                var perp = Math.abs((rk.x - cx) * dy - (rk.y - cy) * dx);
                if (perp > radiusOf(rk) + 6 * scale) continue;  // Ray misses it
                if (along < bestDist) { bestDist = along; bestIdx = i; }
            }
            return bestIdx;
        }

        function update(dt, now) {
            var cx = w / 2, cy = h / 2;

            // Aim: follow the pointer, or idle-sweep before anyone touches it.
            if (hasPointer) {
                turret.angle = Math.atan2(aim.y - cy, aim.x - cx);
            } else if (!reduceMotion) {
                turret.angle += 0.35 * dt;
            }
            turret.recoil *= 0.82;
            if (turret.invuln > 0) turret.invuln -= dt * 1000;
            if (shake > 0) shake = Math.max(0, shake - dt * 42);

            if (firing) fire(now);

            var targetIdx = over ? -1 : findTarget();

            // Icons
            for (var i = rocks.length - 1; i >= 0; i--) {
                var rk = rocks[i];
                rk.x += rk.vx * dt * 60;
                rk.y += rk.vy * dt * 60;
                rk.rot += rk.spin * dt;
                wrap(rk);
                var want = (i === targetIdx) ? 1 : 0;
                rk.lit += (want - rk.lit) * Math.min(1, dt * 12);

                // Turret collision — only while vulnerable and still alive.
                if (!over && turret.invuln <= 0) {
                    if (Math.hypot(rk.x - cx, rk.y - cy) < radiusOf(rk) + turret.radius) {
                        loseShield(i);
                        continue;
                    }
                }
            }

            // Bullets
            for (var b = bullets.length - 1; b >= 0; b--) {
                var bl = bullets[b];
                bl.px = bl.x; bl.py = bl.y;
                bl.x += bl.vx * dt * 60;
                bl.y += bl.vy * dt * 60;
                bl.life -= dt * 1000;
                if (bl.life <= 0 || bl.x < -20 || bl.x > w + 20 || bl.y < -20 || bl.y > h + 20) {
                    bullets.splice(b, 1);
                    continue;
                }
                for (var r = rocks.length - 1; r >= 0; r--) {
                    if (Math.hypot(rocks[r].x - bl.x, rocks[r].y - bl.y) < radiusOf(rocks[r])) {
                        bullets.splice(b, 1);
                        shatter(r, true);
                        break;
                    }
                }
            }

            // Debris and score pops
            for (var s = sparks.length - 1; s >= 0; s--) {
                var sp = sparks[s];
                sp.x += sp.vx * dt * 60;
                sp.y += sp.vy * dt * 60;
                sp.vx *= 0.97; sp.vy *= 0.97;
                sp.life -= dt * 1000;
                if (sp.life <= 0) sparks.splice(s, 1);
            }
            for (var p = pops.length - 1; p >= 0; p--) {
                pops[p].y -= dt * 26;
                pops[p].life -= dt * 1000;
                if (pops[p].life <= 0) pops.splice(p, 1);
            }

            // Keep the field populated so the screen never empties out.
            if (!over) {
                var bigs = rocks.filter(function (rk) { return rk.tier === 0; }).length;
                if (rocks.length === 0 || (bigs < targetBigCount() && Math.random() < dt * 0.55)) {
                    spawnEdgeRock();
                }
            }
        }

        // ---- drawing -----------------------------------------------------
        function tint(icon, lit) {
            var c = rgb[icon];
            // Idle icons sit near grey; a locked target burns full accent.
            var base = 0.45 + lit * 0.55;
            return 'rgb('
                + Math.round(BASE_GREY[0] + (c[0] - BASE_GREY[0]) * base) + ','
                + Math.round(BASE_GREY[1] + (c[1] - BASE_GREY[1]) * base) + ','
                + Math.round(BASE_GREY[2] + (c[2] - BASE_GREY[2]) * base) + ')';
        }

        function drawStars() {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            for (var i = 0; i < stars.length; i++) {
                var st = stars[i];
                st.y += st.drift;
                if (st.y > h) st.y = 0;
                ctx.globalAlpha = st.a;
                ctx.fillRect(st.x, st.y, st.r, st.r);
            }
            ctx.restore();
        }

        function drawRock(rk) {
            if (!fontReady) return;
            var c = rgb[rk.icon];
            var size = rk.size * (1 + rk.lit * 0.12);
            ctx.save();
            ctx.translate(rk.x, rk.y);
            ctx.rotate(rk.rot * 0.25);          // Barely-there tumble; icons stay readable
            ctx.globalAlpha = 0.62 + rk.lit * 0.38;
            ctx.shadowColor = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
            ctx.shadowBlur = 6 + rk.lit * 20;
            ctx.font = '900 ' + size + 'px "Font Awesome 6 Free"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = tint(rk.icon, rk.lit);
            ctx.fillText(ICONS[rk.icon].glyph, 0, 0);
            ctx.restore();

            // Lock brackets on the target the next shot will hit.
            if (rk.lit > 0.15) {
                var b = radiusOf(rk) + 8 * scale;
                ctx.save();
                ctx.globalAlpha = rk.lit * 0.9;
                ctx.strokeStyle = '#EAF6FF';
                ctx.lineWidth = 2 * scale;
                var arm = b * 0.42;
                [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
                    ctx.beginPath();
                    ctx.moveTo(rk.x + q[0] * b, rk.y + q[1] * b - q[1] * arm);
                    ctx.lineTo(rk.x + q[0] * b, rk.y + q[1] * b);
                    ctx.lineTo(rk.x + q[0] * b - q[0] * arm, rk.y + q[1] * b);
                    ctx.stroke();
                });
                ctx.restore();
            }
        }

        function drawTurret() {
            var cx = w / 2, cy = h / 2;
            // Blink while the grace period runs.
            var blink = turret.invuln > 0 && Math.floor(clock / 90) % 2 === 0;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.globalAlpha = over ? 0.25 : (blink ? 0.35 : 1);

            // Shield ring — one arc segment per remaining life.
            var ringR = turret.radius + 9 * scale;
            for (var i = 0; i < MAX_LIVES; i++) {
                var a0 = -Math.PI / 2 + i * (Math.PI * 2 / MAX_LIVES) + 0.14;
                var a1 = a0 + (Math.PI * 2 / MAX_LIVES) - 0.28;
                ctx.beginPath();
                ctx.arc(0, 0, ringR, a0, a1);
                ctx.lineWidth = 3 * scale;
                ctx.strokeStyle = i < lives ? 'rgba(63,169,224,0.9)' : 'rgba(63,169,224,0.16)';
                ctx.stroke();
            }

            ctx.rotate(turret.angle);
            ctx.translate(-turret.recoil, 0);

            // Hull: a blunt azure wedge with a warm cyber-eye, matching the
            // room's half-skeleton/half-machine avatar.
            var s = turret.radius;
            ctx.beginPath();
            ctx.moveTo(s * 1.25, 0);
            ctx.lineTo(-s * 0.6, s * 0.78);
            ctx.lineTo(-s * 0.2, 0);
            ctx.lineTo(-s * 0.6, -s * 0.78);
            ctx.closePath();
            ctx.fillStyle = '#EAF6FF';
            ctx.shadowColor = '#3FA9E0';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.lineWidth = 2 * scale;
            ctx.strokeStyle = '#3FA9E0';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(s * 0.15, 0, s * 0.24, 0, Math.PI * 2);
            ctx.fillStyle = '#F6C453';
            ctx.shadowColor = '#F6C453';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
        }

        function drawBullets() {
            ctx.save();
            ctx.lineCap = 'round';
            for (var i = 0; i < bullets.length; i++) {
                var bl = bullets[i];
                ctx.globalAlpha = clamp(bl.life / 260, 0.25, 1);
                ctx.strokeStyle = '#FFF3C6';
                ctx.shadowColor = '#F6C453';
                ctx.shadowBlur = 10;
                ctx.lineWidth = 3 * scale;
                ctx.beginPath();
                ctx.moveTo(bl.px === undefined ? bl.x : bl.px, bl.py === undefined ? bl.y : bl.py);
                ctx.lineTo(bl.x, bl.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawSparks() {
            ctx.save();
            for (var i = 0; i < sparks.length; i++) {
                var sp = sparks[i];
                var c = rgb[sp.icon];
                ctx.globalAlpha = clamp(sp.life / sp.max, 0, 1);
                ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
                ctx.fillRect(sp.x, sp.y, sp.size, sp.size);
            }
            ctx.restore();
        }

        function drawPops() {
            if (!pops.length) return;
            ctx.save();
            ctx.font = (11 * scale) + 'px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (var i = 0; i < pops.length; i++) {
                var p = pops[i];
                var c = rgb[p.icon];
                ctx.globalAlpha = clamp(p.life / 700, 0, 1);
                ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
                ctx.fillText(p.text, p.x, p.y);
            }
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            if (shake > 0) {
                ctx.translate(rand(-shake, shake) * 0.4, rand(-shake, shake) * 0.4);
            }
            drawStars();
            for (var i = 0; i < rocks.length; i++) drawRock(rocks[i]);
            drawSparks();
            drawBullets();
            drawTurret();
            drawPops();
            ctx.restore();
        }

        function frame(now) {
            if (stopped) return;
            if (!lastFrame) lastFrame = now;
            var dt = Math.min((now - lastFrame) / 1000, 0.05); // Clamp after tab switches
            lastFrame = now;
            clock = now;
            update(dt, now);
            draw();
            rafId = global.requestAnimationFrame(frame);
        }

        // ---- input -------------------------------------------------------
        function pointAt(e) {
            var r = canvas.getBoundingClientRect();
            var pt = e.touches && e.touches.length ? e.touches[0] : e;
            aim.x = pt.clientX - r.left;
            aim.y = pt.clientY - r.top;
            hasPointer = true;
        }

        function onMove(e) { pointAt(e); }

        function onDown(e) {
            pointAt(e);
            if (over) { reset(); return; }
            firing = true;
            fire(global.performance ? global.performance.now() : Date.now());
        }

        function onUp() { firing = false; }

        function onKey(e) {
            if (e.code !== 'Space' && e.key !== ' ') return;
            if (e.repeat) return;
            e.preventDefault();
            if (over) { reset(); return; }
            firing = true;
            fire(global.performance ? global.performance.now() : Date.now());
        }

        function onKeyUp(e) {
            if (e.code === 'Space' || e.key === ' ') firing = false;
        }

        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('touchstart', onDown, { passive: true });
        canvas.addEventListener('touchmove', onMove, { passive: true });
        global.addEventListener('mouseup', onUp);
        global.addEventListener('touchend', onUp);
        global.addEventListener('mousemove', onMove);
        global.addEventListener('keydown', onKey);
        global.addEventListener('keyup', onKeyUp);
        global.addEventListener('resize', resize);

        resize();
        paintHud();
        rafId = global.requestAnimationFrame(frame);

        return {
            stop: function () {
                if (stopped) return;
                stopped = true;
                saveBest();
                if (rafId) global.cancelAnimationFrame(rafId);
                canvas.removeEventListener('mousedown', onDown);
                canvas.removeEventListener('touchstart', onDown);
                canvas.removeEventListener('touchmove', onMove);
                global.removeEventListener('mouseup', onUp);
                global.removeEventListener('touchend', onUp);
                global.removeEventListener('mousemove', onMove);
                global.removeEventListener('keydown', onKey);
                global.removeEventListener('keyup', onKeyUp);
                global.removeEventListener('resize', resize);
            },
            // The loader must not yank the screen away mid-game.
            isPlaying: function () { return started; },
            getScore: function () { return score; }
        };
    }

    global.startLoaderGame = startLoaderGame;
})(window);
