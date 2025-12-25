# Task: List Epics

**Description:** Scans the project structure to identify Epic documents and compiles a summary list including their current status.

## Steps

1.  **Locate Epics**:
    - Search the project for a directory named `epics`, `docs/epics`, or `product/epics`.
    - If a dedicated directory is not found, perform a file search for markdown files containing "Epic" in the filename or frontmatter.

2.  **Extract Information**:
    - For each identified Epic file, parse the content to extract:
        - **File Name**
        - **Title** (First H1 header or `title:` metadata)
        - **Status** (Look for `Status:`, `State:`, or badge indicators)

3.  **Compile Report**:
    - Format the findings into a Markdown table with columns: **File**, **Title**, **Status**.

4.  **Present to User**:
    - Display the table.
    - Ask if the user would like to read or update any specific epic from the list.