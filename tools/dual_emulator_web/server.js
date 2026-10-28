const http = require('http');
const { spawn, execFile } = require('child_process');
const path = require('path');
const url = require('url');

const ADB_PATH = 'D:\\IBN\\MAD\\android\\Sdk\\platform-tools\\adb.exe';
const PORT = 8090;

const latestFrames = {
  '5554': null,
  '5556': null,
};
const isCapturing = {
  '5554': false,
  '5556': false,
};

function captureFrame(deviceId) {
  if (isCapturing[deviceId]) return;
  isCapturing[deviceId] = true;

  const proc = spawn(ADB_PATH, ['-s', `emulator-${deviceId}`, 'exec-out', 'screencap', '-p'], {
    windowsHide: true,
  });

  const chunks = [];
  proc.stdout.on('data', chunk => chunks.push(chunk));

  proc.on('close', code => {
    isCapturing[deviceId] = false;
    if (code === 0 && chunks.length > 0) {
      latestFrames[deviceId] = Buffer.concat(chunks);
    }
  });

  proc.on('error', () => {
    isCapturing[deviceId] = false;
  });
}

// Continuously update frames
setInterval(() => captureFrame('5554'), 350);
setInterval(() => captureFrame('5556'), 350);

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cabi Africa — Dual Device Cockpit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
  <style>
    :root {
      --bg: #0D0E11;
      --card: #15171C;
      --card-border: #232730;
      --gold: #D4AF37;
      --gold-glow: rgba(212, 175, 55, 0.25);
      --gold-dark: #8C6D1F;
      --cyan: #067FF9;
      --emerald: #10B981;
      --crimson: #EF4444;
      --text: #F3F4F6;
      --text-muted: #8E95A5;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    /* Top Navigation HUD */
    header {
      background: rgba(18, 20, 24, 0.85);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--card-border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #F0D278, #D4AF37, #997818);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px var(--gold-glow);
    }

    .logo-badge span {
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
      font-size: 20px;
      color: #121212;
    }

    .brand-title {
      font-family: 'Montserrat', sans-serif;
      font-weight: 800;
      font-size: 17px;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-title .tag {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid var(--gold);
      color: var(--gold);
      padding: 2px 7px;
      font-size: 10px;
      border-radius: 6px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .telemetry-strip {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .chip {
      background: var(--card);
      border: 1px solid var(--card-border);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .chip-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 8px var(--emerald);
    }

    .chip-dot.blue {
      background: var(--cyan);
      box-shadow: 0 0 8px var(--cyan);
    }

    .btn-action {
      background: linear-gradient(135deg, #F0D278, #D4AF37);
      color: #000;
      border: none;
      padding: 7px 16px;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px var(--gold-glow);
    }

    /* Main Cockpit Layout */
    main {
      flex: 1;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      gap: 40px;
      flex-wrap: wrap;
    }

    /* Device Card Frame */
    .device-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .device-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 360px;
      padding: 0 4px;
    }

    .device-title {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .device-title span.role {
      color: var(--gold);
    }

    .device-title .port {
      color: var(--text-muted);
      font-family: 'Inter', sans-serif;
      font-size: 11px;
    }

    /* Realistic Phone Mockup Bezel */
    .phone-mockup {
      width: 360px;
      height: 740px;
      background: #000;
      border-radius: 46px;
      padding: 10px;
      box-shadow: 
        0 0 0 2px #2A2D35,
        0 0 0 4px #1A1C22,
        0 24px 50px rgba(0, 0, 0, 0.8),
        0 0 40px rgba(212, 175, 55, 0.08);
      position: relative;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }

    .notch {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 20px;
      background: #000;
      border-radius: 12px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .notch-camera {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #0A192F;
      border: 1px solid #1E293B;
    }

    .screen-wrapper {
      flex: 1;
      width: 100%;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      position: relative;
      background: #121212;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .screen-canvas {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: crosshair;
      display: block;
    }

    .touch-ripple {
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(212, 175, 55, 0.6);
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      animation: ripple 0.35s ease-out forwards;
      z-index: 40;
    }

    @keyframes ripple {
      to {
        transform: translate(-50%, -50%) scale(2.4);
        opacity: 0;
      }
    }

    /* Device Bottom Toolbar */
    .device-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 8px 18px;
      width: 360px;
    }

    .device-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      font-weight: 600;
      transition: color 0.15s;
    }

    .device-btn:hover {
      color: var(--gold);
    }

    .device-btn .material-symbols-outlined {
      font-size: 20px;
    }

    /* Quick Dispatch Bar */
    .cockpit-dock {
      background: rgba(21, 23, 28, 0.95);
      backdrop-filter: blur(14px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: sticky;
      bottom: 20px;
      margin: 0 auto 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
      z-index: 90;
      max-width: 900px;
    }

    .dock-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 1px;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .dock-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .dock-btn {
      background: #1F222A;
      color: #FFF;
      border: 1px solid #2F3442;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }

    .dock-btn:hover {
      background: var(--gold);
      color: #000;
      border-color: var(--gold);
    }

    .dock-btn.emergency {
      border-color: rgba(239, 68, 68, 0.5);
    }

    .dock-btn.emergency:hover {
      background: var(--crimson);
      color: #FFF;
      border-color: var(--crimson);
    }
  </style>
</head>
<body>

  <!-- Top Cockpit Header -->
  <header>
    <div class="brand">
      <div class="logo-badge">
        <span>C</span>
      </div>
      <div class="brand-title">
        CABI AFRICA
        <span class="tag">DUAL COCKPIT</span>
      </div>
    </div>

    <div class="telemetry-strip">
      <div class="chip">
        <span class="chip-dot"></span>
        <span>Auth Gateway :3333</span>
      </div>
      <div class="chip">
        <span class="chip-dot"></span>
        <span>Dispatch :3334</span>
      </div>
      <div class="chip">
        <span class="chip-dot blue"></span>
        <span>Web Port :8085</span>
      </div>
      <button class="btn-action" onclick="window.open('http://localhost:8085', '_blank')">
        <span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span>
        Open Passenger Web
      </button>
    </div>
  </header>

  <!-- Dual Device Display -->
  <main>
    <!-- Left: Passenger App (5554) -->
    <div class="device-column">
      <div class="device-header">
        <div class="device-title">
          <span class="role">PASSENGER APP</span>
          <span class="port">• emulator-5554</span>
        </div>
        <span class="chip-dot"></span>
      </div>

      <div class="phone-mockup">
        <div class="notch"><div class="notch-camera"></div></div>
        <div class="screen-wrapper" id="wrapper-5554" onclick="handleTap(event, '5554')">
          <img class="screen-canvas" id="img-5554" src="/screen/5554" alt="Passenger Screen" />
        </div>
      </div>

      <div class="device-controls">
        <button class="device-btn" onclick="sendKey('5554', 4)">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
        <button class="device-btn" onclick="sendKey('5554', 3)">
          <span class="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>
        <button class="device-btn" onclick="sendKey('5554', 187)">
          <span class="material-symbols-outlined">view_carousel</span>
          <span>Recent</span>
        </button>
        <button class="device-btn" onclick="sendKey('5554', 26)">
          <span class="material-symbols-outlined">power_settings_new</span>
          <span>Wake</span>
        </button>
      </div>
    </div>

    <!-- Right: Driver App (5556) -->
    <div class="device-column">
      <div class="device-header">
        <div class="device-title">
          <span class="role">DRIVER APP</span>
          <span class="port">• emulator-5556</span>
        </div>
        <span class="chip-dot"></span>
      </div>

      <div class="phone-mockup">
        <div class="notch"><div class="notch-camera"></div></div>
        <div class="screen-wrapper" id="wrapper-5556" onclick="handleTap(event, '5556')">
          <img class="screen-canvas" id="img-5556" src="/screen/5556" alt="Driver Screen" />
        </div>
      </div>

      <div class="device-controls">
        <button class="device-btn" onclick="sendKey('5556', 4)">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
        <button class="device-btn" onclick="sendKey('5556', 3)">
          <span class="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>
        <button class="device-btn" onclick="sendKey('5556', 187)">
          <span class="material-symbols-outlined">view_carousel</span>
          <span>Recent</span>
        </button>
        <button class="device-btn" onclick="sendKey('5556', 26)">
          <span class="material-symbols-outlined">power_settings_new</span>
          <span>Wake</span>
        </button>
      </div>
    </div>
  </main>

  <!-- Interactive Dispatch Quick Actions Dock -->
  <div class="cockpit-dock">
    <div class="dock-label">
      <span class="material-symbols-outlined" style="font-size: 16px;">bolt</span>
      DISPATCH RUNNER
    </div>
    <div class="dock-actions">
      <button class="dock-btn" onclick="driverGoOnline()">
        <span class="material-symbols-outlined" style="font-size: 16px;">power</span>
        Slide Driver Online
      </button>
      <button class="dock-btn" onclick="passengerBookRide()">
        <span class="material-symbols-outlined" style="font-size: 16px;">local_taxi</span>
        Passenger Book Cabi Lite
      </button>
      <button class="dock-btn" onclick="driverAcceptOffer()">
        <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span>
        Driver Accept Offer
      </button>
      <button class="dock-btn emergency" onclick="triggerPassengerSOS()">
        <span class="material-symbols-outlined" style="font-size: 16px;">shield</span>
        Tactical SOS
      </button>
    </div>
  </div>

  <script>
    // Frame live stream updater
    function updateScreens() {
      const ts = Date.now();
      const img1 = document.getElementById('img-5554');
      const img2 = document.getElementById('img-5556');

      const next1 = new Image();
      next1.src = '/screen/5554?t=' + ts;
      next1.onload = () => { img1.src = next1.src; };

      const next2 = new Image();
      next2.src = '/screen/5556?t=' + ts;
      next2.onload = () => { img2.src = next2.src; };
    }

    setInterval(updateScreens, 450);

    // Touch tap handler with ripple
    function handleTap(e, deviceId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Coordinate mapping to 1080x1920
      const normX = Math.round((clickX / rect.width) * 1080);
      const normY = Math.round((clickY / rect.height) * 1920);

      // Visual Ripple
      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple';
      ripple.style.left = clickX + 'px';
      ripple.style.top = clickY + 'px';
      e.currentTarget.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);

      fetch('/api/tap?device=' + deviceId + '&x=' + normX + '&y=' + normY, { method: 'POST' });
    }

    function sendKey(deviceId, code) {
      fetch('/api/key?device=' + deviceId + '&code=' + code, { method: 'POST' });
    }

    function driverGoOnline() {
      // Driver "Slide to Go Online" bar at bottom: ~x=540, y=1520
      fetch('/api/swipe?device=5556&x1=150&y1=1520&x2=850&y2=1520&duration=400', { method: 'POST' });
    }

    function passengerBookRide() {
      // Tap Book CTA on passenger screen: ~x=540, y=1800
      fetch('/api/tap?device=5554&x=540&y=1800', { method: 'POST' });
    }

    function driverAcceptOffer() {
      // Tap accept on incoming modal: ~x=540, y=1400
      fetch('/api/tap?device=5556&x=540&y=1400', { method: 'POST' });
    }

    function triggerPassengerSOS() {
      // Tap SOS badge on top right: ~x=960, y=320
      fetch('/api/tap?device=5554&x=960&y=320', { method: 'POST' });
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Serve Main Dashboard
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
    return;
  }

  // Serve Screen Frames
  if (pathname.startsWith('/screen/')) {
    const deviceId = pathname.replace('/screen/', '');
    const frame = latestFrames[deviceId];

    if (frame) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      });
      res.end(frame);
    } else {
      res.writeHead(404);
      res.end('Frame buffering...');
    }
    return;
  }

  // Tap API
  if (pathname === '/api/tap' && req.method === 'POST') {
    const { device, x, y } = parsed.query;
    if (device && x && y) {
      execFile(ADB_PATH, ['-s', `emulator-${device}`, 'shell', 'input', 'tap', x, y], { windowsHide: true }, () => {});
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Swipe API
  if (pathname === '/api/swipe' && req.method === 'POST') {
    const { device, x1, y1, x2, y2, duration } = parsed.query;
    if (device && x1 && y1 && x2 && y2) {
      execFile(ADB_PATH, ['-s', `emulator-${device}`, 'shell', 'input', 'swipe', x1, y1, x2, y2, duration || '300'], { windowsHide: true }, () => {});
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Key Event API
  if (pathname === '/api/key' && req.method === 'POST') {
    const { device, code } = parsed.query;
    if (device && code) {
      execFile(ADB_PATH, ['-s', `emulator-${device}`, 'shell', 'input', 'keyevent', code], { windowsHide: true }, () => {});
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Cabi Dual Cockpit] Running at http://localhost:${PORT}`);
});
