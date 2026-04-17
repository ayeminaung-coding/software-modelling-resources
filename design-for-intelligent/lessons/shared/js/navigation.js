/**
 * Slide Navigation Script - Design for Intelligence Chapter
 * Handles keyboard navigation, navigation buttons, and speaker notes
 */

console.log('Navigation script loaded');

(function() {
    let notesVisible = false;

    const SLIDES = [
        '01-title.html',
        '02-objectives.html',
        '03-outline.html',
        '04-opening-discussion.html',
        '05-section-intelligence.html',
        '06-spectrum.html',
        '07-deterministic-vs-probabilistic.html',
        '08-five-risks.html',
        '09-exercise-risk-check.html',
        '10-case-study-intro.html',
        '11-ai-black-box.html',
        '12-exercise-spot-flaw.html',
        '13-discussion-shipped-ai.html',
        '14-section-patterns.html',
        '15-pattern-ai-service.html',
        '16-pattern-embedded-model.html',
        '17-pattern-pipeline.html',
        '18-pattern-human-loop.html',
        '19-pattern-rag.html',
        '20-pattern-comparison.html',
        '21-exercise-pattern-match.html',
        '22-discussion-build-vs-buy.html',
        '23-section-principles.html',
        '24-isolate-intelligence.html',
        '25-fallback-design.html',
        '26-exercise-fallback-builder.html',
        '27-observability.html',
        '28-exercise-log-review.html',
        '29-data-contracts.html',
        '30-model-versioning.html',
        '31-case-study-applied.html',
        '32-before-after-isolation.html',
        '33-exercise-design-isolation.html',
        '34-section-ai-debt.html',
        '35-model-decay.html',
        '36-hidden-debt.html',
        '37-exercise-anti-pattern.html',
        '38-debt-detection.html',
        '39-discussion-ai-debt.html',
        '40-exercise-dsm-intelligent.html',
        '41-section-synthesis.html',
        '42-exercise-final.html',
        '43-principles-recap.html',
        '44-summary.html',
        '45-references.html',
        '46-closing.html'
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
