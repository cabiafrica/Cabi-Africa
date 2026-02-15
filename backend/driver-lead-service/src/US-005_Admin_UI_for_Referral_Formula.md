# US-005: Admin UI for MLM Fee Formula Management

**As an** administrator,
**I want to** manage the MLM fee distribution formula through a user interface,
**So that** I can easily view and update commission rules without using API tools.

---

### Description
This story covers the creation of a dedicated user interface within the admin panel for managing the MLM fee formula. This UI will consume the administrative endpoints created in `US-003` to provide a user-friendly way for business operations to configure the referral commission structure.

### Acceptance Criteria
- [ ] A new page exists in the admin panel, for example at `/admin/settings/mlm-formula`.
- [ ] On page load, the UI makes a `GET` request to `/api/v1/admin/mlm/formula` to fetch and display the current fee rules.
- [ ] The rules are displayed in an editable list or table format.
- [ ] The admin can add a new rule to the formula.
- [ ] The admin can edit the values (`recipient`, `value`, `ruleType`, `uplineLevel`) of an existing rule.
- [ ] The admin can remove a rule from the formula.
- [ ] A "Save Changes" button is present and is enabled only when there are unsaved changes.
- [ ] Clicking "Save Changes" sends a `PUT` request to `/api/v1/admin/mlm/formula` with the updated list of rules.
- [ ] The UI displays a success notification upon successful save, or an error message if the save fails.

### Technical Notes
- This UI will be built within the `apps/admin-panel` project.
- It will require state management to handle the dynamic list of rules (adding, editing, deleting).
- The UI should clearly validate inputs (e.g., `value` must be a number).