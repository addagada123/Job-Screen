// Firebase Configuration and Initialization
var firebaseConfig = {
    apiKey: "AIzaSyCQq80MWldxfbj38NWnDgJhIEZ2NmIUYEY",
    authDomain: "job-screen.firebaseapp.com",
    projectId: "job-screen",
    storageBucket: "job-screen.firebasestorage.app",
    messagingSenderId: "692215485641",
    appId: "1:692215485641:web:844e8702e05b09b666a918",
    measurementId: "G-7LLB6VDT0G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Google Auth Provider
var googleProvider = new firebase.auth.GoogleAuthProvider();

// Sign in with Google
function signInWithGoogle() {
    firebase.auth().signInWithPopup(googleProvider)
        .then(function(result) {
            var user = result.user;
            handleFirebaseUser(user);
        })
        .catch(function(error) {
            console.error('Firebase Google Sign-In Error:', error);
            showToast('Google Sign-In failed: ' + error.message, 'error');
        });
}

// Handle Firebase user
function handleFirebaseUser(firebaseUser) {
    var email = firebaseUser.email.toLowerCase();
    var name = firebaseUser.displayName;
    var uid = firebaseUser.uid;
    
    var users = getAllUsers();
    
    // Check if user exists
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email) {
            user = users[i];
            break;
        }
    }
    
    if (!user) {
        // Create new user
        user = {
            id: 'firebase_' + uid,
            name: name,
            email: email,
            password: '',
            role: 'user',
            resume: null,
            tests: [],
            firebaseId: uid,
            pendingAdmin: false,
            createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Check if admin request pending
    if (user.pendingAdmin === true) {
        showToast('Your admin request is pending. Wait for approval.', 'warning');
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    showPage('dashboard');
    updateDashboard();
    showToast('Welcome ' + name + '!', 'success');
}

// Google Sign-In from Google OAuth button
function handleGoogleSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var email = profile.getEmail();
    var name = profile.getName();
    var id = profile.getId();
    
    // Also sign in with Firebase for consistency
    firebase.auth().currentUser.getIdToken().then(function(idToken) {
        handleFirebaseUserFromGoogle(email, name, id);
    }).catch(function() {
        // If Firebase fails, use local handling
        handleFirebaseUserFromGoogle(email, name, id);
    });
}

function handleFirebaseUserFromGoogle(email, name, id) {
    var users = getAllUsers();
    
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email.toLowerCase()) {
            user = users[i];
            break;
        }
    }
    
    if (!user) {
        user = {
            id: 'google_' + id,
            name: name,
            email: email,
            password: '',
            role: 'user',
            resume: null,
            tests: [],
            googleId: id,
            pendingAdmin: false,
            createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    if (user.pendingAdmin === true) {
        showToast('Your admin request is pending.', 'warning');
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    showPage('dashboard');
    updateDashboard();
    showToast('Welcome ' + name + '!', 'success');
}

function handleGoogleLoginFailure(error) {
    console.error('Google Sign-In failed:', error);
    showToast('Google Sign-In failed. Try again.', 'error');
}

// Sign out
function firebaseSignOut() {
    firebase.auth().signOut().then(function() {
        logout();
    }).catch(function(error) {
        console.error('Sign out error:', error);
    });
}

