/**
 * Firebase Configuration and Initialization
 */

console.log('📋 Firebase config loaded');

const firebaseConfig = {
    apiKey: "AIzaSyDsm_5U3Fimz0p1ih6Wyy7HGJlxYLvlRUc",
    authDomain: "webdev2025-1.firebaseapp.com",
    projectId: "webdev2025-1",
    storageBucket: "webdev2025-1.firebasestorage.app",
    messagingSenderId: "853767948689",
    appId: "1:853767948689:web:bede00b3816ee2ecf0f230",
    measurementId: "G-EY1V8X42R2"
};

// Initialize Firebase (will be done after SDK loads)
let app = null;
let auth = null;
let db = null;

function initializeFirebase() {
    console.log('🔧 Initializing Firebase...', typeof firebase);
    if (typeof firebase !== 'undefined') {
        try {
            app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            console.log('✅ Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            return false;
        }
    } else {
        console.error('❌ Firebase SDK not loaded');
        return false;
    }
}

// Export for use in other modules
window.FirebaseApp = {
    config: firebaseConfig, 
    init: initializeFirebase,
    getAuth: () => auth,
    getDb: () => db
};
