# Story 30.3: Create 'Contact Us' Page

**Epic:** Marketing Website / User Portal
**Status:** Done
**Priority:** Medium

## Description
As a user or visitor, I want a dedicated "Contact Us" page so that I can easily find support channels or reach out to the company for inquiries.

## Acceptance Criteria
1.  **Page Implementation**:
    - The page must be implemented as a Next.js page at `apps/user-portal/src/pages/contact.tsx`.
    - It must be accessible via the route `/contact`.

2.  **Layout & Navigation**:
    - The page must utilize the standard application `Layout`.
    - The "Contact" link in the site Footer must navigate to this page.

3.  **Content Requirements**:
    - **Contact Info**: Display the support email (e.g., `support@cabi.ke`) and a placeholder phone number.
    - **Office Address**: Display a placeholder physical address.
    - **Contact Form**: Include a UI-only form with fields for:
        - Name
        - Email
        - Subject
        - Message
    - **Form Behavior**: For this story, the form submission should prevent default behavior, log the data to the console, and show a success message to the user.

4.  **UI/UX**:
    - Styling must use Tailwind CSS consistent with the design system.
    - The layout must be responsive.

## Technical Notes
- This replaces the legacy requirement for `contact.html`.
- Use the existing `Layout` component found in `apps/user-portal/src/components/layout/layout.tsx`.