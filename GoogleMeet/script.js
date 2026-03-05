// Get DOM elements
const cameraPreview = document.getElementById('cameraPreview');
const muteBtn = document.getElementById('muteBtn');
const cameraBtn = document.getElementById('cameraBtn');
const screenBtn = document.getElementById('screenBtn');
const moreBtn = document.getElementById('moreBtn');
const joinBtn = document.querySelector('.join-btn');
const otherWaysBtn = document.querySelector('.other-ways-btn');
const startBtn = document.querySelector('.start-btn');

// State management
let cameraEnabled = true;
let microphoneEnabled = true;
let screenSharing = false;

// Initialize camera
async function initializeCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });
        
        cameraPreview.srcObject = stream;
        cameraPreview.play();
    } catch (error) {
        console.error('Error accessing camera:', error);
        // Show fallback if camera not available
        cameraPreview.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        showNotification('Camera not available. Please check permissions.');
    }
}

// Microphone toggle
muteBtn.addEventListener('click', () => {
    microphoneEnabled = !microphoneEnabled;
    muteBtn.classList.toggle('active', !microphoneEnabled);
    
    const stream = cameraPreview.srcObject;
    if (stream) {
        stream.getAudioTracks().forEach(track => {
            track.enabled = microphoneEnabled;
        });
    }
    
    updateMuteButtonUI();
});

// Camera toggle
cameraBtn.addEventListener('click', () => {
    cameraEnabled = !cameraEnabled;
    cameraBtn.classList.toggle('active', !cameraEnabled);
    
    const stream = cameraPreview.srcObject;
    if (stream) {
        stream.getVideoTracks().forEach(track => {
            track.enabled = cameraEnabled;
        });
    }
    
    if (!cameraEnabled) {
        cameraPreview.style.background = '#000';
    }
    
    updateCameraButtonUI();
});

// Screen share toggle
screenBtn.addEventListener('click', () => {
    screenSharing = !screenSharing;
    screenBtn.classList.toggle('active', screenSharing);
    
    if (screenSharing) {
        startScreenShare();
    } else {
        stopScreenShare();
    }
});

// More options
moreBtn.addEventListener('click', () => {
    showNotification('More options menu opened');
});

// Screen sharing
async function startScreenShare() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always'
            },
            audio: false
        });
        
        showNotification('Screen sharing started');
    } catch (error) {
        console.error('Error sharing screen:', error);
        screenSharing = false;
        screenBtn.classList.remove('active');
        showNotification('Screen sharing failed');
    }
}

function stopScreenShare() {
    showNotification('Screen sharing stopped');
}

// Join button
joinBtn.addEventListener('click', () => {
    if (cameraEnabled && microphoneEnabled) {
        showNotification('Joining meeting...');
        setTimeout(() => {
            showNotification('Meeting started! ✓');
        }, 1000);
    } else {
        showNotification('Please enable camera and microphone to join');
    }
});

// Other ways to join button
otherWaysBtn.addEventListener('click', () => {
    showDropdownMenu();
});

// Start button (Gemini notes)
startBtn.addEventListener('click', () => {
    showNotification('Gemini notes feature coming soon');
});

// Update button UI based on state
function updateMuteButtonUI() {
    if (!microphoneEnabled) {
        muteBtn.style.backgroundColor = '#ea4335';
        muteBtn.style.color = 'white';
    } else {
        muteBtn.style.backgroundColor = '#f8f9fa';
        muteBtn.style.color = '#202124';
    }
}

function updateCameraButtonUI() {
    if (!cameraEnabled) {
        cameraBtn.style.backgroundColor = '#ea4335';
        cameraBtn.style.color = 'white';
    } else {
        cameraBtn.style.backgroundColor = '#f8f9fa';
        cameraBtn.style.color = '#202124';
    }
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #323232;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Dropdown menu
function showDropdownMenu() {
    const menu = document.createElement('div');
    menu.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background-color: white;
        border: 1px solid #dadce0;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 999;
        overflow: hidden;
        min-width: 200px;
        animation: slideUp 0.2s ease-out;
    `;
    
    const options = [
        { text: 'Enter a code', icon: '📝' },
        { text: 'Create a room', icon: '➕' },
        { text: 'Join with phone', icon: '☎️' }
    ];
    
    options.forEach((option, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            border-bottom: ${index < options.length - 1 ? '1px solid #dadce0' : 'none'};
            transition: background-color 0.2s;
        `;
        item.textContent = option.text;
        
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
        
        item.addEventListener('click', () => {
            showNotification(`${option.text} option selected`);
            menu.remove();
        });
        
        menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !otherWaysBtn.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + D to toggle camera
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        cameraBtn.click();
    }
    
    // Ctrl/Cmd + M to toggle microphone
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        muteBtn.click();
    }
    
    // Ctrl/Cmd + S to toggle screen share
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        screenBtn.click();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(10px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCamera();
});
