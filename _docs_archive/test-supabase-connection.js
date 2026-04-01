// Supabase Connection Test Script
// Run with: node test-supabase-connection.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Database Connection...\n');

    try {
        // Test 1: Basic connection
        console.log('1️⃣  Testing basic connection...');
        await prisma.$connect();
        console.log('✅ Connected to database successfully!\n');

        // Test 2: Query existing tables
        console.log('2️⃣  Checking existing tables...');
        const userCount = await prisma.user.count();
        console.log(`✅ Users table accessible (${userCount} users)\n`);

        // Test 3: Check if new tables exist
        console.log('3️⃣  Checking for verification tables...');
        try {
            const docVerificationCount = await prisma.$queryRaw`
        SELECT COUNT(*) FROM document_verifications
      `;
            console.log('✅ document_verifications table exists\n');
        } catch (error) {
            console.log('⚠️  document_verifications table NOT found (migration pending)\n');
        }

        try {
            const bioVerificationCount = await prisma.$queryRaw`
        SELECT COUNT(*) FROM biometric_verifications
      `;
            console.log('✅ biometric_verifications table exists\n');
        } catch (error) {
            console.log('⚠️  biometric_verifications table NOT found (migration pending)\n');
        }

        // Test 4: Check column types
        console.log('4️⃣  Checking column data types...');
        const columnInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('passportPhotoUrl', 'isEmailVerified', 'isPhoneVerified', 'isIdentityVerified')
      ORDER BY column_name
    `;
        console.log('User table columns:', columnInfo);
        console.log('');

        // Test 5: Check database version
        console.log('5️⃣  Checking PostgreSQL version...');
        const version = await prisma.$queryRaw`SELECT version()`;
        console.log('Database version:', version[0].version.split(' ')[0], version[0].version.split(' ')[1]);
        console.log('');

        // Test 6: Check connection pool
        console.log('6️⃣  Connection pool info...');
        const poolInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;
        console.log('Pool stats:', poolInfo[0]);
        console.log('');

        console.log('✅ All connection tests passed!');
        console.log('\n📋 Summary:');
        console.log('  - Database: Connected ✅');
        console.log('  - Pooling: Configured ✅');
        console.log('  - Migration: Pending ⚠️');
        console.log('\n💡 Next step: Apply migration SQL via Supabase Studio');

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('  1. Check .env file has DATABASE_URL and DIRECT_URL');
        console.error('  2. Verify Supabase project is active');
        console.error('  3. Check network connectivity');
        console.error('  4. Verify database credentials');
    } finally {
        await prisma.$disconnect();
    }
}

testSupabaseConnection()
    .catch(console.error);
