/**
 * @deprecated This legacy MUI Sidebar is no longer in use.
 * The active admin panel sidebar is rendered directly inside App.tsx via the <aside> element.
 *
 * This file is retained as a placeholder to prevent import errors from any legacy references.
 * The production sidebar includes:
 *   - Full RBAC-filtered navigation groups (SIDEBAR_MENU in App.tsx)
 *   - Theme toggle & logout controls
 *   - System Access footer (Dispatch Panel, User Portal) with environment-aware URLs
 *
 * To modify the sidebar, edit the <aside> block in src/App.tsx.
 */

// No-op export to prevent build errors from any residual imports.
export const Sidebar = () => null;