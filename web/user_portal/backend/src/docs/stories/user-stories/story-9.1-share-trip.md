# Story 9.1: Share Trip Details

**Epic:** Driver Safety Features
**Status:** Done
**Priority:** High

## Description
As a driver, I want to easily share my current trip details and live location with my trusted contacts, so that someone knows where I am during a ride.

## Acceptance Criteria
1.  **UI Implementation**: A "Share Trip" button must be accessible from the active trip screen (or Safety Toolkit).
2.  **Content**: The shared message must include:
    - Driver Name & Vehicle.
    - Current Location (Google Maps Link).
    - Passenger Name (First name only for privacy).
    - Estimated Time of Arrival.
3.  **Mechanism**: Clicking the button should trigger the native system share dialog (WhatsApp, SMS, etc.).
4.  **Quick Share**: If "Emergency Contacts" are configured (Story 5.1), allow one-tap sharing to them.

## Technical Notes
- **Frontend**: Flutter `driver-app`.
- **Dependencies**: `share_plus` package.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/driver-app/lib/services/share_trip_service.dart`