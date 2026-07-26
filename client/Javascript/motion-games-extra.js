/* ---------------------------------------------------------------------------
   motion-games-extra.js — second pass of console-dashboard motion for Games.html.

   motion-games.js handles the hero art, the carousel selection, the detail
   panel and the library. This file covers the shell around them:

     - the "Press Spacebar" intro handing off to the dashboard
     - a single underline that slides between the Games / Library / Wishlist
       tabs instead of one appearing under each
     - the settings drawer's contents arriving after the drawer does
     - search results dealing in
     - the input and alert modals scaling up rather than blinking on
     - press feedback on the Play button

   Self-contained on purpose. It injects its own stylesheet rather than
   appending to gamestyle.css, so deleting the one <script> tag that loads this
   file removes the entire feature with nothing left behind.

   Nothing in motion-games.js is modified or replaced — the two run alongside
   each other and touch different things.

   As with motion-games.js, gamescript.js exposes no globals, so everything
   here is driven by observing the DOM it produces.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  /* One shared underline that travels between tabs.
     The stylesheet's per-tab ::after must be suppressed so the two do not both
     draw — but ONLY once the sliding replacement is actually running. Injecting
     the suppression unconditionally left reduced-motion visitors with no tab
     underline at all, because the JS underline never moves off opacity 0. */
  var CSS = [
    '.mt-tab-underline{',
    '  position:absolute;bottom:-6px;left:0;height:2px;width:0;',
    '  background:#fff;border-radius:2px;pointer-events:none;opacity:0;',
    '}',
    '.nav-left{position:relative;}'
  ].join('\n');

  var CSS_ANIMATED = 'html.mt-js .nav-tab.active::after{opacity:0;}';

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M) return;

    var style = document.createElement('style');
    style.id = 'mt-games-extra';
    style.textContent = CSS;
    document.head.appendChild(style);

    // Reduced motion keeps the stylesheet's own per-tab underline.
    if (M.skip) return;
    style.textContent = CSS + '\n' + CSS_ANIMATED;

    /* --- intro -> dashboard ------------------------------------------------- */

    // gamescript.js fades #intro-container to opacity 0, then display:none a
    // second and a half later. Lifting the dashboard in underneath turns that
    // from "one screen disappears" into a hand-off.
    var intro = document.getElementById('intro-container');
    var main = document.getElementById('main-container');

    if (intro && main) {
      var handedOff = false;
      new MutationObserver(function () {
        if (handedOff) return;
        if (intro.style.opacity !== '0') return;
        handedOff = true;

        gsap.to(intro, { scale: 1.06, duration: 1.1, ease: 'power2.in' });
        gsap.fromTo(main, { opacity: 0, scale: 1.03 },
          { opacity: 1, scale: 1, duration: 1, ease: 'power2.out', clearProps: 'transform,opacity' });
      }).observe(intro, { attributes: true, attributeFilter: ['style'] });
    }

    /* --- nav tabs ------------------------------------------------------------ */

    var navLeft = document.querySelector('.nav-left');

    if (navLeft) {
      var underline = document.createElement('div');
      underline.className = 'mt-tab-underline';
      navLeft.appendChild(underline);

      function moveUnderline(animate) {
        var tab = navLeft.querySelector('.nav-tab.active');
        if (!tab) { gsap.to(underline, { opacity: 0, duration: 0.2 }); return; }

        var target = {
          x: tab.offsetLeft,
          width: tab.offsetWidth,
          opacity: 1,
          duration: animate ? 0.42 : 0,
          ease: 'power3.out',
          overwrite: 'auto'
        };
        gsap.to(underline, target);
      }

      new MutationObserver(function () { moveUnderline(true); }).observe(navLeft, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
      });

      // Fonts can land after first paint and change tab widths.
      moveUnderline(false);
      window.addEventListener('load', function () { moveUnderline(false); });
      window.addEventListener('resize', function () { moveUnderline(false); });
    }

    /* --- settings drawer ------------------------------------------------------ */

    // The drawer itself slides via CSS (right: -420px -> 0). The links are
    // staggered in behind it so the panel is not fully formed before it lands.
    var settings = document.getElementById('settings-menu');

    if (settings) {
      var drawerOpen = false;
      new MutationObserver(function () {
        var open = settings.classList.contains('open');
        if (open === drawerOpen) return;
        drawerOpen = open;
        if (!open) return;

        var items = settings.querySelectorAll('.menu-list li');
        if (!items.length) return;
        gsap.fromTo(items, { opacity: 0, x: 28 },
          { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out',
            stagger: { amount: 0.3 }, delay: 0.12, clearProps: 'transform,opacity' });
      }).observe(settings, { attributes: true, attributeFilter: ['class'] });
    }

    /* --- search results -------------------------------------------------------- */

    var results = document.getElementById('search-results');

    if (results) {
      var pending = null;
      new MutationObserver(function () {
        clearTimeout(pending);
        pending = setTimeout(function () {
          if (!results.children.length) return;
          gsap.fromTo(results.children, { opacity: 0, x: -14 },
            { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out',
              stagger: { amount: 0.2 }, clearProps: 'transform,opacity' });
        }, 20);
      }).observe(results, { childList: true });
    }

    /* --- modals ---------------------------------------------------------------- */

    // Both share .modal-bg and are shown by flipping display.
    M.toArray('.modal-bg').forEach(function (modal) {
      var box = modal.querySelector('.modal-content-wrapper');
      if (!box) return;

      var wasOpen = false;
      new MutationObserver(function () {
        var open = window.getComputedStyle(modal).display !== 'none';
        if (open === wasOpen) return;
        wasOpen = open;
        if (!open) return;

        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        gsap.fromTo(box, { scale: 0.9, y: 18, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.38, ease: 'back.out(1.6)',
            clearProps: 'transform,opacity' });
      }).observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
    });

    /* --- button feedback --------------------------------------------------------- */

    document.addEventListener('pointerdown', function (e) {
      var btn = e.target.closest && e.target.closest('.play-btn, .icon-btn, .nav-tab');
      if (!btn) return;
      gsap.to(btn, { scale: 0.95, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
    });

    document.addEventListener('pointerup', function () {
      gsap.to(M.toArray('.play-btn, .icon-btn, .nav-tab'),
        { scale: 1, duration: 0.26, ease: 'back.out(2.5)', overwrite: 'auto' });
    });
  });
})();
