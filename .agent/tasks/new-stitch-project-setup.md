# Task: Fresh Stitch Project Initialization for Cabi Africa Ecosystem

## Objective
Initialize a brand-new Google Stitch project covering the entire Cabi Africa mobility ecosystem with dual-theme capability (Obsidian Gold dark mode + Platinum Bronze light mode), and generate the foundational Passenger App Home & Ride Tier Selection screen.

## Execution Steps
1. **Archive Legacy Stitch Artifacts**: Move current `.stitch` configuration files (tied to `5681992570744779348`) to `.stitch/_backup_legacy_project_5681992570744779348/`.
2. **Create New Stitch Project**: Call `StitchMCP:create_project` with title `"Cabi Africa Ecosystem"`.
3. **Fetch Project Metadata**: Call `StitchMCP:get_project` to obtain the resource name and project ID.
4. **Compile Dual-Theme Design System**: Write updated `.stitch/DESIGN.md` containing WCAG-compliant Dark Mode (Obsidian Gold/Electric Blue) and Light Mode (Porcelain Platinum/Deep Bronze).
5. **Upload Design System**: Call `StitchMCP:upload_design_md` and `StitchMCP:create_design_system_from_design_md`.
6. **Generate Foundational Screen (Option A)**: Call `StitchMCP:generate_screen_from_text` for the Passenger App Home & Ride Tier Selector with dark/light mode toggle.
7. **Document & Synchronize**: Update `.stitch/config.json`, `.stitch/SITE.md`, `.stitch/catalog.json`, and `.stitch/next-prompt.md`.
