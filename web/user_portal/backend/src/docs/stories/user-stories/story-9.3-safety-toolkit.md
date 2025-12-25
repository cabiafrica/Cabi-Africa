# Story 9.3: Safety Toolkit UI

**Epic:** Driver Safety Features
**Status:** Done
**Priority:** High

## Description
As a driver, I want a centralized "Safety Shield" icon on my map screen that gives me quick access to all safety tools.

## Acceptance Criteria
1.  **UI Implementation**: A floating action button (FAB) or map overlay button with a "Shield" icon.
2.  **Menu**: Tapping the icon opens a bottom sheet with options:
    - Emergency Call (SOS) - triggers Story 1.10 flow.
    - Share Trip Details - triggers Story 9.1 flow.
    - Safety Center (Tips & Guides).
3.  **Accessibility**: Must be visible during both "Online" and "In-Trip" states.

## Technical Notes
- **Frontend**: Flutter `driver-app`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/driver-app/lib/widgets/safety_toolkit_button.dart`