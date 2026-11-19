# Phase 2: Mobile Apps Real-Time SOS Integration Task Plan

**Status:** Completed ✅  
**Owner:** @mobile-developer & @security-auditor  
**Date:** 2026-11-19  
**Scope:** Mobile Apps Integration (`mobile/passenger_app`, `mobile/driver_app`) with Dispatch Safety Backend, Real GPS Distress Beacons, Emergency Contact Database Synchronization, and Proximity Mesh Responder HUD  

---

## 1. Objectives & Scope

Connected the passenger and driver mobile applications to the consolidated backend safety command center ([backend/dispatch-service/src/safety/](file:///Users/user/Downloads/Cabi%20Africa%20Final/backend/dispatch-service/src/safety/)):

1. **Passenger Real Emergency Dispatch**:
   - Updated [mobile/passenger_app/lib/services/sos_service.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/services/sos_service.dart) to call `POST ${AppConfig.dispatchApiUrl}/safety/sos` with authenticated `Bearer` token.
   - Connected `SafetyService.triggerRealSOS()` to real GPS acquisition and backend beacon dispatch.
   - Connected [mobile/passenger_app/lib/widgets/sos_button.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/widgets/sos_button.dart) and [safety_center_screen.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/screens/safety_center_screen.dart) to display real incident reference number (`OB-SOS-...`) and tracking link.
2. **Passenger Emergency Contacts Cloud Sync**:
   - Upgraded [mobile/passenger_app/lib/services/emergency_contact_service.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/services/emergency_contact_service.dart) to sync contacts with the backend (`GET` & `POST /safety/emergency-contacts`), with local cache in `SharedPreferences`.
   - Wired "SHARE LIVE TRIP WITH CONTACTS" to trigger actual Africa's Talking cellular SMS dispatch to trusted contacts.
3. **Driver Distress Broadcast & Sacco Protection**:
   - Updated [mobile/driver_app/lib/services/sos_service.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/driver_app/lib/services/sos_service.dart) to dispatch live GPS distress signals to `/safety/sos` with auth tokens.
   - Updated [mobile/driver_app/lib/widgets/sos_button.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/driver_app/lib/widgets/sos_button.dart) so "BROADCAST DISTRESS ALERT" triggers real SOS beacon, displaying active distress overlay with Sacco fee breakdown and formal pardon request flow.
4. **Good Samaritan Responder Flow**:
   - Wired [mobile/driver_app/lib/screens/sos_alert_screen.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/driver_app/lib/screens/sos_alert_screen.dart) with real navigation coordinates and Good Samaritan response button (`POST /safety/alerts/:id/respond`), rewarding 500 points.

---

## 2. Implementation Roadmap

- [x] **Step 1: Passenger SOS Service & Real GPS Dispatch** ([sos_service.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/services/sos_service.dart))
- [x] **Step 2: Passenger Emergency Contacts Cloud Sync** ([emergency_contact_service.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/services/emergency_contact_service.dart))
- [x] **Step 3: Passenger Safety Service & SOS Button Wiring** ([sos_button.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/widgets/sos_button.dart), [safety_center_screen.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/passenger_app/lib/screens/safety_center_screen.dart))
- [x] **Step 4: Driver SOS Service & Distress Beacon** ([sos_service.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/driver_app/lib/services/sos_service.dart))
- [x] **Step 5: Driver SOS Button Distress Overlay & Pardon Flow** ([sos_button.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/driver_app/lib/widgets/sos_button.dart))
- [x] **Step 6: Driver Good Samaritan Responder Screen & Points Wiring** ([sos_alert_screen.dart](file:///Users/user/Downloads/Cabi%20Africa%20Final/mobile/driver_app/lib/screens/sos_alert_screen.dart))
- [x] **Step 7: Verification & Syntax Checks**
