---
description: Preview the Admin Panel application
---

# Preview Admin Panel Workflow

This workflow starts the Admin Panel development server and opens it in a browser.

## Steps

1. Ensure you're in the project root directory

2. Start the Admin Panel development server
```powershell
cd web/admin_panel
npm run dev
```

3. The application will be available at:
   - Primary: http://localhost:3001
   - If port 3001 is in use: http://localhost:3002 (or next available port)

4. Login credentials:
   - Email: `ithrivebusinessnetworks@gmail.com`
   - Password: `Admin@2026`

## Notes

- The auth-gateway service (port 3333) must be running for authentication to work
- To start the backend: `npx nx serve auth-gateway` from project root
- Clear browser cache if you encounter loading issues
- Check console logs for any errors
