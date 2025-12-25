# Story 4.1: Admin Driver Approval

*   **ID**: `STORY-4.1`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Review and approve/reject driver applications
*   **Points**: 8 (Involves a detailed UI, backend state changes, and notifications)
*   **Status**: `Done`

---

### User Story

As an **admin**, I want to **review and approve or reject new driver applications**, so that **I can maintain a quality driver fleet**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a dashboard/page that lists all users with the status `PENDING_APPROVAL`.
2.  **Detailed View**: Clicking on a driver from the list must open a detailed view showing all their submitted information (from `DriverProfile`) and links to their uploaded documents (from S3).
3.  **Review Interface**: The admin must be able to mark each individual document/detail as "Approved" or "Rejected". If an item is rejected, a text field must appear for the admin to provide a reason.
4.  **Approval Action**: If the admin approves all items and submits the review, the app must call the `POST /admin/drivers/{id}/approve` endpoint.
5.  **Approval Backend Logic**: The `Admin Service` must:
    *   Update the driver's `status` to `ACTIVE`.
    *   Publish a `DriverApproved` event to the Event Bus.
6.  **Correction Action**: If the admin rejects one or more items and submits the review, the app must call a `POST /admin/drivers/{id}/request-correction` endpoint with the rejection reasons.
7.  **Correction Backend Logic**: The `Admin Service` must:
    *   Update the driver's `status` to `REQUIRES_CORRECTION`.
    *   Store the rejection reasons in the `DriverProfile` model.
    *   Publish a `DriverRequiresCorrection` event with the reasons.
8.  **Notification**: The `Notification Service`, upon consuming the `DriverApproved` or `DriverRequiresCorrection` events, must send an appropriate notification to the driver.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for the approval/rejection logic.
*   **API Endpoints**:
    *   `GET /admin/drivers?status=PENDING_APPROVAL`
    *   `GET /admin/drivers/{id}`
    *   `POST /admin/drivers/{id}/approve`
    *   `POST /admin/drivers/{id}/request-correction` (or a similar endpoint for rejection with reasons)
*   **Data Model**:
    *   The `status` field on the `User` model will be updated.
    *   The `documents` array in the `DriverProfile` model will be updated with rejection reasons.
*   **Asynchronous Notification**: The notification to the driver is handled asynchronously via the Event Bus.
*   **Reference Document**: This story directly implements the logic described in `Story 4.1` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Dashboard**: Created `DriverApprovalDashboard.tsx` to list pending drivers.
*   [x] **Task 2: Implement Detail View**: Added view for driver details and documents.
*   [x] **Task 3: Implement Actions**: Added Approve and Request Correction logic with reason input.

#### **File List**

*   `apps/admin-panel/src/components/DriverApprovalDashboard.tsx` (new)