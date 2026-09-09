// @ts-nocheck
/**
 * Luxury Slider JS
 * Autoplay slider with fade transitions and lazy video loading.
 * Only plays/loads when visible via IntersectionObserver.
 */
(function () {
    'use strict';

    function initLuxurySliders() {
        var sliders = document.querySelectorAll('[data-luxury-slider]');
        sliders.forEach(function (slider) {
            new LuxurySlider(slider);
        });
    }

    function LuxurySlider(element) {
        this.el = element;
        this.container = element.querySelector('[data-slides-container]');
        this.slides = element.querySelectorAll('.luxury-slider__slide');
        this.dots = element.querySelectorAll('.luxury-slider__dot');
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.autoplayDelay = 6000;
        this.isVisible = false;

        if (this.slides.length === 0) return;

        this.bindDots();
        this.initVisibilityObserver();
        this.initLazyLoad();
    }

    LuxurySlider.prototype.goTo = function (index) {
        if (index === this.currentIndex) return;

        // Deactivate current
        this.slides[this.currentIndex].classList.remove('luxury-slider__slide--active');
        if (this.dots[this.currentIndex]) {
            this.dots[this.currentIndex].classList.remove('luxury-slider__dot--active');
        }

        // Pause video on current slide
        var currentVideo = this.slides[this.currentIndex].querySelector('video');
        if (currentVideo) currentVideo.pause();

        // Activate new
        this.currentIndex = index;
        this.slides[this.currentIndex].classList.add('luxury-slider__slide--active');
        if (this.dots[this.currentIndex]) {
            this.dots[this.currentIndex].classList.add('luxury-slider__dot--active');
        }

        // Play video on new slide
        var newVideo = this.slides[this.currentIndex].querySelector('video');
        if (newVideo) {
            newVideo.play().catch(function () { });
        }
    };

    LuxurySlider.prototype.next = function () {
        var nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goTo(nextIndex);
    };

    LuxurySlider.prototype.bindDots = function () {
        var self = this;
        this.dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(this.getAttribute('data-dot-index'), 10);
                self.goTo(index);
                self.resetAutoplay();
            });
        });
    };

    LuxurySlider.prototype.startAutoplay = function () {
        var self = this;
        if (this.slides.length <= 1) return;
        this.autoplayInterval = setInterval(function () {
            self.next();
        }, this.autoplayDelay);
    };

    LuxurySlider.prototype.stopAutoplay = function () {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    };

    LuxurySlider.prototype.resetAutoplay = function () {
        this.stopAutoplay();
        this.startAutoplay();
    };

    LuxurySlider.prototype.initVisibilityObserver = function () {
        var self = this;

        if (!('IntersectionObserver' in window)) {
            self.startAutoplay();
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        self.isVisible = true;
                        self.startAutoplay();
                        // Play active video
                        var activeVideo = self.slides[self.currentIndex].querySelector('video');
                        if (activeVideo) activeVideo.play().catch(function () { });
                    } else {
                        self.isVisible = false;
                        self.stopAutoplay();
                        // Pause all videos
                        self.slides.forEach(function (slide) {
                            var video = slide.querySelector('video');
                            if (video) video.pause();
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(this.el);
    };

    LuxurySlider.prototype.initLazyLoad = function () {
        // Load first video immediately, others when approaching
        var self = this;
        this.slides.forEach(function (slide, index) {
            var video = slide.querySelector('video');
            if (!video) return;

            if (index === 0) {
                video.preload = 'auto';
            } else {
                video.preload = 'none';
                // Load next video when current becomes active
                // Already handled by goTo method
            }
        });
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLuxurySliders);
    } else {
        initLuxurySliders();
    }
})();
