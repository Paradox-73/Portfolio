/* ---------------------------------------------------------------------------
   motion-music.js — motion for the record-collection page.

   Music.html was the one page I skipped in the first pass, because it was the
   only one already using GSAP. That was the wrong call: musicscript.js animates
   the turntable — the crate, the vinyl, the tonearm — and nothing else. Every
   section below the turntable (Top Artists, the queue, the archive, Last.fm)
   still appeared fully formed with no motion at all.

   This file animates that half, in the same analogue idiom the page already
   uses: the queue loads a bar at a time like a tracklist being read in, the
   archive tiles come in from the top-left the way a grid of sleeves fills, and
   artists fade up as you reach them.

   The turntable is deliberately untouched — musicscript.js owns it, and two
   scripts tweening the same vinyl would fight.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M) return;

    var style = document.createElement('style');
    style.id = 'mt-music';
    style.textContent = [
      /* The nav items are staggered in by JS, so their own transition would
         double up on the first frame. */
      'html.mt-js .nav-menu.active .nav-item{transition:color .2s ease;}'
    ].join('\n');
    document.head.appendChild(style);

    if (M.skip) return;

    /* --- masthead ---------------------------------------------------------- */

    M.enter('header .max-w-7xl > div', { y: -14, duration: 0.6, stagger: 0.08 });

    /* --- section headings --------------------------------------------------- */

    // Each section is titled by an h2 inside a bordered header row. Revealing
    // the row as it arrives gives the long scroll some rhythm.
    M.reveal('h2.text-4xl, h2.text-3xl', { y: 22, duration: 0.6 });
    M.reveal('.handwriting', { y: 14, duration: 0.6 });

    /* --- top artists --------------------------------------------------------- */

    // Injected after the Spotify data resolves, and re-injected on every sort
    // change, so this watches the container rather than running once.
    dealInto('artists-grid', function (children) {
      gsap.fromTo(children, { opacity: 0, y: 26, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out',
          stagger: { amount: 0.5, grid: 'auto', from: 'start' },
          clearProps: 'transform,opacity' });
    });

    /* --- now playing queue ---------------------------------------------------- */

    // Bars slide in from the left in sequence — a tracklist being loaded in
    // order, which is what the section is pretending to be.
    dealInto('tracks-queue', function (children) {
      gsap.fromTo(children, { opacity: 0, x: -28 },
        { opacity: 1, x: 0, duration: 0.42, ease: 'power3.out',
          stagger: { amount: 0.55 }, clearProps: 'transform,opacity' });
    });

    /* --- recently scrobbled ---------------------------------------------------- */

    dealInto('lastfm-tracks', function (children) {
      gsap.fromTo(children, { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out',
          stagger: { amount: 0.45 }, clearProps: 'transform,opacity' });
    });

    /* --- the archive ------------------------------------------------------------ */

    // A dense tile grid. `grid: auto` staggers diagonally from the top-left
    // corner rather than in DOM order, so the sleeves fill the wall the way a
    // shelf does instead of racing along row by row.
    dealInto('album-grid', function (children) {
      gsap.fromTo(children, { opacity: 0, scale: 0.86 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out',
          stagger: { amount: 0.8, grid: 'auto', from: 'start' },
          clearProps: 'transform,opacity' });
    });

    /* --- tracklist nav ----------------------------------------------------------- */

    // The nav is a "tracklist"; its entries should read in as one.
    var navMenu = document.getElementById('nav-menu');

    if (navMenu) {
      var navOpen = false;
      new MutationObserver(function () {
        var open = navMenu.classList.contains('active');
        if (open === navOpen) return;
        navOpen = open;
        if (!open) return;

        var items = navMenu.querySelectorAll('.nav-item');
        if (!items.length) return;
        gsap.fromTo(items, { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.32, ease: 'power2.out',
            stagger: { amount: 0.28 }, clearProps: 'transform,opacity' });
      }).observe(navMenu, { attributes: true, attributeFilter: ['class'] });
    }

    /* --- helper -------------------------------------------------------------------- */

    /**
     * Runs `play` with a container's children whenever that container is
     * rebuilt. Every list on this page is filled asynchronously and then
     * replaced wholesale on sort, so a one-shot reveal would only ever catch
     * the first render. The timeout coalesces one rebuild's many appends into
     * a single staggered tween.
     */
    function dealInto(id, play) {
      var box = document.getElementById(id);
      if (!box) return;

      var pending = null;
      new MutationObserver(function () {
        clearTimeout(pending);
        pending = setTimeout(function () {
          if (!box.children.length) return;
          play(box.children);
        }, 30);
      }).observe(box, { childList: true });

      // Covers a container that was already populated before this ran.
      if (box.children.length) play(box.children);
    }
  });
})();
