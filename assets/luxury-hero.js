// @ts-nocheck
/**
 * Luxury Hero — Ken Burns + Text Reveal
 * Activates Ken Burns zoom only when hero is visible.
 * Reveals text elements with staggered delay.
 */
(function () {
    'use strict';

    function initLuxuryHero() {
        var heroes = document.querySelectorAll('.hero-wrapper');

        if (!heroes.length) return;

        if (!('IntersectionObserver' in window)) {
            heroes.forEach(function (hero) {
                hero.classList.add('ken-burns-active');
                revealHeroText(hero);
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('ken-burns-active');
                        revealHeroText(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
            }
        );

        heroes.forEach(function (hero) {
            observer.observe(hero);
        });
    }

    function revealHeroText(heroWrapper) {
        var contentWrapper = heroWrapper.querySelector('.hero__content-wrapper');
        if (!contentWrapper) return;

        var children = contentWrapper.children;
        for (var i = 0; i < children.length; i++) {
            (function (index) {
                var child = children[index];
                child.classList.add('luxury-text-reveal');
                setTimeout(function () {
                    child.classList.add('luxury-text-reveal--visible');
                    if (index <= 4) {
                        child.classList.add('luxury-text-reveal--delay-' + (index + 1));
                    }
                }, 100);
            })(i);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLuxuryHero);
    } else {
        initLuxuryHero();
    }
})();
