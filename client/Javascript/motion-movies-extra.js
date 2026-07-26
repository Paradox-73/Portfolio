/* ---------------------------------------------------------------------------
   motion-movies-extra.js — second pass of Netflix motion for MoviesTV.html.

   motion-movies.js covers the big four (hover dwell, card-to-modal, row arrows,
   rows filling in). This file adds the smaller Netflix behaviours that make the
   rest of the page feel like the same product:

     - the profile picker handing off to the app
     - the search overlay opening, and its results dealing in
     - "More Like This" / "Episodes" crossfading instead of snapping
     - an "Explore All ›" chevron sliding out of a row title on hover
     - press feedback on the billboard buttons

   Self-contained on purpose. It injects its own stylesheet rather than
   appending to moviestvstyle.css, so deleting the one <script> tag that loads
   this file removes the entire feature with nothing left behind.

   Nothing in motion-movies.js is modified or replaced — the two run alongside
   each other and touch different things.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  var CSS = [
    /* Netflix puts a chevron on any row title that leads somewhere. Only rows
       whose header is actually clickable get one. */
    '.mt-explore{',
    '  display:inline-flex;align-items:center;gap:.25rem;',
    '  font-size:.85rem;color:#54b9c5;vertical-align:middle;',
    '  margin-left:.6rem;opacity:0;transform:translateX(-8px);',
    '  transition:opacity .28s ease,transform .28s ease;',
    '  pointer-events:none;white-space:nowrap;font-weight:500;',
    '}',
    '.row-container:hover .mt-explore{opacity:1;transform:translateX(0);}'
  ].join('\n');

  /* GSAP drives the overlay; the stylesheet's own fade would double up. Applied
     only when this file is actually animating, so reduced-motion visitors keep
     the original CSS behaviour rather than an overlay nothing controls. */
  var CSS_ANIMATED = 'html.mt-js .search-overlay{transition:none;}';

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M) return;

    var style = document.createElement('style');
    style.id = 'mt-movies-extra';
    style.textContent = CSS;
    document.head.appendChild(style);

    if (M.skip) return;
    style.textContent = CSS + '\n' + CSS_ANIMATED;

    /* --- profile picker -> app ------------------------------------------- */

    // startApp swaps two full-screen layers with a class toggle. Netflix fades
    // the profile away and lifts the app in behind it.
    M.wrap('startApp', function (original) {
      var layer = document.getElementById('profileLayer');
      var app = document.getElementById('app');

      var result = original();

      if (layer) {
        // The class already hid it; re-show for the length of the fade only.
        layer.classList.remove('hidden');
        gsap.to(layer, {
          opacity: 0,
          scale: 1.08,
          duration: 0.45,
          ease: 'power2.in',
          onComplete: function () {
            layer.classList.add('hidden');
            gsap.set(layer, { clearProps: 'opacity,transform' });
          }
        });
      }

      if (app) {
        gsap.fromTo(app, { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'opacity' });
      }

      return result;
    });

    /* --- search overlay ---------------------------------------------------- */

    var overlay = document.getElementById('searchOverlay');
    var searchBox = overlay && overlay.querySelector('.search-container');

    M.wrap('openSearch', function (original) {
      original();
      if (!overlay) return;
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      if (searchBox) {
        gsap.fromTo(searchBox, { y: -26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', clearProps: 'transform,opacity' });
      }
    });

    M.wrap('closeSearch', function (original) {
      if (!overlay) return original();
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: function () {
          original();
          gsap.set(overlay, { clearProps: 'opacity' });
        }
      });
    });

    // Results are rebuilt on every keystroke, so the stagger is kept short —
    // a long one would still be running when the next keystroke lands.
    var searchGrid = document.getElementById('searchGrid');
    if (searchGrid) {
      var searchPending = null;
      new MutationObserver(function () {
        clearTimeout(searchPending);
        searchPending = setTimeout(function () {
          var cards = searchGrid.children;
          if (!cards.length) return;
          gsap.fromTo(cards, { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out',
              stagger: { amount: 0.25 }, clearProps: 'transform,opacity' });
        }, 20);
      }).observe(searchGrid, { childList: true });
    }

    /* --- modal tabs --------------------------------------------------------- */

    // switchTab toggles .hidden on the two grids. Crossfading the one being
    // shown stops the modal from jumping as the panels swap.
    M.wrap('switchTab', function (original, args) {
      original();
      var target = args[0] === 'EPISODES'
        ? document.getElementById('episodesGrid')
        : document.getElementById('mltGrid');
      if (!target || target.classList.contains('hidden')) return;

      gsap.fromTo(target, { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' });
    });

    // Both grids are filled asynchronously after the modal opens.
    ['mltGrid', 'episodesGrid'].forEach(function (id) {
      var grid = document.getElementById(id);
      if (!grid) return;
      var pending = null;

      new MutationObserver(function () {
        clearTimeout(pending);
        pending = setTimeout(function () {
          if (grid.classList.contains('hidden') || !grid.children.length) return;
          gsap.fromTo(grid.children, { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
              stagger: { amount: 0.35 }, clearProps: 'transform,opacity' });
        }, 20);
      }).observe(grid, { childList: true });
    });

    /* --- row titles --------------------------------------------------------- */

    // Only rows whose title navigates somewhere get the chevron — the
    // recommendation rows are not clickable and would be lying about it.
    M.toArray('.row-header').forEach(function (header) {
      if (!header.getAttribute('onclick')) return;
      if (header.querySelector('.mt-explore')) return;

      var tag = document.createElement('span');
      tag.className = 'mt-explore';
      tag.textContent = 'Explore All ›';
      header.appendChild(tag);
    });

    /* --- button feedback ----------------------------------------------------- */

    // A button that visibly gives under the cursor reads as a real control.
    document.addEventListener('pointerdown', function (e) {
      var btn = e.target.closest && e.target.closest('.btn, .icon-btn, .tab-btn');
      if (!btn) return;
      gsap.to(btn, { scale: 0.94, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
    });

    document.addEventListener('pointerup', function () {
      var pressed = M.toArray('.btn, .icon-btn, .tab-btn');
      gsap.to(pressed, { scale: 1, duration: 0.24, ease: 'back.out(2.5)', overwrite: 'auto' });
    });
  });
})();
