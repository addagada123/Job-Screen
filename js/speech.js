// Speech Recognition Module
var recognition = null;
var isListening = false;

document.addEventListener('DOMContentLoaded', function() {
    initSpeechRecognition();
    var voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.onmousedown = startVoice;
        voiceBtn.onmouseup = stopVoice;
        voiceBtn.ontouchstart = startVoice;
        voiceBtn.ontouchend = stopVoice;
    }
});

function initSpeechRecognition() {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn('Speech recognition not supported');
        showVoiceUnsupported();
        return null;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = function() {
        isListening = true;
        updateVoiceButton(true);
        var transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            transcriptEl.textContent = 'Listening...';
            transcriptEl.classList.add('listening');
        }
    };
    
    recognition.onresult = function(event) {
        var interimTranscript = '';
        var finalTranscript = '';
        
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        var transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            if (finalTranscript) {
                transcriptEl.textContent = finalTranscript;
                transcriptEl.classList.add('final');
                transcriptEl.classList.remove('listening');
                
                var textInput = document.getElementById('answerText');
                if (textInput) {
                    textInput.value += ' ' + finalTranscript;
                }
            } else {
                transcriptEl.textContent = interimTranscript;
            }
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Speech error:', event.error);
        isListening = false;
        updateVoiceButton(false);
        
        var transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            transcriptEl.classList.remove('listening');
            if (event.error === 'no-speech') {
                transcriptEl.textContent = 'No speech detected';
            } else if (event.error === 'not-allowed') {
                transcriptEl.textContent = 'Microphone denied';
                showToast('Allow microphone access', 'error');
            }
        }
    };
    
    recognition.onend = function() {
        isListening = false;
        updateVoiceButton(false);
        var transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            transcriptEl.classList.remove('listening');
        }
    };
    
    return recognition;
}

function startVoice() {
    if (!recognition) {
        recognition = initSpeechRecognition();
    }
    
    if (!recognition) {
        showToast('Speech not supported', 'error');
        return;
    }
    
    try {
        recognition.start();
    } catch (e) {
        console.error('Start error:', e);
    }
}

function stopVoice() {
    if (recognition && isListening) {
        recognition.stop();
    }
}

function updateVoiceButton(listening) {
    var voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        if (listening) {
            voiceBtn.classList.add('recording');
            var textEl = voiceBtn.querySelector('.voice-text');
            if (textEl) textEl.textContent = 'Release to Stop';
        } else {
            voiceBtn.classList.remove('recording');
            var textEl = voiceBtn.querySelector('.voice-text');
            if (textEl) textEl.textContent = 'Hold to Speak';
        }
    }
}

function showVoiceUnsupported() {
    var voiceInputArea = document.getElementById('voiceInputArea');
    if (voiceInputArea) {
        voiceInputArea.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8"><p>Speech not supported</p><p>Use Chrome/Edge</p></div>';
    }
    
    var voiceModeBtn = document.getElementById('voiceModeBtn');
    if (voiceModeBtn) {
        voiceModeBtn.disabled = true;
    }
}

function isSpeechSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// Initialize on load
setTimeout(function() {
    initSpeechRecognition();
}, 100);

