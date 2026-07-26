/* ---------------------------------------------------------------------------
   motion-literature.js — shelving and opening books.

   Two moments carry this page. Books arrive by being slotted onto the shelf
   rather than appearing on it, and clicking one opens its details out of the
   book itself — swinging open from where the spine sits, instead of a panel
   fading in over the middle of the screen.

   The hover tilt already in literaturestyle.css (scale + lift + rotateX) is
   left alone: it is the effect this page wanted, and taking it over in JS would
   add risk without changing what you see.

   Additive: literaturescript.js is untouched. Its shelves and modals are
   observed.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M || M.skip) return;

    /* --- header ------------------------------------------------------------ */

    M.enter('.bookshelf-header h1', { y: -18, duration: 0.7 });

    var rule = document.querySelector('.header-line');
    if (rule) {
      gsap.from(rule, { scaleX: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'power3.out', delay: 0.2 });
    }

    /* --- books being shelved ------------------------------------------------ */

    // Books are fetched and appended per shelf, in bursts. Each burst is
    // coalesced into one stagger so a shelf fills left to right, like someone
    // sliding books into place, instead of popping in as replies land.
    M.toArray('.shelf').forEach(function (shelf) {
      var pending = null;
      var seen = new WeakSet();

      new MutationObserver(function () {
        clearTimeout(pending);
        pending = setTimeout(function () {
          var fresh = M.toArray(shelf.querySelectorAll('.book-face')).filter(function (book) {
            if (seen.has(book)) return false;
            seen.add(book);
            return true;
          });
          if (!fresh.length) return;

          gsap.from(fresh, {
            y: -34,
            opacity: 0,
            rotateZ: function (i) { return i % 2 ? 4 : -4; },
            duration: 0.5,
            ease: 'power3.out',
            stagger: { amount: 0.6 },
            // Hand the transform back to CSS so the hover tilt still works.
            clearProps: 'transform,opacity'
          });
        }, 40);
      }).observe(shelf, { childList: true });
    });

    /* --- book to details ----------------------------------------------------- */

    var modal = document.getElementById('details-modal');
    var panel = modal && modal.firstElementChild;
    if (!modal || !panel) return;

    var origin = null;
    var originAt = 0;

    document.addEventListener('click', function (e) {
      var book = e.target.closest && e.target.closest('.book-face');
      if (!book) return;
      origin = book.getBoundingClientRect();
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

      // openDetailsModal awaits a description lookup before showing, so a slow
      // reply means the book is no longer where the visitor's attention is.
      var fresh = origin && (performance.now() - originAt) < 1500;
      var dx = 0, dy = 0, scale = 0.9, rotY = 0;

      if (fresh && rect.width) {
        dx = (origin.left + origin.width / 2) - (rect.left + rect.width / 2);
        dy = (origin.top + origin.height / 2) - (rect.top + rect.height / 2);
        scale = Math.max(0.15, origin.width / rect.width);
        // A touch of Y rotation so it reads as a cover swinging open rather
        // than a rectangle being scaled.
        rotY = -14;
      }

      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(panel,
        { x: dx, y: dy, scale: scale, rotationY: rotY, opacity: fresh ? 1 : 0,
          transformOrigin: '50% 50%', transformPerspective: 900 },
        { x: 0, y: 0, scale: 1, rotationY: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
      );

      var lines = panel.querySelectorAll('#modal-title, #modal-author, #modal-desc, #modal-footer');
      gsap.fromTo(lines, { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06, delay: 0.2,
          clearProps: 'transform,opacity' });
    }

    function animateOut(done) {
      gsap.to(modal, { opacity: 0, duration: 0.22, ease: 'power2.in' });
      gsap.to(panel, {
        scale: 0.93,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: function () {
          // Explicit list — `display` belongs to literaturescript.js and the
          // inline onclick on #modal-close.
          gsap.set([modal, panel], { clearProps: 'opacity,transform' });
          done();
        }
      });
    }

    new MutationObserver(function () {
      if (internal) { internal = false; return; }

      var display = modal.style.display;

      if ((display === 'flex' || display === 'block') && !isOpen) {
        isOpen = true;
        animateIn();
      } else if (display === 'none' && isOpen) {
        var restore = display === 'block' ? 'block' : 'flex';
        setDisplay(restore);
        animateOut(function () {
          setDisplay('none');
          isOpen = false;
        });
      }
    }).observe(modal, { attributes: true, attributeFilter: ['style'] });

    /* --- reader overlay -------------------------------------------------------- */

    // The Turn.js reader for "My Works". Scaling it up from slightly small makes
    // it feel like a book being opened out of the shelf.
    var reader = document.getElementById('reader-overlay');
    if (reader) {
      var readerOpen = false;
      new MutationObserver(function () {
        var showing = window.getComputedStyle(reader).display !== 'none' &&
                      window.getComputedStyle(reader).opacity !== '0';
        if (showing === readerOpen) return;
        readerOpen = showing;
        if (!showing) return;

        gsap.fromTo(reader, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        var mag = document.getElementById('magazine');
        if (mag) {
          gsap.fromTo(mag, { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' });
        }
      }).observe(reader, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  });
})();
