# Story 1.2: Passenger Login

*   **ID**: `STORY-1.2`
*   **Epic**: Core Ride-Hailing Experience
*   **Title**: User: Log in with phone number and password
*   **Points**: 3 (Low complexity: standard login form and API call)
*   **Status**: `Done`

---

### User Story

As a **returning passenger**, I want to **log in to the app using my phone number and password**, so that **I can access my account and book a ride**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `LoginScreen` in the `passenger-app` must contain `TextFormField`s for "Phone Number" and "Password".
2.  **Input Validation**: The form must validate that both fields are not empty before submission.
3.  **Login Flow**:
    *   When the user submits the form, the app must call the backend login endpoint (`POST /users/login`).
    *   The backend will validate the credentials against the Cognito User Pool.
4.  **Success Scenario**:
    *   On successful authentication, the backend will return authentication tokens (e.g., JWT).
    *   The app must securely store these tokens.
    *   The user must be automatically navigated to the `HomeScreen`, and the login/registration screens must be removed from the navigation stack.
5.  **Failure Scenario**: If authentication fails (e.g., wrong password), the app must display a clear error message to the user (e.g., "Invalid phone number or password").

---

### Technical Notes

*   **Frontend**: This story is implemented in the `passenger-app`.
*   **Authentication Service**: All authentication logic is handled through **Amazon Cognito**, abstracted by the backend.
*   **API Endpoint**: The frontend will interact with the `POST /users/login` endpoint provided by the **User & MLM Service**.
*   **State Management**: The `AuthProvider` should be used to manage the user's authentication state and tokens.

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

- [x] **Task 1: Update UI**: Enhance the existing `LoginScreen` to include a `Form` with `TextFormField`s for phone and password, and a "Login" button.
- [x] **Task 2: Update Authentication Service**: Add a `login` method to the `AuthService` in the `passenger-app`.
- [x] **Task 3: Implement Login Logic**: In `LoginScreen`, implement the `_submitLogin` function to handle form validation, service calls, and state updates via `AuthProvider`.
- [x] **Task 4: Write Tests**: Create `login_screen_test.dart` and test form validation, successful login, and failed login scenarios.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive widget tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/passenger-app/src/api/auth_service.dart` (modified)
*   `apps/passenger-app/src/screens/login_screen.dart` (modified)
*   `apps/passenger-app/test/screens/login_screen_test.dart` (new)