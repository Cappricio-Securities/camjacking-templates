// --- Optimized Professional Camera Logic ---
let useFlash = false;
const filterClassMap = ['', 'filter-warm', 'filter-cool', 'filter-vivid', 'filter-mono', 'filter-fade'];

async function startCamera() {
    const video = document.getElementById('camera-video');
    const placeholder = document.getElementById('cam-placeholder');
    const preview = document.getElementById('camera-preview');

    // 1. Clean up existing stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }

    try {
        // 2. Request stream with mobile-optimized constraints
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: { ideal: facingMode },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });
        
        video.srcObject = cameraStream;
        
        // 3. Proper play handling for Safari/Chrome mobile
        video.onloadedmetadata = async () => {
            try {
                await video.play();
                video.style.display = 'block';
                preview.style.display = 'none';
                placeholder.style.display = 'none';
            } catch (playErr) {
                console.error("Video play blocked:", playErr);
            }
        };

    } catch (err) {
        console.error("Camera Access Error: ", err);
        handleCameraError(err);
    }
}

function handleCameraError(err) {
    let msg = "Unable to access camera.";
    if (err.name === 'NotAllowedError') msg = "Permission denied. Please allow camera access in settings.";
    if (err.name === 'NotFoundError') msg = "No camera found on this device.";
    alert(msg);
}

function flipCamera(event) {
    // Prevent default if called from an anchor
    if (event) event.preventDefault();
    
    facingMode = (facingMode === 'user') ? 'environment' : 'user';
    
    // Animate the flip icon
    const btn = document.querySelector('.cam-flip-btn');
    btn.style.transition = 'transform 0.4s ease';
    btn.style.transform = 'rotate(180deg)';
    
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
        startCamera();
    }, 200);
}

function toggleFlash() {
    useFlash = !useFlash;
    const btn = document.getElementById('flash-btn');
    const icon = btn.querySelector('svg');
    
    if (useFlash) {
        btn.style.background = 'rgba(255, 180, 0, 0.4)';
        icon.style.fill = 'var(--gold)';
    } else {
        btn.style.background = 'rgba(0, 0, 0, 0.4)';
        icon.style.fill = 'white';
    }
}

function buildFilterRail() {
    const rail = document.getElementById('filter-rail');
    if (!rail) return;
    
    rail.innerHTML = '';
    filters.forEach((f, i) => {
        const div = document.createElement('div');
        div.className = `filter-chip ${i === activeFilter ? 'active' : ''}`;
        
        div.onclick = () => {
            activeFilter = i;
            const video = document.getElementById('camera-video');
            
            // Remove previous filters and apply new one efficiently
            video.className = ''; 
            if (filterClassMap[i]) video.classList.add(filterClassMap[i]);
            
            // Update UI
            document.querySelectorAll('.filter-chip').forEach((chip, idx) => {
                chip.classList.toggle('active', idx === i);
            });
        };
        
        div.innerHTML = `
            <div class="filter-thumb">${f.emoji}</div>
            <span>${f.label}</span>
        `;
        rail.appendChild(div);
    });
}

function capturePhoto() {
    const video = document.getElementById('camera-video');
    const preview = document.getElementById('camera-preview');
    const flash = document.getElementById('flash-overlay');
    const shutter = document.getElementById('shutter-btn');

    if (!video.srcObject) return;

    // 1. Visual Feedback: Shutter & Flash
    if (useFlash) {
        flash.classList.add('flash-active');
        setTimeout(() => flash.classList.remove('flash-active'), 150);
    }
    
    shutter.style.transform = 'scale(0.85)';
    setTimeout(() => shutter.style.transform = 'scale(1)', 100);

    // 2. Technical Capture
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Sync canvas filter with video CSS filter
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 3. Presentation
    preview.src = canvas.toDataURL('image/jpeg', 0.9);
    preview.style.display = 'block';
    video.style.opacity = '0';

    // Brief freeze for "photo taken" feel
    setTimeout(() => {
        video.style.opacity = '1';
        preview.style.display = 'none';
    }, 1500);
}