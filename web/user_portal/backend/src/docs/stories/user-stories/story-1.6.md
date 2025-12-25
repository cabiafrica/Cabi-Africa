# Story 1.6: Passenger Ride Request

*   **ID**: `STORY-1.6`
*   **Epic**: Core Ride-Hailing Experience
*   **Title**: Passenger: Request a ride by setting pickup and destination
*   **Points**: 13 (High complexity: involves map UI, external API integration for geocoding/routing, and real-time backend communication)
*   **Status**: `Done`

---

### User Story

As a **logged-in passenger**, I want to **request a ride by setting my pickup and destination points**, so that **I can get to where I need to go**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `passenger-app` home screen must display an interactive map (using the Google Maps SDK).
2.  **Pickup Location**: The map must automatically center on the user's current GPS location, which is set as the default pickup point. The user can also manually adjust the pickup point by moving the map pin.
3.  **Destination Selection**: A search input must allow the user to find and select a destination address. This search must be powered by the Google Places API for address autocomplete.
4.  **Fare & Route Estimation**: Once a destination is selected, the app must display the estimated fare and the proposed route on the map. This data is fetched from the backend, which uses the Google Directions API.
5.  **Ride Confirmation**: The user must be able to confirm the ride request by tapping a "Confirm Ride" button.
6.  **Backend Request**: Upon confirmation, the app must send a `POST /rides/request` request to the `Ride Service` with the pickup and destination coordinates.
7.  **Broadcast**: The `Ride Service` must then publish a `RideRequested` event to the Event Bus to broadcast the request to nearby available drivers.

---

### Technical Notes

*   **Frontend**: This story is implemented in the Flutter `passenger-app`. It will require the `google_maps_flutter` and `google_maps_webservice` (or similar) packages.
*   **Backend Service**: The `Ride Service` is responsible for handling the ride request, calculating the fare estimate, and broadcasting the request.
*   **External APIs**:
    *   **Google Maps SDK (Flutter)**: For displaying the map interface.
    *   **Google Places API**: For destination search and autocomplete.
    *   **Google Directions API**: Used by the backend to calculate the route and fare.
*   **API Endpoint**: The primary endpoint for this story is `POST /rides/request`.
*   **State Management**: The frontend must manage the state of the ride request flow (selecting pickup, selecting destination, viewing estimate, waiting for driver).

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

- [x] **Task 1: Integrate Location Services**: In `HomeScreen`, use the `geolocator` package to get the user's current position and center the `GoogleMap` on it.
- [x] **Task 2: Implement Destination Search**: Add a "Where to?" input field. On tap, use the `flutter_google_places` package to open an autocomplete search screen.
- [x] **Task 3: Display Route and Fare**: When a destination is selected, call the `RideService` to get a fare estimate and a polyline. Display the route on the map and the estimated fare in a bottom card.
- [x] **Task 4: Implement Ride Request Logic**: Add a "Confirm Ride" button. On press, call the `RideService.requestRide` method and update the UI to a "searching for drivers" state.
- [x] **Task 5: Write Tests**: Create `home_screen_test.dart`. Test the initial map display, destination selection flow, and ride request logic by mocking the `RideService` and other dependencies.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive widget tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/passenger-app/src/api/ride_service.dart` (modified)
*   `apps/passenger-app/src/screens/home_screen.dart` (modified)
*   `apps/passenger-app/src/screens/home_screen_test.dart` (new)