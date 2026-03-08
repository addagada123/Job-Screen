// Authentication Module
var ADMIN_EMAIL = 'admin@jobscreen.com';

function getCurrentUser() {
    var userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try { return JSON.parse(userStr); } catch (e) { return null; }
    }
    return null;
}

function getAllUsers() {
    var usersStr = localStorage.getItem('users');
    if (usersStr) {
        try { return JSON.parse(usersStr); } catch (e) { return []; }
    }
    return [];
}

function initializeUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(window.mockData.sampleUsers));
    }
    if (!localStorage.getItem('adminRequests')) {
        localStorage.setItem('adminRequests', JSON.stringify([]));
    }
    if (!localStorage.getItem('admin')) {
        localStorage.setItem('admin', JSON.stringify({ id: 'admin1', email: ADMIN_EMAIL, password: 'admin123', role: 'admin', name: 'Admin' }));
    }
}

function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim().toLowerCase();
    var pwd = document.getElementById('loginPassword').value;
    
    if (email === ADMIN_EMAIL) {
        var admin = JSON.parse(localStorage.getItem('admin'));
        if (admin && admin.password === pwd) {
            admin.role = 'admin';
            localStorage.setItem('currentUser', JSON.stringify(admin));
            showPage('admin');
            updateAuthUI();
            return;
        }
    }
    
    var users = getAllUsers();
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email && users[i].password === pwd) {
            user = users[i];
            break;
        }
    }
    
    if (!user) {
        showToast('Invalid credentials', 'error');
        return;
    }
    
    if (user.pendingAdmin === true) {
        showToast('Your admin request is pending. Wait for approval.', 'warning');
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    showPage('dashboard');
    updateDashboard();
    updateAuthUI();
    showToast('Login successful!', 'success');
}

function handleSignup(e) {
    e.preventDefault();
    var name = document.getElementById('signupName').value.trim();
    var email = document.getElementById('signupEmail').value.trim().toLowerCase();
    var pwd = document.getElementById('signupPassword').value;
    var reqAdmChecked = document.getElementById('requestAdmin') ? document.getElementById('requestAdmin').checked : false;
    
    var users = getAllUsers();
    
    for (var i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email) {
            showToast('Email already exists', 'error');
            return;
        }
    }
    
    var newUser = { 
        id: 'u' + Date.now(), 
        name: name, 
        email: email, 
        password: pwd, 
        role: 'user', 
        resume: null, 
        tests: [], 
        pendingAdmin: reqAdmChecked, 
        createdAt: new Date().toISOString() 
    };
    
    if (reqAdmChecked) {
        var requests = JSON.parse(localStorage.getItem('adminRequests') || '[]');
        requests.push({ id: 'req' + Date.now(), userId: newUser.id, name: name, email: email, status: 'pending', requestedAt: new Date().toISOString() });
        localStorage.setItem('adminRequests', JSON.stringify(requests));
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        showToast('Admin request sent! Wait for approval.', 'success');
        setTimeout(function() { showPage('login'); showToast('Admin request pending. Login after approval.', 'info'); }, 1500);
        return;
    }
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showToast('Account created! Please login.', 'success');
    setTimeout(function() { showPage('login'); }, 1000);
}

function logout() {
    localStorage.removeItem('currentUser');
    showPage('landing');
    updateAuthUI();
    showToast('Logged out successfully', 'info');
}

function checkAuth() {
    var u = getCurrentUser();
    if (u) {
        if (u.role === 'admin' || u.email === ADMIN_EMAIL) {
            showPage('admin');
            updateAdminDashboard();
        } else {
            showPage('dashboard');
            updateDashboard();
        }
    }
}

function updateAuthUI() {
    var user = getCurrentUser();
    var navAuth = document.getElementById('navAuth');
    var navUser = document.getElementById('navUser');
    var userName = document.getElementById('userName');
    
    if (user) {
        // Hide login/signup buttons, show user info and logout
        if (navAuth) navAuth.style.display = 'none';
        if (navUser) navUser.style.display = 'flex';
        if (userName) userName.textContent = user.name || user.email.split('@')[0];
    } else {
        // Show login/signup buttons, hide user info
        if (navAuth) navAuth.style.display = 'flex';
        if (navUser) navUser.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeUsers();
    checkAuth();
    updateAuthUI();
});

