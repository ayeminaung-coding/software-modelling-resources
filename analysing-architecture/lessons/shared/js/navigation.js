/**
 * Slide Navigation Script - Analysing Software Architecture Chapter
 * Handles keyboard navigation, navigation buttons, and speaker notes
 */

console.log('Navigation script loaded');

(function() {
    let notesVisible = false;

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

    function getCurrentSlideIndex() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        const index = SLIDES.indexOf(filename);
        return index >= 0 ? index : 0;
    }

    function getSlideFilename(index) {
        if (index >= 0 && index < SLIDES.length) {
            return SLIDES[index];
        }
        return null;
    }

    function goToSlide(index) {
        const filename = getSlideFilename(index);
        if (filename) {
            window.location.href = filename;
        }
    }

    function prevSlide() {
        const current = getCurrentSlideIndex();
        if (current > 0) {
            goToSlide(current - 1);
        }
    }

    function nextSlide() {
        const current = getCurrentSlideIndex();
        if (current < SLIDES.length - 1) {
            goToSlide(current + 1);
        }
    }

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

    function createNavigation() {
        const currentIndex = getCurrentSlideIndex();

        const nav = document.createElement('div');
        nav.className = 'slide-nav';

        const homeBtn = document.createElement('a');
        homeBtn.href = '../index.html';
        homeBtn.className = 'nav-btn home';
        homeBtn.innerHTML = '&#8962;';
        homeBtn.title = 'Back to Index (H)';
        nav.appendChild(homeBtn);

        const notesBtn = document.createElement('button');
        notesBtn.className = 'nav-btn notes';
        notesBtn.innerHTML = '&#9776;';
        notesBtn.title = 'Toggle Speaker Notes (N)';
        notesBtn.onclick = toggleNotes;
        nav.appendChild(notesBtn);

        const prevBtn = document.createElement('a');
        if (currentIndex > 0) {
            prevBtn.href = getSlideFilename(currentIndex - 1);
            prevBtn.className = 'nav-btn';
        } else {
            prevBtn.className = 'nav-btn disabled';
        }
        prevBtn.innerHTML = '&#8592;';
        prevBtn.title = 'Previous Slide (Left Arrow)';
        nav.appendChild(prevBtn);

        const nextBtn = document.createElement('a');
        if (currentIndex < SLIDES.length - 1) {
            nextBtn.href = getSlideFilename(currentIndex + 1);
            nextBtn.className = 'nav-btn';
        } else {
            nextBtn.className = 'nav-btn disabled';
        }
        nextBtn.innerHTML = '&#8594;';
        nextBtn.title = 'Next Slide (Right Arrow)';
        nav.appendChild(nextBtn);

        document.body.appendChild(nav);

        const counter = document.createElement('span');
        counter.className = 'slide-counter';
        counter.innerHTML = `${currentIndex + 1} / ${SLIDES.length}`;
        nav.insertBefore(counter, notesBtn.nextSibling);

        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        hint.innerHTML = '<kbd>Left</kbd> <kbd>Right</kbd> navigate and <kbd>N</kbd> notes and <kbd>H</kbd> home';
        document.body.appendChild(hint);
    }

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

    function handleKeyboard(e) {
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
            case ' ':
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

    function detectDarkSlide() {
        const slide = document.querySelector('.slide');
        if (slide && (slide.classList.contains('title-slide') || slide.classList.contains('section-slide'))) {
            document.body.classList.add('dark-slide');
        }
    }

    function init() {
        detectDarkSlide();
        createNavigation();
        createNotesPanel();
        document.addEventListener('keydown', handleKeyboard);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
