// Proctoring Module
var tabSwitchCount = 0;
var MAX_TAB_SWITCHES = 5;
var WARNING_THRESHOLD = 3;
var proctoringActive = false;

function initProctoring() {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    
    loadTabSwitchCount();
}

function handleVisibilityChange() {
    if (!proctoringActive) return;
    if (document.hidden) {
        incrementTabSwitch();
    }
}

function handleWindowBlur() {
    if (!proctoringActive) return;
    setTimeout(function() {
        if (!document.hasFocus() && proctoringActive) {
            incrementTabSwitch();
        }
    }, 100);
}

function incrementTabSwitch() {
    tabSwitchCount++;
    saveTabSwitchCount();
    updateTabCounterUI();
    
    if (tabSwitchCount === WARNING_THRESHOLD) {
        showTabWarning();
    }
    
    if (tabSwitchCount >= MAX_TAB_SWITCHES) {
        forceExitTest();
    }
}

function updateTabCounterUI() {
    var counter = document.getElementById('switchCount');
    var tabCounter = document.querySelector('.tab-counter');
    
    if (counter) counter.textContent = tabSwitchCount;
    
    if (tabCounter) {
        tabCounter.classList.remove('warning', 'error');
        if (tabSwitchCount >= MAX_TAB_SWITCHES - 1) {
            tabCounter.classList.add('error');
        } else if (tabSwitchCount >= WARNING_THRESHOLD) {
            tabCounter.classList.add('warning');
        }
    }
}

function showTabWarning() {
    var modal = document.getElementById('tabSwitchModal');
    var countEl = document.getElementById('warningCount');
    if (countEl) countEl.textContent = tabSwitchCount;
    if (modal) modal.classList.add('show');
}

function closeTabWarning() {
    var modal = document.getElementById('tabSwitchModal');
    if (modal) modal.classList.remove('show');
}

function forceExitTest() {
    proctoringActive = false;
    var modal = document.getElementById('exitTestModal');
    if (modal) modal.classList.add('show');
}

function forceSubmitTest() {
    var modal = document.getElementById('exitTestModal');
    if (modal) modal.classList.remove('show');
    submitTest(true);
}

function handleFullscreenChange() {
    var fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            fullscreenBtn.textContent = '🖥️ Exit Fullscreen';
        } else {
            fullscreenBtn.textContent = '🖥️ Enter Fullscreen';
        }
    }
}

function toggleFullscreen() {
    var elem = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(function() {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function requestFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(function() {});
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

function handleContextMenu(e) {
    if (proctoringActive) {
        e.preventDefault();
        showToast('Right-click disabled during test', 'warning');
    }
}

function saveTabSwitchCount() {
    localStorage.setItem('tabSwitchCount', tabSwitchCount.toString());
}

function loadTabSwitchCount() {
    var saved = localStorage.getItem('tabSwitchCount');
    if (saved) {
        tabSwitchCount = parseInt(saved, 10) || 0;
        updateTabCounterUI();
    }
}

function resetTabSwitchCount() {
    tabSwitchCount = 0;
    localStorage.setItem('tabSwitchCount', '0');
    updateTabCounterUI();
}

function startProctoring() {
    proctoringActive = true;
    resetTabSwitchCount();
    setTimeout(function() {
        requestFullscreen();
    }, 1000);
}

function stopProctoring() {
    proctoringActive = false;
}

function isProctoringActive() {
    return proctoringActive;
}

function getTabSwitchCount() {
    return tabSwitchCount;
}

// Initialize
document.addEventListener('DOMContentLoaded', initProctoring);

