'use strict';
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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