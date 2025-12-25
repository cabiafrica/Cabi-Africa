# Story 1.3: Driver Registration Redirect

*   **ID**: `STORY-1.3`
*   **Epic**: Core Ride-Hailing Experience
*   **Title**: Driver: Redirect to web portal for registration
*   **Points**: 1 (A simple UI task involving launching a URL)
*   **Status**: `Done`

---

### User Story

As a **prospective driver in the Driver App**, I want to **tap a "Register" button that redirects me to the CABI web portal**, so that **I can begin the official registration process**.

---

### Acceptance Criteria

1.  **UI Implementation**: The Flutter `driver-app`'s login screen must have a clearly visible "Register" or "Become a Driver" button.
2.  **Redirection**: When the button is tapped, the app must launch the device's default web browser.
3.  **Destination**: The browser must open the URL for the driver registration page on the `web-portal`.

---

### Technical Notes

*   **Frontend**: This story only affects the Flutter `driver-app`.
*   **URL Handling**: The URL for the web portal should be stored as a configurable environment variable, not hardcoded, to support different environments (dev, staging, prod).
*   **Implementation**: The `url_launcher` package in Flutter is the recommended tool for this functionality.

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

- [x] **Task 1: Add `url_launcher` Dependency**: Add the `url_launcher` package to the `pubspec.yaml` for the `driver-app`.
- [x] **Task 2: Create `AppConfig`**: Create a new file `apps/driver-app/config.dart` to store the `driverRegistrationUrl`.
- [x] **Task 3: Implement UI and Logic**: In `apps/driver-app/login_screen.dart`, add a "Register to Drive" button and an `_launchRegistrationUrl` method that uses `url_launcher` to open the URL from `AppConfig`.
- [x] **Task 4: Write Tests**: Create `login_screen_test.dart` to verify that tapping the "Register" button attempts to launch the correct URL.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive widget tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/driver-app/pubspec.yaml` (modified)
*   `apps/driver-app/config.dart` (new)
*   `apps/driver-app/login_screen.dart` (new)
*   `apps/driver-app/login_screen_test.dart` (new)