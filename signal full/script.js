const G = id => document.getElementById(id);

let appState = {
  user: null,
  activeTab: 'calls'
};

// Fake Data
const CONTACTS = [
  { id:1, name:'Alex Johnson', initials:'AJ', color:'#3a8cff' },
  { id:2, name:'Priya Sharma', initials:'PS', color:'#8b5cf6' }
];

function completeAuth() {
  const name = G('first-name').value || "You";
  appState.user = { name, initials: name.substring(0,2).toUpperCase() };
  G('auth-screen').classList.remove('active');
  G('app-screen').classList.add('active');
  initApp();
}

function initApp() {
  G('my-avatar').innerText = appState.user.initials;
  switchTab('calls'); // Default to Calls tab like your screenshot
}

function switchTab(tab) {
  appState.activeTab = tab;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('onclick').includes(tab));
  });

  const content = G('main-content');

  if (tab === 'calls') {
    content.innerHTML = `
      <div style="padding:16px">
        <div onclick="createCallLink()" style="background:#1f1f26;padding:16px;border-radius:12px;display:flex;gap:14px;align-items:center;margin-bottom:12px">
          <div style="width:52px;height:52px;background:#6b46c1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px">🔗</div>
          <div>
            <div style="font-weight:600">Create a Call Link</div>
            <div style="color:#aaa">Share a link for a Signal call</div>
          </div>
        </div>
        <div onclick="launchMeeting('Signal Call')" style="padding:14px 16px;display:flex;align-items:center;gap:14px;background:#1f1f26;border-radius:12px">
          <div style="width:52px;height:52px;background:#c026d3;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px">📹</div>
          <div style="flex:1">
            <div style="font-weight:600">Signal Call</div>
            <div style="color:#888;font-size:13px">Call link • Just now</div>
          </div>
          <div style="font-size:28px">📹</div>
        </div>
      </div>`;
  } else if (tab === 'chats') {
    content.innerHTML = `<div style="padding:60px 20px;text-align:center;color:#777"><h2>No chats yet</h2><p>Get started by messaging a friend</p></div>`;
  } else {
    content.innerHTML = `<div style="padding:40px;text-align:center">Stories</div>`;
  }
}

function createCallLink() {
  launchMeeting("Signal Call");
}

async function launchMeeting(name) {
  G('meeting-wrapper').classList.add('open');
  G('pre-meeting').style.display = 'flex';
  G('pm-call-title').innerText = name;
}

// Your original meeting functions
async function mJoinCall() {
  G('pre-meeting').style.display = 'none';
  G('main-meeting').style.display = 'flex';
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    G('main-video').srcObject = localStream;
    G('main-video').classList.add('live');
  } catch (e) {
    alert("Camera Access Denied");
  }
}

function mMinimizeCall() {
  G('main-meeting').style.display = 'none';
  G('meeting-wrapper').classList.remove('open');
  G('mini-pip').classList.add('show');
}

function mLeaveCall() {
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  G('meeting-wrapper').classList.remove('open');
  G('mini-pip').classList.remove('show');
}

function showMenu() {
  alert("Menu:\n• New Group\n• Settings\n• Invite Friends");
}

window.addEventListener('load', () => {
  // For demo - auto login
  // appState.user = { name: "Hari", initials: "HK" };
  // G('auth-screen').classList.remove('active');
  // G('app-screen').classList.add('active');
  // initApp();
});