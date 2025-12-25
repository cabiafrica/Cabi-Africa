# Story 10.1: Admin Promo Code Management

**Epic:** Marketing Campaigns
**Status:** Done
**Priority:** High

## Description
As a marketing manager, I want to create and manage promotional codes (e.g., "SAVE50"), so that I can incentivize users to take rides.

## Acceptance Criteria
1.  **UI Implementation**: The `admin-panel` must have a "Promotions" page.
2.  **List View**: Display active and expired promo codes with their usage stats.
3.  **Create Action**: A form to create a new code with:
    - Code (Alphanumeric, e.g., "WELCOME2024").
    - Discount Type (Percentage or Fixed Amount).
    - Value (e.g., 20% or 200 KES).
    - Expiry Date.
    - Usage Limit (Max total uses).
4.  **Backend Integration**: `POST /admin/promotions` to save.

## Technical Notes
- **Frontend**: React component `PromoCodeManager`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/admin-panel/src/components/PromoCodeManager.tsx`