/* ---------------------------------------------------------------------------
   motion-projects.js — window-manager animation for the Windows XP desktop.

   The goal here is the opposite of the other pages. Nothing should look modern.
   Windows XP had a specific, slightly cheap motion vocabulary, and matching it
   is what sells the imitation:

     - windows zoom open from whatever you launched them from, fast (~200ms)
     - minimising shrinks the window into its own taskbar button
     - restoring plays that in reverse
     - maximising stretches the frame, squashing its contents on the way
     - closing is near-instant; XP did not animate it at all
     - the Start menu slides up off the taskbar
     - "Turn Off Computer" desaturates the screen before the shutdown screen

   So the durations here are short and the easing is shallow on purpose. A long
   cubic-bezier glide would look wrong on this page, not better.

   Additive: projectscript.js is untouched. Its globals are wrapped.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M) return;

    /* --- launch origin ---------------------------------------------------- */

    // Where the most recent click happened, so a new window can zoom out of it.
    var origin = null;
    var originAt = 0;

    document.addEventListener('click', function (e) {
      var src = e.target.closest &&
                e.target.closest('.desktop-icon, .start-item, .task-item, #start-btn');
      if (!src) return;
      origin = src.getBoundingClientRect();
      originAt = performance.now();
    }, true);

    /* --- window open ------------------------------------------------------ */

    // createWindow appends straight to <body>, so watching body for added
    // .window nodes catches every launch path without touching the function.
    if (!M.skip) {
      new MutationObserver(function (records) {
        records.forEach(function (record) {
          Array.prototype.forEach.call(record.addedNodes, function (node) {
            if (node.nodeType !== 1 || !node.classList.contains('window')) return;

            var rect = node.getBoundingClientRect();
            var fresh = origin && (performance.now() - originAt) < 1200;

            var from = { opacity: 0, duration: 0.2, ease: 'power1.out' };
            if (fresh && rect.width && rect.height) {
              from.x = origin.left - rect.left;
              from.y = origin.top - rect.top;
              from.scaleX = origin.width / rect.width;
              from.scaleY = origin.height / rect.height;
              from.transformOrigin = '0 0';
            } else {
              from.scale = 0.85;
            }

            gsap.from(node, from);
          });
        });
      }).observe(document.body, { childList: true });
    }

    /* --- minimise / restore ------------------------------------------------ */

    // XP's signature move. The window scales and slides until its top-left sits
    // on the taskbar button's top-left, then hides for real.
    M.wrap('minimizeWindow', function (original, args) {
      var win = document.getElementById('win-' + args[0]);
      var task = document.getElementById('task-' + args[0]);
      if (M.skip || !win || !task) return original();

      var w = win.getBoundingClientRect();
      var t = task.getBoundingClientRect();
      if (!w.width || !w.height) return original();

      gsap.to(win, {
        x: t.left - w.left,
        y: t.top - w.top,
        scaleX: t.width / w.width,
        scaleY: t.height / w.height,
        opacity: 0.35,
        transformOrigin: '0 0',
        duration: 0.22,
        ease: 'power2.in',
        onComplete: function () {
          gsap.set(win, { clearProps: 'transform,opacity' });
          original();
        }
      });
    });

    // focusWindow doubles as "restore", but it also fires on every mousedown
    // inside an already-open window. Only a window that was actually hidden
    // should play the zoom back out of the taskbar.
    M.wrap('focusWindow', function (original, args) {
      var win = document.getElementById('win-' + args[0]);
      var wasHidden = win && window.getComputedStyle(win).display === 'none';

      original();

      if (M.skip || !win || !wasHidden) return;

      var task = document.getElementById('task-' + args[0]);
      var w = win.getBoundingClientRect();
      if (!task || !w.width || !w.height) return;

      var t = task.getBoundingClientRect();
      gsap.from(win, {
        x: t.left - w.left,
        y: t.top - w.top,
        scaleX: t.width / w.width,
        scaleY: t.height / w.height,
        opacity: 0.35,
        transformOrigin: '0 0',
        duration: 0.22,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      });
    });

    /* --- maximise ---------------------------------------------------------- */

    // Measure, let the original rewrite the geometry, then invert and play
    // forward. The contents squash as the frame stretches — which is exactly
    // what XP did, so it is left alone rather than corrected.
    M.wrap('toggleMaximize', function (original, args) {
      var win = document.getElementById('win-' + args[0]);
      if (M.skip || !win) return original();

      var before = win.getBoundingClientRect();
      original();
      var after = win.getBoundingClientRect();
      if (!after.width || !after.height) return;

      gsap.fromTo(win, {
        x: before.left - after.left,
        y: before.top - after.top,
        scaleX: before.width / after.width,
        scaleY: before.height / after.height,
        transformOrigin: '0 0'
      }, {
        x: 0, y: 0, scaleX: 1, scaleY: 1,
        duration: 0.2,
        ease: 'power2.out',
        clearProps: 'transform'
      });
    });

    /* --- close -------------------------------------------------------------- */

    // XP had no close animation at all. This is short enough to read as
    // instant while removing the hard pop.
    M.wrap('closeWindow', function (original, args) {
      var win = document.getElementById('win-' + args[0]);
      if (M.skip || !win) return original();

      gsap.to(win, {
        opacity: 0,
        scaleY: 0.94,
        transformOrigin: '50% 0%',
        duration: 0.11,
        ease: 'power1.in',
        onComplete: original
      });
    });

    /* --- start menu ---------------------------------------------------------- */

    // Slides up out of the taskbar. Only the open is animated: the menu is
    // closed from several places (the button, any outside click, launching an
    // app) and XP's dismissal was immediate anyway.
    var startMenu = document.getElementById('start-menu');
    if (startMenu && !M.skip) {
      var menuOpen = false;
      new MutationObserver(function () {
        var showing = startMenu.style.display === 'flex';
        if (showing === menuOpen) return;
        menuOpen = showing;
        if (!showing) return;

        gsap.from(startMenu, {
          y: 40,
          opacity: 0,
          duration: 0.18,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        });
      }).observe(startMenu, { attributes: true, attributeFilter: ['style'] });
    }

    /* --- shutdown ------------------------------------------------------------ */

    // "Turn Off Computer" calls window.close(), which a browser refuses for any
    // page it did not open itself — so the button silently did nothing. It now
    // plays XP's shutdown: the desktop desaturates and dims, then the classic
    // "It is now safe to turn off your computer" screen. Clicking returns to the
    // desktop, since there is no real machine to power off.
    var shutdownItem = document.querySelector('#start-menu .start-footer .start-item');

    if (shutdownItem && !M.skip) {
      shutdownItem.addEventListener('click', function (e) {
        // Capture phase on the element itself still precedes the inline onclick
        // handler only if propagation is stopped here.
        e.preventDefault();
        e.stopImmediatePropagation();
        runShutdown();
      }, true);
    }

    function runShutdown() {
      var desktop = document.getElementById('desktop');
      var taskbar = document.getElementById('taskbar');
      if (startMenu) startMenu.style.display = 'none';

      var veil = document.createElement('div');
      veil.className = 'xp-shutdown';
      veil.innerHTML =
        '<div class="xp-shutdown-msg">Windows<br><span>is shutting down...</span></div>';
      document.body.appendChild(veil);

      var stage = [desktop, taskbar].filter(Boolean)
        .concat(Array.prototype.slice.call(document.querySelectorAll('.window')));

      var tl = gsap.timeline();

      // The desaturate-and-dim pass is the part everyone remembers.
      tl.to(stage, {
        filter: 'grayscale(1) brightness(0.45)',
        duration: 0.9,
        ease: 'power2.inOut'
      }, 0);

      tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3);

      tl.to(veil, { backgroundColor: '#000', duration: 0.5 }, 1.6);
      tl.to(veil.firstChild, { opacity: 0, duration: 0.4 }, 1.6);

      tl.add(function () {
        veil.innerHTML =
          '<div class="xp-shutdown-safe">It is now safe to turn off your computer.' +
          '<span>click anywhere to return</span></div>';
        gsap.fromTo(veil.firstChild, { opacity: 0 }, { opacity: 1, duration: 0.5 });

        veil.addEventListener('click', function () {
          gsap.to(veil, {
            opacity: 0,
            duration: 0.4,
            onComplete: function () { veil.remove(); }
          });
          gsap.to(stage, { filter: 'none', duration: 0.5, clearProps: 'filter' });
        }, { once: true });
      }, 2.2);
    }
  });
})();
