// @ts-nocheck
/**
 * Luxury Scroll Reveal System
 * Uses IntersectionObserver for progressive element reveal on scroll.
 * Lightweight, performant — auto-disconnects after reveal.
 */
(function () {
    'use strict';

    const REVEAL_CLASS = 'luxury-reveal';
    const STAGGER_CLASS = 'luxury-reveal-stagger';
    const VISIBLE_CLASS = 'luxury-reveal--visible';
    const TEXT_REVEAL_CLASS = 'luxury-text-reveal';
    const TEXT_VISIBLE_CLASS = 'luxury-text-reveal--visible';

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15,
    };

    function handleIntersection(entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add(VISIBLE_CLASS);

                // For text reveals
                if (entry.target.classList.contains(TEXT_REVEAL_CLASS)) {
                    entry.target.classList.add(TEXT_VISIBLE_CLASS);
                }

                // Disconnect after reveal for performance
                observer.unobserve(entry.target);
            }
        });
    }

    function initReveal() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: show everything if IO not supported
            var elements = document.querySelectorAll('.' + REVEAL_CLASS + ', .' + STAGGER_CLASS + ', .' + TEXT_REVEAL_CLASS);
            elements.forEach(function (el) {
                el.classList.add(VISIBLE_CLASS);
                if (el.classList.contains(TEXT_REVEAL_CLASS)) {
                    el.classList.add(TEXT_VISIBLE_CLASS);
                }
            });
            return;
        }

        var observer = new IntersectionObserver(handleIntersection, observerOptions);

        // Observe all reveal elements
        var revealElements = document.querySelectorAll('.' + REVEAL_CLASS + ', .' + STAGGER_CLASS + ', .' + TEXT_REVEAL_CLASS);
        revealElements.forEach(function (el) {
            observer.observe(el);
        });

        // Also observe dynamically added sections (for Shopify theme editor)
        var mutationObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) {
                        if (node.classList && (node.classList.contains(REVEAL_CLASS) || node.classList.contains(STAGGER_CLASS) || node.classList.contains(TEXT_REVEAL_CLASS))) {
                            observer.observe(node);
                        }
                        var children = node.querySelectorAll && node.querySelectorAll('.' + REVEAL_CLASS + ', .' + STAGGER_CLASS + ', .' + TEXT_REVEAL_CLASS);
                        if (children) {
                            children.forEach(function (child) {
                                observer.observe(child);
                            });
                        }
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    // Page transition handler
    function initPageTransitions() {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a[href]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;

            // Only handle internal links
            if (link.hostname && link.hostname !== window.location.hostname) return;

            e.preventDefault();
            document.body.classList.add('luxury-page-transitioning');

            setTimeout(function () {
                window.location.href = href;
            }, 300);
        });
    }

    /**
     * Fix for bfcache (Back/Forward Cache) navigation.
     * When the user presses the back/forward button, the browser may restore the page
     * from cache. If the page was in a transition state (opacity: 0), it will remain
     * invisible. This handler resets all animation states so the page is fully visible.
     */
    function initBfcacheFix() {
        window.addEventListener('pageshow', function (event) {
            // event.persisted === true means the page was restored from bfcache
            if (event.persisted) {
                // 1. Remove the page-transitioning class (which sets opacity: 0)
                document.body.classList.remove('luxury-page-transitioning');

                // 2. Force-reveal all scroll reveal elements that may still be hidden
                var allRevealEls = document.querySelectorAll(
                    '.' + REVEAL_CLASS + ', .' + STAGGER_CLASS + ', .' + TEXT_REVEAL_CLASS
                );
                allRevealEls.forEach(function (el) {
                    el.classList.add(VISIBLE_CLASS);
                    if (el.classList.contains(TEXT_REVEAL_CLASS)) {
                        el.classList.add(TEXT_VISIBLE_CLASS);
                    }
                });
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initReveal();
            initPageTransitions();
            initBfcacheFix();
        });
    } else {
        initReveal();
        initPageTransitions();
        initBfcacheFix();
    }
})();
