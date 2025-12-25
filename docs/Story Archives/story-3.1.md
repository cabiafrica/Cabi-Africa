# Story 3.1: Post-Ride Rating and Commenting

*   **ID**: `STORY-3.1`
*   **Epic**: Fair Rating & Feedback System
*   **Title**: User: Rate and comment on counterpart post-ride
*   **Points**: 5 (Involves new UI, state management, and API integration in both apps)
*   **Status**: `In Progress`

---

### User Story

As a **user (passenger or driver)**, I want to **rate my counterpart and leave an optional comment after a trip is completed**, so that **I can provide feedback and contribute to the community's quality and safety**.

---

### Acceptance Criteria

1.  **Trigger (Passenger)**: After the passenger successfully pays for the ride (either via cash confirmation or digital payment), they must be immediately presented with a rating screen.
2.  **Trigger (Driver)**: After the driver marks the trip as "Completed" in their app, they must be immediately presented with a rating screen.
3.  **UI Implementation**:
    *   Both the `passenger-app` and `driver-app` must have a dedicated rating screen.
    *   The screen must display the counterpart's name (e.g., "Rate your driver, John" or "Rate your passenger, Jane").
    *   It must feature a 5-star rating input, defaulting to 3 stars.
    *   It must include an optional multi-line text field for comments.
4.  **Submission**:
    *   Upon submission, the app must call the `POST /rides/{tripId}/rate` endpoint.
    *   The request body must include the `rating` (number) and `comment` (string).
5.  **Navigation**: After submitting the rating, the user must be returned to their respective app's home screen, and the rating screen should be dismissed. The user should not be able to go back to the rating screen for that trip.

---

### Technical Notes

*   **Frontend**: This story affects both the Flutter `passenger-app` and `driver-app`. The UI should be nearly identical and could be a shared widget in a mature implementation.
*   **API Endpoint**: The `Ride Service` will expose an endpoint like `POST /rides/{tripId}/rate` to accept the feedback.
*   **Backend Logic**: The backend will receive the rating, update the target user's average rating, and store the comment in an anonymous feedback table for later review (as per Story 3.3).
*   **State Management**: The app state must be managed to ensure the rating prompt appears at the correct time and only once per trip.

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `In Progress`

#### Tasks

- [x] **Task 1: Implement Shared Rating Logic**
    - [x] Create a `RatingScreen` in the `passenger-app` that can be used as a template.
    - [x] Update the `RideService` in the `passenger-app` to include a `submitRating` method.
- [x] **Task 2: Implement Passenger Flow**
    - [x] Create a `PaymentPromptModal` widget in the `passenger-app` to handle post-ride payment.
    - [x] Add logic to the modal to navigate to the `RatingScreen` after payment is finalized.
    - [x] Add a temporary trigger on the `HomeScreen` to simulate a trip ending and show the modal.
- [x] **Task 3: Implement Driver Flow**
    - [x] Refactor the existing `RatingScreen` in the `driver-app` to use the shared `RideService` and be testable.
- [ ] **Task 4: Write Tests**
    - [ ] Write widget tests for the `RatingScreen` in both apps.
    - [ ] Write widget tests for the `PaymentPromptModal` in the passenger app.