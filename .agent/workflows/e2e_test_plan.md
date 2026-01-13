---
description: End-to-End Test Plan for Cabi Alpha Ride Cycle
---

# E2E Ride Cycle Test Plan

## Pre-requisites
1.  **Backend Services Running**: `dispatch-service`, `driver-lead-service` (and mock `user-service` if applicable).
    -   Ensure `redis` and `postgres` are up.
2.  **Frontend Apps Running**:
    -   Admin Panel: `http://localhost:3001`
    -   Dispatch Panel: `http://localhost:3002`
    -   Driver App: Emulator or Device.
    -   Passenger App: Emulator or Device.

## Test Scenario 1: Basic Ride Flow

### 1. Passenger Request
-   **Action**: Passenger logs in and requests a ride from A to B.
-   **Expected Result**:
    -   App shows "Searching for drivers...".
    -   Backend creates a `Ride` with status `REQUESTED`.
    -   Dispatch Panel shows the new ride in "Pending" list.

### 2. Driver Acceptance
-   **Action**: Driver goes "Online" in Driver App.
-   **Expected Result**:
    -   Driver App receives the ride request via WebSocket/Polling.
    -   Ride Request Modal appears.
-   **Action**: Driver taps "Accept".
-   **Expected Result**:
    -   Ride status updates to `ASSIGNED`.
    -   Passenger App updates to "Driver found: [Name]".
    -   Dispatch Panel updates status to assigned.

### 3. Ride Movement (Tracking)
-   **Action**: Driver moves (Simulated in emulator or via `LocationService` mock stream).
-   **Expected Result**:
    -   Driver App emits socket events `updateDriverLocation`.
    -   Dispatch Panel map shows driver icon moving.
    -   Passenger App map shows car moving.

### 4. Pickup
-   **Action**: Driver taps "Arrived at Pickup".
-   **Expected Result**:
    -   Ride status: `ARRIVED_AT_PICKUP`.
    -   Passenger notified.
-   **Action**: Driver taps "Start Trip".
-   **Expected Result**:
    -   Ride status: `IN_PROGRESS`.

### 5. Completion & Payment
-   **Action**: Driver taps "Complete Trip".
-   **Expected Result**:
    -   Fare calculated.
    -   App shows Payment Modal.
-   **Action**: Driver selects "Cash" and inputs amount.
-   **Expected Result**:
    -   Ride status: `COMPLETED`.
    -   Driver prompted to Rate Passenger.

## Test Scenario 2: Admin Verification

### 1. Driver Registration
-   **Action**: New user registers as Driver via App/Portal.
-   **Expected Result**:
    -   User created with status `PENDING`.
    -   Admin Panel -> "Driver Applications" shows new applicant.

### 2. Approval
-   **Action**: Admin clicks "Approve" on the application.
-   **Expected Result**:
    -   Frontend calls `POST /approve`.
    -   Backend updates user to `VERIFIED`.
    -   Driver can now Go Online.

## Verification Checklist
-   [ ] Passenger App request works.
-   [ ] Driver App receives request.
-   [ ] Socket connection established for tracking.
-   [ ] Admin Panel successfully calls backend API.
