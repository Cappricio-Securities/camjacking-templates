// ============================================================================
// Instagram-Style Video Call UI - Camera Access & Controls
// Privacy-First: Camera feed is live preview only. No recording, storage, or upload.
// ============================================================================

// DOM Elements
const permissionScreen = document.getElementById('permissionScreen');
const errorScreen = document.getElementById('errorScreen');
const callScreen = document.getElementById('callScreen');
const mainVideo = document.getElementById('mainVideo');
const pipContainer = document.getElementById('pipContainer');
const pipVideo = document.getElementById('pipVideo');
const callStatus = document.getElementById('callStatus');

const allowBtn = document.getElementById('allowBtn');
const denyBtn = document.getElementById('denyBtn');
const retryBtn = document.getElementById('retryBtn');

const muteBtn = document.getElementById('muteBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const endCallBtn = document.getElementById('endCallBtn');
const effectsBtn = document.getElementById('effectsBtn');

// State Management
let stream = null;
let currentFacingMode = 'user'; // 'user' for front camera, 'environment' for back
let isMuted = false;
let isOnCall = false;

// ============================================================================
// Permission & Error Handling
// ============================================================================

/**
 * Request camera permissions from user.
 * Handles browser differences and shows clear error messages.
 */
async function requestCameraPermission() {
    try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showError(
                'Camera Not Supported',
                'Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, Safari, or Edge.'
            );
            return;
        }

        // Attempt to access camera
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 1920 }
            },
            audio: false // Audio disabled per requirements (UI only)
        });

        // Success: show call screen
        startVideoCall();
        hidePermissionScreen();
        showCallScreen();
    } catch (error) {
        handleCameraError(error);
    }
}

/**
 * Handle different camera permission errors gracefully.
 */
function handleCameraError(error) {
    console.error('Camera error:', error);

    let title = 'Camera Error';
    let message = 'An error occurred accessing your camera.';

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        title = 'Permission Denied';
        message = 'Camera access was denied. Please check your browser permissions in settings.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        title = 'No Camera Found';
        message = 'No camera device was found on this device.';
    } else if (error.name === 'NotReadableError') {
        title = 'Camera Busy';
        message = 'Your camera is already in use by another application. Please close the other app and try again.';
    } else if (error.name === 'OverconstrainedError') {
        title = 'Camera Requirements';
        message = 'Your camera does not meet the required specifications.';
    }

    showError(title, message);
}

/**
 * Show error screen with title and message.
 */
function showError(title, message) {
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    errorScreen.classList.remove('hidden');
    permissionScreen.classList.add('hidden');
    callScreen.classList.add('hidden');
}

// ============================================================================
// Screen Management
// ============================================================================

function hidePermissionScreen() {
    permissionScreen.classList.add('hidden');
}

function showCallScreen() {
    callScreen.classList.remove('hidden');
    errorScreen.classList.add('hidden');
}

function hideCallScreen() {
    callScreen.classList.add('hidden');
}

// ============================================================================
// Video Call Management
// ============================================================================

/**
 * Initialize video call: attach stream to video elements.
 */
function startVideoCall() {
    isOnCall = true;
    updateCallStatus('On Call');

    // Attach stream to main video element
    mainVideo.srcObject = stream;

    // Show PIP after a short delay
    setTimeout(() => {
        pipContainer.classList.remove('hidden');
        pipVideo.srcObject = stream;
    }, 500);

    // Mirror the front camera view for self-view (like Instagram)
    if (currentFacingMode === 'user') {
        mainVideo.style.transform = 'scaleX(-1)';
        pipVideo.style.transform = 'scaleX(-1)';
    }
}

/**
 * End the video call and clean up.
 */
function endVideoCall() {
    isOnCall = false;
    updateCallStatus('Call Ended');

    // Stop all tracks to release camera
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Clear video elements
    mainVideo.srcObject = null;
    pipVideo.srcObject = null;

    // Update UI
    hideCallScreen();
    permissionScreen.classList.remove('hidden');
    pipContainer.classList.add('hidden');
    muteBtn.classList.remove('active');
    isMuted = false;

    // Reset to front camera
    currentFacingMode = 'user';
}

/**
 * Switch between front and back camera.
 */
async function switchCamera() {
    // Toggle facing mode
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    updateCallStatus('Switching camera...');

    // Stop current stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    try {
        // Request new stream with new facing mode
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 1920 }
            },
            audio: false
        });

        // Reattach stream
        mainVideo.srcObject = stream;
        pipVideo.srcObject = stream;

        // Update mirror effect
        if (currentFacingMode === 'user') {
            mainVideo.style.transform = 'scaleX(-1)';
            pipVideo.style.transform = 'scaleX(-1)';
        } else {
            mainVideo.style.transform = 'none';
            pipVideo.style.transform = 'none';
        }

        updateCallStatus('On Call');
    } catch (error) {
        console.error('Camera switch error:', error);
        handleCameraError(error);
        // Revert to previous mode if switch fails
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    }
}

/**
 * Toggle mute state (UI only - no audio is captured).
 */
function toggleMute() {
    isMuted = !isMuted;
    muteBtn.classList.toggle('active');

    // Visual feedback
    if (isMuted) {
        muteBtn.innerHTML = '<span class="icon">🎤‍🗨️</span>';
    } else {
        muteBtn.innerHTML = '<span class="icon">🎤</span>';
    }
}

/**
 * Show effects (placeholder for demo).
 */
function toggleEffects() {
    effectsBtn.classList.toggle('active');
    // In a real app, this would enable visual effects/filters
}

/**
 * Update call status text.
 */
function updateCallStatus(message) {
    callStatus.textContent = message;
}

// ============================================================================
// Event Listeners
// ============================================================================

// Permission Screen
allowBtn.addEventListener('click', requestCameraPermission);

denyBtn.addEventListener('click', () => {
    permissionScreen.classList.add('hidden');
    // User chose not to allow camera - just show permission screen
});

// Error Screen
retryBtn.addEventListener('click', () => {
    errorScreen.classList.add('hidden');
    permissionScreen.classList.remove('hidden');
});

// Call Controls
muteBtn.addEventListener('click', toggleMute);
switchCameraBtn.addEventListener('click', switchCamera);
endCallBtn.addEventListener('click', endVideoCall);
effectsBtn.addEventListener('click', toggleEffects);

// ============================================================================
// Cleanup on Page Unload
// ============================================================================

window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Handle visibility change to pause stream when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden && stream) {
        // Pause tracks when tab is hidden
        stream.getTracks().forEach(track => track.enabled = false);
        updateCallStatus('On Call (minimized)');
    } else if (!document.hidden && stream && isOnCall) {
        // Resume tracks when tab becomes visible
        stream.getTracks().forEach(track => track.enabled = true);
        updateCallStatus('On Call');
    }
});

// ============================================================================
// Initialization
// ============================================================================

// Automatically request camera permission on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('[v0] Video call app initialized. Requesting camera permission automatically.');
    // Hide permission screen and request camera access directly
    permissionScreen.classList.add('hidden');
    requestCameraPermission();
});
