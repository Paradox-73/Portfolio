$(window).on('load', function() {
  'use strict';

  var mobile = window.innerWidth <= 768;

  // Desktop = two-page spread, mobile = single page. Both keep the page-flip animation.
  $('#magazine').turn({
    display: mobile ? 'single' : 'double',
    gradients: true,
    acceleration: true,
    turnCorners: 'tl,tr',
    autoCenter: true,
    touch: true
  });

  // Turn.js needs explicit pixel dimensions; sizing it to the viewport (with a margin
  // left over on every side via the centred flex body) fixes the squished-strip bug.
  sizeBook();
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
