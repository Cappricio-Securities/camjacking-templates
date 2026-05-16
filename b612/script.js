/* ============================================================
   B612 CAMERA CLONE — script.js
   ============================================================ */

/* ── STATE ─────────────────────────────────────────────────── */
let facingMode  = 'environment'; // 'environment' | 'user'
let topMode     = 'std';         // 'std' | 'hires' | 'iphone'
let capMode     = 'video';       // 'normal' | 'video'
let flashOn     = false;
let isRec       = false;
let sidebarOpen = true;
let mediaRec    = null;
let recChunks   = [];
let stream      = null;
let toastTimer  = null;

/* ── DOM ELEMENTS ───────────────────────────────────────────── */
const camEl        = document.getElementById('cam');
const flashEl      = document.getElementById('flash');
const app          = document.getElementById('app');
const musicBanner  = document.getElementById('musicBanner');
const hiresBanner  = document.getElementById('hiresBanner');
const sbDuration   = document.getElementById('sbDuration');
const sidebar      = document.getElementById('sidebar');
const collapseIcon = document.getElementById('collapseIcon');
const shutterOuter = document.getElementById('shutterOuter');
const shutterInner = document.getElementById('shutterInner');
const toastEl      = document.getElementById('toastEl');
const flashOffSvg  = document.getElementById('flashOff');
const flashOnSvg   = document.getElementById('flashOn');
const ctNormal     = document.getElementById('ctNormal');
const ctVideo      = document.getElementById('ctVideo');

/* ── INIT ───────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  showPermScreen();
  applyCapMode();
  applyTopMode();
});

/* ============================================================
   PERMISSION SCREEN
   Shows a branded permission prompt before calling getUserMedia.
   This ensures the browser permission dialog fires on a real
   user gesture, which is required on iOS Safari & Chrome mobile.
   ============================================================ */
function showPermScreen() {
  const overlay = document.createElement('div');
  overlay.id = 'permOverlay';
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:9999',
    'background:linear-gradient(160deg,#0a0a0a 0%,#141428 100%)',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'justify-content:center',
    'gap:20px',
    'padding:40px 32px',
    'text-align:center',
  ].join(';');

  overlay.innerHTML = `
    <div style="font-size:68px;line-height:1;
      filter:drop-shadow(0 0 24px rgba(0,217,139,.45))">📷</div>

    <h2 style="color:#fff;font-size:22px;font-weight:700;
      letter-spacing:-.3px;line-height:1.35;margin:0">
      Camera &amp; Microphone
    </h2>

    <p style="color:rgba(255,255,255,.52);font-size:13.5px;
      line-height:1.65;max-width:270px;margin:0">
      B612 needs your <strong style="color:rgba(255,255,255,.8)">camera</strong>
      and <strong style="color:rgba(255,255,255,.8)">microphone</strong>
      to take photos and record videos.
    </p>

    <button id="grantBtn" style="
      margin-top:6px;
      background:linear-gradient(135deg,#00d98b 0%,#00b46e 100%);
      color:#fff;border:none;border-radius:32px;
      font-size:16px;font-weight:700;letter-spacing:.02em;
      padding:16px 52px;cursor:pointer;
      box-shadow:0 10px 32px rgba(0,217,139,.38);
      transition:transform .12s,opacity .12s;
      -webkit-appearance:none;
    ">Allow Access</button>

    <div id="permErr" style="
      color:#e8395e;font-size:12.5px;font-weight:500;
      display:none;line-height:1.6;max-width:280px;
      background:rgba(232,57,94,.1);border-radius:12px;
      padding:10px 14px;
    "></div>

    <p style="color:rgba(255,255,255,.25);font-size:11px;
      margin-top:2px;line-height:1.5">
      When prompted, tap <strong style="color:rgba(255,255,255,.4)">Allow</strong>
      in your browser
    </p>
  `;
  document.body.appendChild(overlay);

  const btn    = document.getElementById('grantBtn');
  const errBox = document.getElementById('permErr');

  btn.addEventListener('click', async () => {
    btn.textContent       = 'Opening camera…';
    btn.style.opacity     = '.65';
    btn.style.pointerEvents = 'none';
    errBox.style.display  = 'none';

    try {
      await startCam();
      /* success — fade out overlay */
      overlay.style.transition = 'opacity .35s';
      overlay.style.opacity    = '0';
      setTimeout(() => overlay.remove(), 380);
      toast('Camera ready 🎉');
    } catch (err) {
      errBox.style.display = 'block';
      errBox.textContent   = friendlyError(err);
      btn.textContent       = 'Try Again';
      btn.style.opacity     = '1';
      btn.style.pointerEvents = 'auto';
    }
  });
}

/* Human-readable error messages */
function friendlyError(err) {
  switch (err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return '❌ Permission denied. Go to your browser Settings → Site Permissions → Camera & Microphone, then allow and reload.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return '❌ No camera or microphone detected on this device.';
    case 'NotReadableError':
    case 'TrackStartError':
      return '❌ Camera is already in use by another app. Close it and try again.';
    case 'OverconstrainedError':
      return '❌ Camera does not support the requested settings. Trying again…';
    case 'SecurityError':
      return '❌ This page must be served over HTTPS (or localhost) to access the camera.';
    default:
      return `❌ ${err.message || 'Unknown error. Please check permissions and try again.'}`;
  }
}

/* ============================================================
   CAMERA — start / flip
   ============================================================ */
async function startCam() {
  /* Stop any existing tracks */
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  /* Constraints — try ideal resolution, fall back gracefully */
  const constraints = {
    video: {
      facingMode,
      width:  { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: true   /* request mic at same time → single browser prompt */
  };

  /* Primary attempt */
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (firstErr) {
    /* If OverconstrainedError, retry with basic constraints */
    if (firstErr.name === 'OverconstrainedError') {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      });
    } else {
      throw firstErr;
    }
  }

  /* Attach to video element; mute preview to avoid echo */
  camEl.srcObject = stream;
  camEl.muted     = true;

  /* Keep audio tracks ready for recording but not audible in preview */
  stream.getAudioTracks().forEach(t => { t.enabled = true; });
}

function flipCam() {
  facingMode = facingMode === 'environment' ? 'user' : 'environment';
  startCam().then(() => {
    toast(facingMode === 'user' ? '🤳 Front camera' : '📷 Rear camera');
  }).catch(err => {
    toast('⚠️ Could not flip camera');
    console.warn(err);
  });
}

/* ============================================================
   TOP MODE  (Standard / Hi-res / iPhone)
   ============================================================ */
function setMode(m) {
  topMode = m;
  /* Update pill buttons */
  ['Std', 'Hires', 'Iphone'].forEach(x =>
    document.getElementById('btn' + x).classList.remove('active')
  );
  document.getElementById('btn' + capitalize(m)).classList.add('active');
  applyTopMode();
}

function applyTopMode() {
  musicBanner.classList.remove('show');
  hiresBanner.classList.remove('show');
  app.classList.remove('iphone-mode');

  if (topMode === 'iphone') {
    app.classList.add('iphone-mode');
    toast('iPhone mode');
  } else if (topMode === 'hires') {
    hiresBanner.classList.add('show');
    toast('Hi-res mode');
  }

  /* Re-show music banner when in video capture mode */
  if (capMode === 'video' && topMode !== 'iphone') {
    musicBanner.classList.add('show');
  }
}

/* ============================================================
   CAPTURE MODE  (Normal / Video)
   ============================================================ */
function setCapture(m) {
  capMode = m;
  ctNormal.classList.toggle('active', m === 'normal');
  ctVideo.classList.toggle('active',  m === 'video');
  applyCapMode();
}

function applyCapMode() {
  if (capMode === 'video') {
    shutterOuter.className = 'shutter-outer video';
    shutterInner.className = 'shutter-inner video';
    sbDuration.style.display = 'flex';
    if (topMode !== 'iphone') musicBanner.classList.add('show');
    if (isRec) stopRec();
  } else {
    shutterOuter.className = 'shutter-outer';
    shutterInner.className = 'shutter-inner';
    sbDuration.style.display = 'none';
    musicBanner.classList.remove('show');
    if (isRec) stopRec();
  }
}

/* ============================================================
   SHUTTER ACTION
   ============================================================ */
function captureAction() {
  if (capMode === 'normal') {
    doPhoto();
  } else {
    isRec ? stopRec() : startRec();
  }
}

/* ── PHOTO ── */
function doPhoto() {
  if (!stream) { toast('❌ Camera not ready'); return; }
  flashBurst();

  const track    = stream.getVideoTracks()[0];
  const settings = track ? track.getSettings() : {};
  const w        = settings.width  || camEl.videoWidth  || 1280;
  const h        = settings.height || camEl.videoHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(camEl, 0, 0, w, h);

  canvas.toBlob(blob => {
    if (!blob) { toast('❌ Capture failed'); return; }
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `b612_${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📸 Photo saved!');
  }, 'image/jpeg', 0.95);
}

function flashBurst() {
  flashEl.style.opacity = '1';
  setTimeout(() => { flashEl.style.opacity = '0'; }, 110);
}

/* ── VIDEO RECORD ── */
function startRec() {
  if (!stream) { toast('❌ Camera not ready'); return; }
  recChunks = [];

  /* Pick best supported MIME */
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
    ''
  ];
  const mimeType = mimeTypes.find(t => t === '' || MediaRecorder.isTypeSupported(t));
  const opts     = mimeType ? { mimeType } : {};

  try {
    mediaRec = new MediaRecorder(stream, opts);
  } catch (e) {
    toast('❌ Recording not supported');
    return;
  }

  mediaRec.ondataavailable = e => {
    if (e.data && e.data.size > 0) recChunks.push(e.data);
  };

  mediaRec.onstop = () => {
    const blob = new Blob(recChunks, { type: mimeType || 'video/webm' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `b612_video_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    toast('🎬 Video saved!');
  };

  mediaRec.onerror = e => {
    toast('❌ Recording error: ' + e.error?.message);
    isRec = false;
    shutterOuter.className = 'shutter-outer video';
    shutterInner.className = 'shutter-inner video';
  };

  mediaRec.start(200); /* collect data every 200 ms */
  isRec = true;
  shutterOuter.className = 'shutter-outer rec';
  shutterInner.className = 'shutter-inner rec';
  toast('🔴 Recording…');
}

function stopRec() {
  if (mediaRec && isRec) {
    mediaRec.stop();
  }
  isRec = false;
  shutterOuter.className = 'shutter-outer video';
  shutterInner.className = 'shutter-inner video';
}

/* ============================================================
   FLASH / TORCH
   ============================================================ */
function toggleFlash() {
  flashOn = !flashOn;
  flashOffSvg.style.display = flashOn ? 'none'  : 'block';
  flashOnSvg.style.display  = flashOn ? 'block' : 'none';
  toast(flashOn ? '⚡ Flash ON' : 'Flash OFF');

  /* Try hardware torch (Android Chrome only) */
  if (stream) {
    const track = stream.getVideoTracks()[0];
    if (track) {
      const caps = (typeof track.getCapabilities === 'function')
        ? track.getCapabilities()
        : {};
      if (caps.torch) {
        track.applyConstraints({ advanced: [{ torch: flashOn }] })
          .catch(() => {/* torch not available — silent fail */});
      }
    }
  }
}

/* ============================================================
   SIDEBAR COLLAPSE
   ============================================================ */
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  sidebar.querySelectorAll('.sb-btn').forEach(btn => {
    btn.style.display = sidebarOpen ? 'flex' : 'none';
  });
  collapseIcon.innerHTML = sidebarOpen
    ? '<polyline points="18 15 12 9 6 15"/>'   /* up chevron */
    : '<polyline points="6 9 12 15 18 9"/>';   /* down chevron */
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function toast(msg) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

/* ============================================================
   UTILS
   ============================================================ */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}