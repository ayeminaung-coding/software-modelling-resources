/**
 * Slide Navigation Script - Analysing Software Architecture Chapter
 * Handles keyboard navigation, navigation buttons, and speaker notes
 */

console.log('Navigation script loaded');

(function() {
    // Configuration
    let notesVisible = false;

    // Ordered list of all slides
    const SLIDES = [
        '01-title.html',
        '02-objectives.html',
        '03-agenda.html',
        '04-why-analyse.html',
        '05-what-to-analyse.html',
        '06-section-use-case.html',
        '07-use-case-analysis.html',
        '08-prototyping.html',
        '09-using-prototypes.html',
        '10-simulation.html',
        '11-scenario-analysis.html',
        '12-exercise-scenarios.html',
        '13-section-qa-analysis.html',
        '14-qa-analysis-overview.html',
        '15-availability-analysis.html',
        '16-performance-analysis.html',
        '17-performance-metrics.html',
        '18-testing-types.html',
        '19-security-analysis.html',
        '20-security-metrics.html',
        '21-modifiability-analysis.html',
        '22-usability-analysis.html',
        '23-exercise-match-metrics.html',
        '24-discussion-testing.html',
        '25-section-tradeoff.html',
        '26-tradeoff-overview.html',
        '27-decision-points.html',
        '28-tradeoff-examples.html',
        '29-exercise-tradeoff.html',
        '30-section-cost-benefit.html',
        '31-cost-benefit-overview.html',
        '32-economic-factors.html',
        '33-exercise-cost-benefit.html',
        '34-roi-calculation.html',
        '35-case-study-migration.html',
        '36-risk-adjusted-analysis.html',
        '37-method-comparison.html',
        '38-summary.html',
        '39-references.html'
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
    function goToSlide(index) {
        const filename = getSlideFilename(index);
        if (filename) {
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
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
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
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
