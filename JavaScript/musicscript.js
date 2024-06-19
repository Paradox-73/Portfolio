//get values
var prev = document.querySelector("#prev");
var next = document.querySelector("#next");
var play = document.querySelector("#play");
var progress = document.querySelector("#progress");
var album = document.querySelector(".album");
var audio = document.querySelector("#audio");
var body = document.body;
var counter = 0;

//object contains song info
var songs = [
  {
    name: 'New Magic Wand',
    artist: 'Tyler, The Creator',
    bg: "../Images/igor.jpg",
    src: '../NEW MAGIC WAND.mp3'
  },
  
  {
    name: 'Slide Away',
    artist: 'Miley Cyrus',
    bg: 'https://i.imgur.com/TE0sDrm.jpeg',
    src: 'https://pl.meln.top/mr/fcda85c63ebcd2dc1a582cff8ee61a15.mp3?session_key=1c4df4798b923579413fc5b02b9f6183'
  },
  
  {
    name: 'King Kunta',
    artist: 'Kendrick Lamar',
    bg: 'https://assets.codepen.io/4927073/icon-124.jpg',
    src: 'https://pl.meln.top/mr/01eba40b70a8069147886c14b39c4654.mp3?session_key=6c9ac65d4a9832ac19bfce1d004081b3'
  },
  
  {
    name: "Can't Tell Me Nothing",
    artist: 'Kanye West',
    bg: 'https://lastfm.freetls.fastly.net/i/u/ar0/ec93136e9d7f5aed02ebbd4ae5200453',
    src: 'https://pl.meln.top/mr/01eba40b70a8069147886c14b39c4654.mp3?session_key=6c9ac65d4a9832ac19bfce1d004081b3'
  },
  {
    name: 'Ghost',
    artist: 'Justin Bieber',
    bg: 'https://images.genius.com/82474db689b7894a66cf5bc4cd35575c.2048x2048x1.jpg',
    src: 'https://pl.meln.top/mr/01eba40b70a8069147886c14b39c4654.mp3?session_key=6c9ac65d4a9832ac19bfce1d004081b3'
  },
  {
    name: 'Reborn',
    artist: 'KIDS SEE GHOSTS',
    bg: 'https://i.pinimg.com/originals/04/ae/d4/04aed4d147be4b9d004deedaf6cb4f6c.jpg',
    src: 'https://pl.meln.top/mr/01eba40b70a8069147886c14b39c4654.mp3?session_key=6c9ac65d4a9832ac19bfce1d004081b3'
  },
  
  {
    name: 'HOTEL LOBBY (Unc & Phew)',
    artist: 'Quavo',
    bg: 'https://is2-ssl.mzstatic.com/image/thumb/Music126/v4/e3/e0/e7/e3e0e70f-3dae-0c98-9428-679529fa405f/22UMGIM51309.rgb.jpg/3000x3000bb.jpg',
    src: 'https://pl.meln.top/mr/242971d39dd4abd59c0d7a2d5c144f73.mp3?session_key=18351301869fbafe1e0ee5a7609f3245'
  },
  
  {
    name: 'Rich Spirit',
    artist: 'Kendrick Lamar',
    bg: 'https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/JY77VEGS2UI6ZI5PJMVZM3G3CI.jpg',
    src: 'https://pl.meln.top/mr/9e9ab510f8588f30a012974ea36820ff.mp3?session_key=46c75a331f370e60f481006a13f22536'
  },
  
  {
    name: 'Paranoid',
    artist: 'Post Malone',
    bg: 'https://assets.codepen.io/4927073/icon-125_1.jpg',
    src: 'https://pl.meln.top/mr/01eba40b70a8069147886c14b39c4654.mp3?session_key=6c9ac65d4a9832ac19bfce1d004081b3'
  },
  
  {
    name: 'Miss My Dawgs (with Lil Wayne)',
    artist: 'YG, Lil Wayne',
    bg: 'https://lastfm.freetls.fastly.net/i/u/ar0/be5717623e79655cc4e333b5ce640926.jpg',
    src: 'https://pl.meln.top/mr/242971d39dd4abd59c0d7a2d5c144f73.mp3?session_key=18351301869fbafe1e0ee5a7609f3245'
  },
  
  {
    name: 'Cinderella',
    artist: 'Metro Boomin, Future',
    bg: 'https://assets.codepen.io/4927073/433452617_952539916241903_4937267218052324278_n.jpg',
    src: 'https://assets.codepen.io/4927073/433452617_952539916241903_4937267218052324278_n.jpg'
  },
  
  {
    name: 'What Goes Around... Comes Around',
    artist: 'Justin Timberlake',
    bg: 'https://lastfm.freetls.fastly.net/i/u/ar0/5a4c913910cd9c3a7a4bd931a3c16591',
    src: 'https://pl.meln.top/mr/242971d39dd4abd59c0d7a2d5c144f73.mp3?session_key=18351301869fbafe1e0ee5a7609f3245'
  },
  {
    name: 'Erase Your Social',
    artist: 'Lil Uzi Vert',
    bg: 'https://images-na.ssl-images-amazon.com/images/I/71bGDcqdC0L.jpg',
    src: 'https://pl.meln.top/mr/01eba40b70a8069147886c14b39c4654.mp3?session_key=6c9ac65d4a9832ac19bfce1d004081b3'
  }
];


play.addEventListener('click', function(){
  if(audio.paused){
    audio.play();
    play.setAttribute("name", "pause-circle");
  } else {
    audio.pause();
    play.setAttribute("name", "play-circle");
  }
});

next.addEventListener('click', function(){
  if(counter < songs.length-1)
    {
      counter++;
      audio.setAttribute("src", songs[counter].src);
      album.setAttribute("style", "background-image: url(" + songs[counter].bg + ")");
      h.innerHTML = songs[counter].name;
      p.innerHTML = songs[counter].artist;
      body.setAttribute("style", "background-image: url(" + songs[counter].bg + ")");
    } else {
      audio.setAttribute("src", songs[0].src);
      album.setAttribute("style", "background-image: url(" + songs[0].bg + ")");
      h.innerHTML = songs[0].name;
      p.innerHTML = songs[0].artist;
      body.setAttribute("style", "background-image: url(" + songs[0].bg + ")");
    }
});

prev.addEventListener('click', function(){
  if(counter == 0)
    {
      audio.setAttribute("src", songs[0].src);
      album.setAttribute("style", "background-image: url(" + songs[0].bg + ")");
      h.innerHTML = songs[0].name;
      p.innerHTML = songs[0].artist;
      body.setAttribute("style", "background-image: url(" + songs[0].bg + ")");
    } else {
      counter--;
      audio.setAttribute("src", songs[counter].src);
      album.setAttribute("style", "background-image: url(" + songs[counter].bg + ")");
      h.innerHTML = songs[counter].name;
      p.innerHTML = songs[counter].artist;
      body.setAttribute("style", "background-image: url(" + songs[counter].bg + ")");
    }
});

document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio');
  const progress = document.getElementById('progress');

  audio.addEventListener('timeupdate', () => {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = progressPercent + '%';
  });
});