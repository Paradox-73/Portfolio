/* =============================================================================
   Travel page layout editor  —  authoring tool, not a visitor-facing feature.

   The scrapbook pages are laid out with floats, so a photo can only ever sit
   left or right of the text that follows it. This tool switches every keyed
   element (`data-tl` in Travel.html) to absolute positioning, lets you drag,
   resize and rotate it, then prints the result as plain CSS you paste into
   CSS/travel-layout.css. That file is the frozen layout.

   How it survives other screens
   -----------------------------
   Positions are pixels inside a fixed design box — the page box of the window
   you first laid out in. travelscript.js scales that whole box to fit whatever
   page it lands on, so the arrangement is rigid and only its size follows the
   viewport. Percentages were tried first and drift: a narrower page rewraps a
   paragraph onto more lines, which then runs into whatever sits below it.

   Open:   Travel.html?layout      (or run travelLayoutEditor.start() in console)
   Freeze: "Copy CSS" -> paste over CSS/travel-layout.css -> reload without ?layout

   Without ?layout this file does nothing at all, so it is safe to ship.

   Controls
     click            select        drag           move
     blue handle      resize        orange handle  rotate
     arrows           nudge 1px     shift+arrows   nudge 10px
     - / =            width         [ / ]          rotate 1 deg
     f / b            front / back  ctrl+z         undo
     shift held       drop the 1px grid, move freely
============================================================================= */
(function () {
  'use strict';

  var STORE_KEY = 'travelLayout.v1';
  var BOX_KEY = 'travelLayout.box.v1';
  var store = read(STORE_KEY, {});
  var design = read(BOX_KEY, null);    // {W,H} the layout was authored against
  var sel = null;
  var drag = null;
  var undo = [];
  var on = false;
  var bar = null;

  // ---------------------------------------------------------------- storage
  function read(k, dflt) {
    try { return JSON.parse(localStorage.getItem(k)) || dflt; }
    catch (e) { return dflt; }
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      if (design) localStorage.setItem(BOX_KEY, JSON.stringify(design));
    } catch (e) {}
  }

  // ------------------------------------------------------------------ utils
  function r2(n) { return Math.round(n * 100) / 100; }
  function snap(v, off) { return off ? r2(v) : Math.round(v); }
  function pages() {
    return Array.prototype.slice.call(
      document.querySelectorAll('#magazine .own-size.scrapbook'));
  }
  function items(page) {
    return Array.prototype.filter.call(
      page.querySelectorAll('[data-tl]'), function (el) { return el.tagName !== 'BR'; });
  }
  function innerOf(page) { return page.querySelector(':scope > .fit-inner'); }
  function rotOf(el) {
    var t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 0;
    var m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    var p = m[1].split(',').map(parseFloat);
    return r2(Math.atan2(p[1], p[0]) * 180 / Math.PI);
  }
  function keyOrder(a, b) {
    var A = a.match(/p(\d+)-(\d+)/), B = b.match(/p(\d+)-(\d+)/);
    if (!A || !B) return a < b ? -1 : 1;
    return (+A[1] - +B[1]) || (+A[2] - +B[2]);
  }

  // The page box, read off a real page. Turn.js writes an explicit pixel size onto
  // every own-size page when it builds it, and on resize it re-reads that same
  // inline value — so a page's box is whatever 45vw x 90vh happened to be at build
  // time and never follows the window afterwards. Measuring the CSS rule instead
  // of the element therefore lies whenever the window has changed since load.
  // Transforms do not affect clientWidth, so a folding page still reports true.
  function box() {
    var found = null;
    pages().some(function (p) {
      if (!p.clientWidth || !p.clientHeight || p.offsetParent === null) return false;
      found = { W: p.clientWidth, H: p.clientHeight };
      return true;
    });
    return found;
  }

  // The design box the coordinates live in. It is normally the page box, so the
  // editor shows the page at exactly the size the site does. If a saved layout was
  // authored against a different box — a resized window, a reopened session — the
  // stored coordinates are carried over to the new box rather than scaled at
  // display time, so what you were looking at is what you keep.
  function box0() {
    var live = box();
    if (!live) return design;
    if (!design) { design = live; save(); return design; }
    if (Math.abs(design.W - live.W) > 2 || Math.abs(design.H - live.H) > 2) rebase(live);
    return design;
  }

  function rebase(live) {
    var k = Math.min(live.W / design.W, live.H / design.H);
    var offX = (live.W - design.W * k) / 2;
    var offY = (live.H - design.H * k) / 2;
    Object.keys(store).forEach(function (key) {
      var s = store[key];
      if (!s) return;
      s.x = r2(s.x * k + offX);
      s.y = r2(s.y * k + offY);
      s.w = r2(s.w * k);
    });
    design = { W: live.W, H: live.H };
    save();
    pages().forEach(function (p) { items(p).forEach(paint); });
    flash('design box refitted to ' + live.W + '×' + live.H);
  }

  // How many screen pixels one design pixel currently occupies. Taken from what is
  // actually on screen, so it stays right under the fit scale and any page transform.
  function screenScale(page) {
    var inner = innerOf(page);
    if (!inner || !inner.offsetWidth) return 1;
    return inner.getBoundingClientRect().width / inner.offsetWidth || 1;
  }

  // ------------------------------------------------- the design box on a page
  // Give the content wrapper the design box, then scale it to fit the real page.
  // travelscript.js does exactly this for a frozen layout, so what you drag here
  // is what the page ends up looking like.
  function frame(page) {
    var inner = innerOf(page), d = box0();
    if (!inner || !d) return 1;
    var W = page.clientWidth, H = page.clientHeight;
    var s = Math.min(W / d.W, H / d.H);
    inner.style.width = d.W + 'px';
    inner.style.height = d.H + 'px';
    inner.style.transformOrigin = 'top left';
    inner.style.transform = 'translate(' + ((W - d.W * s) / 2) + 'px, ' +
                            ((H - d.H * s) / 2) + 'px) scale(' + s + ')';
    return s;
  }
  // Hand the wrapper back to the page box, which is the only state the flowed
  // layout can be measured in.
  function naturalize(inner) {
    inner.style.width = '';
    inner.style.height = '';
    inner.style.transform = '';
    inner.style.transformOrigin = '';
  }

  // -------------------------------------------------------------- placement
  // A block that wraps around a float still has a full-width box: only its line
  // boxes are squeezed. Taking the box would drop the text on top of the photo,
  // so measure the text itself and keep the column the reader already sees.
  function textRect(el) {
    if (el.tagName === 'FIGURE' || el.classList.contains('grid-container')) return null;
    var b = el.getBoundingClientRect();
    var rg = document.createRange();
    rg.selectNodeContents(el);
    var r = rg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    if (r.width > b.width - 12) return null;           // no float squeezed it
    return { left: r.left - 2, top: r.top, width: r.width + 6 };
  }

  // Measure a whole page while it is still in flow, then pin every item.
  function absolutize(page) {
    var inner = innerOf(page);
    if (!inner) return;
    var d = box0();
    if (!d || !page.clientWidth || !page.clientHeight) return;

    var b = { W: page.clientWidth, H: page.clientHeight };   // this page's own box
    var list = items(page);
    if (page.dataset.tlDone !== '1') {
      var need = list.filter(function (el) { return !store[el.dataset.tl]; });
      if (need.length) {
        naturalize(inner);
        // Read the angles first, then measure with every transform off, so the
        // numbers are pure layout and never the box of a rotated element.
        var rots = need.map(rotOf);
        need.forEach(function (el) { el.style.transform = 'none'; });
        var base = inner.getBoundingClientRect();
        var kx = d.W / b.W, ky = d.H / b.H;   // this window -> the design box
        var fresh = need.map(function (el, i) {
          var r = textRect(el) || el.getBoundingClientRect();
          return {
            x: r2((r.left - base.left) * kx),
            y: r2((r.top - base.top) * ky),
            w: r2(r.width * kx),
            r: rots[i],
            z: 0
          };
        });
        need.forEach(function (el, i) { store[el.dataset.tl] = fresh[i]; });
      }
      list.forEach(paint);
      page.dataset.tlDone = '1';
      save();
    }
    frame(page);
  }

  function paint(el) {
    var s = store[el.dataset.tl];
    if (!s) return;
    var st = el.style;
    st.position = 'absolute';
    st.float = 'none';
    st.margin = '0';
    st.boxSizing = 'border-box';
    st.maxWidth = 'none';
    st.left = r2(s.x) + 'px';
    st.top = r2(s.y) + 'px';
    st.width = r2(s.w) + 'px';
    st.transform = 'rotate(' + r2(s.r) + 'deg)';
    st.zIndex = s.z ? String(s.z) : '';
  }

  function unpaint(el) {
    ['position', 'float', 'margin', 'boxSizing', 'maxWidth', 'left', 'top',
     'width', 'transform', 'zIndex'].forEach(function (p) { el.style[p] = ''; });
  }

  // Drop a page back to the float layout and re-measure it from scratch.
  function resetPage(page) {
    items(page).forEach(function (el) {
      delete store[el.dataset.tl];
      unpaint(el);
    });
    if (sel && page.contains(sel)) select(null);
    delete page.dataset.tlDone;
    naturalize(innerOf(page));
    save();
    void page.offsetHeight;                    // force the flow layout back
    absolutize(page);
    readout();
  }

  // --------------------------------------------------------------- selection
  function select(el) {
    if (sel === el) return;
    if (sel) {
      sel.classList.remove('tl-sel');
      var old = sel.querySelector(':scope > .tl-ui');
      if (old) old.remove();
    }
    sel = el;
    if (sel) {
      sel.classList.add('tl-sel');
      var ui = document.createElement('div');
      ui.className = 'tl-ui';
      ui.innerHTML =
        '<span class="tl-h tl-h-size" title="drag to resize"></span>' +
        '<span class="tl-h tl-h-rot" title="drag to rotate"></span>';
      sel.appendChild(ui);
    }
    readout();
  }

  function pushUndo(key) {
    if (!store[key]) return;
    undo.push({ k: key, s: JSON.parse(JSON.stringify(store[key])) });
    if (undo.length > 120) undo.shift();
  }

  // ------------------------------------------------------------------ input
  function onDown(e) {
    if (!on || e.button !== 0) return;
    if (e.target.closest('#tl-bar')) return;

    var el = e.target.closest('[data-tl]');
    if (!el || !store[el.dataset.tl]) { select(null); return; }
    e.preventDefault();
    e.stopPropagation();

    select(el);
    var handle = e.target.closest('.tl-h');
    var mode = !handle ? 'move'
             : handle.classList.contains('tl-h-rot') ? 'rot' : 'size';
    var s = store[el.dataset.tl];

    pushUndo(el.dataset.tl);
    drag = {
      el: el, mode: mode, x0: e.clientX, y0: e.clientY,
      // The page is scaled to fit, so pointer pixels are not design pixels.
      k: 1 / (screenScale(el.closest('.own-size.scrapbook')) || 1),
      s0: JSON.parse(JSON.stringify(s)),
      cx: 0, cy: 0, a0: 0
    };
    if (mode === 'rot') {
      var r = el.getBoundingClientRect();
      drag.cx = r.left + r.width / 2;
      drag.cy = r.top + r.height / 2;
      drag.a0 = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI;
    }
    document.documentElement.classList.add('tl-dragging');
  }

  function onMove(e) {
    if (!drag) return;
    e.preventDefault();
    var s = store[drag.el.dataset.tl];
    var dx = (e.clientX - drag.x0) * drag.k, dy = (e.clientY - drag.y0) * drag.k;

    if (drag.mode === 'move') {
      s.x = snap(drag.s0.x + dx, e.shiftKey);
      s.y = snap(drag.s0.y + dy, e.shiftKey);
    } else if (drag.mode === 'size') {
      // Undo the element's own rotation so the handle tracks the pointer.
      var rad = -drag.s0.r * Math.PI / 180;
      var local = dx * Math.cos(rad) - dy * Math.sin(rad);
      s.w = snap(Math.max(24, drag.s0.w + local), e.shiftKey);
    } else {
      var a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI;
      var next = drag.s0.r + (a - drag.a0);
      s.r = e.shiftKey ? r2(next) : Math.round(next);
    }
    paint(drag.el);
    readout();
  }

  function onUp() {
    if (!drag) return;
    drag = null;
    document.documentElement.classList.remove('tl-dragging');
    save();
  }

  function onKey(e) {
    if (!on) return;
    if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      var u = undo.pop();
      if (u) {
        store[u.k] = u.s;
        var el = document.querySelector('[data-tl="' + u.k + '"]');
        if (el) paint(el);
        save(); readout();
      }
      e.preventDefault(); e.stopPropagation();
      return;
    }
    if (e.key === 'Escape') { select(null); e.stopPropagation(); return; }
    if (!sel) return;

    var s = store[sel.dataset.tl];
    var step = e.shiftKey ? 10 : 1;
    var used = true;
    switch (e.key) {
      case 'ArrowLeft':  s.x = r2(s.x - step); break;
      case 'ArrowRight': s.x = r2(s.x + step); break;
      case 'ArrowUp':    s.y = r2(s.y - step); break;
      case 'ArrowDown':  s.y = r2(s.y + step); break;
      case '-': case '_': s.w = r2(Math.max(24, s.w - step)); break;
      case '=': case '+': s.w = r2(s.w + step); break;
      case '[': s.r = r2(s.r - 1); break;
      case ']': s.r = r2(s.r + 1); break;
      case 'f': case 'F': s.z = (s.z || 0) + 1; break;
      case 'b': case 'B': s.z = (s.z || 0) - 1; break;
      default: used = false;
    }
    if (!used) return;
    if (!undo.length || undo[undo.length - 1].k !== sel.dataset.tl) pushUndo(sel.dataset.tl);
    e.preventDefault();
    e.stopPropagation();
    paint(sel);
    readout();
    save();
  }

  // Turn.js turns the page on any click inside the book; swallow those.
  function swallow(e) {
    if (!on) return;
    if (e.target.closest('#tl-bar')) return;
    if (e.target.closest('#magazine')) e.stopPropagation();
  }

  // ------------------------------------------------------------------ export
  function toCSS() {
    var keys = Object.keys(store).filter(function (k) { return store[k]; }).sort(keyOrder);
    var d = box0();
    if (!keys.length || !d) return '/* Nothing laid out yet. */';
    var list = keys.map(function (k) { return '[data-tl="' + k + '"]'; });
    var wrapped = [];
    for (var i = 0; i < list.length; i += 6) {
      wrapped.push('    ' + list.slice(i, i + 6).join(', '));
    }
    var body = wrapped.join(',\n');

    var out = [];
    out.push('/* -----------------------------------------------------------------------');
    out.push('   Frozen travel page layout. Generated by Javascript/travel-layout-editor.js.');
    out.push('   Open Travel.html?layout to move things, then paste the new output here.');
    out.push('');
    out.push('   Everything is placed inside a ' + d.W + ' x ' + d.H + ' design box.');
    out.push('   fitPages() in travelscript.js scales that box to fit the real page, so the');
    out.push('   arrangement holds and only its size follows the viewport.');
    out.push('');
    out.push('   Mobile keeps the flowed, scrolling layout, so this file is desktop only.');
    out.push('----------------------------------------------------------------------- */');
    out.push('@media (min-width: 769px) {');
    out.push('  /* The page content sits in .fit-inner, added by travelscript.js. */');
    out.push('  #magazine .own-size.scrapbook > .fit-inner {');
    out.push('    --tl-w: ' + d.W + ';');
    out.push('    --tl-h: ' + d.H + ';');
    out.push('    position: absolute;');
    out.push('    top: 0;');
    out.push('    left: 0;');
    out.push('    width: ' + d.W + 'px;');
    out.push('    height: ' + d.H + 'px;');
    out.push('    transform-origin: top left;');
    out.push('  }');
    out.push('');
    out.push('  #magazine .scrapbook :is(');
    out.push(body);
    out.push('  ) {');
    out.push('    position: absolute !important;');
    out.push('    float: none !important;');
    out.push('    margin: 0 !important;');
    out.push('    box-sizing: border-box !important;');
    out.push('    max-width: none !important;');
    out.push('    transform: rotate(var(--tl-r, 0deg));');
    out.push('  }');
    out.push('');
    out.push('  /* Keep the hover lift, but do not lose the placed angle. */');
    out.push('  #magazine .scrapbook .tphoto:is(');
    out.push(body);
    out.push('  ):hover {');
    out.push('    transform: rotate(var(--tl-r, 0deg)) scale(1.04);');
    out.push('  }');

    var page = null;
    keys.forEach(function (k) {
      var p = k.split('-')[0];
      if (p !== page) { page = p; out.push(''); out.push('  /* ' + p + ' */'); }
      var s = store[k];
      var decl = 'left: ' + r2(s.x) + 'px !important; top: ' + r2(s.y) +
                 'px !important; width: ' + r2(s.w) + 'px !important; --tl-r: ' + r2(s.r) + 'deg;';
      if (s.z) decl += ' z-index: ' + s.z + ';';
      out.push('  #magazine .scrapbook [data-tl="' + k + '"] { ' + decl + ' }');
    });
    out.push('}');
    return out.join('\n');
  }

  function copyCSS() {
    var text = toCSS();
    var done = function () { flash('CSS copied — paste it into CSS/travel-layout.css'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
    } else { fallback(text, done); }
  }
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-1000px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { flash('Copy failed — use Download instead'); }
    ta.remove();
  }
  function downloadCSS() {
    var blob = new Blob([toCSS()], { type: 'text/css' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'travel-layout.css';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  // ---------------------------------------------------------------- toolbar
  function flash(msg) {
    if (!bar) return;
    var n = bar.querySelector('.tl-msg');
    n.textContent = msg;
    clearTimeout(flash.t);
    flash.t = setTimeout(function () { n.textContent = ''; }, 4000);
  }
  function readout() {
    if (!bar) return;
    try {
      bar.querySelector('.tl-page').textContent = 'page ' + ($('#magazine').turn('page') || 1);
    } catch (e) {}
    var d = design, live = box();
    var fit = d && live ? Math.min(live.W / d.W, live.H / d.H) : 1;
    bar.querySelector('.tl-box').textContent =
      (d ? 'box ' + d.W + '×' + d.H : '') +
      (Math.abs(fit - 1) > 0.005 ? '  @' + Math.round(fit * 100) + '%' : '');
    var n = bar.querySelector('.tl-info');
    if (!sel) { n.textContent = 'nothing selected'; return; }
    var s = store[sel.dataset.tl];
    n.textContent = sel.dataset.tl + '   x ' + r2(s.x) + '   y ' + r2(s.y) +
                    '   w ' + r2(s.w) + '   rot ' + r2(s.r) + '°' +
                    (s.z ? '   z ' + s.z : '');
  }

  function buildBar() {
    bar = document.createElement('div');
    bar.id = 'tl-bar';
    bar.innerHTML =
      '<div class="tl-row">' +
        '<b>layout editor</b>' +
        '<button data-a="prev">&#9664;</button>' +
        '<span class="tl-page">page 1</span>' +
        '<button data-a="next">&#9654;</button>' +
        '<button data-a="copy">Copy CSS</button>' +
        '<button data-a="down">Download</button>' +
        '<button data-a="reset">Reset page</button>' +
        '<button data-a="clear">Clear all</button>' +
        '<button data-a="exit">Exit</button>' +
        '<span class="tl-box"></span>' +
      '</div>' +
      '<div class="tl-row"><span class="tl-info">nothing selected</span></div>' +
      '<div class="tl-row tl-help">drag move &middot; blue resize &middot; orange rotate &middot; ' +
        'arrows nudge &middot; -/= width &middot; [ ] rotate &middot; f/b front-back &middot; ' +
        'shift free &middot; ctrl+z undo</div>' +
      '<div class="tl-row"><span class="tl-msg"></span></div>';
    document.body.appendChild(bar);

    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var a = b.dataset.a;
      if (a === 'prev' || a === 'next') turnPage(a === 'prev' ? 'previous' : 'next');
      else if (a === 'copy') copyCSS();
      else if (a === 'down') downloadCSS();
      else if (a === 'reset') {
        pages().forEach(function (p) { if (visible(p)) resetPage(p); });
        flash('page reset to the flow layout');
      } else if (a === 'clear') {
        if (!confirm('Clear the saved layout for every page?')) return;
        store = {};
        design = null;
        try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(BOX_KEY); } catch (e) {}
        location.reload();
      } else if (a === 'exit') stop();
    });
  }

  function visible(page) {
    return !!(page.clientWidth && page.offsetParent !== null);
  }

  function turnPage(dir) {
    var $m = $('#magazine');
    $m.turn('disable', false);
    try { $m.turn(dir); } catch (e) {}
    setTimeout(function () { $m.turn('disable', true); rescan(); }, 60);
  }

  function scan() {
    if (!on) return;
    pages().forEach(function (p) { if (visible(p)) absolutize(p); });
    readout();
  }
  // A page that is still folding is skipped by absolutize(), so sweep again
  // once the flip has settled.
  function rescan() { scan(); setTimeout(scan, 350); setTimeout(scan, 900); }

  // ------------------------------------------------------------------- style
  function styles() {
    var css = [
      'html.tl-edit #nav-hint { display: none !important; }',
      'html.tl-edit .tphoto { transition: none !important; }',
      'html.tl-edit #magazine .own-size.scrapbook > .fit-inner {',
      '  position: absolute; top: 0; left: 0; right: 0; bottom: 0;',
      '  outline: 1px dashed rgba(255,159,10,.7); }',
      'html.tl-edit [data-tl] { cursor: move; }',
      'html.tl-edit [data-tl]:hover { outline: 1px dashed rgba(10,132,255,.75); outline-offset: 2px; }',
      'html.tl-edit [data-tl].tl-sel { outline: 2px solid #0a84ff; outline-offset: 2px; }',
      'html.tl-dragging, html.tl-dragging * { user-select: none !important; }',
      '.tl-ui { position: absolute; inset: 0; pointer-events: none; z-index: 60; }',
      '.tl-h { position: absolute; width: 15px; height: 15px; border-radius: 50%;',
      '  border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.45); pointer-events: auto; }',
      '.tl-h-size { right: -9px; bottom: -9px; background: #0a84ff; cursor: nwse-resize; }',
      '.tl-h-rot { right: -9px; top: -9px; background: #ff9f0a; cursor: grab; }',
      '#tl-bar { position: fixed; left: 10px; bottom: 10px; z-index: 100000;',
      '  background: rgba(24,24,27,.95); color: #f4f4f5; padding: 9px 12px;',
      '  border-radius: 10px; font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace;',
      '  box-shadow: 0 6px 24px rgba(0,0,0,.4); max-width: 92vw; }',
      '#tl-bar .tl-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }',
      '#tl-bar b { margin-right: 4px; color: #ff9f0a; }',
      '#tl-bar button { font: inherit; background: #3f3f46; color: #f4f4f5; border: 0;',
      '  padding: 3px 9px; border-radius: 6px; cursor: pointer; }',
      '#tl-bar button:hover { background: #52525b; }',
      '#tl-bar .tl-page { min-width: 54px; text-align: center; color: #a1a1aa; }',
      '#tl-bar .tl-box { color: #71717a; margin-left: 4px; }',
      '#tl-bar .tl-info { color: #7ee787; }',
      '#tl-bar .tl-help { color: #a1a1aa; font-size: 11px; }',
      '#tl-bar .tl-msg { color: #ff9f0a; min-height: 16px; }'
    ].join('\n');
    var s = document.createElement('style');
    s.id = 'tl-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ------------------------------------------------------------- start / stop
  function start() {
    if (on) return;
    if (window.innerWidth <= 768) {
      alert('The layout editor is desktop only. Mobile keeps the flowed layout.');
      return;
    }
    on = true;
    document.documentElement.classList.add('tl-edit');   // stops fitPages fighting us
    styles();
    buildBar();

    try { $('#magazine').turn('disable', true); } catch (e) {}
    $('#magazine').bind('turned', rescan);

    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('click', swallow, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);

    rescan();                                            // photos may still be decoding
    flash('editing — arrange the page, then Copy CSS');
  }

  function onResize() { setTimeout(scan, 200); }

  function stop() {
    if (!on) return;
    on = false;
    select(null);
    document.documentElement.classList.remove('tl-edit');
    var s = document.getElementById('tl-style');
    if (s) s.remove();
    if (bar) { bar.remove(); bar = null; }
    pages().forEach(function (p) {
      delete p.dataset.tlDone;
      items(p).forEach(unpaint);
      var inner = innerOf(p);
      if (inner) naturalize(inner);
    });
    document.removeEventListener('pointerdown', onDown, true);
    document.removeEventListener('pointermove', onMove, true);
    document.removeEventListener('pointerup', onUp, true);
    document.removeEventListener('click', swallow, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
    $('#magazine').unbind('turned', rescan);
    try { $('#magazine').turn('disable', false); } catch (e) {}
  }

  window.travelLayoutEditor = {
    start: start,
    stop: stop,
    css: toCSS,
    copy: copyCSS,
    store: function () { return store; },
    design: function () { return design; }
  };

  // Auto-start only when explicitly asked for, so visitors never see this.
  if (/(^|[?&])layout(=|&|$)/.test(location.search) || location.hash === '#layout') {
    if (document.readyState === 'complete') setTimeout(start, 300);
    else window.addEventListener('load', function () { setTimeout(start, 300); });
  }
})();
