const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const driver = await prisma.driverProfile.findFirst({
    where: { user: { email: 'driver@test.com' } },
    include: { user: true, vehicles: true }
  });
  console.log('Driver Profile:', {
    id: driver.id,
    userId: driver.userId,
    isOnline: driver.isOnline,
    isAvailable: driver.isAvailable,
    currentLatitude: driver.currentLatitude,
    currentLongitude: driver.currentLongitude,
    isBiometricVerified: driver.isBiometricVerified,
    verificationStatus: driver.verificationStatus,
    email: driver.user.email,
  });
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
