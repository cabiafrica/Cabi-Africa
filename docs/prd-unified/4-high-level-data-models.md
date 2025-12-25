# 4. High-Level Data Models

This section outlines the core entities within the Cabi ecosystem and their primary relationships. Detailed schema definitions will be provided in the Architecture Document.

## 4.1. User (Core Identity)
-   **Purpose:** Centralized representation of any individual interacting with the Cabi platform (passenger, driver, admin, organization founder/leader).
-   **Key Attributes:** Unique ID, email, authentication credentials, creation/update timestamps.
-   **Relationships:**
    -   One-to-one with `PassengerProfile` (optional)
    -   One-to-one with `DriverProfile` (optional)
    -   Many-to-one with `Organization` (as a member)
    -   Self-referencing for referral relationships (`referrerId`)

## 4.2. PassengerProfile
-   **Purpose:** Stores passenger-specific data and preferences.
-   **Key Attributes:** User ID (FK), name, phone, payment methods (linked), saved places/routes, ride preferences.
-   **Relationships:**
    -   One-to-one with `User`
    -   One-to-many with `Ride` (as a passenger)

## 4.3. DriverProfile
-   **Purpose:** Stores driver-specific data, application status, and operational details.
-   **Key Attributes:** User ID (FK), name, phone, city, application status, vehicle details (linked), documents (linked), referral code, referrer ID.
-   **Relationships:**
    -   One-to-one with `User`
    -   One-to-many with `Ride` (as a driver)
    -   Many-to-one with `Organization` (as a member of a driver organization/union)

## 4.4. Ride
-   **Purpose:** Represents a single ride transaction between a passenger and a driver.
-   **Key Attributes:** Ride ID, passenger ID (FK), driver ID (FK), pickup/destination (coordinates, addresses), timestamp, status, fare details, vehicle type.
-   **Relationships:**
    -   Many-to-one with `PassengerProfile`
    -   Many-to-one with `DriverProfile`

## 4.5. Organization (e.g., Driver Union, Fleet)
-   **Purpose:** Represents a group of drivers, enabling collective management, communication, and specialized programs (e.g., unions, fleets).
-   **Key Attributes:** Organization ID, name, status (pending, active), founder ID (FK), leadership team (list of User IDs), verification documents.
-   **Relationships:**
    -   One-to-many with `DriverProfile` (members)
    -   One-to-many with `Subgroup`

## 4.6. Subgroup
-   **Purpose:** Represents a smaller, hierarchical group within a larger `Organization`.
-   **Key Attributes:** Subgroup ID, Organization ID (FK), name, description.
-   **Relationships:**
    -   Many-to-one with `Organization`
    -   Many-to-many with `User` (members of subgroup)

## 4.7. PaymentMethod
-   **Purpose:** Stores tokenized payment instrument details for users.
-   **Key Attributes:** Payment Method ID, User ID (FK), type (card, digital wallet), last 4 digits (masked), expiry, default status.
-   **Relationships:**
    -   Many-to-one with `User`

## 4.8. Document
-   **Purpose:** Stores metadata about driver-submitted documents (e.g., license, insurance).
-   **Key Attributes:** Document ID, Driver Profile ID (FK), type, expiry date, status (pending, approved, rejected).
-   **Relationships:**
    -   Many-to-one with `DriverProfile`

## 4.9. Referral
-   **Purpose:** Tracks referral relationships and associated rewards/bonuses.
-   **Key Attributes:** Referral ID, referrer ID (FK), referred user ID (FK), referral code used, status (pending, completed, paid), reward details.
-   **Relationships:**
    -   Many-to-one with `User` (referrer)
    -   One-to-one with `User` (referred)

## 4.10. MLMFeeFormula & RegistrationFeeLedger
-   **Purpose:** Define the rules for MLM fee distribution and log individual fee transactions.
-   **Key Attributes:**
    *   `MLMFeeFormula`: Recipient type (system, referrer, upline), value, rule type (fixed, percentage), upline level.
    *   `RegistrationFeeLedger`: New driver ID (FK), recipient ID (FK), amount, total registration fee, timestamp.
-   **Relationships:**
    *   `RegistrationFeeLedger` links to `User` for new driver and recipient.
