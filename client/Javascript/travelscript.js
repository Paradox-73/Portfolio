$(window).on('load', function() {
  'use strict';
  var isMobile = window.innerWidth <= 768;
  $('#magazine').turn({
    display: isMobile? "single" : "double",
    gradients: true, acceleration: true, turnCorners: "tl,tr",
    autoCenter: true, touch: isMobile
  });

    $(document).keydown(function(e){
      if (e.keyCode == 37) {
        $('#magazine').turn('previous');
      } else if (e.keyCode == 39) {
        $('#magazine').turn('next');
      }
    });

    var touchStartX = 0;
    var touchStartY = 0;
    var touchEndX = 0;
    var touchEndY = 0;
    var swipeThreshold = 50; // Minimum horizontal distance for a swipe
    var edgeThreshold = 0.2; // 20% of screen width from edge

    document.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', function(e) {
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', function(e) {
      var swipeDistanceX = touchEndX - touchStartX;
      var swipeDistanceY = touchEndY - touchStartY;
      var screenWidth = window.innerWidth;

      // Check if it's primarily a horizontal swipe
      if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) && Math.abs(swipeDistanceX) > swipeThreshold) {
        if (swipeDistanceX > 0) { // Swiped right
          // Check if swipe started from left edge
          if (touchStartX < screenWidth * edgeThreshold) {
            $('#magazine').turn('previous');
          }
        } else { // Swiped left
          // Check if swipe started from right edge
          if (touchStartX > screenWidth * (1 - edgeThreshold)) {
            $('#magazine').turn('next');
          }
        }
      }

      // Reset touch coordinates
      touchStartX = 0;
      touchStartY = 0;
      touchEndX = 0;
      touchEndY = 0;
    });
});