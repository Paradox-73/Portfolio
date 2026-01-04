$(document).ready(function() {
    $('.menu-cart').on('click', function() {
      var $this = $(this);
      if ($this.data('original-text') === undefined) {
        $this.data('original-text', $this.text());
      }
      var newText = 'Told you I only cook for myself';
      if ($this.text() === newText) {
        $this.text(newText);
      } else {
        $this.text($this.data('original-text'));
      }
    });

    let player; // Declare player globally

    window.onYouTubeIframeAPIReady = function() {
      player = new YT.Player('youtube-audio-player', {
        height: '0',
        width: '0',
        videoId: 'kwVw3nWc2CI', // The YouTube video ID
        playerVars: {
          autoplay: 1, // Autoplay the video
          controls: 0, // Hide player controls
          loop: 1, // Loop the video
          playlist: 'kwVw3nWc2CI', // Required for looping to work
          modestbranding: 1, // A less prominent YouTube logo
          rel: 0, // Do not show related videos
          showinfo: 0, // Do not show video title and uploader info
          disablekb: 1, // Disable keyboard controls
          fs: 0 // Disable fullscreen button
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    function onPlayerReady(event) {
      // Mute the player by default, unmute on first user interaction if needed
      player.mute();
      // Attempt to play only if not already playing due to autoplay
      if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
        event.target.playVideo();
      }
    }

    function onPlayerStateChange(event) {
      if (event.data === YT.PlayerState.ENDED) {
        player.playVideo(); // Loop the video if it ends
      }
    }

    var musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', function() {
            if (player && player.getPlayerState) { // Check if player is initialized
                if (player.getPlayerState() === YT.PlayerState.PLAYING || player.getPlayerState() === YT.PlayerState.BUFFERING) {
                    player.pauseVideo();
                    musicToggle.classList.remove('playing');
                } else {
                    player.playVideo();
                    player.unMute(); // Unmute on user interaction
                    musicToggle.classList.add('playing');
                }
            }
        });
    }
  });

  const buttons = document.querySelectorAll('button');
  const hoverSound = document.getElementById('hover-sound');
  const activeSound = document.getElementById('active-sound');
  buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
      // hoverSound.play(); // Commented out to prevent NotSupportedError
    });
    button.addEventListener('mouseout', () => {
      hoverSound.pause();
      hoverSound.currentTime = 0; /* reset the audio to the beginning */
    });
    button.addEventListener('mousedown', () => {
      // activeSound.play(); // Commented out to prevent NotSupportedError
    });
    button.addEventListener('mouseup', () => {
      activeSound.pause();
      activeSound.currentTime = 0;
    });
  });
  

  
  