---
description: Deploy backend changes and run tests
---
1. Stop all running node processes (Warning: Stop manually if needed)
// turbo
taskkill /F /IM node.exe

2. Update database client
cd libs/backend/database
npx prisma generate

3. Start backend services (Open separate terminals for these)
npx nx serve auth-gateway
npx nx serve dispatch-service

4. Run tests
node test_matching_badges.js

5. Start Passenger App
cd mobile/passenger_app
flutter run
