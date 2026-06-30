// Initialize on DOM-ready (not window 'load') so the book forms on the cover
// immediately, instead of showing the raw inside pages while photos download.
$(document).ready(function() {
  'use strict';

  var mobile = window.innerWidth <= 768;

  // On mobile, skip the inner covers — go straight from the outer cover to the pages.
  if (mobile) {
    $('#magazine').find('.cover-front-inside, .cover-back-inside').remove();
  }

  // Desktop = two-page spread, mobile = single page. Both keep the page-flip animation.
  $('#magazine').turn({
    display: mobile ? 'single' : 'double',
    gradients: true,
    acceleration: true,
    turnCorners: 'tl,tr',
    autoCenter: true,
    touch: true
  });

  // Tap / click either side of the book to turn pages (works alongside Turn.js swipe).
  // Guard against double-turns right after a swipe/drag already flipped the page.
  var lastTurn = 0;
  $('#magazine').bind('turning', function () {
    lastTurn = Date.now();
    // The book is being opened -> retire the handwritten navigation hint.
    var hint = document.getElementById('nav-hint');
    if (hint) hint.classList.add('nav-hint-hidden');
  });
  $('#magazine').on('click', function (e) {
    if (Date.now() - lastTurn < 500) return;     // a swipe/drag just turned it
    if ($(e.target).closest('a').length) return; // don't hijack real links
    var x = e.pageX - $(this).offset().left;
    $('#magazine').turn(x < $(this).width() / 2 ? 'previous' : 'next');
  });

  // Turn.js needs explicit pixel dimensions; sizing it to the viewport (with a margin
  // left over on every side via the centred flex body) fixes the squished-strip bug.
  sizeBook();
  // Reveal the book only once Turn.js has built it (CSS hides #magazine until now),
  // so the unstyled inside pages never flash before the cover.
  $('#magazine').addClass('turn-ready');
  $(window).on('resize orientationchange', function () { setTimeout(sizeBook, 120); });

  function sizeBook() {
    var w = window.innerWidth, h = window.innerHeight;
    var isMobile = w <= 768;
    var W = Math.floor(w * (isMobile ? 0.92 : 0.95));
    var H = Math.floor(h * (isMobile ? 0.90 : 0.95));
    try { $('#magazine').turn('size', W, H); } catch (e) {}
  }

  // Keyboard navigation (desktop)
  $(document).keydown(function (e) {
    if (e.keyCode == 37) {
      $('#magazine').turn('previous');
    } else if (e.keyCode == 39) {
      $('#magazine').turn('next');
    }
  });
});

// Safety net: if Turn.js ever fails to initialize, still reveal the book on window
// load so it can never stay permanently hidden.
$(window).on('load', function () { $('#magazine').addClass('turn-ready'); });
