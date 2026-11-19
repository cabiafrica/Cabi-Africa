# Phase 1: USSD & SMS Offline Ride Booking Gateway

**Status:** Completed ✅  
**Owner:** @backend-specialist & @security-auditor  
**Date:** 2026-11-19  
**Scope:** Africa's Talking USSD Multi-Stage Menu (`*384*222#`), 5-Minute Session Resume, Inbound SMS Parser (`"CABIGO <pickup> to <dropoff>"`), Auto-Provisioning Offline Riders, Auto-Dispatch to Matching Queue, Cellular SMS Ride Notifications, M-PESA STK Push / Cash Settlement Fallback  

---

## 1. Objectives & Scope

1. **Africa's Talking USSD State Machine (`backend/dispatch-service/src/ussd/ussd.service.ts`)**:
   - Implements telco USSD standard (`CON` continue / `END` terminate).
   - Multi-stage menus:
     - 1. Book Cab (Standard) / 2. Book Boda Boda
     - Pickup Landmark Selection (CBD, Westlands, JKIA, Kilimani, Upper Hill, Eastleigh, Ngong Rd, or custom)
     - Destination Selection
     - Fare Preview & Distance calculation
     - Instant Confirmation & Dispatch
     - 3. Check Active Trip Status (Driver Name, Plate, Boarding PIN)
     - 4. Cancel Active Trip
     - 5. Cabi Safety & Support hotline info
   - 5-Minute Session Resume: If telco 20-30 second inactivity timeout occurs, redialing `*384*222#` prompts user to resume draft booking without restarting.
2. **Inbound SMS Dispatch Parser (`backend/dispatch-service/src/ussd/sms-booking.service.ts`)**:
   - Parses keyword strings like `"CABIGO CBD to Westlands"`, `"CABIGO BODA Kilimani to Upper Hill"`, `"CABI STATUS"`, `"CABI CANCEL"`, `"CABI HELP"`.
   - Creates ride and returns instant cellular SMS confirmation with Trip Code, PIN, and estimated fare.
3. **Dispatch Integration (`backend/dispatch-service/src/ride/ride.service.ts`)**:
   - Auto-provisions offline passenger account by phone number if not registered.
   - Directly triggers `rideService.createRide(...)` and matching engine.
   - Dispatches cellular SMS notifications (`SafetySmsService`) upon driver match, arrival, and completion.
4. **M-PESA STK Push & Cash Settlement (`backend/dispatch-service/src/ussd/ussd.controller.ts`)**:
   - Triggers M-PESA STK push prompt for fare settlement upon drop-off, with Cash fallback.
   - Endpoints: `POST /api/ussd`, `POST /api/ussd/sms-inbound`, `POST /api/ussd/mpesa-prompt`, `GET /api/ussd/landmarks`.

---

## 2. Implementation Roadmap

- [x] **Step 1: Implement Landmarks & Fare Matrix Utility** (`backend/dispatch-service/src/ussd/landmarks.util.ts`)
- [x] **Step 2: Implement USSD State Machine Service** (`backend/dispatch-service/src/ussd/ussd.service.ts`)
- [x] **Step 3: Implement Inbound SMS Booking Service** (`backend/dispatch-service/src/ussd/sms-booking.service.ts`)
- [x] **Step 4: Implement USSD & SMS Webhook Controller** (`backend/dispatch-service/src/ussd/ussd.controller.ts`)
- [x] **Step 5: Register UssdModule in Dispatch Service** (`backend/dispatch-service/src/ussd/ussd.module.ts` & `app.module.ts`)
- [x] **Step 6: Automated Verification & Security Scan**
  - Bun TS Transpilation: Verified 0 errors across all USSD/SMS files.
  - Vulnerability Scanner: Verified 0 critical / high findings in USSD subsystem.
