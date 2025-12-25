# 10. Source Tree

**Rationale:**
This section outlines the proposed project folder structure, integrating the new components into the existing Nx monorepo.

```plaintext
project-root/
├── apps/
│   ├── marketing-website/        # Next.js application
│   ├── driver-lead-service/      # NestJS registration API
│   ├── mlm-service/              # NestJS MLM fee distribution and group management API
│   ├── admin-panel/              # Existing admin panel
│   └── ...                       # Other existing apps
├── libs/
│   ├── shared/
│   │   ├── interfaces/           # Common TypeScript interfaces
│   │   └── ...
│   └── ...
└── ...
```
