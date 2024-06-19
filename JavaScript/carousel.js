class Carousel {
    constructor(carouselId) {
        this.carousel = document.getElementById(carouselId);
        this.items = this.carousel.querySelectorAll('.carousel-item');
        this.itemCount = this.items.length;
        this.theta = 360 / this.itemCount;
        this.currIndex = 0;
        this.isMouseOverCarousel = false;

        this.initCarousel();
    }

    initCarousel() {
        this.updateCarousel();
        this.addEventListeners();
    }

    updateCarousel() {
        this.items.forEach((item, index) => {
            const angle = this.theta * (index - this.currIndex);
            item.style.transform = `rotateY(${angle}deg) translateZ(300px)`;
            item.classList.toggle('active', index === this.currIndex);
        });
    }

    handleMouseEnter() {
        this.isMouseOverCarousel = true;
    }

    handleMouseLeave() {
        this.isMouseOverCarousel = false;
    }

    handleWheel(event) {
        if (this.isMouseOverCarousel) {
            if (event.deltaY !== 0) {
                event.preventDefault(); // Prevent vertical scroll
                if (event.deltaY < 0) {
                    if (this.currIndex === 0) return; // Don't go backward from the first item
                    this.currIndex = (this.currIndex - 1 + this.itemCount) % this.itemCount;
                } else {
                    this.currIndex = (this.currIndex + 1) % this.itemCount;
                }
                this.updateCarousel();
            }
        }
    }

    handleItemClick(event) {
        event.currentTarget.querySelector('.text-box').classList.toggle('active');
    }

    addEventListeners() {
        this.carousel.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.carousel.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.carousel.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        this.items.forEach((item) => {
            item.addEventListener('click', this.handleItemClick);
        });
    }
}

// Create carousels for all elements with IDs
const carouselIds = ['carousel-1', 'carousel-2', 'carousel-3', 'carousel-4', 'carousel-5', 'carousel-6', 'carousel-7', 'carousel-8'];
carouselIds.forEach(id => new Carousel(id));
