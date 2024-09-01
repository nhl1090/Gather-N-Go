document.addEventListener('DOMContentLoaded', function() {
    new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            },
        },
        on: {
            init: function () {
                equalizeSlideHeights(this);
            },
            resize: function () {
                equalizeSlideHeights(this);
            }
        }
    });

    function equalizeSlideHeights(swiper) {
        let maxHeight = 0;
        const slides = swiper.slides;
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.height = '';
            const slideHeight = slides[i].clientHeight;
            maxHeight = Math.max(maxHeight, slideHeight);
        }
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.height = `${maxHeight}px`;
        }
    }
});