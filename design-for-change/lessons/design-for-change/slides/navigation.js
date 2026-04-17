/**
 * Slide Navigation Script - Design for Change Chapter
 * Handles keyboard navigation, navigation buttons, and speaker notes
 */

console.log('Navigation script loaded');

(function() {
    let notesVisible = false;

    const SLIDES = [
        '01-title.html',
        '02-objectives.html',
        '03-why-change-matters.html',
        '04-choosing-elements.html',
        '05-section-case-study.html',
        '06-expense-system.html',
        '07-what-if-integration.html',
        '08-ripple-effect.html',
        '09-types-of-changes.html',
        '10-section-dsm.html',
        '11-dsm-intro.html',
        '12-exercise-dsm.html',
        '13-conways-law.html',
        '14-socio-technical.html',
        '14b-conways-law-scenario.html',
        '15-section-localize.html',
        '16-localize-changes.html',
        '17-external-integrator.html',
        '18-adapter-pattern.html',
        '19-information-hiding.html',
        '19b-when-to-apply-strategy.html',
        '20-exercise-localize.html',
        '21-section-debt.html',
        '22-technical-debt.html',
        '23-debt-quadrant.html',
        '24-managing-debt.html',
        '25-code-decay.html',
        '25b-code-decay-example.html',
        '26-discussion-debt.html',
        '27-section-exercise.html',
        '28-exercise-payment.html',
        '29-exercise-dsm-improved.html',
        '30-change-cost-graph.html',
        '30b-design-tradeoffs.html',
        '31-principles-recap.html',
        '32-summary.html',
        '33-references.html',
        '34-closing.html'
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
        prevBtn.title = 'Previous Slide (←)';
        nav.appendChild(prevBtn);

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

        document.body.appendChild(nav);

        const counter = document.createElement('span');
        counter.className = 'slide-counter';
        counter.innerHTML = `${currentIndex + 1} / ${SLIDES.length}`;
        nav.insertBefore(counter, notesBtn.nextSibling);

        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        hint.innerHTML = '<kbd>←</kbd> <kbd>→</kbd> navigate · <kbd>N</kbd> notes · <kbd>H</kbd> home';
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

    function initSwipe() {
        var touchStartX = 0;
        var touchStartY = 0;

        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            var target = e.target;
            // Don't swipe on interactive elements
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' || target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('.dsm-cell') || target.closest('.option-label') ||
                target.closest('.radio-option') || target.closest('.nav-btn') ||
                target.closest('.speaker-notes')) {
                return;
            }
            var deltaX = e.changedTouches[0].clientX - touchStartX;
            var deltaY = e.changedTouches[0].clientY - touchStartY;
            // Require dominant horizontal movement
            if (Math.abs(deltaX) < 50) return;
            if (Math.abs(deltaY) > Math.abs(deltaX) * 0.6) return;
            if (deltaX < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }, { passive: true });
    }

    function init() {
        detectDarkSlide();
        createNavigation();
        createNotesPanel();
        document.addEventListener('keydown', handleKeyboard);
        initSwipe();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
