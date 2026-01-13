# Supabase Production Configuration Checklist

## ✅ Database Schema Configuration

### Current Status: **CONFIGURED**

The Prisma schema is properly configured for Supabase PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Key Features:
- ✅ **Connection Pooling**: Uses `DATABASE_URL` for pooled connections (recommended for serverless)
- ✅ **Direct Connection**: Uses `DIRECT_URL` for migrations and admin tasks
- ✅ **Provider**: PostgreSQL (Supabase's database)

---

## 🔍 Required Environment Variables

Your `.env` file should contain:

```bash
# Supabase Database URLs
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# Supabase Project Settings
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

### Connection String Breakdown:

1. **DATABASE_URL** (Pooled - for application queries)
   - Uses PgBouncer pooling (`?pgbouncer=true`)
   - Port: 5432
   - Host: `aws-1-eu-west-1.pooler.supabase.com`
   - Best for: API requests, serverless functions

2. **DIRECT_URL** (Direct - for migrations)
   - No pooling
   - Port: 5432
   - Same host
   - Best for: Prisma migrations, admin tasks

---

## 📋 Production Readiness Checklist

### 1. Database Configuration ✅
- [x] Prisma schema configured
- [x] Connection pooling enabled
- [x] Direct URL for migrations
- [ ] **TODO**: Apply pending migrations

### 2. Data Types & Schema ✅
- [x] Image URLs use `@db.Text` (supports long URLs, base64)
- [x] Verification tables added (DocumentVerification, BiometricVerification)
- [x] User verification status fields added
- [x] File metadata fields (fileSize, mimeType) added
- [x] Proper enums for verification status

### 3. Supabase Storage Configuration ⚠️
**Action Required**: Configure Supabase Storage buckets

```sql
-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('passport-photos', 'passport-photos', false),
  ('documents', 'documents', false),
  ('vehicle-photos', 'vehicle-photos', false),
  ('organization-logos', 'organization-logos', true);

-- Set up RLS policies for passport photos
CREATE POLICY "Users can upload their own passport photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'passport-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own passport photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'passport-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Database Indexes ⚠️
**Recommended**: Add indexes for performance

```sql
-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Document verification lookups
CREATE INDEX IF NOT EXISTS idx_doc_verification_user ON document_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_verification_status ON document_verifications(status);

-- Biometric verification lookups
CREATE INDEX IF NOT EXISTS idx_bio_verification_user ON biometric_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bio_verification_doc ON biometric_verifications(document_verification_id);

-- Driver profile lookups
CREATE INDEX IF NOT EXISTS idx_driver_profile_user ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profile_org ON driver_profiles(organization_id);
```

### 5. Row Level Security (RLS) ⚠️
**Critical for Production**: Enable RLS on all tables

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id);

-- Apply similar policies to other tables
```

### 6. Connection Limits & Pooling ✅
- [x] PgBouncer enabled (handles 1000s of connections)
- [x] Recommended for serverless/edge functions
- [x] Prevents "too many connections" errors

### 7. Backup & Recovery ⚠️
**Verify**: Supabase automatic backups are enabled
- Daily backups (free tier: 7 days retention)
- Point-in-time recovery (paid plans)
- Manual backup option available

---

## 🚀 Migration Application Steps

Since we're in a non-interactive environment, apply migrations via Supabase Studio:

### Option 1: Supabase Studio (Recommended)
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Run the migration SQL (see below)

### Option 2: Direct SQL Execution
```bash
# Generate migration SQL
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

# Review migration.sql
# Apply via Supabase Studio SQL Editor
```

### Migration SQL Preview
The migration will:
1. Add verification status columns to `users` table
2. Create `document_verifications` table
3. Create `biometric_verifications` table
4. Add enums: `VerificationDocumentType`, `VerificationStatus`
5. Alter existing columns to use `TEXT` type for image URLs
6. Add file metadata columns (`fileSize`, `mimeType`, `thumbnailUrl`)

---

## 🔐 Security Recommendations

### 1. API Keys Management
- ✅ Use `SUPABASE_ANON_KEY` for client-side (public)
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` for server-side only
- ⚠️ Never expose service role key in frontend code

### 2. Environment Variables
- ✅ Store in `.env` (gitignored)
- ✅ Use separate `.env.production` for production
- ⚠️ Use Vercel/Railway environment variables for deployment

### 3. CORS Configuration
Ensure Supabase allows requests from your domains:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

---

## 📊 Performance Optimization

### 1. Connection Pooling ✅
Already configured via PgBouncer

### 2. Query Optimization
- Use Prisma's `select` to fetch only needed fields
- Implement pagination for large datasets
- Use `include` carefully to avoid N+1 queries

### 3. Caching Strategy
Consider implementing:
- Redis for session caching
- CDN for static assets (images)
- Edge caching for API responses

---

## 🧪 Testing Checklist

Before going to production:

- [ ] Test database connection from all services
- [ ] Verify image upload to Supabase Storage
- [ ] Test document verification flow
- [ ] Test biometric verification flow
- [ ] Load test with expected traffic
- [ ] Verify RLS policies work correctly
- [ ] Test backup restoration
- [ ] Monitor connection pool usage

---

## 📞 Supabase Support

- **Dashboard**: https://app.supabase.com
- **Docs**: https://supabase.com/docs
- **Status**: https://status.supabase.com
- **Community**: https://github.com/supabase/supabase/discussions

---

## ✅ Current Status Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Database Schema | ✅ Configured | Apply migration |
| Connection Pooling | ✅ Enabled | None |
| Data Types | ✅ Optimized | None |
| Storage Buckets | ⚠️ Pending | Create buckets |
| RLS Policies | ⚠️ Pending | Enable & configure |
| Indexes | ⚠️ Pending | Add performance indexes |
| Backups | ℹ️ Unknown | Verify enabled |

**Next Immediate Steps:**
1. Apply the Prisma migration to create new tables
2. Set up Supabase Storage buckets
3. Configure RLS policies
4. Add database indexes
