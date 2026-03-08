// Main App Functions
var currentPage = 'landing';

function showPage(page) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    
    var target = document.getElementById(page + 'Page');
    if (target) {
        target.classList.add('active');
    }
    currentPage = page;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function showDashSection(section) {
    var sections = document.querySelectorAll('.dash-section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }
    
    var target = document.getElementById('dash' + section.charAt(0).toUpperCase() + section.slice(1));
    if (target) {
        target.classList.add('active');
    }
    
    // Update nav
    var links = document.querySelectorAll('.sidebar-nav a');
    for (var j = 0; j < links.length; j++) {
        links[j].classList.remove('active');
    }
    event.target.classList.add('active');
    
    if (section === 'results') {
        displayResults();
    }
}

function showAdminSection(section) {
    var sections = document.querySelectorAll('.admin-section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }
    
    var target = document.getElementById('admin' + section.charAt(0).toUpperCase() + section.slice(1));
    if (target) {
        target.classList.add('active');
    }
    
    // Update nav
    var links = document.querySelectorAll('.admin-nav a');
    for (var j = 0; j < links.length; j++) {
        links[j].classList.remove('active');
    }
    event.target.classList.add('active');
    
    if (section === 'overview') {
        updateAdminDashboard();
    } else if (section === 'candidates') {
        displayCandidates();
    } else if (section === 'requests') {
        displayRequests();
    }
}

function updateDashboard() {
    var user = getCurrentUser();
    if (!user) return;
    
    // Update profile
    var dashName = document.getElementById('dashName');
    var welcomeName = document.getElementById('welcomeName');
    var dashAvatar = document.getElementById('dashAvatar');
    
    if (dashName) dashName.textContent = user.name || 'User';
    if (welcomeName) welcomeName.textContent = user.name || 'User';
    if (dashAvatar) dashAvatar.textContent = (user.name ? user.name.charAt(0).toUpperCase() : 'U');
    
    // Update resume status
    var resumeStatus = document.getElementById('resumeStatus');
    if (resumeStatus) {
        if (user.resume && user.resume.fileName) {
            resumeStatus.textContent = 'Uploaded';
            resumeStatus.style.color = '#10b981';
        } else {
            resumeStatus.textContent = 'Not Uploaded';
            resumeStatus.style.color = '#f59e0b';
        }
    }
    
    // Update test status
    var testStatus = document.getElementById('testStatus');
    if (testStatus) {
        if (user.tests && user.tests.length > 0) {
            var lastTest = user.tests[user.tests.length - 1];
            testStatus.textContent = lastTest.score + '%';
            testStatus.style.color = lastTest.score >= 60 ? '#10b981' : '#ef4444';
        } else {
            testStatus.textContent = 'Not Taken';
            testStatus.style.color = '#f59e0b';
        }
    }
    
    // Show/hide resume actions
    var resumeActions = document.getElementById('resumeActions');
    if (resumeActions) {
        if (user.resume && user.resume.fileName) {
            resumeActions.style.display = 'block';
        } else {
            resumeActions.style.display = 'none';
        }
    }
}

function displayResults() {
    var user = getCurrentUser();
    var container = document.getElementById('resultsContainer');
    if (!container || !user) return;
    
    if (!user.tests || user.tests.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8"><span style="font-size:48px">📊</span><p>No test results yet</p></div>';
        return;
    }
<<<<<<< HEAD
    // Hide scores for users, only show test taken info
    var html = '';
    for (var i = user.tests.length - 1; i >= 0; i--) {
        var test = user.tests[i];
=======
    
    var html = '';
    for (var i = user.tests.length - 1; i >= 0; i--) {
        var test = user.tests[i];
        var scoreClass = test.score >= 70 ? 'high' : (test.score >= 50 ? 'medium' : 'low');
        
>>>>>>> 3fbe6ee53dd1170fee4e2a25ab5edf12299f9ae9
        html += '<div class="result-card">';
        html += '<div class="result-info">';
        html += '<h4>' + (window.mockData.jobCategories[test.category] ? window.mockData.jobCategories[test.category].name : test.category) + '</h4>';
        html += '<p>Date: ' + test.date + ' | Questions: ' + test.totalQuestions + '</p>';
<<<<<<< HEAD
        html += '<span style="color:#64748b">Result will be reviewed by admin.</span>';
        html += '</div>';
        html += '</div>';
    }
=======
        html += '</div>';
        html += '<div class="result-score">';
        html += '<span class="score-badge ' + scoreClass + '">' + test.score + '%</span>';
        html += '</div>';
        html += '</div>';
    }
    
>>>>>>> 3fbe6ee53dd1170fee4e2a25ab5edf12299f9ae9
    container.innerHTML = html;
}

function updateAdminDashboard() {
    var users = getAllUsers();
    
    // Calculate stats
    var totalCandidates = 0;
    var totalTests = 0;
    var totalScore = 0;
    var categoryCount = {};
    
    for (var i = 0; i < users.length; i++) {
        if (users[i].tests && users[i].tests.length > 0) {
            totalCandidates++;
            for (var j = 0; j < users[i].tests.length; j++) {
                totalTests++;
                totalScore += users[i].tests[j].score;
                
                var cat = users[i].tests[j].category;
                categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            }
        }
    }
    
    var avgScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
    
    // Find top category
    var topCat = '--';
    var maxCount = 0;
    for (var cat in categoryCount) {
        if (categoryCount[cat] > maxCount) {
            maxCount = categoryCount[cat];
            topCat = cat;
        }
    }
    if (topCat !== '--' && window.mockData.jobCategories[topCat]) {
        topCat = window.mockData.jobCategories[topCat].name;
    }
    
    // Update UI
    var el = document.getElementById('totalCandidates');
    if (el) el.textContent = totalCandidates;
    
    el = document.getElementById('totalTests');
    if (el) el.textContent = totalTests;
    
    el = document.getElementById('avgScoreAdmin');
    if (el) el.textContent = avgScore + '%';
    
    el = document.getElementById('topCategory');
    if (el) el.textContent = topCat;
}

function displayCandidates() {
    var users = getAllUsers();
    var tbody = document.getElementById('candidatesTableBody');
    if (!tbody) return;
    
    // Sort by score
    var ranked = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].tests && users[i].tests.length > 0) {
            var avgScore = 0;
            for (var j = 0; j < users[i].tests.length; j++) {
                avgScore += users[i].tests[j].score;
            }
            avgScore = Math.round(avgScore / users[i].tests.length);
            
            ranked.push({
                user: users[i],
                avgScore: avgScore,
                testsCount: users[i].tests.length,
                lastTest: users[i].tests[users[i].tests.length - 1].date,
                category: users[i].resume ? users[i].resume.jobCategory : 'N/A'
            });
        }
    }
    
    ranked.sort(function(a, b) { return b.avgScore - a.avgScore; });
    
    if (ranked.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8">No candidates yet</td></tr>';
        return;
    }
    
    var html = '<thead><tr><th>Rank</th><th>Name</th><th>Email</th><th>Category</th><th>Score</th><th>Tests</th><th>Last Test</th></tr></thead><tbody>';
    
    for (var k = 0; k < ranked.length; k++) {
        var r = ranked[k];
        var rankClass = 'default';
        if (k === 0) rankClass = 'gold';
        else if (k === 1) rankClass = 'silver';
        else if (k === 2) rankClass = 'bronze';
        
        var catName = r.category;
        if (r.category !== 'N/A' && window.mockData.jobCategories[r.category]) {
            catName = window.mockData.jobCategories[r.category].name;
        }
        
        html += '<tr>';
        html += '<td><span class="rank-badge ' + rankClass + '">' + (k + 1) + '</span></td>';
        html += '<td>' + (r.user.name || 'N/A') + '</td>';
        html += '<td>' + r.user.email + '</td>';
        html += '<td>' + catName + '</td>';
        html += '<td>' + r.avgScore + '%</td>';
        html += '<td>' + r.testsCount + '</td>';
        html += '<td>' + r.lastTest + '</td>';
        html += '</tr>';
    }
    
    html += '</tbody>';
    tbody.innerHTML = html;
}

function displayRequests() {
    var requests = JSON.parse(localStorage.getItem('adminRequests') || '[]');
    var container = document.getElementById('requestsList');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8">No pending requests</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < requests.length; i++) {
        var req = requests[i];
        if (req.status === 'pending') {
            html += '<div class="request-card" style="background:#1e2633;padding:20px;border-radius:12px;margin-bottom:15px">';
            html += '<h4>' + (req.name || 'N/A') + '</h4>';
            html += '<p style="color:#94a3b8">' + req.email + '</p>';
            html += '<p style="color:#64748b;font-size:12px">Requested: ' + req.requestedAt + '</p>';
            html += '<div style="margin-top:15px">';
            html += '<button class="btn btn-primary" onclick="approveRequest(\'' + req.userId + '\')" style="margin-right:10px">Approve</button>';
            html += '<button class="btn btn-outline" onclick="rejectRequest(\'' + req.userId + '\')">Reject</button>';
            html += '</div>';
            html += '</div>';
        }
    }
    
    if (html === '') {
        html = '<div style="text-align:center;padding:40px;color:#94a3b8">No pending requests</div>';
    }
    
    container.innerHTML = html;
}

function approveRequest(userId) {
    var users = getAllUsers();
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            users[i].pendingAdmin = false;
            users[i].role = 'admin';
            break;
        }
    }
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update request status
    var requests = JSON.parse(localStorage.getItem('adminRequests') || '[]');
    for (var j = 0; j < requests.length; j++) {
        if (requests[j].userId === userId) {
            requests[j].status = 'approved';
            requests[j].approvedAt = new Date().toISOString();
        }
    }
    localStorage.setItem('adminRequests', JSON.stringify(requests));
    
    showToast('Admin access granted!', 'success');
    displayRequests();
}

function rejectRequest(userId) {
    var users = getAllUsers();
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            users[i].pendingAdmin = false;
            break;
        }
    }
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update request status
    var requests = JSON.parse(localStorage.getItem('adminRequests') || '[]');
    for (var j = 0; j < requests.length; j++) {
        if (requests[j].userId === userId) {
            requests[j].status = 'rejected';
            requests[j].rejectedAt = new Date().toISOString();
        }
    }
    localStorage.setItem('adminRequests', JSON.stringify(requests));
    
    showToast('Admin request rejected', 'info');
    displayRequests();
}

function filterCandidates() {
    displayCandidates();
}

// Toast notification
function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;top:80px;right:20px;padding:15px 25px;background:' + 
        (type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#00d4ff') + 
        ';color:#fff;border-radius:8px;z-index:9999;animation:slideIn 0.3s ease';
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS for toast animation
var style = document.createElement('style');
style.textContent = '@keyframes slideIn {from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}} @keyframes slideOut {from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
document.head.appendChild(style);

// Resume upload handlers
document.addEventListener('DOMContentLoaded', function() {
    var chooseFileBtn = document.getElementById('chooseFileBtn');
    var resumeInput = document.getElementById('resumeInput');
    var uploadZone = document.getElementById('uploadZone');
    
    if (chooseFileBtn && resumeInput) {
        chooseFileBtn.addEventListener('click', function() {
            resumeInput.click();
        });
        
        resumeInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleResumeUpload(e.target.files[0]);
            }
        });
    }
    
    if (uploadZone) {
        uploadZone.addEventListener('click', function() {
            if (resumeInput) resumeInput.click();
        });
        
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadZone.style.borderColor = '#00d4ff';
        });
        
        uploadZone.addEventListener('dragleave', function() {
            uploadZone.style.borderColor = '#333';
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadZone.style.borderColor = '#333';
            if (e.dataTransfer.files.length > 0) {
                handleResumeUpload(e.dataTransfer.files[0]);
            }
        });
    }
    
    // Check auth
    checkAuth();
});
