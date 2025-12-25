# Development Task: Implement 'Favorite Driver' Button

## User Story

As a **Passenger**,
I want **to be able to mark a driver as a favorite from my past trip history**,
So that **I can easily request them for future rides**.

## Overview

This task involves implementing a UI element on the past trip detail screen in the passenger application that allows users to mark/unmark a driver as a favorite. The functionality will interact with existing backend services to persist the user's preference. This is considered a brownfield addition.

## Technical Details

### UI Implementation

1.  **Locate Past Trip Detail Screen:** Identify the relevant UI component/screen responsible for displaying past trip details.
2.  **Add "Favorite Driver" Button:**
    *   Integrate a new UI button/icon (e.g., a heart icon) on the past trip detail screen.
    *   The button should clearly indicate the driver's current favorite status (e.g., filled heart for favorited, outlined heart for not favorited).
    *   Ensure the button adheres to the existing UI design patterns of the passenger app.
3.  **Handle Button Interaction:** Implement a tap/click handler for the "Favorite Driver" button.

### Backend Integration

1.  **API Call:**
    *   Upon button tap, make an asynchronous call to the appropriate backend API endpoint to update the driver's favorite status for the current passenger.
    *   If an existing endpoint for user preferences can be adapted, use it. Otherwise, a new lightweight endpoint might be required (consult backend team if necessary).
    *   The API request should include the `passenger_id`, `driver_id`, and the new `favorite_status` (e.g., true/false).
2.  **Local State Update:** Update the local UI state and/or cache to reflect the new favorite status immediately after a successful API response.
3.  **Error Handling:** Implement robust error handling for API calls, displaying user-friendly messages for failures and allowing retry mechanisms where appropriate.

### Data Persistence

1.  **Existing Pattern Reference:** Follow existing data persistence patterns for user preferences (e.g., how "saved places" are managed).
2.  **Additive Changes:** Ensure any database changes (if a new endpoint requires it) are additive only and do not cause breaking changes.

## Acceptance Criteria for Development

1.  The "Favorite Driver" button is visible on the past trip detail screen.
2.  Tapping the button successfully marks a driver as a favorite (visually and via backend).
3.  Tapping the button again successfully unmarks a driver as a favorite (visually and via backend).
4.  The button's state (favorited/not favorited) is correctly displayed when viewing a past trip.
5.  Existing trip history display and related functionalities remain unchanged and fully functional.
6.  The implementation includes appropriate unit tests for UI components and integration tests for API interactions.
7.  No regression in existing functionality is introduced.
8.  Code adheres to project coding standards and existing patterns.

## Testing Instructions

1.  Navigate to the "Past Trips" section of the passenger app.
2.  Select any past trip to view its details.
3.  Observe the "Favorite Driver" button on the screen.
4.  Tap the button to mark/unmark the driver as favorite and verify the visual state change.
5.  Navigate away and then back to the same trip detail screen to ensure the favorite status is persisted and correctly loaded.
6.  Perform regression tests on core "Past Trips" functionality (e.g., viewing trip details, map display) to ensure no breakage.

## Definition of Done (for Developer)

-   All UI components for the "Favorite Driver" button are implemented and styled according to existing patterns.
-   Backend integration (API calls, error handling, local state updates) is fully functional.
-   Unit and integration tests are written and pass.
-   No regressions are introduced to existing features.
-   Code is reviewed and merged.
