# Source Tree Structure

This document provides a detailed breakdown of the monorepo's source tree. It serves as the single source of truth for file and directory organization across all applications and libraries. Adhering to this structure is crucial for maintaining a clean, scalable, and understandable codebase.

## 1. High-Level Structure

The monorepo is organized into several top-level directories:

-   `/apps`: Contains all deployable applications (frontends, backends, mobile apps).
-   `/libs`: Contains shared libraries, components, and infrastructure code used across applications.
-   `/docs`: Contains all project documentation, including architecture, PRDs, and this source tree guide.

```
/
├── apps/
│   ├── admin-panel/
│   ├── dispatch-service/
│   ├── driver-app/
│   ├── driver-lead-service/
│   ├── mlm-service/
│   ├── passenger-app/
│   └── user-portal/
├── docs/
│   ├── architecture/
│   └── ...
└── libs/
    ├── components/
    ├── infrastructure/
    └── shared/
```

---

## 2. Applications (`/apps`)

### 2.1. `admin-panel` (Admin Frontend & Backend)

The `admin-panel` is a full-stack Next.js application for internal administrative tasks.

#### `/apps/admin-panel/` (Next.js Frontend)

```
/apps/admin-panel/
├── __e2e__/                 # End-to-end (E2E) tests using Cypress
│   ├── approvals-list.cy.ts
│   └── approvals.cy.ts
├── middleware.ts            # Next.js middleware for authentication and authorization
├── middleware.test.ts       # Unit tests for the middleware
├── next.config.js
├── package.json
├── project.json
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── __tests__/           # Unit and integration tests
    │   ├── components/
    │   │   ├── drivers/
    │   │   │   ├── DriverApplicationDetail.test.tsx
    │   │   │   └── DriverApplicationsList.test.tsx
    │   │   ├── forms/
    │   │   │   ├── BadgeForm.test.tsx
    │   │   │   ├── BlogPostForm.test.tsx
    │   │   │   ├── MlmConfig.test.tsx
    │   │   │   ├── MlmFormulaForm.test.tsx
    │   │   │   ├── PromoConfig.test.tsx
    │   │   │   ├── RoleForm.test.tsx
    │   │   │   └── UserForm.test.tsx
    │   │   ├── management/
    │   │   │   └── PermissionManagement.test.tsx
    │   │   ├── modals/
    │   │   │   ├── document_history_modal.test.tsx
    │   │   │   ├── edit_driver_profile_modal.test.tsx
    │   │   │   └── rejection_reason_modal.test.tsx
    │   │   ├── sos/
    │   │   │   ├── config/
    │   │   │   │   └── SosPenaltyConfig.test.tsx
    │   │   │   └── SosIncidentDashboard.test.tsx
    │   │   ├── users/
    │   │   │   └── SuspendedAccounts.test.tsx
    │   │   └── viewers/
    │   │       └── AuditLogViewer.test.tsx
    │   └── pages/
    │       └── UserManagement.test.tsx
    ├── components/            # React components specific to the admin panel
    │   ├── drivers/
    │   │   ├── DriverApplicationDetail.tsx
    │   │   └── DriverApplicationsList.tsx
    │   ├── forms/
    │   │   ├── BadgeForm.tsx
    │   │   ├── BlogPostForm.tsx
    │   │   ├── CommissionAdjustmentForm.tsx
    │   │   ├── MlmConfig.tsx
    │   │   ├── MlmFormulaForm.tsx
    │   │   ├── PromoConfig.tsx
    │   │   ├── RoleForm.tsx
    │   │   └── UserForm.tsx
    │   ├── layout/
    │   │   └── Sidebar.tsx
    │   ├── management/
    │   │   ├── BadgeManagement.tsx
    │   │   ├── BlogManagement.tsx
    │   │   ├── PermissionManagement.tsx
    │   │   ├── RoleManagement.tsx
    │   │   └── UserManagement.tsx
    │   ├── maps/
    │   │   └── LiveMap.tsx
    │   ├── modals/
    │   │   ├── document_history_modal.tsx
    │   │   ├── DriverDetailsModal.tsx
    │   │   ├── edit_driver_profile_modal.tsx
    │   │   ├── rejection_reason_modal.tsx
    │   │   └── SosResolutionModal.tsx
    │   ├── sos/
    │   │   ├── config/
    │   │   │   └── SosPenaltyConfig.tsx
    │   │   ├── SosAlertBanner.tsx
    │   │   ├── SosIncidentDashboard.tsx
    │   │   └── SosManager.tsx
    │   ├── users/
    │   │   ├── ProfileHistory.tsx
    │   │   └── SuspendedAccounts.tsx
    │   └── viewers/
    │       └── AuditLogViewer.tsx
    ├── hooks/
    │   └── useAuth.ts
    ├── pages/                 # Next.js pages/routes
    │   ├── AuditLogPage.tsx
    │   ├── DriverApprovalPage.tsx
    │   ├── ForgotPasswordPage.tsx
    │   ├── LoginPage.tsx
    │   ├── MlmConfigPage.tsx
    │   ├── ProfilePage.tsx
    │   ├── ResetPasswordPage.tsx
    │   ├── SosIncidentDashboard.tsx
    │   ├── SuspendedAccountsPage.tsx
    │   ├── UserManagement.tsx
    │   └── drivers/
    │       └── approval/
    │           └── [driverId]/
    │               └── page.tsx
    ├── services/              # Frontend-specific services (e.g., data fetching)
    │   └── adminService.ts
    └── App.tsx
    └── AuthContext.tsx
    └── ProtectedRoute.tsx
```

#### `/apps/admin-panel/backend/` (NestJS Backend)

```
/apps/admin-panel/backend/
└── src/
    ├── document/
    │   ├── admin-document-status.controller.ts
    │   ├── admin-document-status.service.ts
    │   ├── admin-document.controller.ts
    │   ├── document.controller.ts
    │   ├── document.service.spec.ts
    │   └── document.service.ts
    ├── feedback/
    │   ├── feedback-visibility.handler.ts
    │   └── feedback.repository.ts
    ├── incentive/
    │   ├── incentive.controller.ts
    │   └── incentive.service.ts
    ├── payment/
    │   ├── payment.controller.ts
    │   └── payment.service.ts
    ├── payout/
    │   ├── automated-payout.job.ts
    │   ├── payout.controller.spec.ts
    │   ├── payout.controller.ts
    │   ├── payout.service.spec.ts
    │   └── payout.service.ts
    ├── rating/
    │   ├── rating.controller.ts
    │   └── rating.service.ts
    ├── restaurant/
    │   └── restaurant.service.ts
    ├── support/
    │   ├── support.controller.ts
    │   └── support.service.ts
    └── user/
        ├── user.controller.ts
        ├── user.service.spec.ts
        └── user.service.ts
```

### 2.2. `dispatch-service` (Dispatch Panel Backend)

A NestJS backend service responsible for ride matching, driver scoring, and operational logistics.

```
/apps/dispatch-service/
├── project.json
├── tsconfig.json
└── src/
    └── trip-tracking.gateway.ts  # WebSocket gateway for real-time trip updates
```

### 2.3. `driver-app` (Flutter Mobile App)

The mobile application for drivers.

```
/apps/driver-app/
├── backend-integration.story-6.3-real-time-location-updates.yml
├── core-ride-hailing-experience.story-1.2-add-otp-screen-tests.yml
├── core-ride-hailing-experience.story-2.1-passenger-home-screen-map-setup.yml
├── passenger-payments.story-17.2-automatic-payment-processing.yml
├── pubspec.yaml
├── refactoring-and-architecture.story-9.2-shared-auth-service.yml
├── user-profile-and-settings.story-10.7-saved-places.yml
├── lib/
│   ├── main.dart              # Main entry point for the driver app
│   ├── config/
│   │   ├── amplifyconfiguration.dart
│   │   ├── app_config.dart
│   │   └── config.dart
│   ├── core/
│   │   ├── core_auth.dart
│   │   └── core_location.dart
│   ├── providers/
│   │   ├── active_ride_provider.dart
│   │   ├── active_ride_provider_test.dart
│   │   ├── auth_provider_test.dart
│   │   ├── auth_provider_test.mocks.dart
│   │   ├── home_screen_provider_test.dart
│   │   ├── home_screen_provider_test.mocks.dart
│   │   ├── payout_providers.dart
│   │   ├── providers.dart
│   │   ├── ride_request_provider.dart
│   │   ├── ride_request_provider_test.dart
│   │   ├── sos_alert_provider.dart
│   │   ├── sos_alert_provider_test.dart
│   │   ├── sos_provider.dart
│   │   └── sos_provider_test.dart
│   ├── screens/
│   │   ├── create_organization_screen.dart
│   │   ├── destination_mode_screen.dart
│   │   ├── document_history_screen.dart
│   │   ├── document_submission_screen.dart
│   │   ├── driver_home_screen.dart
│   │   ├── driving_hours_screen.dart
│   │   ├── earnings_dashboard_screen.dart
│   │   ├── earnings_goal_screen.dart
│   │   ├── earnings_history_screen.dart
│   │   ├── earnings_statements_screen.dart
│   │   ├── emergency_contacts_screen_test.dart
│   │   ├── expense_tracking_screen.dart
│   │   ├── home_screen.dart
│   │   ├── home_screen_test.dart
│   │   ├── in_app_navigation_screen.dart
│   │   ├── join_organization_screen.dart
│   │   ├── login_screen.dart
│   │   ├── login_screen_test.dart
│   │   ├── manage_payout_method_screen.dart
│   │   ├── manage_payout_method_screen_test.dart
│   │   ├── mlm_payouts_screen.dart
│   │   ├── my_earnings_screen.dart
│   │   ├── organization_management_screen.dart
│   │   ├── otp_verification_screen_test.dart
│   │   ├── profile_screen.dart
│   │   ├── ratings_screen.dart
│   │   ├── ratings_screen_test.dart
│   │   ├── rating_screen.dart
│   │   ├── referral_program_screen.dart
│   │   ├── request_payout_screen.dart
│   │   ├── saved_places_screen.dart
│   │   ├── search_screen_test.dart
│   │   ├── sos_alert_screen.dart
│   │   ├── sos_alert_screen_test.dart
│   │   ├── support_screen.dart
│   │   ├── support_screen_test.dart
│   │   ├── trip_in_progress_screen.dart
│   │   └── weekly_statements_screen.dart
│   ├── services/
│   │   ├── audio_stream_service.dart
│   │   ├── audio_stream_service_test.dart
│   │   ├── audio_stream_service_test.mocks.dart
│   │   ├── auth_service.dart
│   │   ├── biometric_service.dart
│   │   ├── document_api_service.dart
│   │   ├── document_service.dart
│   │   ├── location_service.dart
│   │   ├── notification_service.dart
│   │   ├── notification_service_test.dart
│   │   ├── payout_api_service.dart
│   │   ├── ratings_service.dart
│   │   ├── ratings_service_test.dart
│   │   ├── ride_service.dart
│   │   ├── ride_service_test.dart
│   │   ├── ride_service_test.mocks.dart
│   │   ├── sos_service.dart
│   │   ├── sos_service_test.dart
│   │   └── user_service.dart
│   ├── viewmodels/
│   │   ├── document_history_viewmodel.dart
│   │   └── document_submission_viewmodel.dart
│   └── widgets/
│       ├── auth_wrapper.dart
│       ├── auth_wrapper_test.dart
│       ├── back_to_back_offer_widget.dart
│       ├── biometric_check_wrapper.dart
│       ├── driver_details_panel_test.dart
│       ├── in_trip_panel.dart
│   │   ├── in_trip_panel_test.dart
│   │   ├── processing_payment_panel.dart
│   │   ├── ride_confirmation_panel_test.dart
│   │   ├── ride_request_modal.dart
│   │   ├── ride_request_modal_test.dart
│   │   ├── ride_request_modal_test.mocks.dart
│   │   ├── scheduled_ride_confirmation_panel.dart
│   │   ├── trip_in_progress_panel.dart
│   │   ├── trip_in_progress_panel_test.dart
│   │   ├── trip_offer_widget.dart
│   │   └── trip_summary_panel.dart
└── test/
    ├── models/
    │   └── document_test.dart
    ├── screens/
    │   ├── document_history_screen_test.dart
    │   ├── document_submission_screen_test.dart
    │   ├── my_earnings_screen_test.dart
    │   ├── profile_screen_test.dart
    │   └── weekly_statements_screen_test.dart
    ├── services/
    │   └── document_service_test.dart
    └── viewmodels/
        ├── document_history_viewmodel_test.dart
        └── document_submission_viewmodel_test.dart
```

### 2.4. `passenger-app` (Flutter Mobile App)

The mobile application for passengers.

```
/apps/passenger-app/
├── pubspec.yaml
├── lib/
│   ├── main.dart              # Main entry point for the passenger app
│   ├── config/
│   │   └── amplifyconfiguration.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── auth_provider_test.dart
│   │   ├── cart_provider.dart
│   │   └── cart_provider_test.dart
│   ├── screens/
│   │   ├── booking_screen.dart
│   │   ├── forgot_password_screen.dart
│   │   ├── help_screen.dart
│   │   ├── home_screen.dart
│   │   ├── login_screen.dart
│   │   ├── passenger_rating_screen.dart
│   │   ├── payment_methods_screen.dart
│   │   ├── performance_screen.dart
│   │   ├── privacy_center_screen.dart
│   │   ├── profile_picture_screen.dart
│   │   ├── ratings_screen.dart
│   │   ├── rating_screen.dart
│   │   ├── reset_password_screen.dart
│   │   ├── ride_preferences_screen.dart
│   │   ├── saved_places_screen.dart
│   │   ├── saved_routes_screen.dart
│   │   ├── settings_screen.dart
│   │   ├── support_screen.dart
│   │   ├── trip_details_screen.dart
│   │   ├── trip_history_screen.dart
│   │   ├── trusted_contacts_screen.dart
│   │   ├── vehicle_management_screen.dart
│   │   └── wallet_screen.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── core_ride_service.dart
│   │   ├── emergency_contact_service.dart
│   │   ├── location_service.dart
│   │   ├── location_tracking_service.dart
│   │   ├── performance_service.dart
│   │   └── ride_service.dart
│   ├── utils/
│   │   ├── core_location.dart
│   │   └── core_ui.dart
│   └── widgets/
│       ├── base_panel.dart
│       ├── biometric_check_wrapper.dart
│       ├── payment_prompt_modal.dart
│       ├── primary_button.dart
│       ├── promo_code_input_widget.dart
│       ├── scheduled_ride_confirmation_panel.dart
│       └── vehicle_selection_widget.dart
└── test/
    ├── auth_service_test.dart
    ├── driver_details_panel_test.dart
    ├── login_screen_test.dart
    ├── otp_verification_screen_test.dart
    ├── passenger_rating_screen_test.dart
    ├── performance_screen_test.dart
    ├── performance_service_test.dart
    ├── profile_screen_test.dart
    ├── ratings_screen_test.dart
    ├── ride_service_test.dart
    ├── saved_places_screen_test.dart
    ├── support_screen_test.dart
    ├── trip_in_progress_panel_test.dart
    ├── trip_summary_panel_test.dart
    └── waiting_for_passenger_panel_test.dart
```

### 2.5. `user-portal` (Marketing Website)

A Next.js application serving as the marketing website and initial driver registration portal.

```
/apps/user-portal/
├── __e2e__/                 # End-to-end (E2E) tests using Cypress
│   └── app.cy.ts
├── next.config.js
├── package.json
├── project.json
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── __tests__/           # Unit and integration tests
    │   ├── components/
    │   │   └── forms/
    │   │       └── DriverRegistrationForm.test.tsx
    │   └── pages/
    │       └── api/
    │           └── register.test.ts
    ├── components/            # React components for the user portal
    │   ├── forms/
    │   │   ├── CheckoutForm.tsx
    │   │   └── DriverRegistrationForm.tsx
    │   └── layout/
    │       └── layout.tsx
    ├── pages/                 # Next.js pages/routes
    │   ├── api/
    │   │   ├── register/
    │   │   │   └── route.ts
    │   │   └── webhook/
    │   │       └── stripe/
    │   │           └── route.ts
    │   └── drivers/
    │       └── register/
    │           └── payment.tsx
    └── styles/
        └── globals.css
```

### 2.6. Other Backend Services

#### 2.6.1. `/apps/driver-lead-service/` (NestJS Service)

NestJS service for handling driver registration and document management.

```
/apps/driver-lead-service/
├── project.json
├── tsconfig.json
└── src/
    ├── auth/
    │   └── auth.controller.ts
    └── document/
        └── driver-document.controller.ts
```
#### 2.6.2. `/apps/mlm-service/` (NestJS Service)

NestJS service for handling MLM logic.

```
/apps/mlm-service/
├── project.json
├── tsconfig.json
└── src/
    ├── __tests__/
    │   └── mlm.service.spec.ts
    └── mlm.service.ts
```

---

## 3. Shared Libraries (`/libs`)

### 2.x. `apps/components` (Shared React Components)

Contains generic, reusable React components shared across frontend applications.

```
/apps/components/
└── src/
    ├── ConfirmationModal.tsx
    ├── GlobalSearchBar.tsx
    ├── Header.tsx
    ├── InputField.tsx
    └── Sidebar.tsx
```

### 3.2. `libs/infrastructure`

Contains the AWS CDK project for defining Infrastructure as Code (IaC).

```
/libs/infrastructure/
├── project.json
├── tsconfig.json
├── bin/
│   └── infrastructure.ts  # CDK app entry point
└── lib/
    └── main-stack.ts      # Main stack definition
```

### 3.3. `libs/shared`

Contains code shared across multiple backend services.

```
/libs/shared/
├── project.json
├── tsconfig.json
├── interfaces/            # Shared TypeScript interfaces and DTOs
│   ├── index.ts           # Barrel file re-exporting all DTOs
│   ├── audit.dto.ts
│   ├── auth.dto.ts
│   └── ... (all other .dto.ts files)
├── modules/
│   └── logger.module.ts
├── services/
│   ├── event-publisher.ts
│   ├── mock-trip.service.ts
│   ├── notification.service.ts
│   └── structured-logger.service.ts
├── types/
│   └── types.ts
└── utils/
    └── apiClient.ts
```
