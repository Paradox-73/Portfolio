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

    // Books are fetched and appended per shelf, in bursts, each burst coalesced
    // into one stagger so a shelf fills like someone sliding books into place.
    //
    // The reveal is tied to scroll position, not to when the data lands. An
    // earlier version played the moment each fetch resolved, which meant every
    // shelf animated at once shortly after load — including the ones far below
    // the fold, so by the time you scrolled to them they had long since
    // finished. Now a shelf only fills as you come down to it, once.
    //
    // Books that are already on screen when they arrive are left alone entirely:
    // hiding them just to animate them back in is the "on page load" burst the
    // scroll trigger exists to avoid.
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

          // Already in view -> it is part of the page you are looking at.
          if (shelf.getBoundingClientRect().top < window.innerHeight * 0.85) return;

          // Below the fold -> falls into place when you scroll down to it.
          // M.reveal carries the scroll-jump catch-up and the stalled-ticker
          // watchdog, so a book can never be left permanently invisible.
          M.reveal(fresh, {
            y: -34,
            duration: 0.5,
            ease: 'power3.out',
            stagger: { amount: 0.6 },
            start: 'top 85%'
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
        setDisplay('flex');

        var finished = false;
        function finish() {
          if (finished) return;
          finished = true;
          gsap.killTweensOf([modal, panel]);
          gsap.set([modal, panel], { clearProps: 'opacity,transform' });
          setDisplay('none');
          isOpen = false;
        }

        // Watchdog — see motion-food.js. Closing is intercepted so it can
        // animate, so a stalled rAF ticker would otherwise leave the modal open
        // with no way to dismiss it. This timer does not depend on rAF.
        setTimeout(finish, 600);
        animateOut(finish);
      }
    }).observe(modal, { attributes: true, attributeFilter: ['style'] });

    /* --- reader overlay -------------------------------------------------------- */

    // Deliberately not animated.
    //
    // An earlier version scaled #magazine up from 0.9 as the reader opened. That
    // broke opening a work: Turn.js owns #magazine's geometry and writes its own
    // inline position/width/height/margin there, so adding a GSAP transform on
    // top fought it — and because the tween started the overlay and the book at
    // opacity 0, anything that stopped it mid-flight (a background tab, a
    // stalled ticker) left the reader open but completely invisible.
    //
    // Turn.js already animates the page flip. The container it manages is left
    // alone.
  });
})();
