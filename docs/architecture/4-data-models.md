# 4. Data Models

**Rationale:**
This section defines the core data entities required for the driver acquisition funnel. The design is based on the PRD, which specifies the need to capture prospective driver information and create a "Prospect" account. The proposed structure separates core user identity from driver-specific data, promoting a clean, scalable, and maintainable design that integrates with the existing Cabi user ecosystem.

## 4.1. User

**Purpose:** Represents a core identity within the Cabi ecosystem. This central model holds authentication-related information and is linked to various role-specific profiles (e.g., Driver, Passenger). A new account will be created in this table for each driver prospect.

**Key Attributes:**
*   `id`: `UUID` - Unique primary key for the user.
*   `email`: `String` - The user's email address (must be unique).
*   `passwordHash`: `String` - Hashed password for the user. This may be null initially if the prospect signs up via a passwordless flow, to be set later.
*   `createdAt`: `DateTime` - Timestamp of user creation.

**Relationships:**
*   Has one `DriverProfile` (a User can be a Driver).

## 4.2. DriverProfile

**Purpose:** Stores all information related to a driver's application journey and their professional details once active. This model will be created with a status of `PROSPECT` upon successful submission of the marketing website's registration form.

**Key Attributes:**
*   `id`: `UUID` - Unique primary key for the profile.
*   `userId`: `UUID` - A foreign key linking directly to the `User` model.
*   `firstName`: `String` - The prospect's first name.
*   `lastName`: `String` - The prospect's last name.
*   `phone`: `String` - The prospect's phone number.
*   `city`: `String` - The city where the prospect intends to drive.
*   `applicationStatus`: `Enum` - The current status of the driver's application. (e.g., `PROSPECT`, `PENDING_DOCUMENTS`, `ACTIVE`, `REJECTED`).
*   `referralCode`: `String` - A unique code assigned to the driver for referrals (can be nullable).
*   `createdAt`: `DateTime` - Timestamp of profile creation.

**Relationships:**
*   Belongs to one `User`.
