let stream = null;
let screenStream = null;
let mCamOn = false;
let mMicOn = true;
let isRecording = false;
let isSharing = false;
let currentPanel = null;

// --- 1. INITIALIZATION: Detect Platform & Lock UI ---
window.onload = () => {
    // Detect if the user is on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const optComp = document.getElementById('opt-computer');
    const optPhone = document.getElementById('opt-phone');

    if (isMobile) {
        // Phones typically use "Phone audio" by default
        if(optComp) optComp.classList.add('disabled');
        pickAudio('phone');
    } else {
        // Computers use "Computer audio" by default
        if(optPhone) optPhone.classList.add('disabled');
        pickAudio('computer');
    }
};

// --- 2. LOBBY HARDWARE ACCESS ---
async function toggleLobbyCam(on) {
    const video = document.getElementById('lobbyVideo');
    const overlay = document.getElementById('lobbyOffOverlay');
    const label = document.getElementById('lobby-cam-label');
    
    if (on) {
        try {
            // MOBILE FIX: Specifically request the front-facing camera ("user")
            const constraints = { 
                video: { facingMode: "user" }, 
                audio: true 
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            
            // REQUIRED FOR IOS: Prevent native full-screen takeover
            video.setAttribute('playsinline', true);
            video.play();
            
            video.style.display = 'block';
            overlay.style.display = 'none';
            if(label) label.innerText = "Camera on";
            
        } catch (e) { 
            console.error("Hardware access denied", e);
            alert("Permission Error: Please allow camera access in your mobile browser settings.");
        }
    } else {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        video.style.display = 'none';
        overlay.style.display = 'flex';
        if(label) label.innerText = "Camera off";
    }
}

function pickAudio(mode) {
    document.querySelectorAll('.a-card-exact').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`opt-${mode}`);
    if (target && !target.classList.contains('disabled')) {
        target.classList.add('active');
    }
}

// --- 3. TRANSITION & MEETING START ---
function joinMeeting() {
    document.getElementById('lobby-page').style.display = 'none';
    document.getElementById('meeting-page').style.display = 'flex';
    
    // Smoothly carry the camera stream from Lobby to Meeting
    const meetVideo = document.getElementById('meetVideo');
    if (stream && meetVideo) {
        meetVideo.srcObject = stream;
        // Ensure meeting video stays inside the layout on iOS
        meetVideo.setAttribute('playsinline', true);
        meetVideo.play();
    }
    
    startTimer();
}

// --- 4. MEETING WORKFLOW ---
function toggleMeetCam() {
    mCamOn = !mCamOn;
    const v = document.getElementById('meetVideo');
    const a = document.getElementById('meetAvatar');
    
    if (mCamOn) {
        v.style.display = 'block';
        a.style.display = 'none';
        if(stream) v.srcObject = stream;
    } else {
        v.style.display = 'none';
        a.style.display = 'flex';
    }
    
    // Toggle 2D line icons based on state
    document.getElementById('meet-cam-icon').className = mCamOn ? 'fas fa-video' : 'fas fa-video-slash';
    document.getElementById('camBtn').classList.toggle('on', mCamOn);
}

function toggleMeetMic() {
    mMicOn = !mMicOn;
    const btn = document.getElementById('micBtn');
    
    // Toggle the actual audio track
    if (stream) {
        stream.getAudioTracks().forEach(t => t.enabled = mMicOn);
    }
    
    // Apply "Active Blue" box style when live
    btn.classList.toggle('mic-live', mMicOn);
    document.getElementById('meet-mic-icon').className = mMicOn ? 'fas fa-microphone' : 'fas fa-microphone-slash';
}

async function toggleShare() {
    // Screen sharing is fully supported on Laptops and Android, but partial on iOS
    if (!isSharing) {
        try {
            screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const v = document.getElementById('meetVideo');
            v.srcObject = screenStream;
            v.style.display = 'block';
            document.getElementById('meetAvatar').style.display = 'none';
            isSharing = true;
            
            // Apply white border active state
            document.getElementById('shareBtn').classList.add('share-active');
            
            screenStream.getVideoTracks()[0].onended = () => stopSharing();
        } catch (e) { console.error("Screen share failed", e); }
    } else { stopSharing(); }
}

function stopSharing() {
    if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        screenStream = null;
    }
    isSharing = false;
    document.getElementById('shareBtn').classList.remove('share-active');
    toggleMeetCam(); 
}

// --- 5. PANELS & REACTIONS ---
function togglePanel(type) {
    const panel = document.getElementById('right-panel');
    if (currentPanel === type) { 
        closePanel(); 
        return; 
    }
    currentPanel = type;
    panel.classList.add('open');
    document.getElementById('chatContent').style.display = (type === 'chat') ? 'flex' : 'none';
    document.getElementById('peopleContent').style.display = (type === 'people') ? 'flex' : 'none';
}

function closePanel() {
    document.getElementById('right-panel').classList.remove('open');
    currentPanel = null;
}

function sendReaction(emoji) {
    const container = document.getElementById('emojiLayer');
    const float = document.createElement('div');
    float.className = 'floating-emoji-anim';
    float.textContent = emoji;
    
    // Random position to mimic real Teams float
    float.style.left = (20 + Math.random() * 60) + '%';
    
    container.appendChild(float);
    setTimeout(() => float.remove(), 3000);
}

function startTimer() {
    let sec = 0;
    setInterval(() => {
        sec++;
        let m = String(Math.floor(sec/60)).padStart(2,'0');
        let s = String(sec%60).padStart(2,'0');
        const timer = document.getElementById('timerDisp');
        if(timer) timer.textContent = `${m}:${s}`;
    }, 1000);
}