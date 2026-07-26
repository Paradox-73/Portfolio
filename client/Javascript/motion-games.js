/* ---------------------------------------------------------------------------
   motion-games.js — console-dashboard motion for Games.html.

   What makes a PS5/Steam dashboard feel like one is mostly background work:
   the hero art behind the carousel drifts slowly and crossfades when the
   selection changes, the selected tile snaps on with a slight overshoot, the
   detail panel rises from the bottom with its metadata arriving in sequence,
   and re-sorting the library re-deals it rather than swapping it.

   gamescript.js is wrapped in an IIFE and exposes no globals, so unlike the
   other pages there is nothing to wrap. Everything here is driven by observing
   the DOM that script produces: the .active class on a tile, the src on the
   background image, the display flag on the detail overlay, and the library
   grid being rebuilt.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M || M.skip) return;

    /* --- hero background --------------------------------------------------- */

    var bg = document.getElementById('dynamic-bg-img');

    if (bg) {
      // Slow drift. A still background reads as a screenshot; console shells
      // keep the art barely moving so the screen feels live. Long and linear so
      // it is never the thing you notice.
      gsap.to(bg, {
        scale: 1.09,
        duration: 24,
        ease: 'none',
        repeat: -1,
        yoyo: true
      });

      // Crossfade on artwork change. The stylesheet already fades opacity, but
      // it fades to the new image only after the src swap has landed, so a
      // pop is visible. Easing the scale alongside it hides the swap.
      var lastSrc = bg.getAttribute('src');
      new MutationObserver(function () {
        var src = bg.getAttribute('src');
        if (src === lastSrc || !src) return;
        lastSrc = src;
        gsap.fromTo(bg, { scale: 1.16 }, {
          scale: 1.09,
          duration: 1.6,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: function () {
            // Hand back to the endless drift.
            gsap.to(bg, { scale: 1.09, duration: 24, ease: 'none', repeat: -1, yoyo: true });
          }
        });
      }).observe(bg, { attributes: true, attributeFilter: ['src'] });
    }

    /* --- carousel selection ------------------------------------------------- */

    var carousel = document.getElementById('carousel-container');

    if (carousel) {
      var active = null;

      function applySelection() {
        var next = carousel.querySelector('.game-item.active');
        if (next === active) return;

        if (active) {
          gsap.to(active, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        }

        active = next;
        if (!active) return;

        // back.out gives the small overshoot that makes the tile feel caught
        // rather than resized.
        gsap.fromTo(active,
          { scale: 1.05, y: 0 },
          { scale: 1.25, y: -4, duration: 0.42, ease: 'back.out(2)', overwrite: 'auto' });
      }

      // The class moves between tiles, and moveLeft/moveRight also reorder the
      // children, so both attribute and childList changes matter.
      new MutationObserver(applySelection).observe(carousel, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
      });

      applySelection();
    }

    /* --- info panel --------------------------------------------------------- */

    // The title and tagline are rewritten in place as the selection moves.
    var logo = document.getElementById('game-logo');
    var info = document.getElementById('game-info');

    if (logo && info) {
      var lastLogo = logo.textContent;
      new MutationObserver(function () {
        if (logo.textContent === lastLogo) return;
        lastLogo = logo.textContent;
        gsap.fromTo(info,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform' });
      }).observe(logo, { childList: true, characterData: true, subtree: true });
    }

    /* --- detail overlay ------------------------------------------------------ */

    // Rises from the bottom, with the art scaling in and the text following, so
    // the panel assembles instead of appearing.
    var overlay = document.getElementById('detail-overlay');
    var panel = overlay && overlay.querySelector('.detail-content');

    if (overlay && panel) {
      var overlayOpen = false;

      new MutationObserver(function () {
        var showing = window.getComputedStyle(overlay).display !== 'none';
        if (showing === overlayOpen) return;
        overlayOpen = showing;
        if (!showing) return;

        var img = overlay.querySelector('#detail-img');
        var rows = overlay.querySelectorAll('#detail-title, #detail-desc, .play-btn');

        var tl = gsap.timeline();
        tl.fromTo(panel, { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform' }, 0);

        if (img) {
          tl.fromTo(img, { scale: 0.88, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform,opacity' }, 0.05);
        }

        if (rows.length) {
          tl.fromTo(rows, { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out',
              stagger: { amount: 0.25 }, clearProps: 'transform,opacity' }, 0.15);
        }
      }).observe(overlay, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    /* --- library grid --------------------------------------------------------- */

    // renderLibrary() empties the grid and rebuilds it on every sort change.
    // Dealing the cards back out makes a re-sort legible — you can see that the
    // set was reordered rather than replaced.
    var grid = document.getElementById('library-grid');

    if (grid) {
      var pending = null;

      new MutationObserver(function () {
        // Coalesce: the rebuild appends many cards in one synchronous pass, and
        // one stagger across the whole batch beats one tween per card.
        clearTimeout(pending);
        pending = setTimeout(function () {
          var cards = grid.querySelectorAll('.lib-card');
          if (!cards.length) return;
          gsap.fromTo(cards,
            { opacity: 0, y: 22, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out',
              stagger: { amount: 0.5, from: 'start' },
              clearProps: 'transform,opacity' });
        }, 20);
      }).observe(grid, { childList: true });
    }
  });
})();
