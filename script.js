window.addEventListener("gamepadconnected", function(e) {
  var gamepad = navigator.getGamepads()[e.gamepad.index];
  document.getElementById("connectionStatus").textContent = "Gamepad connected: " + gamepad.id;
  updateGamepadStatus();
});

window.addEventListener("gamepaddisconnected", function(e) {
  document.getElementById("connectionStatus").textContent = "Gamepad disconnected";
  document.getElementById("buttonStatus").textContent = "-";
});

var carouselLinks = document.querySelectorAll('.carousel a');
var currentLinkIndex = 1;
var visibleLinks = 2;
var l1Pressed = false;
var r1Pressed = false;
var aPressed = false;
var bPressed = false;
let carouselTimer = null;

var imageCarouselImages = document.querySelectorAll('.image-carousel img');
var currentImageIndex = 0;
var visibleImages = 5;
var imageCarouselTimer = null;

function updateCarousel() {
  for (let i = 0; i < carouselLinks.length; i++) {
    carouselLinks[i].style.display = 'none';
    carouselLinks[i].classList.remove('active');
  }
  for (let i = -Math.floor(visibleLinks / 2); i <= Math.ceil(visibleLinks / 2); i++) {
    let index = (currentLinkIndex + i) % carouselLinks.length;
    if (index < 0) {
      index += carouselLinks.length;
    }
    carouselLinks[index].style.display = 'inline-block';
    if (i === 0) {
      carouselLinks[index].classList.add('active');
    }
  }
}

function updateImageCarousel() {
  for (let i = 0; i < imageCarouselImages.length; i++) {
    imageCarouselImages[i].style.display = 'none';
    imageCarouselImages[i].classList.remove('active');
  }
  for (let i = 0; i < visibleImages; i++) {
    let index = (currentImageIndex + i) % imageCarouselImages.length;
    imageCarouselImages[index].style.display = 'inline-block';
    if (i === 0) {
      imageCarouselImages[index].classList.add('active');
    }
  }
  updateGameTitle();
}

function updateGameTitle() {
  const gameTitleElement = document.getElementById("gameTitle");
  const gameTitles = ["Dragon Ball Z", "God of War", "Grand Theft Auto V", "Spider-Man", "Spider-Man: Miles Morales", "Need For Speed Most Wanted", "Cuphead", "g2", "g3", "g4"];
  gameTitleElement.textContent = gameTitles[currentImageIndex % gameTitles.length];
}

function updateGamepadStatus() {
  var gamepads = navigator.getGamepads();
  if (!gamepads) {
    return;
  }

  var gamepad = gamepads[0];
  if (!gamepad) {
    return;
  }

  var buttons = gamepad.buttons;
  var buttonStatus = "-";
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].pressed) {
      buttonStatus = getButtonLabel(i);
      break;
    }
  }

  if (buttonStatus === "L1" &&!l1Pressed) {
    l1Pressed = true;
    currentLinkIndex = (currentLinkIndex - 1 + carouselLinks.length) % carouselLinks.length;
    updateCarousel();
  } else if (buttonStatus === "R1" &&!r1Pressed) {
    r1Pressed = true;
    currentLinkIndex = (currentLinkIndex + 1) % carouselLinks.length;
    updateCarousel();
  } else if (buttonStatus === "A" &&!aPressed) {
    aPressed = true;
    var activeLink = carouselLinks[currentLinkIndex];
    window.location.href = activeLink.href;
  } else if (buttonStatus === "D PAD LEFT") {
    if (!imageCarouselTimer) {
      imageCarouselTimer = setTimeout(() => {
        imageCarouselTimer = null;
      }, 200);
      currentImageIndex = (currentImageIndex - 1 + imageCarouselImages.length) % imageCarouselImages.length;
      updateImageCarousel();
    }
  } else if (buttonStatus === "D PAD RIGHT") {
    if (!imageCarouselTimer) {
      imageCarouselTimer = setTimeout(() => {
        imageCarouselTimer = null;
      }, 200);
      currentImageIndex = (currentImageIndex + 1) % imageCarouselImages.length;
      updateImageCarousel();
    }
  }
  if (buttonStatus!== "L1") {
    l1Pressed = false;
  }
  if (buttonStatus!== "R1") {
    r1Pressed = false;
  }
  if (buttonStatus!== "A") {
    aPressed = false;
  }

  document.getElementById("buttonStatus").textContent = buttonStatus;
  requestAnimationFrame(updateGamepadStatus);
}

function getButtonLabel(buttonIndex){
  switch (buttonIndex) {
    case 0: return "A";
    case 1: return "B";
    case 2: return "X";
    case 3: return "Y";
    case 4: return "L1";
    case 5: return "R1";
    case 6: return "L2";
    case 7: return "R2";
    case 8: return "SELECT";
    case 9: return "START";
    case 10: return "L3";
    case 11: return "R3";
    case 12: return "D PAD UP";
    case 13: return "D PAD DOWN";
    case 14: return "D PAD LEFT";
    case 15: return "D PAD RIGHT";
    case 16: return "PS";
    default: return "+";
  }
}

updateCarousel();
updateImageCarousel();
requestAnimationFrame(updateGamepadStatus);

document.addEventListener('wheel', function(event) {
  if (event.deltaY < 0) {
    currentImageIndex = (currentImageIndex - 1 + imageCarouselImages.length) % imageCarouselImages.length;
  } else {
    currentImageIndex = (currentImageIndex + 1) % imageCarouselImages.length;
  }
  updateImageCarousel();
});