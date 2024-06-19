const slider = document.querySelector('.slider');

function activate(e) {
  const items = document.querySelectorAll('.item');
  if (e.type === 'wheel') {
    const delta = Math.sign(e.deltaY);
    if (delta > 0) {
      slider.append(items[0]);
    } else if (delta < 0) {
      slider.prepend(items[items.length - 1]);
    }
  }
}

document.addEventListener('wheel', activate, false);
