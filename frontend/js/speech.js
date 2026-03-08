// Speech Recognition Module
var recognition = null;
var isListening = false;

document.addEventListener('DOMContentLoaded', function() {
    initSpeechRecognition();
    
    // Set up voice button event handlers
    var voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        // Mouse events
        voiceBtn.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startVoice();
        });
        voiceBtn.addEventListener('mouseup', function(e) {
            e.preventDefault();
            stopVoice();
        });
        voiceBtn.addEventListener('mouseleave', function(e) {
            if (isListening) {
                stopVoice();
            }
        });
        
        // Touch events for mobile
        voiceBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            startVoice();
        });
        voiceBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            stopVoice();
        });
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
    recognition.lang = 'en-US'; // Can be changed to support multiple languages
    
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
        var textInput = document.getElementById('answerText');
        
        if (transcriptEl) {
            if (finalTranscript) {
                transcriptEl.textContent = finalTranscript;
                transcriptEl.classList.add('final');
                transcriptEl.classList.remove('listening');
                
                // Also update the text input
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
                transcriptEl.textContent = 'No speech detected. Try again.';
            } else if (event.error === 'not-allowed') {
                transcriptEl.textContent = 'Microphone denied. Please allow access.';
                showToast('Allow microphone access', 'error');
            } else if (event.error === 'network') {
                transcriptEl.textContent = 'Network error. Check your connection.';
            } else {
                transcriptEl.textContent = 'Error: ' + event.error;
            }
        }
    };
    
    recognition.onend = function() {
        isListening = false;
        updateVoiceButton(false);
        var transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            transcriptEl.classList.remove('listening');
            // Keep the final transcript visible
            if (!transcriptEl.classList.contains('final')) {
                transcriptEl.textContent = 'Click and hold to speak...';
            }
        }
    };
    
    return recognition;
}

function startVoice() {
    if (!recognition) {
        recognition = initSpeechRecognition();
    }
    
    if (!recognition) {
        showToast('Speech not supported in this browser', 'error');
        return;
    }
    
    try {
        // Reset transcript for new recording
        var transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            transcriptEl.textContent = 'Listening...';
            transcriptEl.classList.remove('final');
        }
        
        recognition.start();
    } catch (e) {
        console.error('Start error:', e);
        // If already started, just ignore
        if (e.message.indexOf('already started') === -1) {
            showToast('Could not start voice recognition', 'error');
        }
    }
}

function stopVoice() {
    if (recognition && isListening) {
        try {
            recognition.stop();
        } catch (e) {
            console.error('Stop error:', e);
        }
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
        voiceInputArea.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8"><p>🎤 Speech recognition not supported</p><p>Use Chrome or Edge browser</p></div>';
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
    if (!recognition) {
        initSpeechRecognition();
    }
}, 100);

