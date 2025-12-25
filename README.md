3## Project Structure Diagram

/
├── backend/          # Backend services (NestJS)
├── libs/             # Shared libraries
├── mobile/           # Mobile applications (Flutter)
│   ├── driver_app/       # Driver app
│   └── passenger_app/    # Passenger app
├── tools/            # Tooling and scripts
├── web/              # Web applications (Next.js/React)
│   ├── admin_panel/      # Admin dashboard
│   ├── dispatch_panel/   # Dispatcher tools
│   └── user_portal/      # User portal
└── docs/             # Documentation

**File Placement:** All new files and modifications should be saved in their logically appropriate directories within this structure. Avoid placing files in root directories or incorrect subdirectories.

---

## Onboarding & Development

To get started with development, please familiarize yourself with the following resources:

-   **[Project Structure (`SOURCE_TREE.md`)] (docs/architecture/SOURCE_TREE.md)**: A detailed guide to the project's directory structure.
-   **[Code Generation Templates (`docs/templates`)] (docs/templates)**: Templates for generating new files with the correct structure and boilerplate.