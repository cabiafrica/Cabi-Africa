
const { PrismaClient } = require('@prisma/client');

// Using IP address derived from nslookup 18.202.64.2
const connectionString = "postgresql://postgres.goasbgflheresuumhmvd:z%25gDuB9yZJbSpAd@18.202.64.2:5432/postgres";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: connectionString,
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});

async function testIpConnection() {
    console.log('🔍 Testing Supabase Connection via IP (Port 5432)...\n');
    console.log('URL:', connectionString);

    try {
        console.log('1️⃣  Testing connecting...');
        await prisma.$connect();
        console.log('✅ Connected to database successfully via IP!\n');

        const version = await prisma.$queryRaw`SELECT version()`;
        console.log('Database version:', version[0].version);

    } catch (error) {
        console.error('❌ IP connection test failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testIpConnection();
