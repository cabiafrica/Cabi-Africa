
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating test driver location and ensuring online status...');
  
  const user = await prisma.user.findUnique({
    where: { email: 'driver@test.com' },
    include: { driverProfile: true }
  });

  if (!user || !user.driverProfile) {
    console.error('Test driver profile not found!');
    return;
  }

  await prisma.driverProfile.update({
    where: { id: user.driverProfile.id },
    data: {
      isOnline: true,
      currentLocation: {
        lat: -1.286389,
        lng: 36.817223
      }
    }
  });

  console.log('Test driver updated successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
