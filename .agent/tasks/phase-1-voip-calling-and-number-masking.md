# Phase 1: VoIP In-App Calling & Phone Number Masking Engine

**Status:** Completed ✅  
**Owner:** @mobile-developer, @backend-specialist & @security-auditor  
**Date:** 2026-11-19  
**Scope:** WebRTC Signaling Protocol over Socket.io `/chat`, In-App Audio Call State Machine, 10s CGNAT Timeout & Cellular Proxy Fallback, Africa's Talking Masked Voice Bridge Backend, Mobile Apps VoIP Call Modal & Audio Session  

---

## 1. Objectives & Scope

1. **WebRTC Signaling Protocol (`backend/dispatch-service/src/chat/chat.gateway.ts`)**:
   - Enhanced `@SubscribeMessage('callSignal')` to validate and relay peer-to-peer WebRTC signaling events (`CALL_START`, `CALL_ACCEPT`, `CALL_DECLINE`, `CALL_END`, `CALL_TIMEOUT`, `CALL_OFFER`, `CALL_ANSWER`, `ICE_CANDIDATE`).
   - Sockets must be verified room members of `trip_${tripId}`.
2. **Backend Masked Voice Proxy (`backend/dispatch-service/src/voice/*`)**:
   - `VoiceService` (`voice.service.ts`): Africa's Talking Voice integration (`https://voice.africastalking.com/call`) for bridging calls anonymously through virtual proxy numbers (`+254 711 082 000`).
   - `VoiceController` (`voice.controller.ts`): Endpoints for initiating masked call bridges (`POST /api/voice/bridge`), fetching the virtual proxy number (`GET /api/voice/proxy-number/:tripId`), logging client audit events (`POST /api/voice/log-audit`), and handling inbound IVR webhook callbacks (`POST /api/voice/callback`) returning Voice Action XML.
   - Call audit metadata persistence: logs call sessions, durations, and fallback events for safety dispute audits.
3. **Mobile Client Audio & Signaling State Machine**:
   - `mobile/passenger_app/lib/services/trip_communication_service.dart`: Added 10s CGNAT timeout detector, `VoipCallState.timeout`, `switchToMaskedCellularCall()` method connecting to backend bridge and launching masked dialer.
   - `mobile/driver_app/lib/services/trip_communication_service.dart`: Mirrored signaling state machine, timeout detector, and cellular dialer fallback on driver app.
4. **Mobile UX Upgrade (`in_app_call_modal.dart`)**:
   - Updated both passenger and driver modals with real-time connection status (`CALLING...`, `INCOMING CALL...`, `CONNECTED 00:45`, `DATA CONNECTION UNREACHABLE`).
   - When the 10-second timeout occurs, provides instant one-tap **"SWITCH TO MASKED CELLULAR CALL"** fallback.
   - Added secondary direct cellular option during outgoing ringing for riders/drivers with spotty 3G/EDGE coverage.
   - Wired Mute/Speaker action circles.

---

## 2. Implementation Roadmap

- [x] **Step 1: Implement VoiceService & Masked Proxy Module** (`backend/dispatch-service/src/voice/voice.service.ts`)
- [x] **Step 2: Implement VoiceController (Voice Bridge & Africa's Talking Callback Webhook)** (`backend/dispatch-service/src/voice/voice.controller.ts`)
- [x] **Step 3: Enhance ChatGateway Signaling Relays** (`backend/dispatch-service/src/chat/chat.gateway.ts`)
- [x] **Step 4: Register VoiceModule in Dispatch Service** (`backend/dispatch-service/src/voice/voice.module.ts` & `app.module.ts`)
- [x] **Step 5: Implement WebRTC Signaling & 10s Timeout in Mobile Services**
  - Updated `mobile/passenger_app/lib/services/trip_communication_service.dart`
  - Updated `mobile/driver_app/lib/services/trip_communication_service.dart`
  - Configured `maskedProxyNumber` and `voiceApiUrl` in both `app_config.dart`
- [x] **Step 6: Upgrade InAppCallModal UI with Masked Cellular Fallback**
  - Updated `mobile/passenger_app/lib/widgets/in_app_call_modal.dart`
  - Updated `mobile/driver_app/lib/widgets/in_app_call_modal.dart`
- [x] **Step 7: Automated Verification & Security Scan**
  - Bun TS Transpilation: Verified 0 errors across all voice and chat backend files.
  - Vulnerability Scanner: Verified 0 critical / high findings in voice subsystem.
