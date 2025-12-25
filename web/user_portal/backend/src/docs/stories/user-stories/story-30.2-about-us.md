# Story 30.2: Create 'About Us' Page

**Epic:** Marketing Website / User Portal
**Status:** Done
**Priority:** Medium

## Description
As a prospective user or partner visiting the website, I want to view an "About Us" page so that I can understand the company's mission, values, and the team behind the service to build trust.

## Acceptance Criteria
1.  **Page Implementation**:
    - The page must be implemented as a Next.js page at `apps/user-portal/src/pages/about.tsx`.
    - It must be accessible via the route `/about`.

2.  **Layout & Navigation**:
    - The page must utilize the standard application `Layout` (including Header and Footer).
    - The "About" link in the site Footer must navigate to this page.

3.  **Content Requirements**:
    - **Mission Section**: Display the company mission statement clearly.
    - **Values Section**: List core company values (e.g., Safety, Community, Transparency).
    - **Team Section**: Include a placeholder grid for team members (photos/names/titles).

4.  **UI/UX**:
    - Styling must use Tailwind CSS consistent with the design system.
    - The layout must be fully responsive (stacking content on mobile).

## Technical Notes
- This replaces the legacy requirement for `about.html`.
- Use the existing `Layout` component found in `apps/user-portal/src/components/layout/layout.tsx`.