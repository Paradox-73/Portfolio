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
    M.toArray('.rating').forEach(function (rating) {
      var stars = rating.querySelectorAll('label');
      if (!stars.length || M.skip || !window.ScrollTrigger) return;

      gsap.set(stars, { scale: 0, opacity: 0 });

      ScrollTrigger.create({
        trigger: rating,
        start: 'top 92%',
        once: true,
        onEnter: function () {
          gsap.to(stars, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'back.out(2.2)',
            stagger: { each: 0.06, from: 'end' }
          });
        }
      });
    });

    /* --- dishes ---------------------------------------------------------- */

    var dishes = M.toArray('.item__image img');

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
    M.toArray('.item').forEach(function (item) {
      var img = item.querySelector('.item__image img');
      if (!img || M.skip) return;

      item.addEventListener('mouseenter', function () {
        gsap.to(img, { scale: 1.09, rotation: -3, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      });
      item.addEventListener('mouseleave', function () {
        gsap.to(img, { scale: 1, rotation: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
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
        animateOut(function () {
          setDisplay('none');
          isOpen = false;
        });
      }
    }).observe(modal, { attributes: true, attributeFilter: ['style'] });
  });
})();
