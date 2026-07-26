/* ---------------------------------------------------------------------------
   motion-movies.js — Netflix-accurate motion for MoviesTV.html.

   The page already looked like Netflix; it did not yet move like it. Four
   behaviours carry most of that difference:

     1. Hover expansion is deliberate, not instant. Netflix waits about a third
        of a second, then grows the card while the rest of the row slides aside
        so nothing overlaps. Skimming a row with the mouse therefore stays calm
        instead of firing a scale on every card you cross.
     2. The details modal grows out of the card you clicked, rather than
        appearing over it.
     3. Row arrows glide with a real ease curve instead of the browser's
        built-in smooth scroll.
     4. Rows populate with a stagger as their data arrives.

   Additive: moviestvscript.js is untouched. Its global entry points are wrapped
   and its DOM changes are observed.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  var HOVER_DELAY = 350;   // ms before a card expands — the Netflix "dwell"
  var HOVER_SCALE = 1.42;

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M) return;

    // Card expansion is a pointer affordance. On touch there is no hover state
    // to dwell in, and growing a card would only fight the scroll.
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* --- card hover ------------------------------------------------------ */

    var hoverTimer = null;
    var lifted = null;

    // Cards sit in a horizontally scrolling flex track. Scaling from the centre
    // clips the ones at either edge, so the growth is anchored to whichever
    // edge the card is against — exactly what Netflix does at the ends of a row.
    function originFor(card, track) {
      if (!track) return '50% 50%';
      var c = card.getBoundingClientRect();
      var t = track.getBoundingClientRect();
      if (c.left - t.left < c.width * 0.5) return '0% 50%';
      if (t.right - c.right < c.width * 0.5) return '100% 50%';
      return '50% 50%';
    }

    function lift(card) {
      var track = card.closest('.slider-track');
      var origin = originFor(card, track);

      card.classList.add('mt-lifted');
      gsap.to(card, {
        scale: HOVER_SCALE,
        zIndex: 100,
        transformOrigin: origin,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Push the rest of the row out of the way. Without this the expanded card
      // simply covers its neighbours, which is the tell that it is a CSS scale
      // and not Netflix. Only rows do this — the grid wraps onto several lines,
      // so a horizontal shove there would displace unrelated cards.
      if (!track) return;

      var siblings = Array.prototype.slice.call(track.children);
      var index = siblings.indexOf(card);
      var shift = card.offsetWidth * (HOVER_SCALE - 1) / 2;

      // An edge-anchored card grows in one direction only, so the row is pushed
      // that way and not split around it.
      var left = origin === '0% 50%' ? 0 : shift;
      var right = origin === '100% 50%' ? 0 : shift;

      siblings.forEach(function (sib, i) {
        if (i === index) return;
        gsap.to(sib, {
          x: i < index ? -left : right,
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    }

    function drop(card) {
      if (!card) return;
      card.classList.remove('mt-lifted');
      gsap.to(card, {
        scale: 1,
        duration: 0.34,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: function () { gsap.set(card, { zIndex: 1 }); }
      });

      var track = card.closest('.slider-track');
      if (!track) return;
      gsap.to(Array.prototype.slice.call(track.children), {
        x: 0,
        duration: 0.34,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }

    if (canHover && !M.skip) {
      // Delegated, so cards created later by the API render need no extra wiring.
      document.addEventListener('mouseover', function (e) {
        var card = e.target.closest && e.target.closest('.movie-box, .grid-card');
        if (!card || card.classList.contains('skeleton') || card === lifted) return;

        clearTimeout(hoverTimer);
        if (lifted) { drop(lifted); lifted = null; }

        hoverTimer = setTimeout(function () {
          lifted = card;
          lift(card);
        }, HOVER_DELAY);
      });

      document.addEventListener('mouseout', function (e) {
        var card = e.target.closest && e.target.closest('.movie-box, .grid-card');
        if (!card) return;
        // Ignore moves between a card and its own children.
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;

        clearTimeout(hoverTimer);
        if (lifted === card) { drop(card); lifted = null; }
      });

      // A row that scrolls out from under an expanded card would leave it
      // stranded at 1.42x.
      document.addEventListener('scroll', function () {
        clearTimeout(hoverTimer);
        if (lifted) { drop(lifted); lifted = null; }
      }, true);
    }

    /* --- row arrows ------------------------------------------------------ */

    // The original used scrollBy({behavior:'smooth'}), whose easing the page
    // cannot control. Tweening scrollLeft gives the decisive glide Netflix uses.
    if (!M.skip) {
      M.wrap('scrollRow', function (original, args) {
        var track = document.getElementById(args[0]);
        if (!track) return original();

        var step = track.clientWidth * 0.82;
        var target = track.scrollLeft + args[1] * step;
        var max = track.scrollWidth - track.clientWidth;

        gsap.to(track, {
          scrollLeft: Math.max(0, Math.min(max, target)),
          duration: 0.72,
          ease: 'power3.inOut',
          overwrite: true
        });
      });
    }

    /* --- rows filling in -------------------------------------------------- */

    // Rows are populated from the API after first paint. Fading each batch in
    // stops finished rows from snapping into place one at a time.
    var content = document.querySelector('.main-content');
    if (content && !M.skip) {
      M.onAppend(content, function (added) {
        var cards = added.filter(function (n) {
          return n.classList && n.classList.contains('movie-box') &&
                 !n.classList.contains('skeleton');
        });
        if (!cards.length) return;
        gsap.fromTo(cards,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out',
            stagger: { amount: 0.35 }, clearProps: 'opacity,transform' });
      });
    }

    /* --- grid view -------------------------------------------------------- */

    // showGrid swaps two full-page views with a class toggle. Sliding the new
    // one up, and counting the total rather than printing it, makes the switch
    // read as a transition instead of a page replacement.
    M.wrap('showGrid', function (original) {
      original();
      if (M.skip) return;

      var grid = document.getElementById('gridView');
      if (grid) {
        gsap.fromTo(grid, { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'opacity,transform' });
      }

      var count = document.getElementById('gridCount');
      if (count) {
        var total = parseInt(String(count.innerText).replace(/\D/g, ''), 10);
        if (!isNaN(total)) {
          M.countUp(count, total, {
            duration: 0.8,
            format: function (v) { return '(' + Math.round(v) + ')'; }
          });
        }
      }
    });

    M.wrap('showHome', function (original) {
      original();
      if (M.skip) return;
      var home = document.getElementById('homeView');
      if (home) {
        gsap.fromTo(home, { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' });
      }
    });

    /* --- billboard -------------------------------------------------------- */

    // The billboard rotates through five titles. Swapping the text in place is
    // jarring; Netflix crossfades the whole info block.
    var bbTitle = document.getElementById('bbTitle');
    var bbInfo = document.querySelector('.billboard-info');

    if (bbTitle && bbInfo && !M.skip) {
      var lastTitle = bbTitle.textContent;
      new MutationObserver(function () {
        if (bbTitle.textContent === lastTitle) return;
        lastTitle = bbTitle.textContent;
        gsap.fromTo(bbInfo, { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'opacity,transform' });
      }).observe(bbTitle, { childList: true, characterData: true, subtree: true });
    }

    /* --- details modal ---------------------------------------------------- */

    var modal = document.getElementById('detailModal');
    var panel = modal && modal.querySelector('.modal-content');
    if (!modal || !panel || M.skip) return;

    var origin = null;
    var originAt = 0;

    document.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('.movie-box, .grid-card, .mlt-card');
      if (!card) return;
      origin = card.getBoundingClientRect();
      originAt = performance.now();
    }, true);

    var internal = false;
    var isOpen = false;

    function setDisplay(value) {
      internal = true;
      modal.style.display = value;
    }

    function animateIn() {
      var rect = panel.getBoundingClientRect();

      // openDetails awaits a TMDB round-trip before showing the modal. If that
      // took a while, the card is no longer what the visitor is looking at, so
      // growing from its position would read as arbitrary — fall back to a
      // straight scale-up from centre.
      var fresh = origin && (performance.now() - originAt) < 1500;
      var dx = 0, dy = 0, scale = 0.9;

      if (fresh) {
        dx = (origin.left + origin.width / 2) - (rect.left + rect.width / 2);
        dy = (origin.top + origin.height / 2) - (rect.top + rect.height / 2);
        scale = Math.max(0.18, origin.width / Math.max(rect.width, 1));
      }

      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(panel,
        { x: dx, y: dy, scale: scale, opacity: fresh ? 1 : 0, transformOrigin: '50% 50%' },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }

    function animateOut(done) {
      gsap.to(modal, { opacity: 0, duration: 0.22, ease: 'power2.in' });
      gsap.to(panel, {
        scale: 0.94,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: function () {
          // Explicit list — `display` belongs to moviestvscript.js.
          gsap.set([modal, panel], { clearProps: 'opacity,transform' });
          done();
        }
      });
    }

    new MutationObserver(function () {
      if (internal) { internal = false; return; }

      var display = modal.style.display;

      if (display === 'flex' && !isOpen) {
        isOpen = true;
        animateIn();
      } else if (display === 'none' && isOpen) {
        setDisplay('flex');
        animateOut(function () {
          setDisplay('none');
          isOpen = false;
        });
      }
    }).observe(modal, { attributes: true, attributeFilter: ['style'] });
  });
})();
