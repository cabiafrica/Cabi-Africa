# Story 30.4: Create 'Privacy Policy' Page

**Epic:** Marketing Website / User Portal
**Status:** Done
**Priority:** High (Legal Requirement)

## Description
As a user, I want to view the Privacy Policy so that I understand how my data is collected, used, and protected by the platform.

## Acceptance Criteria
1.  **Page Implementation**:
    - The page must be implemented as a Next.js page at `apps/user-portal/src/pages/privacy-policy.tsx`.
    - It must be accessible via the route `/privacy-policy`.

2.  **Content Requirements**:
    - **Header**: Display "Privacy Policy" and a "Last updated" date.
    - **Sections**: The page must include the following sections:
        - 1. Information We Collect
        - 2. How We Use Your Information
        - 3. Data Sharing
        - 4. Data Security
        - 5. Your Rights
    - **Content**: Use clear, readable text for each section (placeholders are acceptable for MVP if legal text is pending).

3.  **UI/UX**:
    - Styling must use Tailwind CSS consistent with the design system.
    - The layout must be responsive and support dark mode (e.g., `dark:bg-gray-800`, `dark:text-white`).

## Technical Notes
- This replaces the legacy requirement for `privacy.html`.
- The implementation currently exists but requires this story for formal tracking and validation.
- Ensure the page is linked from the site Footer.