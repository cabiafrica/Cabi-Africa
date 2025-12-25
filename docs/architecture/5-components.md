# 5. Components

## 5.1. Component List

*   **5.1.1. Cabi Marketing Website (Frontend)**
    *   **Responsibility:** Serve engaging marketing content, provide information to prospective drivers, and facilitate the initial web-based driver registration form. Handle user interaction and seamlessly hand off to the mobile app for further onboarding. This is the user-facing web application.
    *   **Key Interfaces:**
        *   User-facing web pages (static/SSR/SSG generated content).
        *   `POST /api/register-lead` (API endpoint within Next.js for submitting prospect data to `Driver Lead Service`).
        *   Deep linking to Cabi Driver App (via specific URL schemes or universal links).
    *   **Dependencies:** `Driver Lead Service` (via API Gateway), CDN for serving static assets.
    *   **Technology Stack:** Next.js (React), Tailwind CSS.
    *   *For detailed frontend architecture, see: [Cabi Marketing Website Frontend Architecture Document](ui-architecture.md)*

*   **5.1.2. Driver Lead Service (Backend)**
    *   **Responsibility:** Handle the initial driver registration process originating from the marketing website. Validate incoming prospect data, interact with the `User Management Service` to create/update user entities, and notify the `MLM Service` upon successful registration.
    *   **Key Interfaces:**
        *   `POST /driver-leads/register`: Accepts prospect registration data.
    *   **Dependencies:** `User Management Service`, `MLM Service`.
    *   **Technology Stack:** NestJS (Node.js/TypeScript), Prisma (ORM).

*   **5.1.3. MLM Service (Backend)**
    *   **Responsibility:** Manages MLM logic, including referral tracking, driver group/subgroup hierarchies, and the calculation and distribution of registration fees based on admin-configured formulas.
    *   **Key Interfaces:**
        *   `POST /mlm/distribute-fee`: Triggered upon a new driver registration to distribute the fee.
        *   `GET /admin/mlm/formula`: Retrieves the current fee distribution formula.
        *   `PUT /admin/mlm/formula`: Updates the fee distribution formula.
        *   `GET /admin/driver-groups`: Manages driver group hierarchies.
    *   **Dependencies:** `User Management Service`, `Cabi Database`.
    *   **Technology Stack:** NestJS (Node.js/TypeScript), Prisma (ORM).

*   **5.1.4. Existing User Management Service (Backend)**
    *   **Responsibility:** Centralized management of all user accounts and their hierarchical relationships (e.g., parent/child links for MLM) across Cabi platforms.
    *   **Key Interfaces:** (Assumed existing APIs, potentially with new endpoints for hierarchy management)
        *   `POST /users`: Creates a new `User` record.
        *   `PUT /users/:id`: Updates an existing `User` record.
        *   `POST /driver-groups`: Manages driver group hierarchies.
    *   **Dependencies:** `Cabi Database`.
    *   **Technology Stack:** (Assumed existing - e.g., Node.js/TypeScript, Java, Python).

*   **5.1.5. Existing Authentication Service (Backend)**
    *   **Responsibility:** Manages user authentication and authorization.
    *   **Key Interfaces:** (Assumed existing APIs)
        *   `POST /auth/login`: Authenticates a user.
    *   **Dependencies:** `Cabi Database`, `User Management Service`.
    *   **Technology Stack:** (Assumed existing - e.g., Node.js/TypeScript, Java, Python).

*   **5.1.6. API Gateway (Infrastructure)**
    *   **Responsibility:** Acts as a unified, secure entry point for all external client requests to backend services.
    *   **Key Interfaces:** Routes traffic to `Driver Lead Service`, `MLM Service`, `User Management Service`, etc.
    *   **Dependencies:** All backend services.
    *   **Technology Stack:** AWS API Gateway.

## 5.2. Component Diagrams

```mermaid
graph LR
    subgraph Frontend
        A[Cabi Marketing Website]
    end

    subgraph Backend Services (Existing & New)
        direction LR
        B(API Gateway) --> C(Driver Lead Service)
        C --> D(User Management Service)
        D --> E(Authentication Service)
        C -- Notifies --> I(MLM Service)
        I -- Reads Hierarchy --> D
        D -- Reads/Writes --> F[Cabi Database]
        E -- Reads/Writes --> F
        I -- Records Data --> F
    end

    subgraph Mobile Application
        G[Cabi Driver App]
    end

    A -- (1) Submit Registration --> B
    B -- (2) Route to --> C
    C -- (3) Create User & Assign Group/Upline --> D
    D -- (4) Store User, Group & Hierarchy --> F
    C -- (5) Trigger Fee Distribution --> I
    I -- (6) Calculate & Record Commissions --> F
    A -- (7) Deep Link --> G
    G -- (8) Authenticate User --> E
```
*   **Flow:**
    1.  User submits registration form on the Marketing Website.
    2.  Request goes through the API Gateway and is routed to the new Driver Lead Service.
    3.  The Driver Lead Service interacts with the existing User Management Service to create a new user, link them to their referrer, and assign them to an appropriate driver group.
    4.  User Management Service stores this information in the Cabi Database.
    5.  The `Driver Lead Service` notifies the `MLM Service` to handle fee distribution.
    6.  The `MLM Service` reads the hierarchy, calculates commissions, and records them in the database.
    7.  The Marketing Website deep links the user to the Cabi Driver App.
    8.  The Driver App authenticates the user.
