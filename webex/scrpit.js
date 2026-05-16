// script.js - Cisco Webex Meeting Replica

let localStream = null;
let screenStream = null;
let isMicOn = true;
let isCameraOn = false;

// Initialize Camera and Microphone
async function initMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        const videoEl = document.getElementById('meetVideo');
        videoEl.srcObject = localStream;
        videoEl.style.display = 'block';
        document.getElementById('meetAvatar').style.display = 'none';

        isCameraOn = true;
        document.getElementById('video-label').textContent = 'Stop video';

    } catch (err) {
        console.error("Camera/Mic access denied:", err);
        alert("Please allow camera and microphone access to join the meeting.");
    }
}

// ====================== MICROPHONE TOGGLE ======================
function toggleMeetMic() {
    if (!localStream) return;

    isMicOn = !isMicOn;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = isMicOn;

    const icon = document.getElementById('meet-mic-icon');
    const label = document.getElementById('mic-label');

    if (isMicOn) {
        icon.className = 'ph ph-microphone';
        label.textContent = 'Mute';
        document.getElementById('mic-pill').classList.remove('muted');
    } else {
        icon.className = 'ph ph-microphone-slash';
        label.textContent = 'Unmute';
        document.getElementById('mic-pill').classList.add('muted');
    }
}

// ====================== CAMERA TOGGLE ======================
function toggleMeetCam() {
    if (!localStream) return;

    isCameraOn = !isCameraOn;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = isCameraOn;

    const videoEl = document.getElementById('meetVideo');
    const avatar = document.getElementById('meetAvatar');
    const label = document.getElementById('video-label');

    if (isCameraOn) {
        videoEl.style.display = 'block';
        avatar.style.display = 'none';
        label.textContent = 'Stop video';
        document.getElementById('video-pill').classList.add('green');
    } else {
        videoEl.style.display = 'none';
        avatar.style.display = 'flex';
        label.textContent = 'Start video';
        document.getElementById('video-pill').classList.remove('green');
    }
}

// ====================== SCREEN SHARING ======================
async function toggleShare() {
    const shareBtn = document.getElementById('shareBtn');

    if (!screenStream) {
        try {
            screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

            const videoEl = document.getElementById('meetVideo');
            videoEl.srcObject = screenStream;
            videoEl.style.display = 'block';
            document.getElementById('meetAvatar').style.display = 'none';

            shareBtn.innerHTML = `<i class="ph ph-stop-circle"></i> Stop sharing`;

            // Handle when user stops sharing from browser UI
            screenStream.getVideoTracks()[0].onended = () => stopSharing();

        } catch (err) {
            console.error("Screen share failed:", err);
        }
    } else {
        stopSharing();
    }
}

function stopSharing() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }

    document.getElementById('shareBtn').innerHTML = `<i class="ph ph-export"></i> Share`;

    // Return to camera feed
    if (localStream && isCameraOn) {
        document.getElementById('meetVideo').srcObject = localStream;
    }
}

// ====================== REACTIONS ======================
function toggleReactionPanel() {
    const panel = document.getElementById('reaction-panel');
    panel.classList.toggle('show');
}

function sendReaction(emoji) {
    const container = document.getElementById('video-container');
    const reaction = document.createElement('div');
    reaction.className = 'floating-emoji-anim';
    reaction.textContent = emoji;
    reaction.style.left = Math.random() * 70 + 15 + '%';
    container.appendChild(reaction);

    setTimeout(() => reaction.remove(), 3000);
    document.getElementById('reaction-panel').classList.remove('show');
}

// ====================== SIDEBAR ======================
function toggleSidebar(type) {
    const sidebar = document.getElementById('sidebar');
    const title = document.getElementById('sidebar-title');
    const content = document.getElementById('sidebar-content');
    const chatContainer = document.getElementById('chat-input-container');

    if (!type || (sidebar.style.display === 'flex' && sidebar.dataset.type === type)) {
        sidebar.style.display = 'none';
        return;
    }

    sidebar.style.display = 'flex';
    sidebar.dataset.type = type;

    if (type === 'participants') {
        title.textContent = "Participants (1)";
        chatContainer.style.display = 'none';
        content.innerHTML = `
            <div style="padding:20px;">
                <div style="display:flex; align-items:center; gap:12px; background:#2a2a2a; padding:12px; border-radius:8px;">
                    <div style="width:48px; height:48px; background:#00a0df; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">HK</div>
                    <div>
                        <strong>Hari Krishnan</strong><br>
                        <small style="color:#00a0df;">Host • Presenter • Me</small>
                    </div>
                </div>
            </div>`;
    } else if (type === 'chat') {
        title.textContent = "Chat";
        chatContainer.style.display = 'block';
        content.innerHTML = `
            <div style="padding:40px 20px; text-align:center; color:#888;">
                <p>Ready, set, chat 🚀</p>
                <p style="font-size:13px; margin-top:10px;">Start with a message or a fun GIF</p>
            </div>`;
    }
}

// ====================== OTHER FUNCTIONS ======================
function showMeetingInfo() {
    alert("Meeting Info\n\nHost: Hari Krishnan\nMeeting Link: https://webex.com/meet/hari...\nMeeting Number: 2644 410 5095");
}

function invitePeople() {
    alert("Invite people link copied!");
}

function copyLink() {
    alert("Meeting link copied to clipboard!");
}

function leaveMeeting() {
    if (confirm("Do you want to leave the meeting?")) {
        window.location.reload();
    }
}

// ====================== INIT ======================
window.onload = async () => {
    await initMedia();
};