# Story 4.5: Admin Blog Post Management

*   **ID**: `STORY-4.5`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Manage blog posts for community engagement
*   **Points**: 5 (Involves a standard CRUD UI with a rich text editor and backend)
*   **Status**: `Done`

---

### User Story

As an **admin with content management permissions**, I want to **create, edit, publish, and delete blog posts through the admin panel**, so that **I can share news and updates with the CABI community**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "Blog Management" section.
2.  **Permission Gating**: This section must only be accessible to admin users who have the `blog.manage` permission.
3.  **Create/Edit Form**: The admin must be able to create and edit posts using a form that includes:
    *   A `title` field.
    *   A `content` field using a rich text editor (e.g., TinyMCE, CKEditor).
    *   A file upload for a `featuredImageUrl`.
    *   An `authorName` field.
4.  **Status Control**: The admin can save a post with a status of either "Draft" or "Published".
5.  **List View**: The admin can view a list of all blog posts, showing their title, author, status, and publication date. This list must be filterable by status.
6.  **Submission**: Saving a post must call the appropriate `POST` or `PUT` endpoint on the `Admin Service`.
7.  **Deletion**: The admin can delete a post, which must trigger a confirmation prompt before calling the `DELETE` endpoint.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for all CRUD operations for blog posts.
*   **API Endpoints**:
    *   `GET /admin/posts`
    *   `POST /admin/posts`
    *   `GET /admin/posts/{id}`
    *   `PUT /admin/posts/{id}`
    *   `DELETE /admin/posts/{id}`
*   **Data Model**: The implementation will create/update records conforming to the `BlogPost Model` defined in `architecture.md`.
*   **User-Facing API**: The mobile apps will consume published posts via the `Content Service` endpoints (`GET /posts`, `GET /posts/{postId}`) as defined in the architecture.
*   **Reference Document**: This story directly implements the logic described in `Story 4.5` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Component**: Created `BlogManagement.tsx` for CRUD operations on blog posts.
*   [x] **Task 2: Implement List View**: Created a table view for listing posts with status indicators.
*   [x] **Task 3: Implement Editor**: Created a form for editing title, content, and metadata.

#### **File List**

*   `apps/admin-panel/src/components/BlogManagement.tsx` (new)