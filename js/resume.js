// Resume Processing Module
function initResumeUpload() {
    // Handled in app.js
}

function handleResumeUpload(file) {
    var allowedExtensions = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
    var fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (allowedExtensions.indexOf(fileExtension) === -1) {
        showToast('Invalid file type. Use PDF, DOCX, JPG, PNG', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('File too large. Max 5MB', 'error');
        return;
    }
    
    showToast('Processing resume...', 'info');
    
    setTimeout(function() {
        var skills = extractSkillsFromFile(file.name);
        var category = detectJobCategory(skills);
        
        var user = getCurrentUser();
        if (user) {
            user.resume = {
                fileName: file.name,
                skills: skills,
                jobCategory: category
            };
            
            updateUserInStorage(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            displayResumeInfo(file.name, skills, category);
            showToast('Resume uploaded!', 'success');
            updateDashboard();
        }
    }, 1500);
}

function extractSkillsFromFile(filename) {
    var lowerName = filename.toLowerCase();
    var allSkills = window.mockData.skillKeywords;
    var foundSkills = [];
    
    for (var i = 0; i < allSkills.length; i++) {
        var skill = allSkills[i];
        if (lowerName.indexOf(skill.toLowerCase()) !== -1) {
            foundSkills.push(skill);
        }
    }
    
    // Add default skills based on keywords
    if (lowerName.indexOf('plumb') !== -1) {
        foundSkills.push('pipe fitting', 'drain cleaning');
    }
    if (lowerName.indexOf('electr') !== -1) {
        foundSkills.push('wiring', 'electrical repair');
    }
    if (lowerName.indexOf('mason') !== -1 || lowerName.indexOf('brick') !== -1) {
        foundSkills.push('brick laying', 'concrete work');
    }
    if (lowerName.indexOf('carpent') !== -1) {
        foundSkills.push('furniture making', 'wood finishing');
    }
    if (lowerName.indexOf('paint') !== -1) {
        foundSkills.push('interior painting', 'exterior painting');
    }
    if (lowerName.indexOf('driver') !== -1 || lowerName.indexOf('drive') !== -1) {
        foundSkills.push('defensive driving', 'cdl');
    }
    
    // Remove duplicates
    var unique = [];
    for (var j = 0; j < foundSkills.length; j++) {
        if (unique.indexOf(foundSkills[j]) === -1) {
            unique.push(foundSkills[j]);
        }
    }
    
    return unique.slice(0, 6);
}

function detectJobCategory(skills) {
    var categories = window.mockData.jobCategories;
    var categoryScores = {};
    
    for (var catKey in categories) {
        var category = categories[catKey];
        var score = 0;
        for (var i = 0; i < skills.length; i++) {
            var skillLower = skills[i].toLowerCase();
            for (var j = 0; j < category.keywords.length; j++) {
                if (skillLower.indexOf(category.keywords[j]) !== -1) {
                    score++;
                    break;
                }
            }
        }
        categoryScores[catKey] = score;
    }
    
    var maxScore = 0;
    var detectedCategory = 'general';
    
    for (var cat in categoryScores) {
        if (categoryScores[cat] > maxScore) {
            maxScore = categoryScores[cat];
            detectedCategory = cat;
        }
    }
    
    return detectedCategory;
}

function displayResumeInfo(fileName, skills, category) {
    var uploadZone = document.getElementById('uploadZone');
    var resumeInfo = document.getElementById('resumeInfo');
    var fileNameEl = document.getElementById('fileName');
    var skillsList = document.getElementById('skillsList');
    var detectedCategory = document.getElementById('detectedCategory');
    
    if (!uploadZone || !resumeInfo) return;
    
    uploadZone.style.display = 'none';
    resumeInfo.style.display = 'block';
    
    if (fileNameEl) fileNameEl.textContent = fileName;
    
    if (skillsList) {
        skillsList.innerHTML = '';
        for (var i = 0; i < skills.length; i++) {
            var tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = skills[i];
            skillsList.appendChild(tag);
        }
    }
    
    if (detectedCategory) {
        var categoryData = window.mockData.jobCategories[category];
        detectedCategory.textContent = categoryData ? categoryData.name : 'General';
    }
}

function removeResume() {
    var user = getCurrentUser();
    if (user) {
        user.resume = null;
        updateUserInStorage(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('resumeInfo').style.display = 'none';
        
        showToast('Resume removed', 'info');
        updateDashboard();
    }
}

function updateUserInStorage(updatedUser) {
    var users = getAllUsers();
    var index = -1;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === updatedUser.id) {
            index = i;
            break;
        }
    }
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function hasResume(user) {
    return user && user.resume && user.resume.fileName;
}

function getUserCategory(user) {
    return user && user.resume ? user.resume.jobCategory : null;
}

