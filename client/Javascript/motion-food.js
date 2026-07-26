/* ---------------------------------------------------------------------------
   motion-food.js — motion for the Kanav's Kitchen menu page.

   Before this file the page had no transitions of any kind. The brief here is a
   printed menu that assembles itself: the masthead builds letter by letter, the
   allergen legend deals out like a row of cards, each course reveals as you
   reach it, and the dishes sit slightly afloat on the page.

   Additive by design — this file never touches recipe.js or foodscript.js. It
   observes their DOM changes instead, so the recipe modal can animate without
   any edits to the logic that opens it.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var M = window.Motion;
    if (!M) return;

    /* --- masthead ------------------------------------------------------- */

    // "FOODIE" is six <span>s in a 3x2 grid. Dropping them in reading order
    // makes the block feel typeset rather than rendered.
    M.enter('.name span', { y: -30, duration: 0.55, stagger: 0.06, ease: 'back.out(1.6)' });
    M.enter('.opening-hours', { y: 0, x: -24, duration: 0.6, delay: 0.25 });
    M.enter('.location', { y: 0, x: 24, duration: 0.6, delay: 0.35 });
    M.enter('.legend__item', { y: 14, duration: 0.45, stagger: 0.06, delay: 0.5 });

    /* --- courses --------------------------------------------------------- */

    // Each course header wipes in from the left, matching the way the h3s are
    // already styled as solid banner bars.
    M.reveal('.menu h3', { x: -28, y: 0, duration: 0.6, stagger: { amount: 0.2 } });

    // Items reveal per course. ScrollTrigger.batch groups whatever enters
    // together, so a course arrives as one staggered unit — spread over a fixed
    // window so a long course does not take seconds to finish arriving.
    M.reveal('.menu .item', { y: 30, duration: 0.6, stagger: { amount: 0.45 } });

    // The bill sits at the end of the menu and deserves a beat of its own.
    M.reveal('.menu-cart', { y: 20, scale: 0.94, duration: 0.6 });

    /* --- star ratings ---------------------------------------------------- */

    // The stars are pre-coloured by CSS via [data-rating]; all that is added is
    // the pop. Note .rating is direction:rtl with floated labels, so the visual
    // order is the reverse of the DOM order — stagger from the end to make the
    // fill read left to right.
    // Routed through M.reveal rather than a hand-rolled ScrollTrigger. The
    // previous version hid the stars up front and only restored them from a
    // tween's onEnter, so if the ticker stalled the rating silently disappeared
    // from every dish — the score is content, and it must survive a missing
    // animation. M.reveal carries the scroll-jump catch-up and the timer-based
    // watchdog that guarantee it.
    M.toArray('.rating').forEach(function (rating) {
      var stars = rating.querySelectorAll('label');
      if (!stars.length) return;

      M.reveal(stars, {
        scale: 0,
        y: 0,
        duration: 0.4,
        ease: 'back.out(2.2)',
        start: 'top 92%',
        stagger: { each: 0.06, from: 'end' }
      });
    });

    /* --- dishes photographed more than once -------------------------------- */

    // A few dishes have two photos of the same food — a plated portion and the
    // whole tray. Both are shown in the same frame, five seconds each, so the
    // dish gets one menu entry instead of two near-duplicates.
    //
    // This runs even under reduced motion: the alternate photo is content, not
    // decoration, and withholding it would hide half the dish. Only the
    // cross-fade is dropped there (see foodstyle.css), leaving a plain swap.
    M.toArray('.item__image').forEach(function (frame) {
      var alts = frame.querySelectorAll('.item__alt');
      if (!alts.length) return;

      frame.classList.add('has-alt');

      var shots = [null].concat(Array.prototype.slice.call(alts)); // null = the base image
      var index = 0;

      setInterval(function () {
        // Pause while the tab is hidden, otherwise the whole rotation is
        // fast-forwarded the moment the visitor comes back.
        if (document.visibilityState !== 'visible') return;

        index = (index + 1) % shots.length;
        alts.forEach(function (img) { img.classList.remove('is-shown'); });

        if (shots[index]) {
          shots[index].classList.add('is-shown');
          frame.classList.add('showing-alt');
        } else {
          frame.classList.remove('showing-alt');
        }
      }, 5000);
    });

    /* --- dishes ---------------------------------------------------------- */

    // Only the base photo of each dish floats; the stacked alternates are
    // positioned over it and must not be given their own transform.
    var dishes = M.toArray('.item__image > img:first-child');

    if (!M.skip) {
      dishes.forEach(function (img, i) {
        // Idle float. Randomised amplitude and period per dish, otherwise six
        // plates bobbing in lockstep looks mechanical rather than alive.
        gsap.to(img, {
          y: '-=' + (5 + (i % 3) * 2),
          duration: 2.4 + (i % 4) * 0.35,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.18
        });
      });
    }

    // Hover lifts the plate and tips it very slightly. Kept on a named tween so
    // repeated enter/leave never stacks conflicting transforms.
    //
    // The whole frame is scaled rather than the base <img>: on a dish with two
    // photos the alternate sits stacked on top, so scaling only the base would
    // do nothing visible while the alternate is the one showing. Drinks have no
    // frame at all and are skipped.
    M.toArray('.item').forEach(function (item) {
      var frame = item.querySelector('.item__image');
      if (!frame || M.skip) return;

      item.addEventListener('mouseenter', function () {
        gsap.to(frame, { scale: 1.09, rotation: -3, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      });
      item.addEventListener('mouseleave', function () {
        gsap.to(frame, { scale: 1, rotation: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    /* --- recipe modal ---------------------------------------------------- */

    var modal = document.getElementById('recipe-modal');
    var panel = modal && modal.querySelector('.modal-content');
    if (!modal || !panel || M.skip) return;

    // Where the modal should appear to grow from — the dish the visitor clicked.
    var origin = null;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.recipe-button');
      if (!btn) return;
      var item = btn.closest('.item');
      var src = (item && item.querySelector('.item__image')) || btn;
      origin = src.getBoundingClientRect();
    }, true);

    // recipe.js flips modal.style.display directly. Rather than edit that file,
    // watch the attribute: an outside change to 'block' means "opening", and a
    // change to 'none' is intercepted so the close can animate first.
    var internal = false;

    function setDisplay(value) {
      internal = true;
      modal.style.display = value;
    }

    function animateIn() {
      var rect = panel.getBoundingClientRect();
      var dx = 0;
      var dy = 0;

      if (origin) {
        // Offset the panel so its centre starts on the dish's centre.
        dx = (origin.left + origin.width / 2) - (rect.left + rect.width / 2);
        dy = (origin.top + origin.height / 2) - (rect.top + rect.height / 2);
      }

      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' });
      gsap.fromTo(panel,
        { x: dx, y: dy, scale: 0.22, opacity: 0, transformOrigin: '50% 50%' },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );

      // The recipe body lands just behind the panel so the text does not appear
      // fully formed at 22% scale.
      var lines = panel.querySelectorAll('h2, h3, li');
      gsap.fromTo(lines,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.025, delay: 0.18 }
      );
    }

    function animateOut(done) {
      gsap.to(modal, { opacity: 0, duration: 0.25, ease: 'power2.in' });
      gsap.to(panel, {
        scale: 0.9,
        opacity: 0,
        y: 16,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: function () {
          // Explicit list, not 'all' — `display` is recipe.js's inline style and
          // must survive being reset here.
          gsap.set([modal, panel], { clearProps: 'opacity,transform' });
          done();
        }
      });
    }

    var isOpen = false;

    new MutationObserver(function () {
      if (internal) { internal = false; return; }

      var display = modal.style.display;

      if (display === 'block' && !isOpen) {
        isOpen = true;
        animateIn();
      } else if (display === 'none' && isOpen) {
        // Put it back for the length of the out-tween, then hide for real.
        setDisplay('block');

        var finished = false;
        function finish() {
          if (finished) return;
          finished = true;
          gsap.killTweensOf([modal, panel]);
          gsap.set([modal, panel], { clearProps: 'opacity,transform' });
          setDisplay('none');
          isOpen = false;
        }

        // Watchdog. Closing is intercepted so it can animate, which means the
        // modal is only really dismissed when the tween ends — and GSAP's ticker
        // is rAF-driven. If rAF stalls (background tab, power saving, a blocked
        // main thread) the tween never completes and the modal stays open with
        // no way to dismiss it. This timer is not rAF-driven, so it always
        // fires; an animation that already finished makes it a no-op.
        setTimeout(finish, 600);
        animateOut(finish);
      }
    }).observe(modal, { attributes: true, attributeFilter: ['style'] });
  });
})();
