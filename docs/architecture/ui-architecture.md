# Cabi Marketing Website Frontend Architecture Document

## 1. Template and Framework Selection

The primary frontend framework for the Cabi Marketing Website will be **Next.js**, as established in the main architecture document (`docs/architecture.md`).

**Rationale:**
Next.js was chosen for its strong support for Server-Side Rendering (SSR) and Static Site Generation (SSG), which are critical for achieving the project's performance and SEO goals. Its React-based ecosystem aligns with modern web development practices and provides a robust foundation for building the user interface and the driver registration form. This decision is supported by the PRD's non-functional requirements and the need for a high-performance marketing presence.

**Constraints:**
*   The architecture and development patterns must adhere to Next.js best practices.
*   All new frontend code will be written in TypeScript, consistent with the existing monorepo.
*   A UX/UI design specification is required to guide the implementation of visual components and user flows.

### 1.1. Change Log

| Date         | Version | Description              | Author  |
| :----------- | :------ | :----------------------- | :------ |
| 2025-12-01   | 1.0     | Initial document creation| Winston |
