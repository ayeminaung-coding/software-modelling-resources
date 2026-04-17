/**
 * Application Initialization
 * Loads Firebase SDK and initializes all services
 */

console.log('🚀 App init script loaded');

(function() {
    // Load Firebase SDK dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function initializeApp() {
        console.log('🔧 Starting app initialization...');
        try {
            // Check if Firebase SDK is already loaded (from navigation.js)
            if (typeof firebase === 'undefined') {
                console.log('📦 Loading Firebase SDK...');
                await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
                await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
                await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
                console.log('✅ Firebase SDK loaded by app-init');
            } else {
                console.log('✅ Firebase SDK already loaded');
            }

            // Initialize Firebase
            if (window.FirebaseApp) {
                console.log('🔧 Calling FirebaseApp.init()...');
                window.FirebaseApp.init();
            }

            // Initialize Auth Service
            if (window.AuthService) {
                console.log('🔧 Calling AuthService.init()...');
                window.AuthService.init();
            }

            // Initialize Login UI
            if (window.LoginUI) {
                console.log('🔧 Calling LoginUI.init()...');
                window.LoginUI.init();
            }

            // Initialize Interaction Tracker after auth is ready
            if (window.InteractionTracker) {
                console.log('⏳ Waiting 1s before initializing tracker...');
                // Wait a bit for auth state to settle
                setTimeout(() => {
                    window.InteractionTracker.init();
                    console.log('✅ All services initialized');
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error initializing app:', error);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();
