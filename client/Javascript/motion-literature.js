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

    // Books drop onto their shelf a shelf at a time, as you scroll down past
    // each one — never on load, and never all at once.
    //
    // Two rules drive this:
    //   1. Nothing animates until the visitor has actually scrolled down. The
    //      first shelf is on screen at load, so triggering on visibility alone
    //      would fire it immediately, which is the load-time burst this exists
    //      to avoid.
    //   2. Each shelf plays once, when it is reached. Going back up leaves the
    //      shelves already filled, the way a real shelf stays filled.
    //
    // Books are hidden the moment they are appended, so nothing is ever seen in
    // place and then re-animated.

    var scrolledDown = false;
    var lastY = window.scrollY;
    var queued = [];   // shelves waiting for the first downward scroll

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (!scrolledDown && y > lastY + 4) {
        scrolledDown = true;
        queued.splice(0).forEach(function (play) { play(); });
      }
      lastY = y;
    }, { passive: true });

    // Safety net: if the visitor never scrolls, the books must not sit hidden
    // forever. After a few seconds, release whatever is still waiting.
    setTimeout(function () {
      if (scrolledDown) return;
      scrolledDown = true;
      queued.splice(0).forEach(function (play) { play(); });
    }, 6000);

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

          // Hide straight away so this shelf never flashes in at full opacity
          // while it waits its turn.
          gsap.set(fresh, { opacity: 0 });

          // M.reveal carries the scroll-jump catch-up and the stalled-ticker
          // watchdog, so a book can never be left permanently invisible.
          var play = function () {
            M.reveal(fresh, {
              y: -34,
              duration: 0.5,
              ease: 'power3.out',
              stagger: { amount: 0.6 },
              start: 'top 85%'
            });
          };

          if (scrolledDown) play();
          else queued.push(play);
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
