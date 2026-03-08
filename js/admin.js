// Admin Module
function updateAdminDashboard() {
    var users = getAllUsers();
    
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

