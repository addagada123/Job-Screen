// Test Module with AI Integration
var currentTest = {
    questions: [],
    answers: [],
    currentIndex: 0,
    startTime: null,
    timerInterval: null,
    category: null,
    useAI: true,
    micPermission: false,
    videoPermission: false
};

var TEST_QUESTIONS_COUNT = 15;

// Request microphone and video permissions before test
async function requestPermissions() {
    var micGranted = false;
    var videoGranted = false;
    
    try {
        var micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
        micStream.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.log('Microphone permission denied:', err);
        micGranted = false;
    }
    
    try {
        var videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoGranted = true;
        videoStream.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.log('Video permission denied:', err);
        videoGranted = false;
    }
    
    return { mic: micGranted, video: videoGranted };
}

function showPermissionModal() {
    var modal = document.getElementById('permissionModal');
    if (!modal) {
        var modalHtml = `
            <div class="modal" id="permissionModal">
                <div class="modal-content" style="max-width:450px;text-align:center">
                    <h3>📹 Camera & Microphone Access</h3>
                    <p style="margin:20px 0;color:#94a3b8">This test requires camera and microphone access for proctoring.</p>
                    <div style="display:flex;gap:15px;justify-content:center;margin:25px 0">
                        <div style="text-align:center">
                            <div style="font-size:40px">🎤</div>
                            <div id="micStatus" style="color:#ef4444;font-weight:bold">Not Granted</div>
                            <div style="font-size:12px;color:#64748b">Microphone</div>
                        </div>
                        <div style="text-align:center">
                            <div style="font-size:40px">📹</div>
                            <div id="videoStatus" style="color:#ef4444;font-weight:bold">Not Granted</div>
                            <div style="font-size:12px;color:#64748b">Camera</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="requestPermissionsAndStart()" style="width:100%;margin-bottom:10px">Allow Permissions</button>
                    <button class="btn btn-outline" onclick="startTestWithoutPermissions()" style="width:100%">Skip (Test Without)</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    modal = document.getElementById('permissionModal');
    modal.style.display = 'flex';
    document.getElementById('micStatus').textContent = 'Not Granted';
    document.getElementById('micStatus').style.color = '#ef4444';
    document.getElementById('videoStatus').textContent = 'Not Granted';
    document.getElementById('videoStatus').style.color = '#ef4444';
}

async function requestPermissionsAndStart() {
    var permissions = await requestPermissions();
    currentTest.micPermission = permissions.mic;
    currentTest.videoPermission = permissions.video;
    
    document.getElementById('micStatus').textContent = permissions.mic ? '✓ Granted' : '✗ Denied';
    document.getElementById('micStatus').style.color = permissions.mic ? '#22c55e' : '#ef4444';
    document.getElementById('videoStatus').textContent = permissions.video ? '✓ Granted' : '✗ Denied';
    document.getElementById('videoStatus').style.color = permissions.video ? '#22c55e' : '#ef4444';
    
    if (permissions.mic || permissions.video) {
        setTimeout(function() {
            document.getElementById('permissionModal').style.display = 'none';
            proceedToStartTest();
        }, 1000);
    } else {
        showToast('Please allow at least one permission for proctoring', 'warning');
    }
}

function startTestWithoutPermissions() {
    currentTest.micPermission = false;
    currentTest.videoPermission = false;
    document.getElementById('permissionModal').style.display = 'none';
    proceedToStartTest();
}

function startTest() {
    showPermissionModal();
}

function proceedToStartTest() {
    var user = getCurrentUser();
    
    if (!user) {
        showToast('Please login first', 'error');
        return;
    }
    
    if (!user.resume || !user.resume.jobCategory) {
        showToast('Upload resume first', 'error');
        showDashSection('resume');
        return;
    }
    
    var category = user.resume.jobCategory;
    
    // Show loading state
    document.getElementById('testStart').innerHTML = '<div style="text-align:center;padding:40px"><div class="loader"></div><p>Generating questions with AI...</p></div>';
    
    // Try AI first, fallback to local
    if (currentTest.useAI && window.aiModule) {
        window.aiModule.generateQuestionsWithAI(category, TEST_QUESTIONS_COUNT, function(questions) {
            initTest(questions, category);
        });
    } else {
        var questions = getQuestionsForTest(category);
        initTest(questions, category);
    }
}

function initTest(questions, category) {
    if (!questions || questions.length === 0) {
        showToast('No questions available', 'error');
        showDashSection('resume');
        return;
    }
    
    currentTest = {
        questions: questions,
        answers: [],
        currentIndex: 0,
        startTime: Date.now(),
        timerInterval: null,
        category: category,
        useAI: true,
        micPermission: currentTest.micPermission,
        videoPermission: currentTest.videoPermission
    };
    
    // Hide test start, show test container
    document.getElementById('testStart').style.display = 'none';
    document.getElementById('testContainer').style.display = 'block';
    document.getElementById('testComplete').style.display = 'none';
    
    document.getElementById('qTotal').textContent = questions.length;
    
    // HIDE NAVBAR AND SIDEBAR DURING TEST
    var navbar = document.getElementById('mainNavbar');
    var sidebar = document.getElementById('dashSidebar');
    if (navbar) navbar.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    
    // Start proctoring and timer
    startProctoring();
    startTimer();
    showQuestion(0);
}

function getQuestionsForTest(category) {
    var questionBank = window.mockData.questionBank;
    var categoryQuestions = questionBank[category] || questionBank.plumbing;
    
    // Shuffle
    var shuffled = [];
    var indices = [];
    for (var i = 0; i < categoryQuestions.length; i++) {
        indices.push(i);
    }
    
    // Fisher-Yates shuffle
    for (var j = indices.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var temp = indices[j];
        indices[j] = indices[k];
        indices[k] = temp;
    }
    
    for (var l = 0; l < Math.min(TEST_QUESTIONS_COUNT, categoryQuestions.length); l++) {
        shuffled.push(categoryQuestions[indices[l]]);
    }
    
    return shuffled;
}

function showQuestion(index) {
    if (index >= currentTest.questions.length) {
        completeTest();
        return;
    }
    
    var question = currentTest.questions[index];
    
    document.getElementById('qNum').textContent = index + 1;
    document.getElementById('questionText').textContent = question.question;
    
    var catName = 'General';
    if (window.mockData.jobCategories[currentTest.category]) {
        catName = window.mockData.jobCategories[currentTest.category].name;
    }
    document.getElementById('questionCategory').textContent = catName;
    
    var progress = ((index + 1) / currentTest.questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    document.getElementById('answerText').value = '';
    var transcriptEl = document.getElementById('voiceTranscript');
    if (transcriptEl) {
        transcriptEl.textContent = 'Speech will appear here...';
        transcriptEl.classList.remove('final');
    }
    
    setAnswerMode('text');
    
    // Show/hide Next and Submit buttons based on question position
    var nextBtn = document.getElementById('nextQuestionBtn');
    var submitBtn = document.getElementById('submitTestBtn');
    
    if (nextBtn && submitBtn) {
        if (index < currentTest.questions.length - 1) {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        }
    }
}

function setAnswerMode(mode) {
    var textInputArea = document.getElementById('textInputArea');
    var voiceInputArea = document.getElementById('voiceInputArea');
    var textModeBtn = document.getElementById('textModeBtn');
    var voiceModeBtn = document.getElementById('voiceModeBtn');
    
    if (mode === 'text') {
        if (textInputArea) textInputArea.style.display = 'block';
        if (voiceInputArea) voiceInputArea.style.display = 'none';
        if (textModeBtn) textModeBtn.classList.add('active');
        if (voiceModeBtn) voiceModeBtn.classList.remove('active');
    } else {
        if (textInputArea) textInputArea.style.display = 'none';
        if (voiceInputArea) voiceInputArea.style.display = 'block';
        if (textModeBtn) textModeBtn.classList.remove('active');
        if (voiceModeBtn) voiceModeBtn.classList.add('active');
    }
}

// Save current answer
function saveCurrentAnswer() {
    var answerText = '';
    var textInputArea = document.getElementById('textInputArea');
    var textMode = textInputArea && textInputArea.style.display !== 'none';
    
    if (textMode) {
        answerText = document.getElementById('answerText').value.trim();
    } else {
        var transcript = document.getElementById('voiceTranscript');
        if (transcript && transcript.classList.contains('final')) {
            answerText = transcript.textContent.trim();
        }
    }
    
    // Save or update answer for current question
    var existingIdx = -1;
    for (var i = 0; i < currentTest.answers.length; i++) {
        if (currentTest.answers[i].questionIndex === currentTest.currentIndex) {
            existingIdx = i;
            break;
        }
    }
    
    var question = currentTest.questions[currentTest.currentIndex];
    var answerObj = {
        questionIndex: currentTest.currentIndex,
        questionId: question.id || 'q' + currentTest.currentIndex,
        text: answerText,
        timestamp: Date.now()
    };
    
    if (existingIdx >= 0) {
        currentTest.answers[existingIdx] = answerObj;
    } else {
        currentTest.answers.push(answerObj);
    }
    
    return answerText;
}

function submitAnswer() {
    var answerText = saveCurrentAnswer();
    
    if (!answerText) {
        showToast('Please provide an answer', 'warning');
        return;
    }
    
    // Only auto-advance if not last question
    if (currentTest.currentIndex < currentTest.questions.length - 1) {
        nextQuestion();
    } else {
        // Show submit button for last question
        var submitBtn = document.getElementById('submitTestBtn');
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        showToast('Answer saved! Click Submit Test to finish.', 'info');
    }
}

function nextQuestion() {
    if (currentTest.currentIndex < currentTest.questions.length - 1) {
        currentTest.currentIndex++;
        showQuestion(currentTest.currentIndex);
    }
}

function submitTestNow() {
    saveCurrentAnswer();
    
    // Show confirmation
    if (confirm('Are you sure you want to submit the test? You cannot change your answers after submission.')) {
        // Mark remaining questions as skipped
        while (currentTest.currentIndex < currentTest.questions.length) {
            var question = currentTest.questions[currentTest.currentIndex];
            var alreadyAnswered = false;
            for (var i = 0; i < currentTest.answers.length; i++) {
                if (currentTest.answers[i].questionIndex === currentTest.currentIndex) {
                    alreadyAnswered = true;
                    break;
                }
            }
            if (!alreadyAnswered) {
                currentTest.answers.push({
                    questionIndex: currentTest.currentIndex,
                    questionId: question.id || 'q' + currentTest.currentIndex,
                    text: '',
                    skipped: true,
                    timestamp: Date.now()
                });
            }
            currentTest.currentIndex++;
        }
        completeTest();
    }
}

function completeTest() {
    if (currentTest.timerInterval) {
        clearInterval(currentTest.timerInterval);
    }
    
    stopProctoring();
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    
    // RESTORE NAVBAR AND SIDEBAR AFTER TEST
    var navbar = document.getElementById('mainNavbar');
    var sidebar = document.getElementById('dashSidebar');
    if (navbar) navbar.style.display = '';
    if (sidebar) sidebar.style.display = '';
    
    // Show loading while AI evaluates
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('testComplete').style.display = 'block';
    document.getElementById('previewScore').innerHTML = '<div class="loader"></div><p>AI is evaluating your answers...</p>';
    
    // Evaluate with AI (async)
    evaluateTest(currentTest.answers, currentTest.questions, function(evaluation) {
        var timeTaken = Math.floor((Date.now() - currentTest.startTime) / 1000);
        
        var testResult = {
            id: 'test' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            category: currentTest.category,
            score: evaluation.averageScore,
            totalQuestions: evaluation.totalQuestions,
            correctAnswers: evaluation.correctAnswers,
            timeTaken: timeTaken,
            answers: currentTest.answers,
            evaluation: evaluation,
            aiGenerated: currentTest.useAI
        };
        
        // Update user and admin dashboard
        var user = getCurrentUser();
        if (user) {
            if (!user.tests) user.tests = [];
            user.tests.push(testResult);
            
            var users = getAllUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === user.id) {
                    users[i] = user;
                    break;
                }
            }
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Update admin dashboard
            if (typeof updateAdminDashboard === 'function') {
                updateAdminDashboard();
            }
        }
        
        // Show test complete UI
        document.getElementById('testComplete').style.display = 'block';
        document.getElementById('previewScore').textContent = testResult.score;
        
        showToast('Test completed!', 'success');
        updateDashboard();
    });
}


function submitTest(forced) {
    while (currentTest.currentIndex < currentTest.questions.length) {
        var question = currentTest.questions[currentTest.currentIndex];
        currentTest.answers.push({
            questionIndex: currentTest.currentIndex,
            questionId: question.id || 'q' + currentTest.currentIndex,
            text: '',
            skipped: true,
            timestamp: Date.now()
        });
        currentTest.currentIndex++;
    }
    completeTest();
    if (forced) {
        showToast('Test auto-submitted', 'warning');
    }
}

function startTimer() {
    var startTime = Date.now();
    
    currentTest.timerInterval = setInterval(function() {
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        var minutes = Math.floor(elapsed / 60);
        var seconds = elapsed % 60;
        
        var display = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        document.getElementById('timerDisplay').textContent = display;
    }, 1000);
}

function resetTestUI() {
    document.getElementById('testStart').style.display = 'block';
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('testComplete').style.display = 'none';
    document.getElementById('answerText').value = '';
    
    // Restore navbar and sidebar
    var navbar = document.getElementById('mainNavbar');
    var sidebar = document.getElementById('dashSidebar');
    if (navbar) navbar.style.display = '';
    if (sidebar) sidebar.style.display = '';
    
    // Reset test start content
    document.getElementById('testStart').innerHTML = '<div class="test-instructions"><h3>Before You Begin</h3><ul><li>⚠️ Fullscreen required during test</li><li>⚠️ More than 4 tab switches = auto-submit</li><li>🎤 Answer via voice or text (any language)</li></ul><button class="btn btn-primary btn-lg" onclick="startTest()">🚀 Start Test</button></div>';
}

function canTakeTest() {
    var user = getCurrentUser();
    return user && user.resume && user.resume.jobCategory;
}

function getTestStatus(user) {
    if (!user || !user.tests || user.tests.length === 0) {
        return { status: 'not_taken', text: 'Not Taken' };
    }
    
    var latestTest = user.tests[user.tests.length - 1];
    return {
        status: 'taken',
        text: 'Completed',
        score: latestTest.score,
        date: latestTest.date
    };
}

