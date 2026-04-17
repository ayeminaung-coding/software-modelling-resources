/**
 * Slide Navigation Script
 * Handles keyboard navigation, navigation buttons, and speaker notes
 */

console.log('🚀 Navigation script loaded');

(function() {
    // Configuration
    const TOTAL_SLIDES = 42;
    let notesVisible = false;

    // Load authentication and tracking scripts
    function loadAuthScripts() {
        console.log('📦 Loading Firebase SDK and authentication scripts...');
        const basePath = '../../shared/js/';

        // Firebase SDK scripts (must load first)
        const firebaseSDKScripts = [
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
        ];

        // App scripts (load after Firebase SDK)
        const appScripts = [
            'firebase-config.js',
            'auth-service.js',
            'interaction-tracker.js',
            'login-ui.js',
            'app-init.js'
        ];

        function loadScript(src, isFullUrl = false) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = isFullUrl ? src : basePath + src;
                script.onload = () => {
                    console.log('✅ Loaded:', src);
                    resolve();
                };
                script.onerror = () => {
                    console.error('❌ Failed to load:', src);
                    resolve(); // Don't fail if script not found
                };
                document.body.appendChild(script);
            });
        }

        async function loadAll() {
            // Load Firebase SDK first
            console.log('📦 Loading Firebase SDK...');
            for (const src of firebaseSDKScripts) {
                await loadScript(src, true);
            }
            console.log('✅ Firebase SDK loaded');

            // Then load app scripts
            console.log('📦 Loading app scripts...');
            for (const src of appScripts) {
                await loadScript(src, false);
            }
            console.log('✅ All scripts loaded and ready');
        }

        loadAll();
    }

    // Ordered list of all slides
    const SLIDES = [
        '01-title.html',
        '02-agenda.html',
        '03-section-fundamentals.html',
        '04-what-is-scalability.html',
        '05-types-of-scaling.html',
        '06-vertical-scaling.html',
        '07-horizontal-scaling.html',
        '08-scaling-comparison.html',
        '09-scalability-metrics.html',
        '10-common-bottlenecks.html',
        '11-section-patterns.html',
        '12-load-balancing.html',
        '13-lb-algorithms.html',
        '14-caching-overview.html',
        '15-cache-patterns.html',
        '16-database-scaling.html',
        '17-sharding-strategies.html',
        '18-async-processing.html',
        '19-message-queues.html',
        '20-cdn-edge.html',
        '21-section-microservices.html',
        '22-microservices-intro.html',
        '23-microservices-scaling.html',
        '24-event-driven.html',
        '25-event-sourcing.html',
        '26-event-sourcing-impl.html',
        '27-cqrs-intro.html',
        '28-cqrs-benefits.html',
        '28b-cqrs-sync.html',
        '28c-cqrs-consistency.html',
        '29-saga-pattern.html',
        '30-resilience-patterns.html',
        '31-section-implementation.html',
        '32-frameworks-overview.html',
        '33-kafka-architecture.html',
        '34-kubernetes-scaling.html',
        '35-case-study-netflix.html',
        '36-case-study-uber.html',
        '37-case-study-shopify.html',
        '38-best-practices.html',
        '39-summary.html',
        '40-references.html'
    ];

    // Get current slide index from filename
    function getCurrentSlideIndex() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        const index = SLIDES.indexOf(filename);
        return index >= 0 ? index : 0;
    }

    // Generate slide filename from index
    function getSlideFilename(index) {
        if (index >= 0 && index < SLIDES.length) {
            return SLIDES[index];
        }
        return null;
    }

    // Navigate to slide by index
    async function goToSlide(index) {
        const filename = getSlideFilename(index);
        if (filename) {
            // CRITICAL: Wait for any pending tracking to complete before navigating
            if (window.InteractionTracker && window.InteractionTracker.flushBuffer) {
                console.log('⏳ Waiting for tracking to complete before navigation...');
                try {
                    await window.InteractionTracker.flushBuffer();
                    console.log('✅ Tracking complete, navigating now');
                } catch (error) {
                    console.error('❌ Tracking flush error:', error);
                }
            }
            window.location.href = filename;
        }
    }

    // Navigate to previous slide
    function prevSlide() {
        const current = getCurrentSlideIndex();
        if (current > 0) {
            goToSlide(current - 1);
        }
    }

    // Navigate to next slide
    function nextSlide() {
        const current = getCurrentSlideIndex();
        if (current < SLIDES.length - 1) {
            goToSlide(current + 1);
        }
    }

    // Toggle speaker notes
    function toggleNotes() {
        notesVisible = !notesVisible;
        const notesPanel = document.querySelector('.speaker-notes');
        const notesBtn = document.querySelector('.nav-btn.notes');

        if (notesPanel) {
            notesPanel.classList.toggle('visible', notesVisible);
            document.body.classList.toggle('notes-visible', notesVisible);
            if (notesBtn) {
                notesBtn.classList.toggle('active', notesVisible);
            }
        }
    }

    // Create navigation UI
    function createNavigation() {
        const currentIndex = getCurrentSlideIndex();
        const slide = document.querySelector('.slide');

        // Create navigation container
        const nav = document.createElement('div');
        nav.className = 'slide-nav';

        // Home button
        const homeBtn = document.createElement('a');
        homeBtn.href = '../index.html';
        homeBtn.className = 'nav-btn home';
        homeBtn.innerHTML = '&#8962;';
        homeBtn.title = 'Back to Index (H)';
        nav.appendChild(homeBtn);

        // Notes toggle button
        const notesBtn = document.createElement('button');
        notesBtn.className = 'nav-btn notes';
        notesBtn.innerHTML = '&#9776;';
        notesBtn.title = 'Toggle Speaker Notes (N)';
        notesBtn.onclick = toggleNotes;
        nav.appendChild(notesBtn);

        // Previous button
        const prevBtn = document.createElement('a');
        if (currentIndex > 0) {
            prevBtn.href = getSlideFilename(currentIndex - 1);
            prevBtn.className = 'nav-btn';
            // Intercept click to ensure tracking completes
            prevBtn.onclick = async (e) => {
                e.preventDefault();
                await goToSlide(currentIndex - 1);
            };
        } else {
            prevBtn.className = 'nav-btn disabled';
        }
        prevBtn.innerHTML = '&#8592;';
        prevBtn.title = 'Previous Slide (←)';
        nav.appendChild(prevBtn);

        // Next button
        const nextBtn = document.createElement('a');
        if (currentIndex < SLIDES.length - 1) {
            nextBtn.href = getSlideFilename(currentIndex + 1);
            nextBtn.className = 'nav-btn';
            // Intercept click to ensure tracking completes
            nextBtn.onclick = async (e) => {
                e.preventDefault();
                await goToSlide(currentIndex + 1);
            };
        } else {
            nextBtn.className = 'nav-btn disabled';
        }
        nextBtn.innerHTML = '&#8594;';
        nextBtn.title = 'Next Slide (→)';
        nav.appendChild(nextBtn);

        // Add to body (not slide, so it stays fixed)
        document.body.appendChild(nav);

        // Add slide counter between notes and prev
        const counter = document.createElement('span');
        counter.className = 'slide-counter';
        counter.innerHTML = `${currentIndex + 1} / ${SLIDES.length}`;
        nav.insertBefore(counter, notesBtn.nextSibling);

        // Create keyboard hint
        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        hint.innerHTML = '<kbd>←</kbd> <kbd>→</kbd> navigate · <kbd>N</kbd> notes · <kbd>H</kbd> home';
        document.body.appendChild(hint);
    }

    // Create speaker notes panel
    function createNotesPanel() {
        const notesContent = document.querySelector('script[type="text/speaker-notes"]');
        if (!notesContent) return;

        const panel = document.createElement('div');
        panel.className = 'speaker-notes';

        panel.innerHTML = `
            <div class="speaker-notes-header">
                <h4>Speaker Notes</h4>
                <button class="speaker-notes-close" onclick="this.closest('.speaker-notes').classList.remove('visible'); document.body.classList.remove('notes-visible'); document.querySelector('.nav-btn.notes').classList.remove('active');">&times;</button>
            </div>
            <div class="speaker-notes-content">
                ${notesContent.innerHTML}
            </div>
        `;

        document.body.appendChild(panel);
    }

    // Keyboard navigation
    function handleKeyboard(e) {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                prevSlide();
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ':  // Spacebar
                nextSlide();
                e.preventDefault();
                break;
            case 'Home':
                goToSlide(0);
                e.preventDefault();
                break;
            case 'End':
                goToSlide(SLIDES.length - 1);
                e.preventDefault();
                break;
            case 'h':
            case 'H':
                window.location.href = '../index.html';
                e.preventDefault();
                break;
            case 'n':
            case 'N':
                toggleNotes();
                e.preventDefault();
                break;
            case 'Escape':
                if (notesVisible) {
                    toggleNotes();
                    e.preventDefault();
                }
                break;
        }
    }

    // Detect dark slides (title/section) and add class to body
    function detectDarkSlide() {
        const slide = document.querySelector('.slide');
        if (slide && (slide.classList.contains('title-slide') || slide.classList.contains('section-slide'))) {
            document.body.classList.add('dark-slide');
        }
    }

    // Initialize
    function init() {
        detectDarkSlide();
        createNavigation();
        createNotesPanel();
        document.addEventListener('keydown', handleKeyboard);
        loadAuthScripts(); // Load authentication and tracking
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
