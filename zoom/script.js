// script.js

let localStream = null;
let screenStream = null;
let isScreenSharing = false;
let isMicMuted = false;
let isVideoOff = false;

const localVideo = document.getElementById('local-video');
const startOverlay = document.getElementById('start-video-overlay');
const reactionPanel = document.getElementById('reactionPanel');
const sidebar = document.getElementById('right-sidebar');
const participantsSection = document.getElementById('participants-section');
const chatSection = document.getElementById('chat-section');
const sidebarTitle = document.getElementById('sidebar-title');

function googleSignIn() {
    window.open("https://accounts.google.com/signin/v2/identifier?service=accountsettings&flowName=GlifWebSignIn&flowEntry=ServiceLogin", "_blank");
}

async function startLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" }, 
            audio: true 
        });

        localVideo.srcObject = localStream;
        localVideo.muted = true;
        localVideo.playsInline = true;
        localVideo.style.display = 'block';

        startOverlay.style.display = 'none';

    } catch (err) {
        console.error("Camera failed:", err);
        alert("Could not access camera. Please allow permission.");
    }
}

function toggleMic() {
    if (!localStream) return;
    isMicMuted = !isMicMuted;
    localStream.getAudioTracks().forEach(track => track.enabled = !isMicMuted);
    document.getElementById('mic-icon').className = isMicMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
    document.getElementById('mic-text').textContent = isMicMuted ? 'Unmute' : 'Mute';
}

function toggleCamera() {
    if (!localStream) return;
    isVideoOff = !isVideoOff;
    localStream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
    document.getElementById('cam-icon').className = isVideoOff ? 'fas fa-video-slash' : 'fas fa-video';
    document.getElementById('cam-text').textContent = isVideoOff ? 'Start Video' : 'Stop Video';
}

async function startScreenShare() {
    try {
        if (isScreenSharing) {
            stopScreenShare();
            return;
        }
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        isScreenSharing = true;
        localVideo.srcObject = screenStream;

        document.getElementById('share-text').textContent = "Stop Share";
        document.getElementById('share-icon').className = "fas fa-stop";

        screenStream.getVideoTracks()[0].onended = stopScreenShare;
    } catch (err) {
        console.error(err);
    }
}

function stopScreenShare() {
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    screenStream = null;
    isScreenSharing = false;
    if (localStream) localVideo.srcObject = localStream;

    document.getElementById('share-text').textContent = "Share";
    document.getElementById('share-icon').className = "fas fa-arrow-up-from-bracket";
}

function showParticipants() {
    participantsSection.style.display = 'block';
    chatSection.style.display = 'none';
    sidebarTitle.textContent = "Participants (1)";
    sidebar.classList.add('open');
}

function showChat() {
    participantsSection.style.display = 'none';
    chatSection.style.display = 'flex';
    sidebarTitle.textContent = "Chat";
    sidebar.classList.add('open');
}

function closeSidebar() {
    sidebar.classList.remove('open');
}

function toggleReactionPanel() {
    reactionPanel.style.display = reactionPanel.style.display === 'flex' ? 'none' : 'flex';
}

function sendReaction(emoji) {
    const container = document.getElementById('video-container');
    const float = document.createElement('div');
    float.textContent = emoji;
    float.style.cssText = `position:absolute; bottom:140px; left:50%; font-size:55px; transform:translateX(-50%); animation:floatUp 3s forwards; z-index:1000; pointer-events:none;`;
    container.appendChild(float);
    reactionPanel.style.display = 'none';
    setTimeout(() => float.remove(), 3000);
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input || input.value.trim() === "") return;
    const msgArea = document.getElementById('messages-area');
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>You:</strong> ${input.value}`;
    msg.style.marginBottom = "8px";
    msgArea.appendChild(msg);
    msgArea.scrollTop = msgArea.scrollHeight;
    input.value = "";
}

function endMeeting() {
    if (confirm("End the meeting?")) {
        if (localStream) localStream.getTracks().forEach(track => track.stop());
        if (screenStream) screenStream.getTracks().forEach(track => track.stop());
        window.location.reload();
    }
}

const style = document.createElement('style');
style.innerHTML = `@keyframes floatUp { 0% {transform:translate(-50%,0); opacity:1;} 100% {transform:translate(-50%,-500px); opacity:0;} }`;
document.head.appendChild(style);

window.onload = () => {
    // Camera starts only when user clicks "Start Video"
};

window.googleSignIn = googleSignIn;
window.startLocalStream = startLocalStream;
window.toggleMic = toggleMic;
window.toggleCamera = toggleCamera;
window.startScreenShare = startScreenShare;
window.toggleReactionPanel = toggleReactionPanel;
window.sendReaction = sendReaction;
window.showParticipants = showParticipants;
window.showChat = showChat;
window.closeSidebar = closeSidebar;
window.sendChatMessage = sendChatMessage;
window.endMeeting = endMeeting;