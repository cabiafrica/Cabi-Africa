const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const driverProfileId = process.argv[2];
  if (!driverProfileId) {
    console.error('Usage: node verify-driver.js <driverProfileId>');
    process.exit(1);
  }

  const driver = await prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: { isBiometricVerified: true }
  });

  console.log('Driver Verified:', JSON.stringify(driver, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
