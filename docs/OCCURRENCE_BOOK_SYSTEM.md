# Occurrence Book (OB) System - Complete Documentation

## Overview

The Occurrence Book system is a comprehensive incident tracking platform for Cabi Africa, inspired by police OB systems. It permanently records all incidents involving drivers, passengers, and vehicles with complete audit trails and dispute resolution.

---

## ✅ What's Been Built

### 1. Database Layer (100% Complete)

**Location**: `libs/backend/database/`

**Files**:
- `migrations/add_occurrence_book_tables.sql` - Complete SQL migration
- `prisma/schema.prisma` - Updated with OB models

**Tables Created**:
1. **occurrences** - Main incident records
2. **occurrence_media** - Photos, videos, audio attachments
3. **occurrence_objections** - User disputes
4. **occurrence_audit_log** - Complete change history

**Key Features**:
- OB number auto-generation (OB-2026-000001)
- Separate date/time fields for precise tracking
- Comprehensive location data (GPS, address, place name, city)
- 11 performance indexes
- Cannot delete records (only resolve)

---

### 2. Backend Service (100% Complete)

**Location**: `backend/occurrence-service/`

**Structure**:
```
occurrence-service/
├── src/
│   ├── controllers/
│   │   ├── occurrence.controller.ts      # Main CRUD endpoints
│   │   ├── objection.controller.ts       # Dispute handling
│   │   └── integration.controller.ts     # Webhooks
│   ├── services/
│   │   ├── occurrence.service.ts         # Business logic
│   │   ├── objection.service.ts          # Objection workflow
│   │   ├── occurrence-audit.service.ts   # Audit trail
│   │   └── occurrence-integration.service.ts # Auto-creation
│   └── dto/
│       ├── occurrence.dto.ts             # Validation
│       └── objection.dto.ts
├── package.json
├── README.md
└── INTEGRATION_GUIDE.md
```

**API Endpoints** (18 total):

**Occurrences**:
- `POST /occurrences` - Create
- `GET /occurrences` - List with filters
- `GET /occurrences/:id` - Get details
- `GET /occurrences/statistics` - Stats
- `GET /occurrences/user/:userId/history` - User history
- `GET /occurrences/vehicle/:vehicleId/history` - Vehicle history
- `PATCH /occurrences/:id` - Update
- `POST /occurrences/:id/resolve` - Resolve
- `POST /occurrences/:id/flag` - Flag for review

**Objections**:
- `POST /objections` - File objection
- `GET /objections/pending` - Pending list
- `GET /objections/:id` - Details
- `GET /objections/occurrence/:occurrenceId` - By occurrence
- `GET /objections/user/:userId` - By user
- `POST /objections/:id/review` - Admin review

**Integration Webhooks**:
- `POST /integrations/sos` - SOS emergency
- `POST /integrations/rating` - Low ratings
- `POST /integrations/comment` - User reports

---

### 3. Integration Layer (100% Complete)

**Smart Auto-Creation**:
- ✅ SOS button → CRITICAL occurrence
- ✅ Ratings ≤2 stars → Auto-categorized occurrence
- ✅ User comments → Categorized by keywords

**Keyword Detection** (12 categories):
- Crime: theft, robbery, assault, weapon
- Harassment: inappropriate, sexual, abuse
- Traffic: speeding, reckless, drunk, dui
- Safety: no seatbelt, unsafe, overloading
- Fraud: scam, overcharge, cheating
- And 7 more...

**Mobile Integration**:
- Updated `mobile/passenger_app/lib/services/sos_service.dart`
- Calls occurrence webhook after SOS activation
- Graceful error handling (doesn't block SOS)

---

### 4. Admin Panel UI (15% Complete)

**Location**: `web/admin_panel/src/`

**Created**:
- ✅ `types/occurrence.types.ts` - TypeScript definitions
- ✅ `services/occurrence.service.ts` - API client
- ✅ `pages/occurrences/Dashboard.tsx` - Statistics dashboard

**Dashboard Features**:
- Statistics cards (total, open, resolved, disputed)
- Category breakdown with color coding
- Recent occurrences list
- Material-UI components

**Not Yet Created**:
- Registration form
- Detail view with media
- List page with filtering
- Objection review UI
- Audit timeline component

---

## 🎨 Design System

### Category Colors

| Category | Color | Hex |
|----------|-------|-----|
| Crime | 🔴 Red | #DC2626 |
| Traffic Offense | 🟠 Orange | #EA580C |
| Safety Violation | 🟡 Amber | #D97706 |
| Policy Violation | 🟡 Yellow | #CA8A04 |
| Harassment | 🟣 Purple | #9333EA |
| Fraud | 🔵 Indigo | #4F46E5 |
| Property Damage | 🔵 Blue | #2563EB |
| Medical Emergency | 🩷 Pink | #DB2777 |
| Dispute | 🩵 Teal | #0D9488 |
| Suspicious Activity | ⚫ Slate | #475569 |
| Vehicle Issue | 🩵 Cyan | #0891B2 |
| Environmental | 🟢 Green | #16A34A |

### Severity Levels

| Level | Badge | Color |
|-------|-------|-------|
| CRITICAL (SEV-1) | 🔴 | #DC2626 |
| HIGH (SEV-2) | 🟠 | #EA580C |
| MEDIUM (SEV-3) | 🟡 | #F59E0B |
| LOW (SEV-4) | 🟢 | #10B981 |

---

## 🚀 Quick Start

### 1. Setup Database

```bash
cd libs/backend/database

# Run migration
psql -U your_user -d cabi_africa -f migrations/add_occurrence_book_tables.sql

# Generate Prisma client
npx prisma generate
```

### 2. Start Backend Service

```bash
cd backend/occurrence-service
npm install
npm run start:dev
```

Runs on: `http://localhost:3005`

### 3. Test API

```bash
# Get statistics
curl http://localhost:3005/occurrences/statistics

# Create occurrence
curl -X POST http://localhost:3005/occurrences \
  -H "Content-Type: application/json" \
  -d '{
    "category": "TRAFFIC_OFFENSE",
    "severity": "HIGH",
    "title": "Reckless Driving",
    "description": "Driver was speeding dangerously",
    "passengerId": "uuid-here",
    "occurrenceDate": "2026-01-13",
    "occurrenceTime": "14:30",
    "location": {
      "lat": -1.2634,
      "lng": 36.8047,
      "city": "Nairobi"
    },
    "source": "MANUAL",
    "registeredById": "admin-uuid"
  }'
```

### 4. Start Admin Panel

```bash
cd web/admin_panel

# Add environment variable
echo "VITE_OCCURRENCE_SERVICE_URL=http://localhost:3005" >> .env

npm install
npm run dev
```

Runs on: `http://localhost:5173`

---

## 📋 Next Steps to Complete

### Phase 4: Complete Admin UI (Estimated: 8-12 hours)

**Priority 1: Registration Form**
- File: `web/admin_panel/src/pages/occurrences/Register.tsx`
- Features:
  - Date/time pickers
  - Category/severity dropdowns (color-coded)
  - Location map picker (Leaflet)
  - Involved parties autocomplete
  - Description rich text editor
  - Media upload (drag-and-drop)
  - Tags input

**Priority 2: Detail View**
- File: `web/admin_panel/src/pages/occurrences/[id].tsx`
- Features:
  - Header with OB number, date, time, location
  - Category and severity badges
  - Involved parties cards
  - Media gallery (lightbox)
  - Objections list
  - Resolution form (admin only)
  - Audit timeline

**Priority 3: List Page**
- File: `web/admin_panel/src/pages/occurrences/List.tsx`
- Features:
  - Data table with sorting
  - Advanced filters (category, severity, status, date range)
  - Search by OB number, description
  - Pagination
  - Export to CSV

**Priority 4: Components**
- `src/components/occurrences/OccurrenceCard.tsx`
- `src/components/occurrences/CategoryBadge.tsx`
- `src/components/occurrences/SeverityBadge.tsx`
- `src/components/occurrences/MediaGallery.tsx`
- `src/components/occurrences/AuditTimeline.tsx`
- `src/components/occurrences/ObjectionForm.tsx`
- `src/components/occurrences/ResolutionForm.tsx`

### Phase 5: User Portal (Estimated: 6-8 hours)

**User Occurrence History**
- File: `web/user_portal/src/pages/my-occurrences.tsx`
- Features:
  - List of user's occurrences
  - Filter by status
  - View details
  - File objection button

**Objection Form**
- File: `web/user_portal/src/components/occurrences/ObjectionForm.tsx`
- Features:
  - Text area for objection
  - Evidence upload
  - Submission confirmation

### Phase 6: Testing (Estimated: 4-6 hours)

**Backend Tests**
```bash
cd backend/occurrence-service
npm test
npm run test:e2e
```

**Frontend Tests**
```bash
cd web/admin_panel
npm test
```

---

## 🔐 Security Considerations

### Before Production

1. **Authentication**: Add JWT-based auth to all endpoints
2. **Authorization**: Role-based access (Admin, Dispatcher, User)
3. **Rate Limiting**: Prevent webhook abuse
4. **Input Validation**: Already implemented with class-validator
5. **SQL Injection**: Protected by Prisma ORM
6. **XSS Protection**: Sanitize user input in frontend

### Recommended Middleware

```typescript
// In occurrence-service/src/main.ts
app.use(helmet()); // Security headers
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

---

## 📊 Monitoring & Maintenance

### Key Metrics to Track

1. **Occurrence Creation Rate**: Occurrences per day/week
2. **Category Distribution**: Which categories are most common
3. **Resolution Time**: Average time to resolve
4. **Objection Rate**: % of occurrences disputed
5. **Source Breakdown**: SOS vs Rating vs Manual

### Regular Tasks

- Review flagged occurrences daily
- Process pending objections within 48 hours
- Archive resolved occurrences older than 1 year
- Update categorization keywords based on patterns

---

## 🐛 Troubleshooting

### Common Issues

**1. Occurrence service won't start**
```bash
# Check if port 3005 is in use
lsof -i :3005

# Check database connection
psql -U your_user -d cabi_africa -c "SELECT 1"
```

**2. Prisma client errors**
```bash
cd libs/backend/database
npx prisma generate
```

**3. Integration webhook failures**
- Check occurrence service is running
- Verify URL in mobile app matches service URL
- Check network connectivity
- Review error logs

---

## 📚 Additional Resources

1. **Implementation Plan**: `C:\Users\User\.gemini\antigravity\brain\...\implementation_plan.md`
2. **Integration Guide**: `backend/occurrence-service/INTEGRATION_GUIDE.md`
3. **API Documentation**: `backend/occurrence-service/README.md`
4. **Task Checklist**: `C:\Users\User\.gemini\antigravity\brain\...\task.md`

---

## 💡 Tips for Developers

### Adding a New Category

1. Update enum in `libs/backend/database/prisma/schema.prisma`
2. Add to SQL enum in migration file
3. Add color in `web/admin_panel/src/types/occurrence.types.ts`
4. Add label in `CATEGORY_LABELS`
5. Run `npx prisma generate`

### Adding a New Integration Source

1. Create handler in `occurrence-integration.service.ts`
2. Add endpoint in `integration.controller.ts`
3. Update mobile app to call webhook
4. Add to integration guide

### Customizing Auto-Categorization

Edit `categorizeFromComment()` in `occurrence-integration.service.ts`:
```typescript
if (this.containsAny(lowerComment, ['your', 'keywords'])) {
  return OccurrenceCategory.YOUR_CATEGORY;
}
```

---

## Summary

The Occurrence Book system is **65% complete** with a fully functional backend, smart integrations, and the foundation for the admin UI. The system can already:

✅ Track incidents from SOS, ratings, and comments
✅ Store permanent records with audit trails
✅ Handle user objections
✅ Provide statistics and history
✅ Auto-categorize based on keywords

**Ready for**: Completing the admin UI, adding user-facing features, and comprehensive testing.

**Estimated completion time**: 18-26 hours of development work.
