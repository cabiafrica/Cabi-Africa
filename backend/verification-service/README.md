# Cabi Africa - Passenger Verification Service

AI-powered passenger verification system for the Cabi Africa ride-hailing platform.

## Features

- **Multi-Step Verification**: ID, Passport Photo, Selfie, Certificate of Good Conduct, Fingerprint
- **AI Document Verification**: Automatic document detection, OCR, validation
- **Trip Flow Control**: 1 free trip for unverified passengers
- **Real-time Status**: Check verification status and trip eligibility
- **Webhook Support**: External system integration

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run start:dev

# Build for production
npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/verification/passenger/id` | Upload National ID |
| POST | `/api/v1/verification/passenger/photo` | Upload passport photo |
| POST | `/api/v1/verification/passenger/selfie` | Selfie verification |
| POST | `/api/v1/verification/passenger/certificate` | Certificate of Good Conduct |
| POST | `/api/v1/verification/passenger/fingerprint` | Fingerprint |
| GET | `/api/v1/verification/passenger/status/:userId` | Get status |
| GET | `/api/v1/verification/passenger/can-request` | Check eligibility |

## Documentation

- Swagger UI: `http://localhost:3003/api/docs`
- Health: `http://localhost:3003/health`

## Environment

Copy `config.env.example` to `.env` and configure:

```bash
cp config.env.example .env
```

## Docker

```bash
# Build
docker build -t cabi-verification .

# Run
docker run -p 3003:3003 cabi-verification
```

Or use docker-compose:
```bash
docker-compose up -d
```

## Verification Flow

1. Passenger registers → Can request 1 free trip
2. Driver sees verification status → Can reject
3. Passenger completes verification:
   - Upload ID → AI verifies
   - Upload photo → Avatar
   - Take selfie → Liveness check
4. Verified → Unlimited rides + priority

## License

Proprietary - Cabi Africa
