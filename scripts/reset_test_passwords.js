/**
 * reset_test_passwords.js
 * Resets all test account passwords to Password123! in the live Supabase DB
 * Run: node scripts/reset_test_passwords.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL },
  },
});

const TEST_ACCOUNTS = [
  { email: 'driver@test.com',        newPassword: 'Password123!', role: 'DRIVER' },
  { email: 'passenger@test.com',     newPassword: 'Password123!', role: 'PASSENGER' },
  { email: 'superadmin@cabi.africa', newPassword: 'Cabi2026!',    role: 'ADMIN' },
];

async function main() {
  console.log('🔄 Resetting test account passwords...\n');

  for (const acct of TEST_ACCOUNTS) {
    try {
      const hash = await bcrypt.hash(acct.newPassword, 10);
      const updated = await prisma.user.update({
        where: { email: acct.email },
        data: {
          password: hash,
          status: 'ACTIVE',
          isEmailVerified: true,
          isPhoneVerified: true,
          isIdentityVerified: true,
        },
      });
      console.log(`✅  ${acct.role.padEnd(12)} | ${acct.email.padEnd(35)} | Password: ${acct.newPassword}`);
    } catch (e) {
      if (e.code === 'P2025') {
        console.log(`⚠️  User not found, skipping: ${acct.email}`);
      } else {
        console.error(`❌  Failed for ${acct.email}:`, e.message);
      }
    }
  }

  console.log('\n📋  Summary of working credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DRIVER    driver@test.com          Password123!');
  console.log('  PASSENGER passenger@test.com       Password123!');
  console.log('  ADMIN     superadmin@cabi.africa   Cabi2026!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
