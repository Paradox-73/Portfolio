/* ---------------------------------------------------------------------------
   motion.js — the small shared vocabulary the per-page motion scripts build on.

   Loaded after GSAP (plus ScrollTrigger where a page reveals on scroll). Every
   helper degrades to "do the un-animated thing immediately" when GSAP is missing
   or the visitor asked for reduced motion, so a CDN failure can never leave the
   page in a half-hidden state.

   Usage:  <script src=".../gsap.min.js"></script>
           <script src=".../ScrollTrigger.min.js"></script>   (optional)
           <script src="Javascript/motion.js"></script>
           <script src="Javascript/motion-<page>.js"></script>
--------------------------------------------------------------------------- */

window.Motion = (function () {
  'use strict';

  var hasGsap = typeof window.gsap !== 'undefined';
  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marks the document as JS-capable so motion.css is allowed to hide
  // .mt-reveal elements. Set as early as possible to avoid a flash.
  document.documentElement.classList.add('mt-js');

  if (hasGsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    // A hidden tab freezes rAF; without this, long-paused timelines jump on return.
    gsap.ticker.lagSmoothing(500, 33);
  }

  /* --- internals --------------------------------------------------------- */

  // Accepts a selector, a single node, a NodeList or an array. Always returns
  // a real array so callers can use .length / .forEach without thinking.
  function toArray(targets) {
    if (!targets) return [];
    if (typeof targets === 'string') {
      return Array.prototype.slice.call(document.querySelectorAll(targets));
    }
    if (targets.nodeType) return [targets];
    return Array.prototype.slice.call(targets);
  }

  /**
   * Safety net for reveal-on-scroll.
   *
   * ScrollTrigger only fires onEnter when an element actually crosses the start
   * line during a scroll. A jump — browser scroll restoration on reload, an
   * anchor link, a hard flick on a trackpad — can relocate the viewport without
   * ever crossing those lines, stranding content at opacity 0. Verified: jumping
   * straight to y=1600 on the Food menu left every item below the fold hidden.
   *
   * So on each scroll frame, anything still untouched gets resolved by position:
   * fully above the viewport is snapped visible (it is off-screen, nothing to
   * animate), and anything now past the start line is handed to the normal
   * reveal. Elements GSAP is already tweening are skipped, so this never
   * double-fires against the batch. The pending list drains to empty and the
   * listener removes itself.
   */
  function catchUp(els, run, startRatio) {
    var pending = els.slice();
    var running = false;
    var until = 0;

    function sweep() {
      var late = [];

      pending = pending.filter(function (el) {
        // Already revealed, or a reveal tween has started moving it.
        if (Number(gsap.getProperty(el, 'opacity')) !== 0) return false;
        // Queued to animate but not yet stepped — leave it for a later frame.
        if (gsap.isTweening(el)) return true;

        var rect = el.getBoundingClientRect();
        if (rect.bottom <= 0) {
          gsap.set(el, { opacity: 1, clearProps: 'transform,willChange' });
          el.classList.remove('mt-reveal');
          return false;
        }
        if (rect.top < window.innerHeight * startRatio) {
          late.push(el);
          return false;
        }
        return true;
      });

      if (late.length) run(late);
    }

    // A single sweep per scroll event is not enough: one programmatic jump fires
    // exactly one scroll event, and at that instant ScrollTrigger has not run its
    // own rAF update yet, so the sweep sees elements that look mid-tween and
    // defers them — with no further scroll, they were never revisited. Sweeping
    // across a short window after each scroll gives both mechanisms time to land.
    function tick() {
      sweep();
      if (!pending.length) { running = false; return; }
      if (performance.now() > until) { running = false; return; }
      requestAnimationFrame(tick);
    }

    function onScroll() {
      until = performance.now() + 700;
      if (running) return;
      running = true;
      requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Covers a page that loads already scrolled (browser scroll restoration).
    onScroll();

    /* Watchdog.
     *
     * Everything above is driven by requestAnimationFrame, and so is GSAP's
     * ticker. If rAF never fires — a background tab, some power-saving and
     * accessibility modes — tweens sit at progress 0 and the elements they own
     * stay at opacity 0. That is invisible content, which is a far worse failure
     * than a missing animation.
     *
     * This runs on setTimeout instead, which is throttled but never stopped, and
     * force-shows anything that has been inside the viewport across two
     * consecutive checks while still fully transparent. A healthy reveal takes
     * about a second, so a normal tween always finishes first.
     */
    var stalled = new WeakSet();

    var guard = setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      if (!pending.length) { clearInterval(guard); return; }

      pending = pending.filter(function (el) {
        if (Number(gsap.getProperty(el, 'opacity')) !== 0) return false;

        var rect = el.getBoundingClientRect();
        var onScreen = rect.top < window.innerHeight && rect.bottom > 0;
        if (!onScreen) { stalled.delete(el); return true; }

        if (!stalled.has(el)) { stalled.add(el); return true; }   // first sighting

        gsap.killTweensOf(el);
        gsap.set(el, { opacity: 1, clearProps: 'transform,willChange' });
        el.classList.remove('mt-reveal');
        return false;
      });
    }, 2000);
  }

  // The un-animated end state: make it visible, drop the marker class.
  function settle(els) {
    els.forEach(function (el) {
      el.classList.remove('mt-reveal');
      el.style.opacity = '';
      el.style.transform = '';
      el.style.willChange = '';
    });
  }

  /* --- public API -------------------------------------------------------- */

  var api = {
    /** True when animation should be skipped (reduced-motion or no GSAP). */
    get skip() { return reduced || !hasGsap; },

    reduced: reduced,
    hasGsap: hasGsap,
    toArray: toArray,

    /**
     * Reveal elements as they scroll into view.
     *
     * Elements are expected to carry .mt-reveal (see motion.css) so they start
     * hidden. Uses ScrollTrigger.batch when available — it groups elements that
     * enter together into one staggered tween, which is what makes a menu
     * section feel like it arrives as a unit rather than as N separate items.
     * Falls back to IntersectionObserver, then to "just show it".
     *
     * @param {*} targets
     * @param {Object} [opts] y, x, scale, duration, stagger, ease, start, once
     */
    reveal: function (targets, opts) {
      var els = toArray(targets);
      if (!els.length) return;

      opts = opts || {};
      if (this.skip) { settle(els); return; }

      var from = {
        opacity: 0,
        y: opts.y === undefined ? 26 : opts.y,
        x: opts.x || 0,
        scale: opts.scale === undefined ? 1 : opts.scale
      };
      var to = {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: opts.duration || 0.7,
        ease: opts.ease || 'power3.out',
        // `amount` spreads the whole batch over a fixed window rather than
        // adding a fixed delay per element. A per-element stagger is fine for 4
        // items and unusable for 20 — the Food menu batched 13 items into a
        // 2.4s reveal, so content was still trickling in seconds after arriving.
        stagger: opts.stagger === undefined ? { amount: 0.4 } : opts.stagger,
        clearProps: 'transform,opacity,willChange'
      };
      var start = opts.start || 'top 88%';

      // Hide synchronously at call time rather than relying on the .mt-reveal
      // class in markup. These scripts run at the end of <body>, so this lands
      // before first paint and saves hand-tagging every element in the HTML.
      gsap.set(els, { opacity: 0 });

      function run(batch) {
        batch.forEach(function (el) { el.classList.remove('mt-reveal'); });
        gsap.fromTo(batch, from, to);
      }

      if (window.ScrollTrigger && ScrollTrigger.batch) {
        ScrollTrigger.batch(els, {
          start: start,
          once: opts.once !== false,
          onEnter: run
        });
        // Same threshold as `start` ("top 88%" -> 0.88 of the viewport height).
        var pct = /(\d+(?:\.\d+)?)%/.exec(start);
        catchUp(els, run, pct ? Number(pct[1]) / 100 : 0.88);
        return;
      }

      if (!('IntersectionObserver' in window)) { settle(els); return; }

      var io = new IntersectionObserver(function (entries) {
        var hit = entries.filter(function (e) { return e.isIntersecting; })
                         .map(function (e) { return e.target; });
        if (!hit.length) return;
        run(hit);
        hit.forEach(function (el) { io.unobserve(el); });
      }, { rootMargin: '0px 0px -12% 0px' });

      els.forEach(function (el) { io.observe(el); });
    },

    /**
     * Play a one-shot entrance now, without waiting for scroll. For content
     * that is already on screen when the page loads (headers, hero rows).
     */
    enter: function (targets, opts) {
      var els = toArray(targets);
      if (!els.length) return null;

      opts = opts || {};
      if (this.skip) { settle(els); return null; }

      els.forEach(function (el) { el.classList.remove('mt-reveal'); });
      return gsap.fromTo(els, {
        opacity: 0,
        y: opts.y === undefined ? 18 : opts.y,
        scale: opts.scale === undefined ? 1 : opts.scale
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: opts.duration || 0.6,
        ease: opts.ease || 'power3.out',
        stagger: opts.stagger === undefined ? 0.05 : opts.stagger,
        delay: opts.delay || 0,
        clearProps: 'transform,opacity,willChange'
      });
    },

    /**
     * Count a number up. Used for the Food bill and the Games/Movies counts —
     * a number that ticks reads as "computed", a number that appears reads as
     * "hard-coded".
     */
    countUp: function (el, to, opts) {
      if (!el) return;
      opts = opts || {};
      var format = opts.format || function (v) { return Math.round(v); };

      if (this.skip) { el.textContent = format(to); return; }

      var proxy = { v: opts.from || 0 };
      gsap.to(proxy, {
        v: to,
        duration: opts.duration || 0.9,
        ease: opts.ease || 'power2.out',
        onUpdate: function () { el.textContent = format(proxy.v); }
      });
    },

    /**
     * Draw an SVG stroke on, by animating stroke-dashoffset from its own length
     * down to zero. Works on any <path>/<line>/<polyline> with a stroke.
     */
    drawSVG: function (targets, opts) {
      var paths = toArray(targets).filter(function (p) {
        return typeof p.getTotalLength === 'function';
      });
      if (!paths.length) return null;

      opts = opts || {};
      if (this.skip) {
        paths.forEach(function (p) {
          p.style.strokeDasharray = '';
          p.style.strokeDashoffset = '';
        });
        return null;
      }

      paths.forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len + ' ' + len;
        p.style.strokeDashoffset = len;
      });

      return gsap.to(paths, {
        strokeDashoffset: 0,
        duration: opts.duration || 0.8,
        ease: opts.ease || 'power2.inOut',
        stagger: opts.stagger === undefined ? 0.12 : opts.stagger,
        delay: opts.delay || 0
      });
    },

    /**
     * Wraps an existing global function so extra behaviour runs around it.
     * The themed pages keep their logic in large scripts with global entry
     * points (openApp, minimizeWindow, ...); wrapping lets the motion layer stay
     * a separate additive file instead of threading tweens through that code.
     *
     * @param {string} name     global function name
     * @param {Function} wrapper receives (original, args) and must call original
     * @returns {boolean} false when the global does not exist
     */
    wrap: function (name, wrapper) {
      var original = window[name];
      if (typeof original !== 'function') return false;
      window[name] = function () {
        var args = Array.prototype.slice.call(arguments);
        var self = this;
        return wrapper.call(self, function () {
          return original.apply(self, arguments.length ? arguments : args);
        }, args);
      };
      return true;
    },

    /**
     * Runs `fn` once `test()` returns true, polling on rAF up to `timeout` ms.
     * The data-driven pages build their DOM after a fetch, so motion setup has
     * to wait for nodes that do not exist at DOMContentLoaded.
     */
    whenReady: function (test, fn, timeout) {
      var deadline = performance.now() + (timeout || 8000);
      (function poll() {
        var result;
        try { result = test(); } catch (e) { result = false; }
        if (result) { fn(result); return; }
        if (performance.now() > deadline) return;
        requestAnimationFrame(poll);
      })();
    },

    /**
     * Fires `fn(addedNodes)` whenever nodes are appended under `root`, throttled
     * to one call per frame. Used to animate list items that arrive from an API
     * after the initial render.
     */
    onAppend: function (root, fn) {
      if (!root || !window.MutationObserver) return null;
      var queued = false;
      var mo = new MutationObserver(function (records) {
        var added = [];
        records.forEach(function (r) {
          Array.prototype.forEach.call(r.addedNodes, function (n) {
            if (n.nodeType === 1) added.push(n);
          });
        });
        if (!added.length || queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; fn(added); });
      });
      mo.observe(root, { childList: true, subtree: true });
      return mo;
    }
  };

  return api;
})();
