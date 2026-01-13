# Occurrence Book Integration Guide

## Overview

The Occurrence Book system automatically creates incident records from various sources in the Cabi Africa platform. This document explains how to integrate with the occurrence service.

---

## Integration Endpoints

**Base URL**: `http://localhost:3005` (development)

### 1. SOS Emergency Integration

**Endpoint**: `POST /integrations/sos`

Automatically creates a CRITICAL severity occurrence when SOS button is pressed.

**Request Body**:
```json
{
  "tripId": "uuid",
  "rideId": "uuid",
  "passengerId": "uuid",
  "driverId": "uuid",
  "vehicleId": "uuid",
  "location": {
    "lat": -1.2634,
    "lng": 36.8047,
    "address": "Waiyaki Way, Westlands",
    "placeName": "Westlands Roundabout",
    "city": "Nairobi"
  },
  "timestamp": "2026-01-13T14:30:00Z",
  "userId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "SOS occurrence created",
  "occurrence": {
    "id": "uuid",
    "obNumber": "OB-2026-000123",
    "category": "MEDICAL_EMERGENCY",
    "severity": "CRITICAL"
  }
}
```

**Mobile Implementation** (Flutter):
```dart
// In sos_service.dart
await http.post(
  Uri.parse('$occurrenceServiceUrl/integrations/sos'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'tripId': tripId,
    'passengerId': passengerId,
    'driverId': driverId,
    'location': {
      'lat': position.latitude,
      'lng': position.longitude,
    },
    'timestamp': DateTime.now().toIso8601String(),
    'userId': passengerId,
  }),
);
```

---

### 2. Rating System Integration

**Endpoint**: `POST /integrations/rating`

Automatically creates occurrence for ratings ≤ 2 stars with comments.

**Request Body**:
```json
{
  "ratingId": "uuid",
  "rideId": "uuid",
  "driverId": "uuid",
  "passengerId": "uuid",
  "vehicleId": "uuid",
  "score": 1,
  "comment": "Driver was reckless and speeding",
  "timestamp": "2026-01-13T14:30:00Z"
}
```

**Response** (if occurrence created):
```json
{
  "success": true,
  "message": "Occurrence created from low rating",
  "occurrenceCreated": true,
  "occurrence": {
    "id": "uuid",
    "obNumber": "OB-2026-000124",
    "category": "TRAFFIC_OFFENSE",
    "severity": "HIGH"
  }
}
```

**Response** (if no occurrence created):
```json
{
  "success": true,
  "message": "Rating does not meet occurrence criteria",
  "occurrenceCreated": false
}
```

**Backend Implementation** (NestJS):
```typescript
// In rating.service.ts
async createRating(ratingDto: CreateRatingDto) {
  const rating = await this.prisma.rating.create({...});
  
  // Auto-create occurrence for low ratings
  if (rating.score <= 2 && rating.comment) {
    await this.httpService.post(
      'http://localhost:3005/integrations/rating',
      {
        ratingId: rating.id,
        rideId: rating.rideId,
        driverId: rating.driverId,
        passengerId: rating.passengerId,
        score: rating.score,
        comment: rating.comment,
        timestamp: rating.createdAt,
      }
    ).toPromise();
  }
  
  return rating;
}
```

---

### 3. User Comment/Report Integration

**Endpoint**: `POST /integrations/comment`

Creates occurrence from user reports and feedback.

**Request Body**:
```json
{
  "commentId": "uuid",
  "rideId": "uuid",
  "driverId": "uuid",
  "passengerId": "uuid",
  "vehicleId": "uuid",
  "comment": "Driver was harassing me during the ride",
  "category": "harassment",
  "timestamp": "2026-01-13T14:30:00Z",
  "reportedById": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Occurrence created from user report",
  "occurrence": {
    "id": "uuid",
    "obNumber": "OB-2026-000125",
    "category": "HARASSMENT",
    "severity": "MEDIUM"
  }
}
```

---

## Automatic Categorization

The system intelligently categorizes occurrences based on comment text:

| Keywords | Category |
|----------|----------|
| theft, steal, robbery, assault, weapon | **CRIME** |
| harassment, inappropriate, sexual, abuse | **HARASSMENT** |
| speeding, reckless, drunk, dui, accident | **TRAFFIC_OFFENSE** |
| no seatbelt, unsafe, overloading | **SAFETY_VIOLATION** |
| fraud, scam, overcharge, cheating | **FRAUD** |
| damage, broken, vandalism | **PROPERTY_DAMAGE** |
| vehicle problem, mechanical, breakdown | **VEHICLE_ISSUE** |
| dispute, disagreement, wrong route | **DISPUTE** |

**Default**: POLICY_VIOLATION

---

## Integration Checklist

### Mobile Apps (Flutter)

- [x] Update `sos_service.dart` to call occurrence webhook
- [ ] Update rating submission to call occurrence webhook
- [ ] Add report/comment feature with occurrence integration
- [ ] Handle occurrence creation errors gracefully

### Backend Services

- [ ] Create rating service with occurrence integration
- [ ] Add comment/report endpoints
- [ ] Implement notification service for occurrence creation
- [ ] Add webhook authentication/authorization

### Admin Panel

- [ ] Display occurrence notifications
- [ ] Link occurrences to original events (SOS, ratings, comments)
- [ ] Show occurrence creation source in UI

---

## Error Handling

**Best Practices**:

1. **Don't block primary operations**: If occurrence creation fails, don't prevent SOS activation or rating submission
2. **Log failures**: Record failed occurrence creations for manual review
3. **Retry logic**: Implement retry for transient failures
4. **Fallback**: Have manual occurrence creation as backup

**Example** (Flutter):
```dart
try {
  await occurrenceService.createFromSOS(data);
} catch (e) {
  // Log error but don't throw
  print('Warning: Failed to create occurrence: $e');
  // Continue with SOS activation
}
```

---

## Testing

### Test SOS Integration

```bash
curl -X POST http://localhost:3005/integrations/sos \
  -H "Content-Type: application/json" \
  -d '{
    "passengerId": "test-passenger-id",
    "location": {
      "lat": -1.2634,
      "lng": 36.8047,
      "city": "Nairobi"
    },
    "timestamp": "2026-01-13T14:30:00Z",
    "userId": "test-user-id"
  }'
```

### Test Rating Integration

```bash
curl -X POST http://localhost:3005/integrations/rating \
  -H "Content-Type: application/json" \
  -d '{
    "ratingId": "test-rating-id",
    "rideId": "test-ride-id",
    "driverId": "test-driver-id",
    "passengerId": "test-passenger-id",
    "score": 1,
    "comment": "Driver was speeding dangerously",
    "timestamp": "2026-01-13T14:30:00Z"
  }'
```

### Test Comment Integration

```bash
curl -X POST http://localhost:3005/integrations/comment \
  -H "Content-Type: application/json" \
  -d '{
    "commentId": "test-comment-id",
    "passengerId": "test-passenger-id",
    "comment": "Driver was harassing me",
    "category": "harassment",
    "timestamp": "2026-01-13T14:30:00Z",
    "reportedById": "test-user-id"
  }'
```

---

## Next Steps

1. **Add Authentication**: Implement API key or JWT authentication for webhooks
2. **Add Notifications**: Send notifications when occurrences are created
3. **Add Deduplication**: Prevent duplicate occurrences from same event
4. **Add Batch Processing**: Handle multiple events efficiently
5. **Add Analytics**: Track occurrence creation rates and patterns
