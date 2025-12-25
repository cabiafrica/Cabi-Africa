# 3. Tech Stack

**Rationale:**
This section defines the definitive technology stack for the Cabi Marketing Website and its associated backend services. The choices are guided by the project's non-functional requirements (performance, scalability, security), the existing monorepo structure (Nx, TypeScript), and industry best practices for modern web applications. The goal is to create a cohesive, maintainable, and high-performing stack that enables developer productivity.

Since no specific technical preferences were provided, these recommendations are based on creating a robust and modern system. Each choice is critical and will be the single source of truth for all development.

## 3.1. Cloud Infrastructure

*   **Provider:** AWS (Amazon Web Services) is recommended.
    *   *Rationale:* AWS offers a mature and comprehensive suite of services that align well with the proposed architecture, including excellent support for serverless functions, managed databases, and global content delivery, which are key to meeting the project's performance and scalability goals. Alternatives include Google Cloud Platform (GCP) and Microsoft Azure.
*   **Key Services:**
    *   **Compute:** AWS Lambda (for serverless backend logic, e.g., the Driver Lead Service, MLM Service).
    *   **Frontend Hosting:** Vercel (for Next.js) or AWS Amplify/S3+CloudFront. Vercel is highly recommended for optimal Next.js performance.
    *   **Database:** Amazon RDS for PostgreSQL (for relational data like user profiles).
    *   **API Gateway:** Amazon API Gateway (to manage and secure backend APIs).
    *   **CDN:** Amazon CloudFront (for caching static assets and ensuring fast global delivery).
*   **Deployment Regions:** A primary region like `us-east-1` (N. Virginia) is a common starting point, with the option to expand to other regions as the user base grows.

## 3.2. Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | TypeScript | `~5.3.3` | Primary development language | Provides static typing for robust, maintainable code; already in use in the monorepo. |
| **Monorepo Tool** | Nx | `~18.0.0` | Manage project workspaces | Already in use; excellent for code sharing, task running, and enforcing project structure. |
| **Runtime** | Node.js | `~20.11.0` | Backend JavaScript runtime | LTS version ensures stability; consistent language (TS/JS) across frontend and backend. |
| **Web Framework** | Next.js | `~14.1.0` | Frontend and web server | Enables high-performance SSR/SSG for SEO and fast page loads, ideal for a marketing site. |
| **Backend Framework**| NestJS | `~10.3.0` | Backend API framework | A structured, modular framework for building efficient and scalable Node.js APIs. Works well with Nx and TypeScript. |
| **Styling** | Tailwind CSS | `~3.4.1` | CSS Framework | Utility-first approach for rapid, custom UI development with excellent performance. |
| **Database** | PostgreSQL | `15` | Primary relational database | Powerful, reliable, and well-suited for structured data like user and driver information. |
| **ORM** | Prisma | `~5.10.0` | Database toolkit for TS/Node.js| Provides a type-safe and intuitive way to interact with the database. |
| **Deployment** | Docker | `~25.0` | Containerization | Ensures consistent development and production environments for backend services. |
| **Infrastructure** | AWS CDK | `~2.127.0`| Infrastructure as Code (IaC) | Define cloud infrastructure using TypeScript, keeping the entire project in a single language. |
