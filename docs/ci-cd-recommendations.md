# CI/CD Recommendations: Enforcing Project Structure

To prevent misplaced files and maintain a clean codebase, it is recommended to implement a CI/CD check that validates the project structure on every pull request. This document outlines the specification for such a check.

## 1. Goal

The primary goal of this CI/CD check is to automatically detect and flag files that are not placed in their correct directories as defined in the `SOURCE_TREE.md` document.

## 2. Implementation a script that:

1.  **Parses `SOURCE_TREE.md`**: Reads the `SOURCE_TREE.md` document to understand the expected directory structure for each application and library.

2.  **Scans the codebase**: Traverses all directories within `apps/` and `libs/`.

3.  **Applies rules based on file type and location**: For each file, the script should apply a set of rules, such as:
    *   **Rule 1 (Framework Segregation)**: `.dart` files should only exist within Flutter applications (`apps/driver-app`, `apps/passenger-app`) and shared Flutter libraries (`libs/core_ui`). They should not be found in Next.js or NestJS applications.
    *   **Rule 2 (Backend/Frontend Segregation)**: `.tsx` files (React components) should only exist within frontend applications (`apps/admin-panel`, `apps/user-portal`, `apps/components`). They should not be found in backend services.
    *   **Rule 3 (DTOs)**: `.dto.ts` files should reside in `libs/shared/interfaces`.
    *   **Rule 4 (Services)**: Shared backend services (`.service.ts`) should reside in `libs/shared/services`.
    *   **Rule 5 (Controllers)**: Backend controllers (`.controller.ts`) should reside within the `src` directory of a backend application (e.g., `apps/admin-panel/backend/src`, `apps/dispatch-service/src`).

4.  **Reports errors**: If any file violates these rules, the script should:
    *   Log an error message indicating the misplaced file and its expected location.
    *   Exit with a non-zero status code, causing the CI/CD pipeline to fail.

## 3. Example (Pseudocode)

```
// Pseudocode for the CI check script

function main() {
  const sourceTree = parseSourceTree("docs/architecture/SOURCE_TREE.md");
  const misplacedFiles = [];

  for (const app of sourceTree.apps) {
    misplacedFiles.push(...validateApp(app));
  }

  for (const lib of sourceTree.libs) {
    misplacedFiles.push(...validateLib(lib));
  }

  if (misplacedFiles.length > 0) {
    console.error("Misplaced files found:", misplacedFiles);
    process.exit(1);
  } else {
    console.log("Project structure is valid.");
  }
}

// ... implement validation functions based on rules ...
```

## 4. Integration

This script should be configured to run as a step in your CI/CD pipeline (e.g., in a GitHub Actions workflow) on every pull request that modifies files in the `apps/` or `libs/` directories.
