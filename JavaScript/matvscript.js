$('.multiple-items').slick({
  infinite: true,
  slidesToShow: 5,
  slidesToScroll: 5,
  arrows: true,
  nextArrow: '<i class="fa fa-chevron-right"></i>',
  prevArrow: '<i class="fa fa-chevron-left"></i>',
});

document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('header');
  const video = document.querySelector('.background-video');

  setTimeout(function() {
      // Hide the background image by setting its display to none
      

      // Show the video and play it
      video.style.display = 'block';
      video.play();
  }, 3000); // 3 seconds delay

  // Add an event listener to the video to detect when it ends
  video.addEventListener('ended', function() {
      // Hide the video
      video.style.display = 'none';

      // Restore the background image
      wrapper.header.style.background = 'url("../Images/xmen.jpg") no-repeat center';
      wrapper.header.style.backgroundSize = 'cover';
  });
});
