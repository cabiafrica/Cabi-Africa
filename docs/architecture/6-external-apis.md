# 6. External APIs

**Rationale:**
This section identifies and details external API integrations necessary for the Cabi Marketing Website to meet its functional and non-functional requirements.

## 6.1. Google reCAPTCHA (for Bot Protection)

*   **Purpose:** To protect the driver registration form on the marketing website from automated bot submissions and spam.
*   **Documentation:** `https://developers.google.com/recaptcha`
*   **Base URL(s):** Verification API endpoint: `https://www.google.com/recaptcha/api/siteverify`
*   **Authentication:** Requires a Site Key (frontend) and a Secret Key (backend).
*   **Integration Notes:** The `Driver Lead Service` will verify the reCAPTCHA token before processing registration.
