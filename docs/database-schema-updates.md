# Database Schema Updates - Summary

## Changes Made to `schema.prisma`

### 1. **User Model** - Added Verification Fields
- `passportPhotoUrl`: Changed to `@db.Text` for compressed images
- Added `isEmailVerified`, `isPhoneVerified`, `isIdentityVerified` boolean fields
- Added relations to `DocumentVerification[]` and `BiometricVerification[]`

### 2. **Document Model** - Enhanced Image Handling
- `url`: Changed to `@db.Text` for compressed image URLs
- Added `thumbnailUrl` (Text), `fileSize` (Int), `mimeType` (String)
- `rejectionReason`: Changed to `@db.Text` for longer rejection messages

### 3. **Vehicle Model** - Image URL Updates
- All photo URLs changed to `@db.Text`:
  - `insuranceCertificateUrl`
  - `inspectionReportUrl`
  - `frontPhotoUrl`, `backPhotoUrl`, `sidePhotoUrl`

### 4. **Organization Model** - Image and Document URLs
- `bio`: Changed to `@db.Text`
- `logoUrl`, `bannerUrl`: Changed to `@db.Text` for compressed images
- `registrationCertificateUrl`: Changed to `@db.Text`

### 5. **NEW: DocumentVerification Model**
Supports OCR-based document verification:
- `documentImageUrl` (Text) - Compressed document image
- `fileSize`, `mimeType` - File metadata
- `extractedData` (Json) - OCR results
- `validationErrors` (Json) - Validation issues
- `confidenceScore` (Float) - OCR confidence
- `status` (VerificationStatus enum)

### 6. **NEW: BiometricVerification Model**
Supports face matching and liveness detection:
- `selfieImageUrl` (Text) - Compressed selfie
- `matchScore` (Float) - Face match score 0-1
- `livenessScore` (Float) - Liveness detection 0-1
- `isMatch`, `isLive` (Boolean) - Verification results
- `status` (VerificationStatus enum)

### 7. **NEW Enums**
- `VerificationDocumentType`: NATIONAL_ID, PASSPORT, DRIVERS_LICENSE
- `VerificationStatus`: PENDING, PROCESSING, VERIFIED, FAILED, EXPIRED

## Data Type Rationale

### Why `@db.Text` for Image URLs?
1. **Compressed Images**: Our PassportPhotoUploader creates compressed images that may be stored as:
   - Long URLs (cloud storage with query params)
   - Base64-encoded data URIs (for small images)
   - Signed URLs with tokens (Supabase Storage)

2. **PostgreSQL VARCHAR Limit**: Default `String` maps to `VARCHAR(255)`, which is too short for:
   - Supabase signed URLs: ~200-300 characters
   - Base64 images: Can be several KB
   - `@db.Text` has no practical limit

## Migration Status

⚠️ **Migration Pending**: The schema changes need to be applied to the database.

### Next Steps:
1. Review Supabase configuration
2. Apply migration using Supabase Studio or SQL editor
3. Update Prisma Client in all services
4. Test verification endpoints

## Compatibility Notes

- All changes are **backward compatible** (adding fields, not removing)
- Existing data will not be affected
- New fields have sensible defaults or are optional
