/* ---------------------------------------------------------------------------
   motion-travel.js — the scrapbook annotating itself.

   Turn.js already animates the page flip. What was missing is what happens once
   a spread lands: the doodle arrows draw themselves and the highlighter sweeps
   across the marked words, as though someone were annotating the page in front
   of you.

   Only those two things animate. The photos and the diary text are printed on
   the page, so they are fully there the instant the flip finishes — nothing you
   turned the page to read has to fade in first.

   Every spread plays once. Flipping back to a page you have already seen leaves
   it as it was, which is how a real scrapbook behaves.

   Additive: travelscript.js is untouched. This binds its own Turn.js listener.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  if (typeof jQuery === 'undefined') return;

  jQuery(function ($) {
    var M = window.Motion;
    if (!M || M.skip) return;

    // If Turn.js failed to load, travelscript.js falls back to revealing the raw
    // pages as a plain stack. Animating that stack would fire every spread at
    // once on load, so in that state this file does nothing and the content is
    // simply left visible.
    if (typeof $.fn.turn !== 'function') return;

    var magazine = $('#magazine');
    var done = new WeakSet();

    // Ask Turn.js which spread is open rather than guessing from geometry.
    // The earlier version treated "laid out and on screen" as "open", which is
    // true of pages Turn.js keeps mounted just off the fold — so spreads
    // animated before you ever turned to them.
    function currentPages() {
      var view;
      try { view = magazine.turn('view'); } catch (e) { return []; }
      if (!view || !view.length) return [];

      return M.toArray('#magazine .own-size.scrapbook').filter(function (page) {
        if (done.has(page)) return false;

        // Turn.js wraps each page in an element carrying its page number.
        var holder = page.closest('[page]');
        var number = holder ? Number(holder.getAttribute('page')) : NaN;
        if (isNaN(number)) return false;

        return view.indexOf(number) !== -1;
      });
    }

    function animatePage(page) {
      done.add(page);

      var marks = page.querySelectorAll('.hl, .red-marker');
      var arrows = page.querySelectorAll('.doodle-arrow path');

      // Only the hand-added marks animate.
      //
      // The photos and the diary text are what is *printed* on the page — they
      // are part of the spread, so they must already be there the moment the
      // flip lands. Fading them in made the page look like it was still loading
      // and delayed the writing you turned the page to read. The highlighter
      // and the doodle arrows are the things drawn on afterwards, so those are
      // the only things drawn on afterwards here too.

      var tl = gsap.timeline();

      // Marker sweep. See travelstyle.css: this drives background-size, which
      // lives inside the element's own box and so ignores Turn.js's transforms.
      if (marks.length) {
        gsap.set(marks, { '--mt-hl': '0%' });
        tl.to(marks, {
          '--mt-hl': '100%',
          duration: 0.5,
          ease: 'power1.inOut',
          stagger: { amount: 0.4 }
        }, 0.15);
      }

      // The arrows are real <path>s, so they can draw themselves on.
      if (arrows.length) {
        tl.add(M.drawSVG(arrows, { duration: 0.7, stagger: 0.15 }), 0.25);
      }
    }

    function sweep() {
      currentPages().forEach(animatePage);
    }

    // 'turned' fires when a flip finishes and the new spread is at rest. The
    // extra delayed pass covers Turn.js swapping a page into the DOM slightly
    // after the event, and travelscript.js's fitPages() re-measure.
    magazine.bind('turned', function () {
      sweep();
      setTimeout(sweep, 250);
    });

    // The book opens on its cover, so on load this normally finds nothing. It
    // only matters if Turn.js is ever configured to start on a spread.
    setTimeout(sweep, 400);
  });
})();
