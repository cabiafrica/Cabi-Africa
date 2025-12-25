# Story 10.3: Targeted Push Notifications

**Epic:** Marketing Campaigns
**Status:** Done
**Priority:** Medium

## Description
As a marketing manager, I want to send push notifications to specific user segments (e.g., "All Passengers", "Inactive Drivers"), so that I can re-engage them.

## Acceptance Criteria
1.  **UI Implementation**: A "Marketing Blasts" page in the `admin-panel`.
2.  **Compose**: Fields for Title and Body.
3.  **Targeting**: Dropdown to select segment: "All Users", "Passengers Only", "Drivers Only", "Inactive (30 days)".
4.  **Send**: Button to trigger the broadcast.

## Technical Notes
- **Frontend**: React component `PushNotificationManager`.
- **Backend**: Integration with Firebase Cloud Messaging (FCM).

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/admin-panel/src/components/PushNotificationManager.tsx`