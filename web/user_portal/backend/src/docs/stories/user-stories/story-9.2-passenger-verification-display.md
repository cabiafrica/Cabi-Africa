# Story 9.2: Passenger Verification Display

**Epic:** Driver Safety Features
**Status:** Done
**Priority:** Medium

## Description
As a driver, I want to see if a passenger has verified their identity before I accept a ride, so that I can make informed safety decisions.

## Acceptance Criteria
1.  **UI Implementation**: The incoming ride request modal must display a "Verified" badge next to the passenger's name if applicable.
2.  **Logic**: The app must check the `isVerified` flag in the ride request payload.
3.  **Visuals**:
    - Verified: Green checkmark icon with text "ID Verified".
    - Unverified: Grey icon or no badge.

## Technical Notes
- **Frontend**: Flutter `driver-app`.
- **Backend**: Ensure `RideRequest` event includes passenger verification status.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/driver-app/lib/widgets/passenger_verification_badge.dart`