const fs = require('fs');
const path = require('path');

const memDir = 'D:/IBN/iBN-Cabi Vault/00-ProjectMemories';
if (!fs.existsSync(memDir)) {
  fs.mkdirSync(memDir, { recursive: true });
}

const memPath = path.join(memDir, 'cabi-memory.md');
const memory = `Cabi Africa Project Memory & Directives
======================================

Active: 2026-09-19
Location: D:\\IBN\\PROJECTS\\Cabi Africa
Obsidian Vault: D:\\IBN\\iBN-Cabi Vault

Core Directives:
- MANDATORY: Always keep this Obsidian vault synchronized whenever architectural, service, database, or financial policy changes occur in the codebase.
- Engineering Documentation Path: 01-System Architecture & Engineering/
- Index Map of Content: 01-System Architecture & Engineering/MOC — Engineering & Codebase Hub.md

Key Architecture Highlights:
- Framework: Nx Monorepo with NestJS Microservices (Node.js 20+)
- Gateway: auth-gateway (Port 3333 / 8080)
- Microservices: sacco-service (3338), dispatch-service (3335), driver-lead-service (3336), referral-service (3337), verification-service (3334)
- Frontends:
  * web/admin_panel (Vite + React 18 + Tailwind v4 + Tremor/MUI)
  * web/dispatch_panel (Vite + React 18 + Leaflet + Socket.io)
  * web/user_portal (Next.js 14 App Router SSR)
- Mobile Apps: mobile/passenger_app (CABI Go) & mobile/driver_app (CABI Drive) in Flutter 3.x (Riverpod)
- Database: Supabase PostgreSQL 15+ via Prisma ORM
- Cloud Infrastructure: Google Cloud Run (us-central1) via Google Cloud Build
- Key Differentiator: Capped 18% commission, SACCO welfare integration with guaranteed 65% driver take-home floor, and ODPC/NTSA regulatory compliance.
`;

fs.writeFileSync(memPath, memory, 'utf8');
console.log('Successfully saved cabi-memory.md in vault');
