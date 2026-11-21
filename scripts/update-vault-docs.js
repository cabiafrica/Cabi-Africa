const fs = require('fs');
const path = require('path');

const vaultDir = 'D:\\IBN\\iBN-Cabi Vault\\01-System Architecture & Engineering';

if (!fs.existsSync(vaultDir)) {
  console.error('Vault directory does not exist:', vaultDir);
  process.exit(1);
}

// 1. Update Database — Prisma Models & Ledger Schema.md
const dbPath = path.join(vaultDir, 'Database — Prisma Models & Ledger Schema.md');
if (fs.existsSync(dbPath)) {
  let dbContent = fs.readFileSync(dbPath, 'utf8');
  
  // Update DriverProfile description
  if (!dbContent.includes('preferredDestination')) {
    dbContent = dbContent.replace(
      '* **`DriverProfile`:**\n  * `licenseNumber`, `isOnline`, `currentLocation` (GeoJSON), `isBiometricVerified`.',
      '* **`DriverProfile`:**\n  * `licenseNumber`, `isOnline`, `currentLocation` (GeoJSON), `isBiometricVerified`.\n  * **Routing Preferences:** `preferredDestination` (Json - Destination Mode / Heading Home), `excludedZones` (Json - array of geofenced avoidance zones).'
    );
  }

  // Update Ride description
  if (!dbContent.includes('passedDriverIds')) {
    dbContent = dbContent.replace(
      '* **`Ride` (`rides` table):**\n  * Pickup and dropoff latitude/longitude coordinates and address text.\n  * Status: `REQUESTED`, `SEARCHING`, `ACCEPTED`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.',
      '* **`Ride` (`rides` table):**\n  * Pickup and dropoff latitude/longitude coordinates and address text.\n  * Status: `REQUESTED`, `SEARCHING`, `MATCHING`, `DRIVER_ASSIGNED`, `ACCEPTED`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.\n  * **Escalation & Matching:** `passedDriverIds` (String[] - drivers who declined or timed out), `assignmentExpiresAt` (DateTime - 20s countdown timer for acceptance).'
    );
  }

  fs.writeFileSync(dbPath, dbContent, 'utf8');
  console.log('Updated Database — Prisma Models & Ledger Schema.md');
}

// 2. Update Backend — Microservices Catalog.md
const backendPath = path.join(vaultDir, 'Backend — Microservices Catalog.md');
if (fs.existsSync(backendPath)) {
  let beContent = fs.readFileSync(backendPath, 'utf8');

  const dispatchUpdate = `## 3. ⚡ Dispatch Service (\`dispatch-service\`)

* **Source Directory:** \`backend/dispatch-service/src\`
* **Port:** \`3334\` (Development & Production Cluster)
* **Domain Focus:** High-concurrency geospatial dispatching, intelligent driver matching, and real-time trip lifecycle management.
* **Core Capabilities:**
  * **20-Second Auto-Escalation Worker:**
    * Background scheduler (\`checkExpiringAssignments()\`) running every 3 seconds to monitor active driver assignments.
    * When \`assignmentExpiresAt\` elapses without acceptance, the assigned driver is added to \`passedDriverIds\`, the ride status resets to \`MATCHING\`, and the request auto-escalates to the next nearby available driver.
  * **Driver Pass & Decline Engine:**
    * \`POST /rides/:id/pass\`: Drivers can explicitly pass offers with reason tracking (e.g. unverified passenger, heading home, out of zone), immediately triggering rematching without penalty.
  * **Intelligent Routing & Zone Filters:**
    * \`POST /rides/driver-preferences\`: Updates driver's \`preferredDestination\` (Heading Home) and \`excludedZones\` (geofenced avoid-areas).
    * Candidate matching engine filters out drivers whose excluded zones encompass the trip drop-off point, and awards high routing affinity scores to drivers heading toward the passenger's destination.
  * **Demand Intelligence & Heatmap Hotspots:**
    * \`GET /rides/demand-hotspots\`: Real-time aggregated demand intelligence across Nairobi clusters (Westlands, CBD, Kilimani, Upper Hill, JKIA, Gigiri) returning active request volume, surge multipliers (up to 1.8x), and optimal staging zones.
  * **Resilient Driver Identification:**
    * Dual-lookup resolver (\`OR: [{ id: driverId }, { userId: driverId }]\`) eliminating authentication mismatch errors across Flutter mobile clients and Next.js web portals.
  * **Redis Spatial Indexes:** Driver locations stored in geospatial sets.
  * **Socket.io Gateways:** Real-time event channels:
    * \`/trip-tracking\`: Broadcasts driver movement to passenger app.
    * \`/driver-offers\`: Delivers dispatch bids to nearby drivers.
  * **State Machine:** Governs ride transitions:
    * \`REQUESTED\` → \`MATCHING\` / \`SEARCHING\` → \`DRIVER_ASSIGNED\` → \`ACCEPTED\` → \`ARRIVED\` → \`IN_PROGRESS\` → \`COMPLETED\` / \`CANCELLED\`.`;

  if (beContent.includes('## 3. âš¡ Dispatch Service (`dispatch-service`)') || beContent.includes('## 3. ⚡ Dispatch Service (`dispatch-service`)')) {
    beContent = beContent.replace(/## 3\..*?Dispatch Service \(`dispatch-service`\)[\s\S]*?(?=## 4\.)/, dispatchUpdate + '\n\n');
  }

  fs.writeFileSync(backendPath, beContent, 'utf8');
  console.log('Updated Backend — Microservices Catalog.md');
}

// 3. Update Mobile Applications — CABI Go & CABI Drive.md
const mobilePath = path.join(vaultDir, 'Mobile Applications — CABI Go & CABI Drive.md');
if (fs.existsSync(mobilePath)) {
  let mobContent = fs.readFileSync(mobilePath, 'utf8');

  const mobileContentUpdate = `## 1. 🚖 CABI Go (Passenger App)

* **Path:** \`mobile/passenger_app\`
* **Key Features:**
  1. **Interactive Ride Booking & Dynamic Radar Search:**
     * Google Places / Mapbox auto-complete for pickup and destination.
     * Fare breakdown showing base fare, distance, estimated time, and vehicle category (Boda, Standard, Comfort, XL).
     * **Pulsing Concentric Radar Animation:** Renders rhythmic expanding radar ripples while matching nearby drivers, conveying active dispatch telemetry.
     * **Immediate Search Cancellation:** Riders can abort searches instantly, resetting map state back to home screen without orphan requests.
  2. **Full-Screen Interactive Map Mode:**
     * Map expand/collapse button toggling an unobstructed full-screen viewport.
     * Collapses bottom sheets into a floating compact mini-bar showing current ride phase and a quick 'Restore' action.
  3. **Driver Live Tracking:**
     * Smooth vehicle rotation and coordinate interpolation over WebSockets.
     * Real-time ETA updates.
  4. **Passenger KYC Verification Badge:**
     * Displays \`BASIC\`, \`VERIFIED\`, or \`CORPORATE\` status, building mutual trust with drivers and preventing passenger anonymity.
  5. **Safety & Emergency Toolkit:**
     * One-tap SOS calling Police and dispatch center.
     * Share live trip link with trusted contacts via WhatsApp / SMS.

---

## 2. 👨‍✈️ CABI Drive (Driver OS)

* **Path:** \`mobile/driver_app\`
* **Key Features:**
  1. **20-Second Timed Dispatch Offer Modal & Escalation:**
     * 20-second circular countdown timer with dynamic urgency color transitions (Emerald >10s, Amber ≤10s, Red ≤5s).
     * Shows pickup distance, destination neighborhood, estimated fare, and passenger KYC verification badge.
     * **Auto-Escalation on Expiry:** If the timer reaches 0s without acceptance, the request is automatically passed and routed to the next available driver.
  2. **Driver Pass & Rejection Controls:**
     * Prominent "Pass" button with reason selection modal (Unverified Passenger, Heading Home, Outside Zone, Other) allowing drivers to skip undesirable trips without dispatch lockouts.
  3. **Route Preferences & Destination Mode ("Heading Home"):**
     * Drivers can set a preferred home destination (e.g. Westlands, Kilimani, South B, Rongai) to receive trips prioritized toward their route.
     * **Excluded Avoidance Zones:** Drivers can designate neighborhoods or zones to avoid; dispatch engine skips the driver if the trip drops off in an excluded zone.
  4. **Demand Heatmap Hotspots Overlay (🔥):**
     * Dedicated map layer toggle displaying high-demand clusters across Nairobi.
     * Visual markers with surge indicators, active ride request volumes, and optimal staging guidance.
  5. **Full-Screen Map Mode:**
     * Quick-toggle full-screen navigation mode that collapses status panels into a slim floating overlay.
  6. **Earnings & Commission Transparency:**
     * Immediate trip completion breakdown: Total Fare, 18% Platform Cut, Driver Payout (82%).
  7. **SACCO & Savings Controls:**
     * Toggle voluntary SACCO savings contribution per trip.
     * View accumulated welfare fund balance and credit eligibility.
  8. **Background Location Service:**
     * Battery-optimized background location tracking to maintain dispatch readiness when phone is locked.`;

  if (mobContent.includes('## 1. ðŸš– CABI Go (Passenger App)') || mobContent.includes('## 1. 🚖 CABI Go (Passenger App)')) {
    mobContent = mobContent.replace(/## 1\..*?CABI Go \(Passenger App\)[\s\S]*?(?=## ðŸ› ï¸  Build & Release Automation|## 🛠️ Build & Release Automation)/, mobileContentUpdate + '\n\n');
  }

  fs.writeFileSync(mobilePath, mobContent, 'utf8');
  console.log('Updated Mobile Applications — CABI Go & CABI Drive.md');
}

// 4. Update Web Applications — Admin, Dispatch & User Portals.md
const webPath = path.join(vaultDir, 'Web Applications — Admin, Dispatch & User Portals.md');
if (fs.existsSync(webPath)) {
  let webContent = fs.readFileSync(webPath, 'utf8');

  if (!webContent.includes('demand-analysis')) {
    webContent = webContent.replace(
      '* **Key Routes & Pages:**\n  * `/`: High-converting marketing landing page showcasing passenger safety, driver welfare, and transparent fares.',
      '* **Key Routes & Pages:**\n  * `/`: High-converting marketing landing page showcasing passenger safety, driver welfare, and transparent fares.\n  * `/drivers/demand-analysis`: **Driver Demand Intelligence & Analytics** — Interactive telemetry dashboard displaying high-demand hotspot clusters (surge multipliers, active trip counts), 24-hour volume curves (morning/evening rush hour staging), and day-of-week comparative profitability metrics.'
    );
    fs.writeFileSync(webPath, webContent, 'utf8');
    console.log('Updated Web Applications — Admin, Dispatch & User Portals.md');
  }
}

// 5. Update MOC — Engineering & Codebase Hub.md
const mocPath = path.join(vaultDir, 'MOC — Engineering & Codebase Hub.md');
if (fs.existsSync(mocPath)) {
  let mocContent = fs.readFileSync(mocPath, 'utf8');
  if (!mocContent.includes('20-Second Acceptance Timer')) {
    const changelogEntry = `\n### 🚀 Recent Architectural Enhancements (September 2026)
- **20-Second Driver Acceptance & Auto-Escalation**: Configured 20s dispatch acceptance timer on CABI Drive with 3-second background worker auto-reassigning unaccepted trips to next nearest drivers.
- **Driver Pass & Ride Rematching**: Explicit pass action with rationale tracking, immediate rematching without passenger drop-off.
- **Driver Destination Mode & Excluded Zones**: Heading Home destination matching affinity and geofenced avoidance zones persisted in PostgreSQL.
- **Nairobi Demand Intelligence Engine**: Backend hotspot aggregation API and interactive analytics dashboard in Driver Portal (\`/drivers/demand-analysis\`).
- **Dynamic Concentric Radar Animation & Cancel**: Passenger app search radar ripples and clean cancellation state reset.
- **Full-Screen Interactive Map Mode**: Full-screen toggle across both CABI Go and CABI Drive with collapsible floating mini-bars.
`;
    mocContent += changelogEntry;
    fs.writeFileSync(mocPath, mocContent, 'utf8');
    console.log('Updated MOC — Engineering & Codebase Hub.md');
  }
}

console.log('All Obsidian Vault documentation updated successfully!');
