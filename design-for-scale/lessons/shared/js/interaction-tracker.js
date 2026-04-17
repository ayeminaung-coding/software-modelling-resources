/**
 * Interaction Tracker Service
 * Tracks user interactions with slide content
 *
 * Storage structure: 1 document per user per lesson
 * Document ID: {lessonId}_{odId}
 * Fields:
 *   - odId: user ID
 *   - lessonId: lesson identifier
 *   - countVisited: number of page views (increments each time user visits a slide)
 *   - countInteracted: number of unique interactive slides user interacted with
 *   - slidesVisited: array of unique slide names visited
 *   - lastVisited: timestamp of last visit
 *   - firstVisited: timestamp of first visit
 *   - userEmail: user email for reference
 */

console.log('Interaction tracker loaded');

const InteractionTracker = {
    sessionId: null,
    startTime: null,
    currentSlide: null,
    currentLesson: null,
    pendingUpdates: new Map(), // lessonId -> {countVisited, slidesVisited, slidesInteracted}
    flushInterval: null,
    isInitialized: false,

    /**
     * Initialize tracker
     */
    init() {
        if (this.isInitialized) {
            console.log('Tracker already initialized');
            return;
        }

        console.log('Initializing Interaction Tracker...');
        this.sessionId = this.generateSessionId();
        this.startTime = new Date();
        this.detectCurrentContext();
        console.log('Context:', { lesson: this.currentLesson, slide: this.currentSlide });

        // Start periodic flush (every 60 seconds)
        this.flushInterval = setInterval(() => this.flushPendingUpdates(), 60000);

        // Flush on page unload
        window.addEventListener('beforeunload', () => {
            this.flushPendingUpdatesSync();
        });

        // Also flush on visibility change (when tab becomes hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.flushPendingUpdates();
            }
        });

        // Wait for auth state before tracking
        if (window.AuthService) {
            let hasTrackedPageView = false;

            const currentUser = window.AuthService.getCurrentUser();
            if (currentUser) {
                console.log('User already authenticated, tracking immediately');
                hasTrackedPageView = true;
                this.trackPageView();
            }

            window.AuthService.onAuthStateChanged((user) => {
                if (user && !hasTrackedPageView) {
                    console.log('User authenticated, tracking page view now');
                    hasTrackedPageView = true;
                    this.trackPageView();
                }
            });
        } else {
            console.warn('AuthService not available, cannot track page view');
        }

        // Setup interaction listeners
        this.setupListeners();
        this.isInitialized = true;
    },

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Detect current lesson and slide from URL
     */
    detectCurrentContext() {
        const path = window.location.pathname;
        // Normalize path separators for Windows compatibility
        const normalizedPath = path.replace(/\\/g, '/');
        const parts = normalizedPath.split('/').filter(p => p);

        console.log('Path detection - normalized:', normalizedPath, 'parts:', parts);

        const lessonsIndex = parts.indexOf('lessons');
        if (lessonsIndex !== -1 && parts.length > lessonsIndex + 1) {
            this.currentLesson = parts[lessonsIndex + 1];

            const slidesIndex = parts.indexOf('slides');
            if (slidesIndex !== -1 && parts.length > slidesIndex + 1) {
                this.currentSlide = parts[slidesIndex + 1].replace('.html', '');
            }
        }

        // Fallback: try to detect from href if pathname didn't work
        if (!this.currentLesson) {
            const href = window.location.href;
            const lessonMatch = href.match(/lessons[\/\\]([^\/\\]+)/);
            if (lessonMatch) {
                this.currentLesson = lessonMatch[1];
                console.log('Lesson detected from href:', this.currentLesson);
            }

            const slideMatch = href.match(/slides[\/\\]([^\/\\]+\.html)/);
            if (slideMatch) {
                this.currentSlide = slideMatch[1].replace('.html', '');
                console.log('Slide detected from href:', this.currentSlide);
            }
        }
    },

    /**
     * Setup event listeners for interactions
     */
    setupListeners() {
        // Track clicks on interactive elements (buttons, inputs in interactive slides)
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .btn, input[type="button"], .interactive-element');
            if (target && this.isInteractiveSlide()) {
                this.trackInteraction('interactive_click');
            }
        });

        // Track form input changes on interactive slides
        document.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea') && this.isInteractiveSlide()) {
                this.trackInteraction('interactive_input');
            }
        });
    },

    /**
     * Check if current slide is an interactive slide
     */
    isInteractiveSlide() {
        // Interactive slides typically have 'interactive' in their filename or specific elements
        const isInteractive = this.currentSlide && (
            this.currentSlide.includes('interactive') ||
            this.currentSlide.includes('exercise') ||
            document.querySelector('.builder-panel, .interactive-container, .qas-builder')
        );
        return isInteractive;
    },

    /**
     * Track page view - increments countVisited and adds slide to slidesVisited
     */
    trackPageView() {
        const user = window.AuthService?.getCurrentUser();
        if (!user || !this.currentLesson) {
            console.log('Not tracking page view - user not authenticated or no lesson context');
            return;
        }

        console.log('Tracking page view:', this.currentLesson, this.currentSlide);

        // Get or create pending update for this lesson
        if (!this.pendingUpdates.has(this.currentLesson)) {
            this.pendingUpdates.set(this.currentLesson, {
                countVisited: 0,
                slidesVisited: new Set(),
                slidesInteracted: new Set()
            });
        }

        const update = this.pendingUpdates.get(this.currentLesson);
        update.countVisited++;
        if (this.currentSlide) {
            update.slidesVisited.add(this.currentSlide);
        }

        // Flush immediately for page views to ensure data is saved
        this.flushPendingUpdates();
    },

    /**
     * Track an interaction on interactive slides - adds slide to slidesInteracted
     */
    trackInteraction(type) {
        const user = window.AuthService?.getCurrentUser();
        if (!user || !this.currentLesson || !this.currentSlide) {
            return;
        }

        console.log('Tracking interaction:', type, 'on slide:', this.currentSlide);

        // Get or create pending update for this lesson
        if (!this.pendingUpdates.has(this.currentLesson)) {
            this.pendingUpdates.set(this.currentLesson, {
                countVisited: 0,
                slidesVisited: new Set(),
                slidesInteracted: new Set()
            });
        }

        const update = this.pendingUpdates.get(this.currentLesson);
        update.slidesInteracted.add(this.currentSlide);

        // Don't flush immediately for interactions - batch them
    },

    /**
     * Get document ID for user-lesson combination
     */
    getDocId(lessonId, odId) {
        return `${lessonId}_${odId}`;
    },

    /**
     * Extract student ID from email (e.g., 623423423@lamduan.mfu.ac.th -> 623423423)
     */
    extractStudentId(email) {
        if (!email) return null;
        const match = email.match(/^(\d+)@/);
        return match ? match[1] : null;
    },

    /**
     * Flush pending updates to Firestore (async)
     */
    async flushPendingUpdates() {
        if (this.pendingUpdates.size === 0) {
            return;
        }

        const db = window.FirebaseApp?.getDb();
        const user = window.AuthService?.getCurrentUser();
        if (!db || !user) {
            console.log('Cannot flush - Firebase not ready');
            return;
        }

        const odId = this.extractStudentId(user.email) || user.uid;
        const updates = new Map(this.pendingUpdates);
        this.pendingUpdates.clear();

        console.log('Flushing', updates.size, 'lesson updates to Firestore...');

        try {
            const batch = db.batch();

            for (const [lessonId, update] of updates) {
                const docId = this.getDocId(lessonId, odId);
                const docRef = db.collection('user_progress').doc(docId);

                // Use set with merge to create or update
                const updateData = {
                    odId: odId,
                    lessonId: lessonId,
                    userEmail: user.email,
                    userName: user.displayName || '',
                    lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
                    countVisited: firebase.firestore.FieldValue.increment(update.countVisited),
                    slidesVisited: firebase.firestore.FieldValue.arrayUnion(...Array.from(update.slidesVisited))
                };

                // Add slidesInteracted if any
                if (update.slidesInteracted.size > 0) {
                    updateData.slidesInteracted = firebase.firestore.FieldValue.arrayUnion(...Array.from(update.slidesInteracted));
                }

                batch.set(docRef, updateData, { merge: true });

                // Set firstVisited only if document doesn't exist (handled by merge)
            }

            await batch.commit();
            console.log('Successfully saved progress updates');
        } catch (error) {
            console.error('Error flushing progress:', error);
            // Re-add failed updates to pending
            for (const [lessonId, update] of updates) {
                if (!this.pendingUpdates.has(lessonId)) {
                    this.pendingUpdates.set(lessonId, update);
                } else {
                    const existing = this.pendingUpdates.get(lessonId);
                    existing.countVisited += update.countVisited;
                    update.slidesVisited.forEach(s => existing.slidesVisited.add(s));
                    update.slidesInteracted.forEach(s => existing.slidesInteracted.add(s));
                }
            }
        }
    },

    /**
     * Synchronous flush using individual writes (for page unload)
     */
    flushPendingUpdatesSync() {
        if (this.pendingUpdates.size === 0) {
            return;
        }

        const db = window.FirebaseApp?.getDb();
        const user = window.AuthService?.getCurrentUser();
        if (!db || !user) {
            return;
        }

        const odId = this.extractStudentId(user.email) || user.uid;
        const updates = new Map(this.pendingUpdates);
        this.pendingUpdates.clear();

        console.log('Sync flushing', updates.size, 'lesson updates...');

        try {
            for (const [lessonId, update] of updates) {
                const docId = this.getDocId(lessonId, odId);
                const docRef = db.collection('user_progress').doc(docId);

                // Fire and forget
                const updateData = {
                    odId: odId,
                    lessonId: lessonId,
                    userEmail: user.email,
                    userName: user.displayName || '',
                    lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
                    countVisited: firebase.firestore.FieldValue.increment(update.countVisited),
                    slidesVisited: firebase.firestore.FieldValue.arrayUnion(...Array.from(update.slidesVisited))
                };

                if (update.slidesInteracted.size > 0) {
                    updateData.slidesInteracted = firebase.firestore.FieldValue.arrayUnion(...Array.from(update.slidesInteracted));
                }

                docRef.set(updateData, { merge: true });
            }
        } catch (error) {
            console.error('Error in sync flush:', error);
        }
    },

    /**
     * Get user progress for a lesson (from new structure)
     */
    async getUserProgress(lessonId) {
        const db = window.FirebaseApp?.getDb();
        const user = window.AuthService?.getCurrentUser();
        if (!db || !user) return null;

        try {
            const odId = this.extractStudentId(user.email) || user.uid;
            const docId = this.getDocId(lessonId, odId);
            const doc = await db.collection('user_progress').doc(docId).get();

            if (doc.exists) {
                const data = doc.data();
                return {
                    slidesVisited: data.slidesVisited || [],
                    countVisited: data.countVisited || 0,
                    slidesInteracted: data.slidesInteracted || [],
                    countInteracted: (data.slidesInteracted || []).length,
                    lastVisited: data.lastVisited
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting progress:', error);
            return null;
        }
    },

    /**
     * Track slide completion (legacy support)
     */
    trackSlideComplete() {
        // Now handled via slidesVisited array
        console.log('Slide complete tracked via slidesVisited');
    }
};

// Export globally
window.InteractionTracker = InteractionTracker;
