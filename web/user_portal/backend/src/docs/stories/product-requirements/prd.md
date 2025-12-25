# CABI Product Requirements Document (PRD)

## 1. Goals and Background Context

### Goals

*   Achieve 5% market share in Nairobi within the first 12 months.
*   Establish a driver fleet of 5,000 active drivers in Nairobi within 9 months.
*   Achieve a 40% user acquisition rate through the referral program by the end of Year 1.
*   Attain a driver retention rate of over 70% month-over-month.
*   Reach a passenger referral conversion rate of over 15%.

### Background Context

The Kenyan ride-hailing market is mature but suffers from significant driver and passenger dissatisfaction. Drivers face high commissions and punitive rating systems, while passengers experience a purely transactional service with low brand loyalty.

CABI aims to fill this market gap by introducing a partnership-first model. By combining a unique MLM referral system, a fairer rating system, and gamification, CABI will create a more engaged and loyal community, giving both drivers and passengers a tangible stake in the platform's success.

### Change Log

| Date | Version | Description | Author |
| :------------ | :------ | :---------------------------------------- | :--------- |
| *Initial Draft* | 0.1     | Initial PRD draft from Project Brief      | John (PM)  |
| *Update*      | 0.2     | Refined registration and MLM logic per user | John (PM)  |

## 2. User Personas & Stories

### 2.1. Personas

*   **Primary Persona: The Professional Driver (e.g., "David")**
    *   **Profile**: A tech-savvy individual in Nairobi who drives full-time for ride-hailing services. He likely works across multiple platforms (Uber, Bolt) to maximize his income and is highly sensitive to commission rates, payment reliability, and platform fairness.
    *   **Goals**: To earn a stable and respectable living, be treated as a professional partner, and find opportunities for financial growth beyond just driving.
    *   **Frustrations**: High and unpredictable commissions, the constant fear of arbitrary deactivation from a low rating, and feeling like a disposable commodity with no voice.

*   **Secondary Persona: The Urban Commuter (e.g., "Brenda")**
    *   **Profile**: A student or young professional in Nairobi who relies on ride-hailing for daily transport to university or work. She is tech-literate, price-conscious, and values safety and convenience above all.
    *   **Goals**: To get to her destination safely, reliably, and affordably. She is open to a more engaging app experience that offers better value.
    *   **Frustrations**: Inconsistent pricing, concerns about safety, and a purely transactional experience with no reward for loyalty.
    
### 2.2. Epics

Based on the MVP scope, our development will be organized into the following high-level epics:

*   **Epic 1: Core Ride-Hailing Experience** - Covers the fundamental functionality for a passenger to request a ride and a driver to accept and complete it.
*   **Epic 2: MLM & Referral Engine** - Encompasses all features related to the two-tier referral system for both drivers and passengers.
*   **Epic 3: Fair Rating & Gamification System** - Includes the unique 3-star default rating system and the foundational badge system.
*   **Epic 4: Admin & Configuration Panel** - All functionality required for the back-office administration of the platform.

## 3. Functional Requirements

### Epic 1: Core Ride-Hailing Experience

*   **Goal**: To establish the fundamental, end-to-end functionality for a passenger to successfully request, take, and pay for a ride, and for a driver to accept and complete that ride. This epic forms the backbone of the entire application.

#### Story 1.1: Passenger Account Registration
*As a new passenger, I want to register for an account using my phone number and a password, so that I can start using the service.*
*   **Acceptance Criteria**:
    1.  The user can enter their full name, phone number, and a password.
    2.  The phone number must be validated for a proper Kenyan format.
    3.  The system sends a verification code (OTP) to the provided phone number via SMS.
    4.  The user must enter the correct verification code to complete the registration process.
    5.  Upon successful registration, a new passenger record is created in the database with a default 3-star rating, and the user is automatically logged in.

#### Story 1.2 (Revised): Driver Registration Redirect
*As a prospective driver in the Driver App, I want to tap a "Register" button that redirects me to the CABI web portal, so that I can begin the official registration process.*
*   **Acceptance Criteria**:
    1.  The Driver App's login screen must have a clearly visible "Register" or "Become a Driver" button.
    2.  Tapping this button opens the device's default web browser to the driver registration page on the CABI web portal.

#### Story 1.3: Step 1 - Initial Driver Registration & Payment
*As a prospective driver on the CABI web portal, I want to complete an initial registration with my basic details and pay the registration fee, so that I can proceed to the document upload stage.*
*   **Acceptance Criteria**:
    1.  The web form must have fields for full name, phone number, and password.
    2.  The form must include an optional field to find a referrer by their username, email, or phone number. If no referrer is provided, the system assigns the new driver to a default **"System"** referrer account.
    3.  Upon submitting the form, the user is prompted to pay the registration fee via an M-Pesa STK push.
    4.  Upon successful payment, a new driver account is created with a "Pending Documents" status and linked to the correct referrer.
    5.  The registration fee is distributed according to the logic in Story 2.3.
    6.  The user is automatically redirected to the second step of registration (document upload).

#### Story 1.4: Step 2 - Document & Vehicle Details Upload
*As a new driver who has paid the registration fee, I want to provide my personal documents and vehicle details, so that I can complete my application for admin approval.*
*   **Acceptance Criteria**:
    1.  The web form must have fields for national ID number, driver's license number, and vehicle details (make, model, year, license plate).
    2.  The form must include a file upload component for required documents (e.g., Driver's License, National ID card, Vehicle Inspection Report).
    3.  Upon submission, the driver's account status is updated to "Pending Approval".
    4.  A notification is sent to the Admin Panel about the completed driver application.

#### Story 1.5 (Renumbered from 1.4): User Login
*As a registered user (driver or passenger), I want to log in using my phone number and password, so that I can access my account.*
*   **Acceptance Criteria**:
    1.  The login screen accepts a phone number and password.
    2.  Upon successful authentication, the user is redirected to the appropriate app home screen (Passenger or Driver).
    3.  A clear error message is shown for incorrect credentials.
    4.  A "Forgot Password" flow is available to reset the password via SMS.

#### Story 1.6 (Renumbered from 1.5): Passenger Ride Request
*As a logged-in passenger, I want to request a ride by setting my pickup and destination points, so that I can get to where I need to go.*
*   **Acceptance Criteria**:
    1.  The app displays an interactive map centered on the user's current location (pickup point).
    2.  The user can search for and select a destination.
    3.  Once the destination is set, the app displays an estimated fare and route.
    4.  The user can confirm the ride request, which then broadcasts the request to nearby available drivers.

#### Story 1.7 (Renumbered from 1.6): Driver Ride Acceptance
*As an available, logged-in driver, I want to see and accept incoming ride requests, so that I can earn money.*
*   **Acceptance Criteria**:
    1.  The driver app receives notifications for new ride requests from nearby passengers.
    2.  The notification displays the pickup location, distance to the passenger, and the passenger's rating.
    3.  The driver has a set amount of time (e.g., 30 seconds) to accept or reject the request.
    4.  Upon acceptance, the driver's status changes to "On Trip," and they receive navigation instructions to the pickup location.
    5.  The passenger is notified that a driver has accepted their request and can see the driver's details (name, rating, vehicle) and location on the map.

#### Story 1.8 (Renumbered from 1.7): Trip Completion and Payment
*As a driver, I want to end the trip upon reaching the destination, so that the passenger can pay and I can receive my earnings.*
*   **Acceptance Criteria**:
    1.  The driver can mark the trip as "Complete" in their app.
    2.  The passenger's app displays the final fare and prompts for payment.
    3.  The passenger can choose to pay via M-Pesa or Cash.
    4.  For M-Pesa, an STK push is initiated to the passenger's phone for payment confirmation.
    5.  Upon successful payment (or cash confirmation by the driver), the trip is marked as "Paid."

#### Story 1.9: Random Biometric Identity Verification
*As the system, I want to randomly prompt users (drivers and passengers) for biometric verification, so that I can ensure the account holder is the one using the app.*
*   **Acceptance Criteria**:
    1.  The system can trigger a random verification check at key moments (e.g., app open, before accepting a ride, before starting a ride).
    2.  The app presents a full-screen modal requesting biometric verification (Fingerprint/Face ID), based on device capability.
    3.  Successful verification allows the user to continue their action seamlessly.
    4.  After multiple failed attempts (e.g., 3), the user is logged out, the account is temporarily locked, and an alert is sent to the admin panel.

#### Story 1.10: Driver In-Trip SOS Alert
*As a driver during a trip, I want to press an SOS button to discreetly alert for help, so that I can get immediate assistance in an emergency.*
*   **Acceptance Criteria**:
    1.  A persistent SOS button is visible on the driver's active trip screen.
    2.  The button requires a long-press (e.g., 3 seconds) followed by a confirmation to activate, preventing accidental triggers.
    3.  Upon activation, an alert is sent to the backend with the driver's live location, trip details, and user ID.
    4.  The driver's app UI changes to an "SOS Activated" state.
    5.  The system activates the driver's phone microphone for live audio streaming to the admin panel.

#### Story 1.11: Nearby Driver SOS Notification
*As a nearby available driver, I want to receive a high-priority alert when another driver activates their SOS, so that I can provide assistance if I am able.*
*   **Acceptance Criteria**:
    1.  The system identifies geographically close, available drivers.
    2.  These drivers receive a loud, un-dismissible, full-screen notification about the SOS alert, showing the distressed driver's live location on a map.
    3.  The notification includes an option to "View Details & Navigate" to the location.

### Epic 2: MLM & Referral Engine
---
*   **Goal**: To implement the complete two-tier multi-level marketing system that allows users to earn passive income from driver registration fees and promotional passenger fares, creating a powerful, self-sustaining growth loop.

#### Story 2.1: User Referral Code & QR Generation
*As a registered user (passenger or driver), I want to have a unique referral code and a scannable QR code, so that I can easily invite new users to the platform.*
*   **Acceptance Criteria**:
    1.  Each user is assigned a unique, human-readable referral code (e.g., `DAVID123`).
    2.  The user's profile screen must display the referral code and a QR code icon.
    3.  Tapping the QR code icon must open a full-screen view of the QR code for easy scanning by another device.
    4.  The QR code must encode the user's unique referral registration link (e.g., `https://cabi.ke/join?ref=DAVID123`).
    5.  A "Share" button must open the native OS sharing dialog with the link.

#### Story 2.2: Referral Link Attribution
*As a new user registering via a referral link, I want the system to automatically recognize my referrer, so I don't have to enter the code manually.*
*   **Acceptance Criteria**:
    1.  When a user visits the registration web portal via a referral link, the referrer's code is pre-filled and locked in the registration form.
    2.  Upon successful registration, the new user is correctly linked to their referrer (Upline 1) in the database.
    3.  The system correctly identifies the referrer's own referrer (Upline 2) and establishes the two-tier link.

#### Story 2.3 (Revised): Driver Registration Fee Distribution
*As the system, I want to collect a registration fee from a new driver during Step 1 of registration and distribute it to their upline, so that referrers are compensated for bringing new drivers to the platform.*
*   **Acceptance Criteria**:
    1.  This process is triggered upon successful payment in Story 1.3.
    2.  The collected fee is split according to the percentages configured in the Admin Panel (System Cut, Upline 1 Cut, Upline 2 Cut).
    3.  The respective earnings are correctly credited to the System's account, Upline 1's wallet, and Upline 2's wallet.
    4.  If Upline 2 does not exist, their share is automatically credited to the System's account.
    5.  The transaction is logged for auditing.

#### Story 2.4: Standard Fare Commission Splitting (Badge-Qualified)
*As the system, I want to automatically distribute the commission from a driver's fare to their upline only if the referrer has the required badge, so that earnings are tied to performance.*
*   **Acceptance Criteria**:
    1.  When a driver (who was referred) completes a paid trip, the system calculates the total commission.
    2.  The system checks if Upline 1 and Upline 2 have the required "Earning Badge" (as configured in the Admin Panel).
    3.  If an upline member **has** the required badge, their share of the commission (based on the single set of percentages in the Admin Panel) is credited to their wallet.
    4.  If an upline member **does not** have the required badge, their share of the commission is credited to the System's account.
    5.  If Upline 2 does not exist, their share is automatically credited to the System's account.
    6.  The driver's net earning (Fare - Total Commission) is correctly calculated.

#### Story 2.5: Promotional Passenger Fare Splitting (Badge-Qualified)
*As the system, I want to automatically deduct a configurable portion of a driver's commission as SACCO savings, so that drivers build savings as they earn.*
*   **Acceptance Criteria**:
    1.  This process is triggered after the standard fare commission is calculated (Story 2.4).
    2.  The system retrieves the current "SACCO Savings Rate" from the Admin Panel configuration.
    3.  The system calculates the savings amount (e.g., `Total Commission * SACCO Savings Rate`).
    4.  This savings amount is deducted from the driver's net earnings for the trip.
    5.  The savings amount is credited to the driver's virtual SACCO savings account.
    6.  The transaction is logged for auditing, clearly showing the fare, commission, SACCO deduction, and final net earning.
    7.  If the SACCO Savings Rate is set to 0, no deduction is made.

#### Story 2.6: Promotional Passenger Fare Splitting (Badge-Qualified)
*As the system, I want to distribute a portion of a passenger's fare to their upline based on badge qualification during promotional periods, so that we can incentivize passenger-to-passenger referrals.*
*   **Acceptance Criteria**:
    1.  The system checks if the "Promotional Passenger Fare Split" is currently active in the Admin Panel.
    2.  If active, the system checks if the passenger's Upline 1 and Upline 2 have the required "Earning Badge".
    3.  If an upline member **has** the required badge, their share of the fare (based on the single set of promotional percentages) is credited to their wallet.
    4.  If an upline member **does not** have the required badge, their share is credited to the System's account.
    5.  If Upline 2 does not exist, their share is automatically credited to the System's account.

#### Story 2.7: User Referral Network & Earnings View
*As a user, I want to see my network of referrals and my total earnings from the MLM system, so that I can track my success.*
*   **Acceptance Criteria**:
    1.  Both the Driver and Passenger apps must have a "My Network" or "Earnings" screen.
    2.  If the user is a driver who has **not** paid the registration fee, this screen must be locked and display a message like "Your network is growing! Pay the registration fee to unlock your earnings and view your tree." with a button to initiate payment.
    3.  If the user is a passenger or a paid driver, the screen must display the total number of direct referrals (Tier 1) and indirect referrals (Tier 2).
    4.  The screen must show the total lifetime earnings from referrals.
    5.  A list of recent referral earnings transactions must be visible.

### Epic 3: Fair Rating & Gamification System

*   **Goal**: To implement the unique 3-star rating system and the foundational badge system to support gamification and MLM qualification.

#### Story 3.1 (Revised): Post-Ride Rating and Commenting
*As a user (driver or passenger), I want to rate my counterpart and optionally leave an anonymous comment after a trip, so that I can provide detailed feedback.*
*   **Acceptance Criteria**:
    1.  After a trip is marked "Paid", both driver and passenger apps present a rating screen for the other user.
    2.  The screen shows the other user's current average rating and defaults to a neutral state (no change).
    3.  The user can choose to adjust the rating up or down (e.g., by selecting 1 to 5 stars).
    4.  An optional text input field is available for leaving a comment.
    5.  If no action is taken and the screen is dismissed, the other user's rating remains unchanged.
    6.  Submitting a rating (with or without a comment) updates the other user's average rating in the database.
    7.  If a comment is submitted, it is saved in the database with the trip details and a timestamp, but is not immediately visible to the rated user.

#### Story 3.2: Badge Definition & Assignment
*As the system, I want to automatically assign badges to users based on their performance and activity, so that they can be recognized and qualify for MLM earnings.*
*   **Acceptance Criteria**:
    1.  The system periodically (e.g., daily) evaluates user metrics against the criteria for defined badges (e.g., "Top Referrer", "5-Star Partner", "Earning Badge").
    2.  When a user meets the criteria for a badge, it is assigned to their profile.
    3.  Users can view their earned badges on their profile screen.
    4.  The logic for badge assignment must be based on rules configured in the Admin Panel (as defined in Story 4.4).

#### Story 3.3: Monthly Feedback Review
*As a user (driver or passenger), I want to view the anonymous comments left for me on a monthly basis, so that I can get feedback while protecting the privacy of the reviewers.*
*   **Acceptance Criteria**:
    1.  The user's profile screen has a "My Feedback" or "My Comments" section.
    2.  This section displays a list of all comments received.
    3.  The comments are grouped by month (e.g., "Feedback for May 2024").
    4.  New comments for a given month (e.g., May) only become visible on the first day of the following month (e.g., June 1st).
    5.  The comments are displayed anonymously, without any link to a specific trip or user.
    6.  A background job or scheduled task is responsible for making comments visible at the start of each month.

### Epic 4: Admin & Configuration Panel

#### Story 3.4: User Blog Viewing
*As a user (driver or passenger), I want to view a list of recent blog posts within the app, so that I can stay informed about CABI news and feel connected to the community.*
*   **Acceptance Criteria**:
    1.  Both the Passenger and Driver apps must have a "Blog" or "News" section, accessible from the Profile or a similar non-intrusive area.
    2.  The screen displays a list of published blog posts, showing the featured image, title, and a short summary for each.
    3.  The list should be sorted by publication date, with the newest posts first.
    4.  Tapping on a post opens a detailed view to read the full content within the app (e.g., using an in-app browser or a native view).
    5.  The app should efficiently load and cache the list of posts to ensure fast performance and minimize data usage.
    6.  A pull-to-refresh mechanism allows users to manually check for new posts.

---

### Epic 4: Admin & Configuration Panel

*   **Goal**: To provide administrators with the tools to manage users, configure the core business logic of the MLM and payment systems, monitor platform activity, and manage access control through a flexible roles and permissions system.

#### Story 4.1: Admin Driver Approval
*As an admin, I want to review and approve or reject new driver applications, so that I can maintain a quality driver fleet.*
*   **Acceptance Criteria**:
    1.  The admin panel displays a list of drivers with a "Pending Approval" status.
    2.  The admin can view all submitted details and uploaded documents for each applicant.
    3.  For each document and key detail, the admin can mark it as "Approved" or "Rejected" individually.
    4.  If an item is rejected, the admin must provide a reason.
    5.  The admin can submit the review, which can have three outcomes:
        a. **Full Approval**: If all items are approved, the driver's status changes to "Active". A notification is sent to the driver.
        b. **Request Correction**: If one or more items are rejected, the driver's status changes to "Requires Correction". A notification is sent to the driver with the rejection reasons.
        c. **Full Rejection**: The admin can choose to reject the entire application, changing the driver's status to "Rejected".

#### Story 4.2 (Revised): Admin MLM Configuration
*As an admin, I want to configure all commission and fee split percentages, and define which badges qualify users to earn, so that I can control the platform's revenue and referral incentives.*
*   **Acceptance Criteria**:
    1.  The admin can set the one-time **Driver Registration Fee** amount and its percentage splits (System, Upline 1, Upline 2).
    2.  The admin can set the single set of percentage splits for the **Standard Fare Commission** (System, Upline 1, Upline 2).
    3.  The admin can set the **SACCO Savings Rate** as a percentage to be deducted from the driver's portion of the commission.
    4.  The admin can select which badge(s) are required to qualify for earning commissions.
    5.  The system must validate that percentages for any given split add up to 100%.

#### Story 4.3 (Revised): Admin Promotional Fare Split Configuration
*As an admin, I want to enable, disable, and schedule the promotional passenger fare splitting feature, so that I can run limited-time growth campaigns.*
*   **Acceptance Criteria**:
    1.  The admin can turn the feature on or off with a master toggle and set a start/end date.
    2.  The admin can set the single set of percentage splits for the **Promotional Fare** (System, Driver, Upline 1, Upline 2).
    3.  The admin can select which badge(s) are required to qualify for earning during the promotion.
    4.  The system must validate that the promotional percentages add up to 100%.

#### Story 4.4: Admin Badge Management
*As an admin, I want to define the criteria for earning badges, so that I can control the gamification and MLM qualification rules.*
*   **Acceptance Criteria**:
    1.  The admin panel has a section for managing badges.
    2.  The admin can create a new badge with a name and description.
    3.  For each badge, the admin can define the rules for earning it (e.g., "Number of referrals > 10", "Average rating > 4.8").
    4.  The admin can edit or delete existing badge rules.

---

#### Story 4.5: Admin Blog Post Management
*As an admin with content management permissions, I want to create, edit, publish, and delete blog posts through the admin panel, so that I can share news, updates, and success stories with the CABI community.*
*   **Acceptance Criteria**:
    1.  The admin panel must have a "Blog Management" section, accessible only to users with the `blog.manage` permission.
    2.  An admin can create a new blog post with a title, content (using a rich text editor like TinyMCE or CKEditor), a featured image upload, and an author name.
    3.  Posts can be saved with a status of "Draft" or "Published".
    4.  Only posts with a "Published" status are fetched and displayed by the mobile apps.
    5.  The admin can view a list of all posts, filterable by status (Draft/Published).
    6.  The admin can edit any existing post.
    7.  The admin can delete a post (with a confirmation prompt).

---

#### Story 4.5: Admin Blog Post Management
*As an admin with content management permissions, I want to create, edit, publish, and delete blog posts through the admin panel, so that I can share news, updates, and success stories with the CABI community.*
*   **Acceptance Criteria**:
    1.  The admin panel must have a "Blog Management" section, accessible only to users with the `blog.manage` permission.
    2.  An admin can create a new blog post with a title, content (using a rich text editor like TinyMCE or CKEditor), a featured image upload, and an author name.
    3.  Posts can be saved with a status of "Draft" or "Published".
    4.  Only posts with a "Published" status are fetched and displayed by the mobile apps.
    5.  The admin can view a list of all posts, filterable by status (Draft/Published).
    6.  The admin can edit any existing post.
    7.  The admin can delete a post (with a confirmation prompt).

---

#### Story 4.5: Permission Management

#### Story 4.5: Permission Management
*As a Super Admin, I want to create, view, update, and delete specific permissions, so that I can define granular access rights for the platform.*
*   **Acceptance Criteria**:
    1.  The Admin Panel has a "Permissions" section, accessible only to Super Admins.
    2.  A Super Admin can create a new permission with a unique key (e.g., `drivers.approve`) and a human-readable description.
    3.  A Super Admin can view a list of all available permissions.
    4.  A Super Admin can update the description of a permission.
    5.  A Super Admin can delete a permission (with a confirmation prompt, checking if it's in use by any roles).

#### Story 4.6: Role Management (Renumbered from 4.5)
*As a Super Admin, I want to create, view, update, and delete user roles and assign permissions to them, so that I can group access rights for different staff functions.*
*   **Acceptance Criteria**:
    1.  The Admin Panel has a "Roles" section, accessible only to Super Admins.
    2.  A Super Admin can create a new role with a name (e.g., "Support Level 1").
    3.  When creating or editing a role, the Super Admin can select multiple permissions from the list of available permissions to assign to that role.
    4.  A Super Admin can view a list of all roles and the permissions associated with each.
    5.  A Super Admin can update a role's name and its assigned permissions.
    6.  A Super Admin can delete a role (with a confirmation prompt).

#### Story 4.7: Admin User Role Assignment (Renumbered from 4.6)
*As a Super Admin, I want to assign one or more roles to other admin users, so that I can grant them the appropriate level of access.*
*   **Acceptance Criteria**:
    1.  The Admin Panel has a section for managing admin users.
    2.  When creating or editing an admin user, the Super Admin can assign one or more roles from the list of available roles.
    3.  The user's access to features within the admin panel is restricted based on the permissions granted by their assigned roles.
    4.  A user with multiple roles inherits the sum of all permissions from all their roles.

#### Story 4.8: Direct User Permission Assignment (Renumbered from 4.7)
*As a Super Admin, I want to assign or revoke specific, individual permissions for a user, so that I can grant exceptions or one-off access without creating a new role.*
*   **Acceptance Criteria**:
    1.  On an admin user's management page, a Super Admin can view a list of all permissions.
    2.  The view clearly indicates which permissions are inherited from roles and which are assigned directly.
    3.  A Super Admin can explicitly grant a permission to a user, which adds to their existing permissions.
    4.  A Super Admin can explicitly revoke a permission from a user, even if it is granted by one of their roles (a direct deny overrides a role-based grant).
    5.  The user's final set of permissions is the sum of all permissions from their roles, plus any directly granted permissions, minus any directly revoked permissions.

---
    
#### Story 4.10: Direct User Permission Assignment
*As a Super Admin, I want to assign or revoke specific, individual permissions for a user, so that I can grant exceptions or one-off access without creating a new role.*
*   **Acceptance Criteria**:
    1.  On an admin user's management page, a Super Admin can view a list of all permissions.
    2.  The view clearly indicates which permissions are inherited from roles and which are assigned directly.
    3.  A Super Admin can explicitly grant a permission to a user, which adds to their existing permissions.
    4.  A Super Admin can explicitly revoke a permission from a user, even if it is granted by one of their roles (a direct deny overrides a role-based grant).
    5.  The user's final set of permissions is the sum of all permissions from their roles, plus any directly granted permissions, minus any directly revoked permissions.
    
#### Story 4.11: Admin Action Logging
*As a Super Admin, I want a detailed audit log of all significant admin actions, so that I can monitor platform security and changes.*
*   **Acceptance Criteria**:
    1.  The system automatically logs all admin login attempts (successful and failed), including IP address and timestamp.
    2.  The system logs all driver status changes (Approval, Rejection, Request for Correction) and the admin who performed the action.
    3.  The system logs all changes made in the MLM, Promotional, and Badge configuration panels.
    4.  The system logs all changes to roles and permissions.
    5.  A "System Logs" or "Audit Trail" section is available in the Admin Panel, accessible only to Super Admins.
    6.  The log viewer allows for filtering by date range, user, and action type.
    
#### Story 4.12: Admin SOS Incident Dashboard
*As a fleet manager, I want to receive an immediate, high-priority alert in the admin panel when a driver triggers an SOS, so that I can manage the incident in real-time.*
*   **Acceptance Criteria**:
    1.  An audible alarm and a persistent, high-visibility banner appear in the admin panel for any user with the appropriate permission.
    2.  Clicking the banner opens a dedicated "SOS Incident" dashboard.
    3.  The dashboard displays the driver's details, live location on a map, and trip information.
    4.  The dashboard includes a prominent "**Listen In**" button to activate the live audio stream from the driver's phone.
    5.  A "**View Camera**" button is present (and enabled if CCTV integration is available for that vehicle).
    6.  The dashboard displays contact information for the driver's two-tier upline (referrer and referrer's referrer).
    7.  The system sends an automated SMS/push notification to the driver's upline, alerting them to the incident.
    8.  The dashboard includes a log for the admin to record actions taken during the incident.
    
#### Story 4.13: Admin SOS Incident Resolution
*As a fleet manager, after an SOS incident is over, I want to resolve it and classify it as legitimate or misuse, so that I can apply penalties for misuse to discourage false alarms.*
*   **Acceptance Criteria**:
    1.  On the "SOS Incident" dashboard, there is a "Resolve Incident" button.
    2.  Clicking "Resolve Incident" opens a modal asking the admin to classify the incident: "Legitimate Emergency" or "Misuse/False Alarm".
    3.  If "Legitimate Emergency" is selected, the incident is marked as resolved with no penalty.
    4.  If "Misuse/False Alarm" is selected, the system applies the pre-configured penalty to the driver who triggered the SOS.
    5.  The penalty is either a fee charged to the driver's wallet or the revocation of a specific badge, based on the configuration in Story 4.14.
    6.  The incident's resolution status and outcome are logged in the audit trail (Story 4.11).
    
#### Story 4.14: Admin SOS Misuse Penalty Configuration
*As a Super Admin, I want to configure the penalty for SOS button misuse, so that I can control how the system discourages false alarms.*
*   **Acceptance Criteria**:
    1.  In the Admin Panel settings, there is a section for "SOS Configuration".
    2.  The admin can choose the penalty type for misuse: "Fee" or "Revoke Badge".
    3.  If "Fee" is selected, the admin can enter a specific monetary amount to be deducted from the driver's wallet.
    4.  If "Revoke Badge" is selected, the admin can choose a specific badge from the list of available badges (managed in Story 4.4) to be removed from the user.
    5.  The setting is saved and applied to all future misuse incidents.

---

#### Story 4.15: Suspended Account Management
*As an admin, I want to view and manage user accounts that have been suspended due to security flags, so that I can review incidents and reactivate legitimate users.*
*   **Acceptance Criteria**:
    1.  The Admin Panel must have a "Suspended Accounts" section, accessible to users with the appropriate permission.
    2.  This section displays a list of all users with the `SUSPENDED` status.
    3.  The list must show the user's name, phone number, the reason for suspension (e.g., "BIOMETRIC_FAILURE"), and the date of suspension.
    4.  An admin can click a "Reactivate" button next to a user's name.
    5.  Clicking "Reactivate" prompts the admin for confirmation.
    6.  Upon confirmation, the system calls the `POST /admin/users/{userId}/unsuspend` endpoint to change the user's status back to `ACTIVE`.
    7.  The reactivated user is removed from the suspended accounts list.
    8.  The reactivation action, including which admin performed it, must be recorded in the audit log (Story 4.11).

## 4. Next Steps

This PRD is now ready for the next phase of planning.

1.  **Hand off to the UX Expert (`@ux-expert`)**: To create the `front-end-spec.md` which will detail the user flows and wireframes for the Passenger and Driver apps.
2.  **Hand off to the Architect (`@architect`)**: After the UX spec is complete, the Architect will use this PRD and the UX spec to create the `architecture.md` document, detailing the full-stack technical design.