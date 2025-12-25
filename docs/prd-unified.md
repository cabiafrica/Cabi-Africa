# Unified Product Requirements Document: Cabi Ecosystem

| **Status:** | **Draft** |
| --- | --- |
| **Author:** | Mary, Business Analyst |
| **Version:** | 1.0 |
| **Date:** | December 1, 2025 |

---

## 1. Introduction

### 1.1. Purpose of the Document
This Unified Product Requirements Document (PRD) serves as the definitive source of truth for the entire Cabi ecosystem. It details the functional and non-functional requirements across all core applications: the Passenger App, Driver App, Admin Panel, Dispatch System, User Management backend, and the Marketing Website. The purpose is to provide a shared understanding of the product to all stakeholders, guide development, and ensure alignment with business objectives.

### 1.2. Scope of the Project
The Cabi ecosystem encompasses a comprehensive suite of applications designed to facilitate on-demand transportation services, manage a network of drivers, engage with passengers, and provide administrative oversight. The scope includes:
-   **Passenger App:** Mobile application for passengers to book rides, manage payments, and interact with the service.
-   **Driver App:** Mobile application for drivers to accept/manage rides, track earnings, and manage their profile.
-   **Admin Panel:** Web-based interface for platform administrators to manage users, drivers, operations, content, and system configuration.
-   **Dispatch System:** Backend services and tools responsible for matching drivers with passenger requests, managing scheduled rides, and optimizing fleet utilization.
-   **User Management (Backend):** Core services responsible for user authentication, profiles, data privacy, and organizational structures (e.g., driver unions).
-   **Marketing Website:** Public-facing web presence for driver acquisition, brand communication, and direct web booking.

### 1.3. Overall Vision & Goals
**Vision:** To be the leading on-demand transportation platform, known for its efficiency, reliability, safety, and driver/passenger satisfaction, by building a cohesive and innovative digital ecosystem.

**Key Goals:**
-   **Increase User Acquisition & Retention:** Grow the passenger and driver base through seamless onboarding, engaging features, and effective marketing.
-   **Optimize Operational Efficiency:** Streamline ride matching, dispatch, and administrative tasks to reduce costs and improve service delivery.
-   **Enhance User Experience:** Provide intuitive, performant, and reliable applications for both passengers and drivers.
-   **Ensure Platform Safety & Security:** Implement robust measures to protect user data, ensure ride safety, and maintain system integrity.
-   **Comply with Regulations:** Adhere to all relevant data privacy, transportation, and labor laws.
-   **Foster Driver Community & Incentives:** Support drivers through fair compensation models, referral programs, and organizational structures like unions.

### 1.4. Key Stakeholders
-   **Product Owners/Managers:** Define features, prioritize backlog.
-   **Business Analysts (Mary):** Elicit, analyze, and document requirements.
-   **Solutions Architects/Tech Leads:** Design system architecture and technical solutions.
-   **Development Teams:** Implement features across all applications.
-   **Quality Assurance (QA) Teams:** Ensure quality, test features, and verify requirements.
-   **Operations Team:** Manage day-to-day platform activities, driver support, and dispatch.
-   **Marketing Team:** Drive user acquisition and brand awareness.
-   **Legal & Compliance:** Ensure adherence to regulations.
-   **End-Users:** Passengers and Drivers using the Cabi platform.

---

## 2. Functional Requirements

### 2.1. Passenger App

**Core Ride Booking & Management:**
-   **Homepage Redesign:** Intuitive home screen with primary focus on destination input; prominent shortcuts for "Home" and "Work".
-   **Vehicle Type Selection:** Ability to choose from different vehicle types (e.g., "Standard", "XL") with estimated fares and capacities.
-   **Scheduled Rides:** Option to schedule rides for a future date/time, with business rule enforcement (e.g., min/max time in advance).
-   **Trip History:** View past trips with detailed information (route map, driver/vehicle, fare breakdown).

**Convenience & Personalization:**
-   **Saved Routes:** Ability to save frequent routes as one-tap shortcuts on the home screen.
-   **Pickup Notes:** Provide specific instructions/notes for the driver.
-   **Calendar Integration:** Integrate with personal calendars for ride planning.
-   **Order Ahead (Food/Services):** Functionality to order food or other services in advance.
-   **Saved Places:** Custom icons for saved places.
-   **Favorite Drivers:** Mark drivers as favorites for potential re-booking.
-   **Ride Preferences:** Set preferences for quiet rides, music, temperature.
-   **Block User:** Ability to block unwanted users.
-   **Adaptive Home Screen:** Home screen adapts based on user behavior.

**Engagement & Gamification:**
-   **Passenger Leaderboards:** Anonymized leaderboards for non-sensitive metrics (e.g., "Most Trips Taken").
-   **Year in Review:** Personalized summaries of ride activity.
-   **Group Location Sharing:** Share live location with selected groups.

**Payments & Promotions:**
-   **Payment Method Management:** Add, view, remove payment methods (credit cards, digital wallets); set default payment method.
-   **Fare Splitting:** Split fare with other passengers.
-   **Promotions & Discounts:** Apply promo codes, view promo wallet, auto-apply discounts.
-   **Tipping:** Pre-trip, post-trip tipping options; round-up-to-tip.

**Safety & Support:**
-   **SOS Button:** In-app emergency SOS button.
-   **Share Trip Status:** Share live trip details with trusted contacts.
-   **In-App Help Center:** Access FAQs and help articles categorized by topic.
-   **Create Support Ticket:** Ability to submit support tickets within the app.
-   **Lost and Found:** Report lost items and track their return.
-   **Report Incorrect Fare:** Report discrepancies in fare.
-   **Trip Check-in Safety:** Automated check-ins during trips.

**UI/UX Enhancements:**
-   **Home Screen Redesign:** Focus on faster booking.
-   **Dark Mode:** Theme option for low-light conditions.
-   **Haptic Feedback:** Tactile responses for interactions.
-   **Animated Vehicle Icons:** Visual flair during ride tracking.
-   **Widgets:** Device home screen widgets for quick actions.
-   **Trip History Filtering:** Filter and sort past trips.

### 2.2. Driver App

**Core Trip Management & Navigation:**
-   **Home Screen Redesign:** Cleaner, more intuitive home screen prioritizing online status, current earnings, and map access.
-   **Driver Availability Toggle:** Ability to switch between online/offline status.
-   **In-App Navigation:** Display map, speed limit, and provide turn-by-turn guidance.
-   **Passenger Profile View:** Ability to view passenger's profile information during a trip.
-   **Real-time Location Updates:** Provide accurate location to passengers.
-   **Ride Request Modal:** Receive and accept/decline ride requests.
-   **Destination Mode:** Set a destination to receive rides heading in that direction.
-   **Long Trip Preference:** Indicate preference for longer trips.
-   **Back-to-Back Trips:** Option to receive new trip requests while finishing a current one.
-   **Decline Reasons:** Provide reasons for declining a trip.
-   **Break Time:** Manage break times during shifts.
-   **Area Preference:** Set preferred driving areas.
-   **Scheduled Ride Acceptance:** View and accept pre-booked scheduled rides.
-   **On the Way to Pickup:** Status and UI for driver en route to passenger pickup.

**Earnings, Payouts & Financial Tools:**
-   **Detailed Trip View:** View past trips with detailed earnings breakdown (Base Fare, Tip, Bonus, Commission, Final Earnings, route map, date, time, distance, duration).
-   **Earnings Goal Setting:** Set and track earnings goals.
-   **Expense Tracking:** In-app tools for tracking expenses.
-   **Instant Payouts:** Request immediate payout of earnings.
-   **Tax Savings Tool:** Tools or integrations to assist with tax savings.
-   **Earnings Forecast:** View predicted earnings.
-   **Earnings History & Trends:** Detailed history and analytical view of earnings over time.
-   **Accounting Integration:** Integration with accounting software.
-   **Downloadable Statements:** Access to financial statements.
-   **Pay for Fuel:** Integrated payment solutions for fuel.
-   **MLM Commission Payouts:** Receive commissions from ride fares (from referred drivers) and registration fees (from referred drivers).

**Onboarding & Profile Management:**
-   **Driver Document Submission:** Submit required documents (license, insurance, etc.) via the app.
-   **Vehicle Registration:** Register and manage vehicle details.
-   **In-App Onboarding Tutorial:** Guided tour for new drivers.
-   **Driver Profile Bio:** Customize public-facing driver profile.
-   **Multi-Vehicle Management:** Manage multiple registered vehicles.

**Engagement, Incentives & Community:**
-   **Loyalty Points & Store:** Earn and redeem loyalty points.
-   **Driver Training:** Access training modules.
-   **Driver-to-Driver Tipping:** Tip other drivers.
-   **Driver Stories/Forums:** Community features.
-   **Leaderboards & Achievements:** Gamification features to recognize performance.
-   **Driver Challenges:** Participate in individual and team challenges.
-   **Consecutive Trips Bonus:** Incentives for completing multiple trips in a row.
-   **Peak Hours Bonus:** Incentives for driving during peak times.
-   **Guaranteed Earnings Incentive:** Program for minimum earnings.
-   **Driver Store:** Access to a store for driver-related products.
-   **Break Reminders:** Prompts for drivers to take breaks.
-   **Driver Destinations:** Set preferred driving areas/destinations for trips.
-   **Driver Unions/Organizations:** View organization announcements and status (from `story-120.1`).
-   **Driver Referral Program:** Refer new drivers and earn bonuses based on their performance.

**Safety & Wellness:**
-   **SOS Button:** In-app emergency SOS button.
-   **Driver Hours Tracking:** Track driving hours for compliance and fatigue management.
-   **In-App Mindfulness Content:** Access to wellness resources.
-   **Fatigue Detection:** System to detect driver fatigue.

**UI/UX Enhancements:**
-   **Dark Mode:** Theme option.
-   **Navigation Preference:** Select preferred navigation app.
-   **Landscape Mode:** Support for landscape orientation.
-   **Speed Limit Display:** Show current speed limit.
-   **Earnings by Time:** Visual display of earnings over time.

### 2.3. Admin Panel

**User & Permissions Management:**
-   **Role-Based Access Control (RBAC):** Implement granular permissions for admin users.
-   **Admin Read-Only Role:** Grant read-only access to the admin panel for specific users; all modifying actions disabled/hidden; backend API enforcement.
-   **Admin Action Audit Log:** Track all actions performed by administrators.
-   **Admin 2FA:** Two-factor authentication for admin users.
-   **Manual User Suspension:** Ability to manually suspend user accounts.
-   **Impersonation:** Ability to impersonate users for support or testing.

**Operational Dashboards & Tools:**
-   **Driver Document Expiry Warnings:** Dashboard widget showing drivers with documents expiring within 30 days, with navigation to driver document page.
-   **Admin Global Search:** Search across various entities (users, rides, documents, etc.).
-   **Admin User Detail View:** Comprehensive view of individual user profiles.
-   **City Management Dashboard:** Tools for managing city-specific operations and configurations.
-   **Heat Map Analytics:** Visualize demand and supply patterns.
-   **Simulation Mode:** Simulate scenarios for testing or planning.
-   **Admin Bulk Messaging:** Send messages to groups of users.
-   **Admin Bulk Actions:** Perform mass actions on users or other entities.
-   **Saved Messages:** Pre-defined message templates for common communications.

**Reporting & Analytics:**
-   **Admin Dashboard:** High-level overview of key platform metrics.
-   **Driver Performance Reports:** Track and analyze driver performance metrics.
-   **Financial Reports:** Generate and view financial summaries.
-   **Passenger Reports:** Analyze passenger behavior and demographics.
-   **Heatmap Reports:** Detailed reports based on heatmap data.
-   **Admin Audit Log:** Detailed logs of all admin activities.
-   **Promo Code LTV Report:** Lifetime value reporting for promo codes.
-   **Driver Metrics Report:** Specific reports on driver acceptance/cancellation rates, online hours, etc.
-   **Support Ticket Report:** Analytics on customer support interactions.

**Content & Configuration Management:**
-   **Content Management System:** Section for creating, editing, and organizing help articles (for in-app help center) and blog posts (for marketing website).
-   **Admin Featured Content UI:** Manage featured content on various platforms.
-   **Admin Surge Zones:** Map-based interface to define and manage geographic surge pricing zones.
-   **Admin Incentive Dashboard:** Create and manage driver incentives.
-   **Admin Manual Bonus:** Manually issue bonuses to drivers.
-   **Admin Incentive Analytics:** Track performance of incentive programs.
-   **Admin Manage Payout Methods:** Manage payment methods for payouts.
-   **Admin Configure MLM Fee Distribution:** Set and modify the formula for MLM registration fee distribution.
-   **Admin Manage Vehicle Categories:** Define and manage different vehicle types.
-   **Admin Promo Codes:** Create, manage, and track promo codes.
-   **Admin Scheduled Rides Management:** Oversee and manage all scheduled rides.

**Customer Support Management:**
-   **Admin Manage Support Tickets:** View, update, and resolve support tickets.
-   **Admin Support Chat Interface:** Directly communicate with users via chat.
-   **Admin Feedback Management:** Review and manage user feedback.
-   **Automated Ticket Tagging:** System for categorizing support requests.
-   **Support Ticket Merging:** Merge related support tickets.
-   **Support SLA Tracking:** Monitor Service Level Agreement adherence for support.
-   **Canned Responses for Agents:** Pre-defined responses for support agents.
-   **Proactive Support Outreach:** Tools for initiating support contact.
-   **Agent Performance Dashboard:** Monitor support agent performance.
-   **Knowledge Base Integration:** Integrate with external knowledge bases.
-   **Self-Service Refunds:** Allow users to initiate refunds.
-   **Feedback Management Dashboard:** Central dashboard for all user feedback.

**Organization Management:**
-   **Review and Approve Driver Organizations:** Verify and activate driver organizations (unions).
-   **Organization Audit Log:** Track changes and activities within organizations.
-   **Organization Member Removal:** Ability to remove members from an organization.
-   **Organization Dissolution:** Process for dissolving an organization.

### 2.4. User Management

**Core User Accounts & Profiles:**
-   **User Registration:** Create new user accounts (for both passengers and drivers).
-   **Login & Authentication:** Secure user login, password management (change, forgot password flow).
-   **User Profile Picture:** Upload and manage user profile pictures.
-   **Self-Serve Account Deletion:** Allow users to permanently delete their accounts and associated data with a multi-step confirmation process.
-   **User Activity Log:** Track user actions for auditing and security.
-   **Referrer Tracking:** Store and manage referrer relationships for MLM and other referral programs.
-   **User Roles Management:** Support multiple roles for a single user (e.g., driver, founder of an organization, leader board member).

**Data Privacy & Compliance:**
-   **Download My Data:** Enable users to request and download all their personal data in a machine-readable format.
-   **Granular Privacy Controls:** Allow users to manage specific privacy settings (e.g., location sharing, ad personalization).
-   **Privacy Policy Versioning:** Track and manage different versions of the privacy policy.
-   **Data Retention Policies:** Implement and enforce policies for data retention.
-   **Privacy Center:** A dedicated section for users to manage all privacy-related settings and information.
-   **Privacy Policy Acceptance Log:** Record user acceptance of privacy policies.
-   **Anonymized Analytics:** Ensure user data is anonymized for analytical purposes.
-   **Incognito Mode:** Option for users to use the service without personal data tracking.
-   **Ad Personalization Controls:** Allow users to opt-in/out of ad personalization.
-   **Location Sharing Controls:** Manage sharing of real-time location data.
-   **Manage Marketing Communications:** Allow users to control their marketing communication preferences.

**User Groups & Organizations:**
-   **Driver Organization Foundation:** Support the creation and management of Driver Organizations (e.g., unions) with registration, admin approval, and leadership teams.
-   **Subgroup Management:** Allow leadership teams to create and manage hierarchical subgroups within organizations.
-   **MLM Referral System:** Implement the backend logic for multi-level referral systems, including tracking referrer chains and managing fee distribution.
-   **Driver Organization Join Flow:** Enable drivers to request to join an organization, with approval/rejection by organization admins.
-   **Organization Member Removal:** Functionality for leadership teams to remove members.
-   **Organization Audit Log:** Log activities within an organization.
-   **Organization Certificate Expiration Handling:** Manage expiration of organization registration certificates.
-   **Founder Succession Flow:** Process for transferring founder role.
-   **User Voluntary Leave:** Process for users to leave an organization.

### 2.5. Dispatch System

**Ride Matching & Assignment:**
-   **Automatic Job Assignments:** System to automatically assign incoming ride requests to eligible drivers based on various factors.
-   **Driver Scoring for Assignments:** Implement a scoring mechanism for drivers that influences job assignment (e.g., based on rating, acceptance rate).
-   **Job Offer Rejection Cascade:** If a driver rejects a job, the system automatically offers it to the next suitable driver.
-   **Penalize Timeouts in Scoring:** Drivers who do not respond to job offers within a set time negatively impact their assignment scoring.

**Scheduled Ride Management:**
-   **Dispatching Scheduled Rides:** Backend logic to manage and assign pre-booked rides at the appropriate time.
-   **Admin Management of Scheduled Rides:** Admin panel interface to view, modify, or reassign scheduled rides.

**Airport Operations:**
-   **Airport-Specific Pickup Zones:** Define and manage designated pickup zones within airports (terminals, gates, doors).
-   **Virtual Queue Management:** Manage a virtual queue for drivers waiting for rides at airports.
-   **Airport Rematching:** Logic for efficiently re-matching drivers and passengers in case of cancellations or changes at airports.

**Operational Efficiency & Optimization:**
-   **Surge Zone Integration:** Utilize defined surge zones (from admin panel) to influence driver availability and passenger demand, thereby impacting dispatch.
-   **Heatmap Data Utilization:** Integrate heatmap data to predict demand and proactively dispatch drivers.

### 2.6. Marketing Website

**Brand Communication & Content Marketing:**
-   **Homepage:** Compelling marketing copy, driver testimonials, and clear calls-to-action (CTAs).
-   **About Us Page:** Details Cabi's mission and values.
-   **Why Drive with Us? Page:** Highlights benefits, earning potential, and flexibility for prospective drivers.
-   **Public-Facing Blog:** A blog integrated with the marketing website for publishing articles, company news, and feature announcements.
-   **Content Management (Admin):** Backend tools in the Admin Panel for writing, editing, publishing blog posts, and managing other marketing content.
-   **Comprehensive FAQ Section:** Answers to common questions for both drivers and passengers.

**Driver Acquisition Funnel:**
-   **Multi-Step Web Registration:** A web-based form for initial driver registration (Name, Email, Phone, City).
-   **Referrer Code Input:** Option for new registrants to enter a referral code.
-   **Prospect Status:** New registrations create a user account in the backend with a "Prospect" status.
-   **Registration Fee Collection:** Collection of a driver registration fee as part of the MLM process.
-   **Seamless App Hand-off:** Secure transfer of user session/credentials from the website to the mobile app for further onboarding.
-   **Driver Referral Program Landing Page:** Dedicated landing pages for driver referral programs.

**User Acquisition & Referral Programs:**
-   **Passenger Referral Program Landing Page:** Dedicated landing page for passenger referral programs.
-   **Social Sharing Tools:** Enhanced options for sharing referral codes/links.

**Web Booking & Services:**
-   **Web Booking Widget:** Allow users to book a ride directly from the main website (without needing the app).
-   **Login/Signup for Web Booking:** Users can log in or sign up directly through the web booking interface.
-   **Vehicle Type Selection (Web):** Similar to the app, allowing users to choose vehicle types for web bookings.
-   **Real-time Ride Tracking (Web):** Display driver's location and ETA on the web page after booking.

**Accessibility & Performance:**
-   **Voice Commands Support:** Integration for voice commands.
-   **High-Contrast Mode:** UI option for improved accessibility.
-   **Screen Reader Support:** Compatibility with screen reader technologies.
-   **Optimized for SEO & Speed:** Designed for high PageSpeed scores and search engine visibility.

---

## 3. Non-Functional Requirements (NFRs)

The following non-functional requirements apply across the entire Cabi ecosystem, where applicable, to ensure a robust, secure, and performant platform.

### 3.1. Performance
-   **Responsiveness:** All user-facing applications (Passenger App, Driver App, Marketing Website) must load and respond to user actions within acceptable timeframes (e.g., <2 seconds for critical interactions, <5 seconds for page loads on average network conditions).
-   **Throughput:** Backend services must be capable of handling peak transaction volumes without degradation in performance.
-   **Scalability:** The system architecture must be horizontally scalable to accommodate growth in user base, transaction volume, and data storage.
-   **Page Load Speed (Marketing Website):** The Marketing Website must achieve a Google PageSpeed score of 85 or higher for mobile and desktop.

### 3.2. Security
-   **Data Protection:** All sensitive user data must be encrypted in transit and at rest.
-   **Authentication & Authorization:** Robust authentication (e.g., OAuth2, JWT) and granular authorization mechanisms must be implemented across all applications and APIs. Multi-Factor Authentication (MFA) must be supported, especially for admin users.
-   **Vulnerability Management:** Regular security audits, penetration testing, and dependency scanning must be conducted.
-   **Bot Protection:** User-facing forms (e.g., registration) must be protected against automated bot submissions (e.g., using reCAPTCHA).
-   **PCI Compliance:** Handling of payment information must adhere to PCI DSS standards.

### 3.3. Reliability & Availability
-   **Uptime:** Critical services (e.g., ride booking, payment processing) must maintain high availability (e.g., 99.9% uptime).
-   **Error Handling:** The system must gracefully handle errors, providing informative feedback to users and detailed logs for operators.
-   **Disaster Recovery:** A robust disaster recovery plan must be in place to ensure business continuity.

### 3.4. Usability (UX)
-   **Intuitive Interfaces:** All applications must provide intuitive and easy-to-use interfaces tailored to their respective user types.
-   **Consistency:** Consistent design language, navigation patterns, and user flows across all applications.
-   **Feedback:** Users must receive clear and timely feedback on their actions and system status.

### 3.5. Accessibility
-   **WCAG Compliance:** All user-facing applications (especially web) must comply with WCAG 2.1 AA standards.
-   **Screen Reader Support:** Applications must be compatible with screen reader technologies.
-   **High-Contrast Mode:** UI options for users with visual impairments.

### 3.6. Maintainability & Extensibility
-   **Modular Architecture:** The system must be built with a modular, microservices-oriented architecture to facilitate independent development, deployment, and scaling of components.
-   **Code Quality:** Adherence to established coding standards, comprehensive testing, and clear documentation.
-   **Configurability:** Key business rules (e.g., pricing, referral formulas, incentives) should be configurable via admin tools without requiring code deployments.

### 3.7. Compliance
-   **Data Privacy Regulations:** Full compliance with global data privacy regulations (e.g., GDPR, CCPA) including "Right to be Forgotten" and "Data Portability".
-   **Local Transportation Regulations:** Adherence to all local and regional transportation and labor laws.

---

## 4. High-Level Data Models

This section outlines the core entities within the Cabi ecosystem and their primary relationships. Detailed schema definitions will be provided in the Architecture Document.

### 4.1. User (Core Identity)
-   **Purpose:** Centralized representation of any individual interacting with the Cabi platform (passenger, driver, admin, organization founder/leader).
-   **Key Attributes:** Unique ID, email, authentication credentials, creation/update timestamps.
-   **Relationships:**
    -   One-to-one with `PassengerProfile` (optional)
    -   One-to-one with `DriverProfile` (optional)
    -   Many-to-one with `Organization` (as a member)
    -   Self-referencing for referral relationships (`referrerId`)

### 4.2. PassengerProfile
-   **Purpose:** Stores passenger-specific data and preferences.
-   **Key Attributes:** User ID (FK), name, phone, payment methods (linked), saved places/routes, ride preferences.
-   **Relationships:**
    -   One-to-one with `User`
    -   One-to-many with `Ride` (as a passenger)

### 4.3. DriverProfile
-   **Purpose:** Stores driver-specific data, application status, and operational details.
-   **Key Attributes:** User ID (FK), name, phone, city, application status, vehicle details (linked), documents (linked), referral code, referrer ID.
-   **Relationships:**
    -   One-to-one with `User`
    -   One-to-many with `Ride` (as a driver)
    -   Many-to-one with `Organization` (as a member of a driver organization/union)

### 4.4. Ride
-   **Purpose:** Represents a single ride transaction between a passenger and a driver.
-   **Key Attributes:** Ride ID, passenger ID (FK), driver ID (FK), pickup/destination (coordinates, addresses), timestamp, status, fare details, vehicle type.
-   **Relationships:**
    -   Many-to-one with `PassengerProfile`
    -   Many-to-one with `DriverProfile`

### 4.5. Organization (e.g., Driver Union, Fleet)
-   **Purpose:** Represents a group of drivers, enabling collective management, communication, and specialized programs (e.g., unions, fleets).
-   **Key Attributes:** Organization ID, name, status (pending, active), founder ID (FK), leadership team (list of User IDs), verification documents.
-   **Relationships:**
    -   One-to-many with `DriverProfile` (members)
    -   One-to-many with `Subgroup`

### 4.6. Subgroup
-   **Purpose:** Represents a smaller, hierarchical group within a larger `Organization`.
-   **Key Attributes:** Subgroup ID, Organization ID (FK), name, description.
-   **Relationships:**
    -   Many-to-one with `Organization`
    -   Many-to-many with `User` (members of subgroup)

### 4.7. PaymentMethod
-   **Purpose:** Stores tokenized payment instrument details for users.
-   **Key Attributes:** Payment Method ID, User ID (FK), type (card, digital wallet), last 4 digits (masked), expiry, default status.
-   **Relationships:**
    -   Many-to-one with `User`

### 4.8. Document
-   **Purpose:** Stores metadata about driver-submitted documents (e.g., license, insurance).
-   **Key Attributes:** Document ID, Driver Profile ID (FK), type, expiry date, status (pending, approved, rejected).
-   **Relationships:**
    -   Many-to-one with `DriverProfile`

### 4.9. Referral
-   **Purpose:** Tracks referral relationships and associated rewards/bonuses.
-   **Key Attributes:** Referral ID, referrer ID (FK), referred user ID (FK), referral code used, status (pending, completed, paid), reward details.
-   **Relationships:**
    -   Many-to-one with `User` (referrer)
    -   One-to-one with `User` (referred)

### 4.10. MLMFeeFormula & RegistrationFeeLedger
-   **Purpose:** Define the rules for MLM fee distribution and log individual fee transactions.
-   **Key Attributes:**
    *   `MLMFeeFormula`: Recipient type (system, referrer, upline), value, rule type (fixed, percentage), upline level.
    *   `RegistrationFeeLedger`: New driver ID (FK), recipient ID (FK), amount, total registration fee, timestamp.
-   **Relationships:**
    *   `RegistrationFeeLedger` links to `User` for new driver and recipient.
