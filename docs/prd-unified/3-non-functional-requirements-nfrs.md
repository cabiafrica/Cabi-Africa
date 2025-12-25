# 3. Non-Functional Requirements (NFRs)

The following non-functional requirements apply across the entire Cabi ecosystem, where applicable, to ensure a robust, secure, and performant platform.

## 3.1. Performance
-   **Responsiveness:** All user-facing applications (Passenger App, Driver App, Marketing Website) must load and respond to user actions within acceptable timeframes (e.g., <2 seconds for critical interactions, <5 seconds for page loads on average network conditions).
-   **Throughput:** Backend services must be capable of handling peak transaction volumes without degradation in performance.
-   **Scalability:** The system architecture must be horizontally scalable to accommodate growth in user base, transaction volume, and data storage.
-   **Page Load Speed (Marketing Website):** The Marketing Website must achieve a Google PageSpeed score of 85 or higher for mobile and desktop.

## 3.2. Security
-   **Data Protection:** All sensitive user data must be encrypted in transit and at rest.
-   **Authentication & Authorization:** Robust authentication (e.g., OAuth2, JWT) and granular authorization mechanisms must be implemented across all applications and APIs. Multi-Factor Authentication (MFA) must be supported, especially for admin users.
-   **Vulnerability Management:** Regular security audits, penetration testing, and dependency scanning must be conducted.
-   **Bot Protection:** User-facing forms (e.g., registration) must be protected against automated bot submissions (e.g., using reCAPTCHA).
-   **PCI Compliance:** Handling of payment information must adhere to PCI DSS standards.

## 3.3. Reliability & Availability
-   **Uptime:** Critical services (e.g., ride booking, payment processing) must maintain high availability (e.g., 99.9% uptime).
-   **Error Handling:** The system must gracefully handle errors, providing informative feedback to users and detailed logs for operators.
-   **Disaster Recovery:** A robust disaster recovery plan must be in place to ensure business continuity.

## 3.4. Usability (UX)
-   **Intuitive Interfaces:** All applications must provide intuitive and easy-to-use interfaces tailored to their respective user types.
-   **Consistency:** Consistent design language, navigation patterns, and user flows across all applications.
-   **Feedback:** Users must receive clear and timely feedback on their actions and system status.

## 3.5. Accessibility
-   **WCAG Compliance:** All user-facing applications (especially web) must comply with WCAG 2.1 AA standards.
-   **Screen Reader Support:** Applications must be compatible with screen reader technologies.
-   **High-Contrast Mode:** UI options for users with visual impairments.

## 3.6. Maintainability & Extensibility
-   **Modular Architecture:** The system must be built with a modular, microservices-oriented architecture to facilitate independent development, deployment, and scaling of components.
-   **Code Quality:** Adherence to established coding standards, comprehensive testing, and clear documentation.
-   **Configurability:** Key business rules (e.g., pricing, referral formulas, incentives) should be configurable via admin tools without requiring code deployments.

## 3.7. Compliance
-   **Data Privacy Regulations:** Full compliance with global data privacy regulations (e.g., GDPR, CCPA) including "Right to be Forgotten" and "Data Portability".
-   **Local Transportation Regulations:** Adherence to all local and regional transportation and labor laws.

---
