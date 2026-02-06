
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

async function testDirectConnection() {
  console.log('🔍 Testing Supabase Direct Connection (Port 5432)...\n');
  console.log('URL:', process.env.DIRECT_URL);

  try {
    console.log('1️⃣  Testing connecting...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully via DIRECT_URL!\n');
    
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('Database version:', version[0].version);

  } catch (error) {
    console.error('❌ Direct connection test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectConnection();
