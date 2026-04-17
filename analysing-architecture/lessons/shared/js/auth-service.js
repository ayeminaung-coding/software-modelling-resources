/**
 * Authentication Service
 * Handles Gmail authentication with domain restriction (lamduan.mfu.ac.th)
 */

console.log('🔐 Auth service loaded');

const ALLOWED_DOMAINS = ['lamduan.mfu.ac.th', 'mfu.ac.th'];

const AuthService = {
    currentUser: null,
    authStateListeners: [],

    /**
     * Initialize authentication service
     */
    init() {
        console.log('🔧 Initializing Auth Service...');
        const auth = window.FirebaseApp.getAuth();
        if (!auth) {
            console.error('❌ Firebase Auth not initialized');
            return;
        }
        console.log('✅ Auth Service initialized');

        auth.onAuthStateChanged((user) => {
            console.log('🔄 Auth state changed:', user ? `Signed in as ${user.email}` : 'Signed out');
            if (user) {
                // Verify domain
                if (this.isAllowedDomain(user.email)) {
                    console.log('✅ User domain verified:', user.email);
                    this.currentUser = user;
                    this.saveUserToFirestore(user);
                } else {
                    console.warn('❌ User domain not allowed:', user.email);
                    // Sign out if not from allowed domain
                    this.signOut();
                    this.showDomainError();
                    return;
                }
            } else {
                console.log('👤 No user authenticated');
                this.currentUser = null;
            }
            console.log('📢 Notifying', this.authStateListeners.length, 'auth state listeners');
            this.notifyListeners(this.currentUser);
        });
    },

    /**
     * Check if email is from allowed domain
     */
    isAllowedDomain(email) {
        if (!email) return false;
        const emailLower = email.toLowerCase();
        return ALLOWED_DOMAINS.some(domain => emailLower.endsWith('@' + domain));
    },

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        const auth = window.FirebaseApp.getAuth();
        if (!auth) {
            console.error('Firebase Auth not initialized');
            return null;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        // Don't restrict hd parameter to allow both domains

        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;

            if (!this.isAllowedDomain(user.email)) {
                await this.signOut();
                this.showDomainError();
                return null;
            }

            return user;
        } catch (error) {
            console.error('Sign in error:', error);
            this.showError(error.message);
            return null;
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        const auth = window.FirebaseApp.getAuth();
        if (auth) {
            try {
                await auth.signOut();
                this.currentUser = null;
            } catch (error) {
                console.error('Sign out error:', error);
            }
        }
    },

    /**
     * Save user data to Firestore
     */
    async saveUserToFirestore(user) {
        const db = window.FirebaseApp.getDb();
        if (!db || !user) return;

        try {
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving user:', error);
        }
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Add auth state listener
     */
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        // Call immediately with current state
        if (this.currentUser !== undefined) {
            callback(this.currentUser);
        }
    },

    /**
     * Notify all listeners
     */
    notifyListeners(user) {
        this.authStateListeners.forEach(callback => callback(user));
    },

    /**
     * Show domain error message
     */
    showDomainError() {
        alert(`Access restricted to MFU email accounts only (@lamduan.mfu.ac.th or @mfu.ac.th).\n\nPlease sign in with your MFU email.`);
    },

    /**
     * Show generic error
     */
    showError(message) {
        alert('Authentication error: ' + message);
    }
};

// Export globally
window.AuthService = AuthService;
