# Story 1.8: Trip Completion and Payment

*   **ID**: `STORY-1.8`
*   **Epic**: Core Ride-Hailing Experience
*   **Title**: Driver/Passenger: Complete Trip and Process Payment
*   **Points**: 13 (High complexity: involves two user-facing apps, multiple backend services, and external payment integration)
*   **Status**: `Done`

---

### User Story

As a **driver**, I want to **end the trip upon reaching the destination**, and as a **passenger**, I want to **pay the final fare**, so that the ride is officially concluded and everyone is compensated correctly.

---

### Acceptance Criteria

1.  **Driver Action (Trip Completion)**: The driver, upon reaching the destination, must be able to tap a "Complete Trip" button in the `driver-app`.
2.  **Backend Update**: This action calls `POST /rides/{id}/complete` on the `Ride Service`. The service updates the `Trip` status to `COMPLETED` and calculates the final fare.
3.  **Passenger Payment Prompt**: The `passenger-app` must receive a real-time update displaying the final fare and presenting payment options: "Pay with M-Pesa" and "Pay with Cash".
4.  **Cash Payment Flow**:
    *   If the passenger selects "Pay with Cash", they pay the driver directly.
    *   The driver must then tap a "Confirm Cash Received" button in their app. This action notifies the backend to finalize the trip.
5.  **M-Pesa Payment Flow**:
    *   If the passenger selects "Pay with M-Pesa", the app calls the `Payment Service` to initiate an M-Pesa STK push.
    *   The `passenger-app` UI must enter a waiting state until payment is confirmed.
6.  **Payment Confirmation & Event**: Upon successful payment (either via M-Pesa webhook or driver's cash confirmation), the `Payment Service` updates the `Trip`'s `paymentStatus` to `PAID` and publishes a `TripPaid` event to the Event Bus.
7.  **Commission & Savings Logic**: The `Payment Service` and `User & MLM Service`, consuming the `TripPaid` event, must trigger the commission splitting, badge qualification checks, and SACCO savings logic as defined in the PRD (Stories 2.4, 2.5, 2.6).
8.  **Post-Payment UI**: Both the driver and passenger apps must transition to a "Trip Ended" screen, which then leads to the rating screen (covered in Story 3.1).

---

### Technical Notes

*   **Frontend**: This story involves UI changes in both the Flutter `driver-app` and `passenger-app`.
*   **Backend Services**:
    *   **Ride Service**: Handles the `complete` endpoint and initial status change.
    *   **Payment Service**: Manages the M-Pesa STK push, handles payment confirmation webhooks, and orchestrates the post-payment event publication.
    *   **User & MLM Service**: Consumes the `TripPaid` event to process commissions and badge logic.
*   **API Endpoints**:
    *   `POST /rides/{id}/complete`
    *   An endpoint for the driver to confirm cash payment.
    *   An endpoint for the passenger to initiate M-Pesa payment.
*   **Asynchronous Flow**: The payment confirmation and subsequent commission calculations are highly asynchronous and event-driven.
*   **Data Model**: The `Trip` model's `status` and `paymentStatus` fields will be updated. New `Transaction` records will be created for the fare, commissions, and savings.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Driver App Services**: Implemented `RideService` to handle trip completion and cash confirmation.
*   [x] **Task 2: Driver App UI**: Created `TripCompletionScreen` with logic to show fare and wait for payment.
*   [x] **Task 3: Passenger App Services**: Implemented `PaymentService` to handle M-Pesa initiation.
*   [x] **Task 4: Passenger App UI**: Created `PaymentScreen` to display fare and payment options.

#### **File List**

*   `apps/driver-app/lib/services/ride_service.dart` (new)
*   `apps/driver-app/lib/screens/trip/trip_completion_screen.dart` (new)
*   `apps/passenger-app/lib/services/payment_service.dart` (new)
*   `apps/passenger-app/lib/screens/trip/payment_screen.dart` (new)