# Occurrence Service

Backend microservice for the Occurrence Book (OB) system - tracking incidents involving drivers, passengers, and vehicles.

## Features

- **Incident Registration**: Create occurrence records with time, date, and place
- **Categorization**: 12 color-coded categories with 4 severity levels
- **Media Support**: Attach photos, videos, and audio evidence
- **Dispute Resolution**: Users can file objections to occurrences
- **Audit Trail**: Complete history of all changes
- **Permanent Records**: Occurrences cannot be deleted, only resolved

## API Endpoints

### Occurrences

- `POST /occurrences` - Create new occurrence
- `GET /occurrences` - List occurrences (with filters)
- `GET /occurrences/:id` - Get occurrence details
- `GET /occurrences/statistics` - Get statistics
- `GET /occurrences/user/:userId/history` - User occurrence history
- `GET /occurrences/vehicle/:vehicleId/history` - Vehicle occurrence history
- `PATCH /occurrences/:id` - Update occurrence
- `POST /occurrences/:id/resolve` - Resolve occurrence
- `POST /occurrences/:id/flag` - Flag occurrence for review

### Objections

- `POST /objections` - File objection
- `GET /objections/pending` - Get pending objections
- `GET /objections/:id` - Get objection details
- `GET /objections/occurrence/:occurrenceId` - Get objections for occurrence
- `GET /objections/user/:userId` - Get user's objections
- `POST /objections/:id/review` - Review objection (admin)

## Installation

```bash
npm install
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Environment Variables

```
PORT=3005
DATABASE_URL=postgresql://...
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```
