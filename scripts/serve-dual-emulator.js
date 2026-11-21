const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execFile, execFileSync } = require('child_process');

const PORT_STUDIO = 8080;
const PORT_DRIVER_FLUTTER = 8081;
const PORT_PASSENGER_FLUTTER = 8082;
const PORT_AUTH_API = 3333;
const PORT_DISPATCH_API = 3334;

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.resolve(ROOT_DIR, 'web');
const DRIVER_WEB_DIR = path.resolve(ROOT_DIR, 'mobile', 'driver_app', 'build', 'web');
const PASSENGER_WEB_DIR = path.resolve(ROOT_DIR, 'mobile', 'passenger_app', 'build', 'web');
const SCREENSHOTS_DIR = path.resolve(WEB_DIR, 'screenshots');

const ADB_PATH = process.env.ADB_PATH || 'adb';
const SAFE_SERIAL_REGEX = /^[a-zA-Z0-9._:-]+$/;
const SAFE_KEY_REGEX = /^[a-zA-Z0-9_]+$/;

let EMULATOR_SERIAL = 'emulator-5554';
let HAS_REAL_ADB = false;
try {
  const devOut = execFileSync(ADB_PATH, ['devices'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const m = devOut.match(/(emulator-\d+)\s+device/);
  if (m) {
    EMULATOR_SERIAL = m[1];
    HAS_REAL_ADB = true;
  }
} catch (e) {
  HAS_REAL_ADB = false;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.frag': 'application/octet-stream'
};

// Track simulated screen states for the Real Android Screenshot Bridge when ADB is not connected
const fallbackScreenState = {
  'emulator-5554': 0,
  'emulator-5556': 0
};

const PASSENGER_SCREENSHOTS = [
  path.join(SCREENSHOTS_DIR, 'passenger_current_screen.png'),
  path.join(SCREENSHOTS_DIR, 'phone_passenger_screen.png')
];

const DRIVER_SCREENSHOTS = [
  path.join(SCREENSHOTS_DIR, 'driver_current_screen.png'),
  path.join(SCREENSHOTS_DIR, 'phone_driver_service_screen.png'),
  path.join(SCREENSHOTS_DIR, 'phone_driver_screen.png'),
  path.join(SCREENSHOTS_DIR, 'phone_driver_post_trip.png'),
  path.resolve(ROOT_DIR, 'mobile', 'driver_app', 'emulator_5556.png')
];

function getFallbackScreenshot(serial) {
  const isPassenger = serial === 'emulator-5554' || String(serial).includes('5554');
  const list = (isPassenger ? PASSENGER_SCREENSHOTS : DRIVER_SCREENSHOTS).filter((p) => {
    try {
      return fs.statSync(p).size > 0;
    } catch {
      return false;
    }
  });
  if (list.length === 0) return null;
  const idx = (fallbackScreenState[serial] || 0) % list.length;
  return list[idx];
}

function serveStaticDirectory(baseDir, spaFallback = false) {
  return (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = decodeURIComponent(urlObj.pathname);
    if (reqPath === '/' || reqPath === '') {
      reqPath = spaFallback ? '/index.html' : '/dual_emulator.html';
    }

    let filePath = path.resolve(baseDir, '.' + reqPath);
    if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if ((err || !stats.isFile()) && spaFallback) {
        filePath = path.resolve(baseDir, 'index.html');
      }
      fs.stat(filePath, (err2, stats2) => {
        if (err2 || !stats2.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: ' + reqPath);
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
      });
    });
  };
}

// 1. Studio Server on Port 8080
const studioStaticHandler = serveStaticDirectory(WEB_DIR, false);
const passengerAppHandler = serveStaticDirectory(PASSENGER_WEB_DIR, true);
const driverAppHandler = serveStaticDirectory(DRIVER_WEB_DIR, true);

const studioServer = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Flutter Web App Routing for Studio Iframes
  if (pathname === '/apps/passenger') {
    res.writeHead(302, { Location: '/apps/passenger/' });
    res.end();
    return;
  }
  if (pathname.startsWith('/apps/passenger/')) {
    req.url = req.url.substring('/apps/passenger'.length) || '/';
    return passengerAppHandler(req, res);
  }

  if (pathname === '/apps/driver') {
    res.writeHead(302, { Location: '/apps/driver/' });
    res.end();
    return;
  }
  if (pathname.startsWith('/apps/driver/')) {
    req.url = req.url.substring('/apps/driver'.length) || '/';
    return driverAppHandler(req, res);
  }

  function resolveSerial(paramSerial, deviceName) {
    let candidate = EMULATOR_SERIAL;
    if (paramSerial) candidate = String(paramSerial);
    else if (deviceName === 'passenger') candidate = 'emulator-5554';
    else if (deviceName === 'driver') candidate = 'emulator-5556';

    if (!SAFE_SERIAL_REGEX.test(candidate)) {
      throw new Error('Invalid emulator serial identifier');
    }
    return candidate;
  }

  // 1. Android Live Screencap Streaming Endpoint (with High-Res Fallback when ADB is offline)
  if (pathname === '/api/emulator/screen') {
    let targetSerial;
    try {
      targetSerial = resolveSerial(urlObj.searchParams.get('serial'), urlObj.searchParams.get('device'));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(err.message);
      return;
    }

    const sendFallbackImage = () => {
      const fallbackPath = getFallbackScreenshot(targetSerial);
      if (fallbackPath && !res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        fs.createReadStream(fallbackPath).pipe(res);
      } else if (!res.headersSent) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('No emulator screenshot available');
      }
    };

    if (!HAS_REAL_ADB) {
      sendFallbackImage();
      return;
    }

    const chunks = [];
    const screencap = spawn(ADB_PATH, ['-s', targetSerial, 'exec-out', 'screencap', '-p']);
    screencap.stdout.on('data', (chunk) => chunks.push(chunk));
    screencap.on('error', () => sendFallbackImage());
    screencap.on('close', (code) => {
      const buf = Buffer.concat(chunks);
      if (code === 0 && buf.length > 100 && !res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        res.end(buf);
      } else {
        sendFallbackImage();
      }
    });
    return;
  }

  // 2. Android Touch Input Tap
  if (pathname === '/api/emulator/tap' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const { x, y, serial, device } = parsed;
        const targetSerial = resolveSerial(serial, device);
        fallbackScreenState[targetSerial] = (fallbackScreenState[targetSerial] || 0) + 1;
        const tapX = String(Math.round(Number(x || 0)));
        const tapY = String(Math.round(Number(y || 0)));
        if (HAS_REAL_ADB) {
          execFile(ADB_PATH, ['-s', targetSerial, 'shell', 'input', 'tap', tapX, tapY], () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, tapX: Number(tapX), tapY: Number(tapY), targetSerial }));
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, simulated: true, tapX: Number(tapX), tapY: Number(tapY), targetSerial }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 3. Android Touch Input Swipe
  if (pathname === '/api/emulator/swipe' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const { x1, y1, x2, y2, duration = 300, serial, device } = parsed;
        const targetSerial = resolveSerial(serial, device);
        fallbackScreenState[targetSerial] = (fallbackScreenState[targetSerial] || 0) + 1;
        if (HAS_REAL_ADB) {
          const args = [
            '-s', targetSerial, 'shell', 'input', 'swipe',
            String(Math.round(Number(x1))),
            String(Math.round(Number(y1))),
            String(Math.round(Number(x2))),
            String(Math.round(Number(y2))),
            String(Math.round(Number(duration)))
          ];
          execFile(ADB_PATH, args, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, targetSerial }));
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, simulated: true, targetSerial }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. Android Key Event
  if (pathname === '/api/emulator/key' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const { key, serial, device } = parsed;
        const targetSerial = resolveSerial(serial, device);
        const safeKey = String(key);
        if (!SAFE_KEY_REGEX.test(safeKey)) {
          throw new Error('Invalid keyevent code');
        }
        fallbackScreenState[targetSerial] = (fallbackScreenState[targetSerial] || 0) + 1;
        if (HAS_REAL_ADB) {
          execFile(ADB_PATH, ['-s', targetSerial, 'shell', 'input', 'keyevent', safeKey], () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, key: safeKey, targetSerial }));
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, simulated: true, key: safeKey, targetSerial }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 5. App Launcher
  if (pathname === '/api/emulator/launch' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const { app, serial, device } = parsed;
        const targetSerial = resolveSerial(serial, device || (app === 'passenger' ? 'passenger' : 'driver'));
        fallbackScreenState[targetSerial] = 0;
        const pkg = app === 'passenger' ? 'africa.cabi.passenger/.MainActivity' : 'africa.cabi.driver/.MainActivity';
        if (HAS_REAL_ADB) {
          execFile(ADB_PATH, ['-s', targetSerial, 'shell', 'am', 'start', '-n', pkg], (err, stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: !err, output: stdout, targetSerial }));
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, simulated: true, targetSerial }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 5b. ADB Devices Listing
  if (pathname === '/api/emulator/devices') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      hasRealAdb: HAS_REAL_ADB,
      devicesOutput: HAS_REAL_ADB ? `${EMULATOR_SERIAL}\tdevice` : 'emulator-5554\tsimulated\nemulator-5556\tsimulated'
    }));
    return;
  }

  return studioStaticHandler(req, res);
});

// Stateful in-memory driver store for preview & local dev
const mockDrivers = [
  {
    id: 'driver-001',
    userId: 'driver-001',
    email: 'driver@test.com',
    fullName: 'Joseph Kimani',
    name: 'Joseph Kimani',
    phone: '+254712345678',
    isOnline: false,
    status: 'offline',
    averageRating: 4.95,
    rating: 4.95,
    totalRidesCompleted: 1240,
    acceptanceRate: 98,
    score: 99,
    currentLocation: { lat: -1.286389, lng: 36.817223 },
    licenseNumber: 'DL-KE-99281',
    isBiometricVerified: true,
    user: {
      id: 'driver-001',
      fullName: 'Joseph Kimani',
      phone: '+254712345678',
      email: 'driver@test.com',
      averageRating: 4.95,
      status: 'ACTIVE',
      role: 'DRIVER'
    },
    vehicle: {
      make: 'Toyota',
      model: 'Axio Hybrid',
      year: 2022,
      plateNumber: 'KDH 452X',
      category: 'STANDARD',
      type: 'Toyota Axio'
    },
    vehicles: [
      {
        id: 'v-001',
        make: 'Toyota',
        model: 'Axio Hybrid',
        year: 2022,
        plateNumber: 'KDH 452X',
        category: 'STANDARD',
        type: 'Toyota Axio',
        isActive: true
      }
    ]
  }
];

// 2. Built-in Auth & Dispatch Mock API Responders (for Flutter Web Apps on 8081 & 8082)
function createMockApiServer(serviceName) {
  return http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-api-key');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      let parsed = {};
      try {
        parsed = body ? JSON.parse(body) : {};
      } catch {}

      res.setHeader('Content-Type', 'application/json');

      // 1. Driver Toggle Online / Offline Status
      if (pathname.includes('/dispatch/drivers') && pathname.includes('/toggle-status')) {
        const parts = pathname.split('/');
        const toggleIdx = parts.indexOf('toggle-status');
        const driverId = toggleIdx > 0 ? parts[toggleIdx - 1] : 'driver-001';
        let driver = mockDrivers.find(d => d.id === driverId || d.userId === driverId);
        if (!driver) {
          driver = mockDrivers[0];
        }
        driver.isOnline = Boolean(parsed.isOnline);
        driver.status = driver.isOnline ? 'online' : 'offline';
        console.log(`[DISPATCH] 🔄 Driver status changed: ${driver.name} is now ${driver.status.toUpperCase()}`);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, isOnline: driver.isOnline, driver }));
        return;
      }

      // 2. Driver Location Update
      if (pathname.includes('/dispatch/drivers') && pathname.includes('/location')) {
        const parts = pathname.split('/');
        const locIdx = parts.indexOf('location');
        const driverId = locIdx > 0 ? parts[locIdx - 1] : 'driver-001';
        let driver = mockDrivers.find(d => d.id === driverId || d.userId === driverId);
        if (driver && parsed.lat && parsed.lng) {
          driver.currentLocation = { lat: Number(parsed.lat), lng: Number(parsed.lng) };
        }
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, currentLocation: driver ? driver.currentLocation : null }));
        return;
      }

      // 3. Driver Status Query
      if (pathname.includes('/dispatch/drivers/') && pathname.endsWith('/status')) {
        const parts = pathname.split('/');
        const driverId = parts[parts.length - 2];
        const driver = mockDrivers.find(d => d.id === driverId || d.userId === driverId) || mockDrivers[0];
        res.writeHead(200);
        res.end(JSON.stringify({ isOnline: driver.isOnline }));
        return;
      }

      // 4. Dispatch Drivers List (for Dispatch Panel & Live Map)
      if (pathname.endsWith('/dispatch/drivers') || pathname.endsWith('/dispatch/drivers/')) {
        res.writeHead(200);
        res.end(JSON.stringify(mockDrivers));
        return;
      }

      // 5. Dispatch Metrics
      if (pathname.endsWith('/dispatch/metrics')) {
        const onlineCount = mockDrivers.filter(d => d.isOnline).length;
        res.writeHead(200);
        res.end(JSON.stringify({
          activeDrivers: mockDrivers.length,
          onlineDrivers: onlineCount,
          activeRides: 0,
          completedToday: 42,
          surgeMultiplier: 1.0,
          emergencyAlerts: 0
        }));
        return;
      }

      // Auth Login
      if (pathname.endsWith('/auth/login')) {
        const email = parsed.email || 'driver@test.com';
        const isDispatcher = email.includes('dispatch') || email.includes('admin');
        const isDriver = !isDispatcher && (email.includes('driver') || email.includes('boda') || !email.includes('passenger'));
        let user;
        if (isDispatcher) {
          user = {
            id: 'disp-001',
            userId: 'disp-001',
            email,
            firstName: 'Sarah',
            lastName: 'Mwangi',
            fullName: 'Sarah Mwangi',
            phone: '+254700112233',
            role: 'DISPATCHER',
            status: 'ACTIVE',
            permissions: [
              'DISPATCH_DASHBOARD_VIEW',
              'DISPATCH_RIDE_MONITOR',
              'DISPATCH_DRIVER_MANAGE',
              'DISPATCH_REAL_TIME_MAP',
              'DISPATCH_ANALYTICS_VIEW',
              'PASSENGER_PROFILES_VIEW',
              'SUPER_ADMIN',
              'ADMIN'
            ]
          };
        } else if (isDriver) {
          user = {
            id: 'driver-001',
            userId: 'driver-001',
            email,
            firstName: 'Joseph',
            lastName: 'Kimani',
            fullName: 'Joseph Kimani',
            phone: '+254712345678',
            role: 'DRIVER',
            status: 'ACTIVE',
            isBiometricVerified: true,
            driverProfile: {
              id: 'dp-001',
              userId: 'driver-001',
              licenseNumber: 'DL-KE-99281',
              status: 'APPROVED',
              isOnline: mockDrivers[0].isOnline,
              rating: 4.95,
              totalTrips: 1240,
              vehicle: {
                make: 'Toyota',
                model: 'Axio Hybrid',
                year: 2022,
                plateNumber: 'KDH 452X',
                category: 'STANDARD'
              }
            }
          };
        } else {
          user = {
            id: 'passenger-001',
            userId: 'passenger-001',
            email,
            firstName: 'Brian',
            lastName: 'Karanja',
            fullName: 'Brian Karanja',
            phone: '+254722111222',
            role: 'PASSENGER',
            status: 'ACTIVE',
            walletBalance: 4500
          };
        }

        res.writeHead(200);
        res.end(
          JSON.stringify({
            accessToken: 'cabi-live-preview-jwt-token',
            token: 'cabi-live-preview-jwt-token',
            user
          })
        );
        return;
      }

      // Auth Me / Profile
      if (pathname.endsWith('/auth/me') || pathname.includes('/users/')) {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            id: 'driver-001',
            userId: 'driver-001',
            email: 'driver@test.com',
            firstName: 'Joseph',
            lastName: 'Kimani',
            fullName: 'Joseph Kimani',
            phone: '+254712345678',
            role: 'DRIVER',
            status: 'ACTIVE',
            isBiometricVerified: true,
            driverProfile: {
              id: 'dp-001',
              userId: 'driver-001',
              licenseNumber: 'DL-KE-99281',
              status: 'APPROVED',
              isOnline: true,
              rating: 4.95,
              totalTrips: 1240,
              vehicle: {
                make: 'Toyota',
                model: 'Axio Hybrid',
                year: 2022,
                plateNumber: 'KDH 452X',
                category: 'STANDARD'
              }
            }
          })
        );
        return;
      }

      // Rides / Dispatch
      if (pathname.includes('/rides')) {
        res.writeHead(req.method === 'POST' ? 201 : 200);
        res.end(
          JSON.stringify({
            id: 'TRIP-' + Math.floor(100000 + Math.random() * 900000),
            status: 'SEARCHING',
            fare: parsed.estimatedFare || parsed.fare || 1850,
            pickupLocation: parsed.pickupLocation || { address: 'Kenyatta Avenue, Nairobi CBD' },
            dropoffLocation: parsed.dropoffLocation || { address: 'JKIA Terminal 1A, Nairobi' }
          })
        );
        return;
      }

      // Generic 200 OK JSON response for settings, wallets, sacco, etc.
      res.writeHead(200);
      res.end(
        JSON.stringify({
          status: 'ok',
          service: serviceName,
          balance: 4820,
          currency: 'KES',
          data: [],
          items: []
        })
      );
    });
  });
}

studioServer.listen(PORT_STUDIO, '127.0.0.1', () => {
  console.log(`================================================================`);
  console.log(`📱 CABI AFRICA: DUAL MOBILE EMULATOR STUDIO LIVE ON PORT ${PORT_STUDIO}`);
  console.log(`👉 Studio URL:        http://localhost:${PORT_STUDIO}/dual_emulator.html`);
  console.log(`================================================================`);
});

if (fs.existsSync(DRIVER_WEB_DIR)) {
  const driverServer = http.createServer(serveStaticDirectory(DRIVER_WEB_DIR, true));
  driverServer.on('error', () => {});
  driverServer.listen(PORT_DRIVER_FLUTTER, '127.0.0.1', () => {
    console.log(`🚕 Driver Flutter Web App Live:    http://localhost:${PORT_DRIVER_FLUTTER}`);
  });
}

if (fs.existsSync(PASSENGER_WEB_DIR)) {
  const passengerServer = http.createServer(serveStaticDirectory(PASSENGER_WEB_DIR, true));
  passengerServer.on('error', () => {});
  passengerServer.listen(PORT_PASSENGER_FLUTTER, '127.0.0.1', () => {
    console.log(`🧍 Passenger Flutter Web App Live: http://localhost:${PORT_PASSENGER_FLUTTER}`);
  });
}

const authMockServer = createMockApiServer('auth-gateway');
authMockServer.on('error', () => {});
authMockServer.listen(PORT_AUTH_API, '127.0.0.1', () => {
  console.log(`🔑 Auth Gateway Bridge Live:       http://localhost:${PORT_AUTH_API}`);
});

const dispatchMockServer = createMockApiServer('dispatch-service');
dispatchMockServer.on('error', () => {});
dispatchMockServer.listen(PORT_DISPATCH_API, '127.0.0.1', () => {
  console.log(`📡 Dispatch Service Bridge Live:   http://localhost:${PORT_DISPATCH_API}`);
});
