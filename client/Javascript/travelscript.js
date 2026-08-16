// Initialize on DOM-ready (not window 'load') so the book forms on the cover
// immediately, instead of showing the raw inside pages while photos download.
$(document).ready(function() {
  'use strict';

  var mobile = window.innerWidth <= 768;

  // On mobile, skip the inner covers — go straight from the outer cover to the pages.
  if (mobile) {
    $('#magazine').find('.cover-front-inside, .cover-back-inside').remove();
  }

  // Wrap every scrapbook page's content in an inner element BEFORE Turn.js builds the
  // book. Turn.js applies its own transforms (page folds/peels) directly to the
  // .own-size page element, so the auto-fit scale must live on this inner wrapper to
  // avoid fighting — and being wiped by — those fold transforms.
  $('#magazine .own-size.scrapbook').each(function () {
    if (!this.querySelector(':scope > .fit-inner')) {
      $(this).wrapInner('<div class="fit-inner"></div>');
    }
  });

  // Held from before Turn.js builds the book, because it swaps far-away pages out
  // of the DOM as you flip and a live selector would miss them. See sizeBook().
  var $ownSize = $('#magazine .own-size');

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
    // Don't hijack real links, and treat the whole "other pages" nav grid as a
    // dead-zone so taps between/around the icons never flip the page underneath.
    if ($(e.target).closest('a, .grid-container').length) return;
    var x = e.pageX - $(this).offset().left;
    $('#magazine').turn(x < $(this).width() / 2 ? 'previous' : 'next');
  });

  // Turn.js needs explicit pixel dimensions; sizing it to the viewport (with a margin
  // left over on every side via the centred flex body) fixes the squished-strip bug.
  sizeBook();
  fitPages();
  // Reveal the book only once Turn.js has built it (CSS hides #magazine until now),
  // so the unstyled inside pages never flash before the cover.
  $('#magazine').addClass('turn-ready');
  $(window).on('resize orientationchange', function () {
    setTimeout(function () { sizeBook(); fitPages(); }, 120);
  });
  // Turn.js swaps pages in/out of the DOM as you flip, and photos finish loading
  // late, so re-fit whenever a turn lands (a few times, to catch images that are
  // still decoding) and whenever any image anywhere in the book reports its size.
  // A capturing listener is used because `load` doesn't bubble, but it does fire on
  // ancestors in the capture phase, so this one handler covers pages Turn.js adds later.
  $('#magazine').bind('turning turned', scheduleFit);
  var magEl = document.getElementById('magazine');
  if (magEl) magEl.addEventListener('load', fitPages, true);

  function scheduleFit() {
    fitPages();
    setTimeout(fitPages, 200);
    setTimeout(fitPages, 600);
  }

  function sizeBook() {
    var w = window.innerWidth, h = window.innerHeight;
    var isMobile = w <= 768;
    var W = Math.floor(w * (isMobile ? 0.92 : 0.95));
    var H = Math.floor(h * (isMobile ? 0.90 : 0.95));
    // An `own-size` page keeps its own CSS box (45vw x 90vh), which Turn.js reads
    // once and then writes back as an inline pixel size. On the next resize it
    // re-reads that inline value, not the rule, so the pages would stay at their
    // very first size for ever and drift out of the resized book. Clearing the
    // inline size first makes them measure the rule again.
    $ownSize.css({ width: '', height: '' });
    try { $('#magazine').turn('size', W, H); } catch (e) {}
  }

  // Keep every scrapbook page's content inside its fixed page box, at any screen
  // size, so nothing (especially the photos near the bottom) is ever clipped.
  // Turn.js pages can't grow, so when the content is taller than the page we scale
  // it down uniformly; on tall screens the scale is 1 and nothing changes.
  // Mobile keeps its own internal scroll (see travelstyle.css), so skip it there.
  function fitPages() {
    if (window.innerWidth <= 768) return;
    // The layout editor drives .fit-inner itself while it is open.
    if (document.documentElement.classList.contains('tl-edit')) return;
    $('#magazine .own-size.scrapbook').each(function () {
      var page = this;
      var inner = page.querySelector(':scope > .fit-inner');
      if (!inner) return;
      var availW = page.clientWidth, avail = page.clientHeight;

      // Frozen hand-placed layout (CSS/travel-layout.css): the content carries an
      // explicit design box, so scale that box to fit the page and centre it,
      // instead of measuring flowed content that no longer exists.
      var cs = getComputedStyle(inner);
      var dw = parseFloat(cs.getPropertyValue('--tl-w'));
      var dh = parseFloat(cs.getPropertyValue('--tl-h'));
      if (dw && dh && availW && avail) {
        var s = Math.min(availW / dw, avail / dh);
        inner.style.transformOrigin = 'top left';
        inner.style.transform = 'translate(' + ((availW - dw * s) / 2) + 'px, ' +
                                ((avail - dh * s) / 2) + 'px) scale(' + s + ')';
        return;
      }

      // Measure at natural scale first, then decide how much to shrink.
      inner.style.transform = '';
      inner.style.transformOrigin = 'top center';
      var content = inner.scrollHeight;    // full natural content height
      if (!avail || !content) return;      // page not currently laid out by Turn.js
      if (content > avail + 1) {
        inner.style.transform = 'scale(' + (avail / content) + ')';
      }
    });
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
