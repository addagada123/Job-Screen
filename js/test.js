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

var TEST_QUESTIONS_COUNT = 5;

// Request microphone and video permissions before test
async function requestPermissions() {
    var micGranted = false;
    var videoGranted = false;
    try {
        var micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
        micStream.getTracks().forEach(track => track.stop());
    } catch (err) { micGranted = false; }
    try {
        var videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoGranted = true;
        videoStream.getTracks().forEach(track => track.stop());
    } catch (err) { videoGranted = false; }
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
    document.getElementById('testStart').innerHTML = '<div style="text-align:center;padding:40px"><div class="loader"></div><p>Generating questions with AI...</p></div>';
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
    document.getElementById('testStart').style.display = 'none';
    document.getElementById('testContainer').style.display = 'block';
    document.getElementById('testComplete').style.display = 'none';
    document.getElementById('qTotal').textContent = questions.length;
    // Hide navbar and sidebar for distraction-free test
    var navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.display = 'none';
    var dashSidebar = document.querySelector('.dashboard-sidebar');
    if (dashSidebar) dashSidebar.style.display = 'none';
    // Hide all other dashboard sections
    var dashMain = document.querySelector('.dashboard-main');
    if (dashMain) dashMain.style.background = '#181f2a';
    // Add Next/Submit buttons if not present
    var answerSection = document.querySelector('.answer-section');
    if (answerSection && !document.getElementById('nextQuestionBtn')) {
        var nextBtn = document.createElement('button');
        nextBtn.id = 'nextQuestionBtn';
        nextBtn.className = 'btn btn-primary';
        nextBtn.textContent = 'Next Question';
        nextBtn.onclick = nextQuestion;
        nextBtn.style.marginRight = '10px';
        answerSection.appendChild(nextBtn);
    }
    if (answerSection && !document.getElementById('submitTestBtn')) {
        var submitBtn = document.createElement('button');
        submitBtn.id = 'submitTestBtn';
        submitBtn.className = 'btn btn-success';
        submitBtn.textContent = 'Submit Test';
        submitBtn.onclick = submitTestNow;
        answerSection.appendChild(submitBtn);
    }
    startProctoring && startProctoring();
    startTimer && startTimer();
    showQuestion(0);
}

function getQuestionsForTest(category) {
    var questionBank = window.mockData.questionBank;
    var categoryQuestions = questionBank[category] || questionBank.plumbing;
    var shuffled = [];
    var indices = [];
    for (var i = 0; i < categoryQuestions.length; i++) indices.push(i);
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
    // Show/hide navigation buttons
    var nextBtn = document.getElementById('nextQuestionBtn');
    var submitBtn = document.getElementById('submitTestBtn');
    if (nextBtn && submitBtn) {
        if (index < currentTest.questions.length - 1) {
            nextBtn.style.display = '';
            submitBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            submitBtn.style.display = '';
        }
    }
}

function setAnswerMode(mode) {
    var textInputArea = document.getElementById('textInputArea');
    var voiceInputArea = document.getElementById('voiceInputArea');
    var textModeBtn = document.getElementById('textModeBtn');
    var voiceModeBtn = document.getElementById('voiceModeBtn');
    if (mode === 'text') {
        textInputArea.style.display = 'block';
        voiceInputArea.style.display = 'none';
        textModeBtn.classList.add('active');
        voiceModeBtn.classList.remove('active');
    } else {
        textInputArea.style.display = 'none';
        voiceInputArea.style.display = 'block';
        textModeBtn.classList.remove('active');
        voiceModeBtn.classList.add('active');
    }
}

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
        var submitBtn = document.getElementById('submitTestBtn');
        if (submitBtn) submitBtn.style.display = '';
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
    stopProctoring && stopProctoring();
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    // Restore navbar/sidebar after test
    var navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.display = '';
    var dashSidebar = document.querySelector('.dashboard-sidebar');
    if (dashSidebar) dashSidebar.style.display = '';
    var dashMain = document.querySelector('.dashboard-main');
    if (dashMain) dashMain.style.background = '';
    // Evaluate and update admin
    var evaluation = evaluateTest(currentTest.answers, currentTest.questions);
    var timeTaken = Math.floor((Date.now() - currentTest.startTime) / 1000);
    var testResult = {
        id: 'test' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        category: currentTest.category,
        score: evaluation.averageScore,
        totalQuestions: evaluation.totalQuestions,
        correctAnswers: Math.round((evaluation.averageScore / 100) * evaluation.totalQuestions),
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
        var users = JSON.parse(localStorage.getItem('users') || '[]');
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === user.id) {
                users[i] = user;
                break;
            }
        }
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (typeof updateAdminDashboard === 'function') {
            updateAdminDashboard();
        }
    }
    // Show test complete UI
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('testComplete').style.display = 'block';
    document.getElementById('previewScore').textContent = testResult.score;
}
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

var TEST_QUESTIONS_COUNT = 5;

// Request microphone and video permissions before test
async function requestPermissions() {
    var micGranted = false;
    var videoGranted = false;
    
    try {
        // Request microphone
        var micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
        micStream.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.log('Microphone permission denied:', err);
        micGranted = false;
    }
    
    try {
        // Request video
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
        // Create modal if doesn't exist
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
    // Show permission modal first
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
        category: category
    };
    
    document.getElementById('testStart').style.display = 'none';
    document.getElementById('testContainer').style.display = 'block';
    document.getElementById('testComplete').style.display = 'none';
    
    document.getElementById('qTotal').textContent = questions.length;
    
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
}


function setAnswerMode(mode) {
    var textInputArea = document.getElementById('textInputArea');
    var voiceInputArea = document.getElementById('voiceInputArea');
    var textModeBtn = document.getElementById('textModeBtn');
    var voiceModeBtn = document.getElementById('voiceModeBtn');
    
    if (mode === 'text') {
        textInputArea.style.display = 'block';
        voiceInputArea.style.display = 'none';
        textModeBtn.classList.add('active');
        voiceModeBtn.classList.remove('active');
    } else {
        textInputArea.style.display = 'none';
        voiceInputArea.style.display = 'block';
        textModeBtn.classList.remove('active');
        voiceModeBtn.classList.add('active');
    }
}

// Save current answer (without moving to next question)
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
    
    currentTest.currentIndex++;
    
    if (currentTest.currentIndex >= currentTest.questions.length) {
        completeTest();
    } else {
        showQuestion(currentTest.currentIndex);
    }
}

// Go to previous question
function previousQuestion() {
    if (currentTest.currentIndex > 0) {
        saveCurrentAnswer();
        currentTest.currentIndex--;
        showQuestion(currentTest.currentIndex);
    }
}

// Go to next question  
function nextQuestion() {
    if (currentTest.currentIndex < currentTest.questions.length - 1) {
        saveCurrentAnswer();
        currentTest.currentIndex++;
        showQuestion(currentTest.currentIndex);
    }
}

// Submit the entire test
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

function skipQuestion() {
    var question = currentTest.questions[currentTest.currentIndex];
    currentTest.answers.push({
        questionId: question.id || 'q' + currentTest.currentIndex,
        text: '',
        skipped: true,
        timestamp: Date.now()
    });
    
    currentTest.currentIndex++;
    
    if (currentTest.currentIndex >= currentTest.questions.length) {
        completeTest();
    } else {
        showQuestion(currentTest.currentIndex);
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
    
    var evaluation = evaluateTest(currentTest.answers, currentTest.questions);
    var timeTaken = Math.floor((Date.now() - currentTest.startTime) / 1000);
    
    var testResult = {
        id: 'test' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        category: currentTest.category,
        score: evaluation.averageScore,
        totalQuestions: evaluation.totalQuestions,
        correctAnswers: Math.round((evaluation.averageScore / 100) * evaluation.totalQuestions),
        timeTaken: timeTaken,
        answers: currentTest.answers,
        evaluation: evaluation,
        aiGenerated: currentTest.useAI
    };
    
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
    }
    
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('testComplete').style.display = 'block';
    document.getElementById('previewScore').textContent = evaluation.averageScore + '%';
    
    showToast('Test completed!', 'success');
    updateDashboard();
}

function submitTest(forced) {
    while (currentTest.currentIndex < currentTest.questions.length) {
        skipQuestion();
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

