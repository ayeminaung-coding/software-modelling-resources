/**
 * Login UI Component
 * Creates and manages the login interface
 */

console.log('🎨 Login UI loaded');

const LoginUI = {
    container: null,
    userBadge: null,

    /**
     * Initialize login UI
     */
    init() {
        console.log('🔧 Initializing Login UI...');
        this.createUserBadge();
        this.createLoginModal();

        // Listen for auth state changes
        window.AuthService?.onAuthStateChanged((user) => {
            this.updateUI(user);
        });
    },

    /**
     * Create user badge (top-left corner)
     */
    createUserBadge() {
        this.userBadge = document.createElement('div');
        this.userBadge.className = 'user-badge';
        this.userBadge.innerHTML = `
            <div class="user-badge-guest">
                <button class="login-btn" onclick="LoginUI.showLoginModal()">
                    Sign In
                </button>
            </div>
            <div class="user-badge-authenticated" style="display: none;">
                <img class="user-avatar" src="" alt="User">
                <span class="user-name"></span>
                <button class="logout-btn" onclick="LoginUI.handleLogout()" title="Sign Out">
                    &times;
                </button>
            </div>
        `;
        document.body.appendChild(this.userBadge);
    },

    /**
     * Create login modal
     */
    createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.className = 'login-modal';
        modal.innerHTML = `
            <div class="login-modal-content">
                <button class="login-modal-close" onclick="LoginUI.hideLoginModal()">&times;</button>
                <div class="login-modal-header">
                    <h2>Welcome</h2>
                    <p>Sign in to track your learning progress</p>
                </div>
                <div class="login-modal-body">
                    <button class="google-signin-btn" onclick="LoginUI.handleGoogleSignIn()">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>
                    <p class="domain-notice">
                        Only <strong>@lamduan.mfu.ac.th</strong> and <strong>@mfu.ac.th</strong> accounts are allowed
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideLoginModal();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLoginModal();
            }
        });
    },

    /**
     * Show login modal
     */
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('visible');
        }
    },

    /**
     * Hide login modal
     */
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('visible');
        }
    },

    /**
     * Handle Google sign in
     */
    async handleGoogleSignIn() {
        const btn = document.querySelector('.google-signin-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Signing in...';
        }

        try {
            const user = await window.AuthService?.signInWithGoogle();
            if (user) {
                this.hideLoginModal();
            }
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                `;
            }
        }
    },

    /**
     * Handle logout
     */
    async handleLogout() {
        await window.AuthService?.signOut();
    },

    /**
     * Update UI based on auth state
     */
    updateUI(user) {
        const guestUI = document.querySelector('.user-badge-guest');
        const authUI = document.querySelector('.user-badge-authenticated');
        const avatar = document.querySelector('.user-avatar');
        const name = document.querySelector('.user-name');

        if (user) {
            if (guestUI) guestUI.style.display = 'none';
            if (authUI) authUI.style.display = 'flex';
            if (avatar) avatar.src = user.photoURL || '';
            if (name) name.textContent = user.displayName || user.email;
        } else {
            if (guestUI) guestUI.style.display = 'flex';
            if (authUI) authUI.style.display = 'none';
        }
    }
};

// Export globally
window.LoginUI = LoginUI;
