
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing active rides for test driver...');
  
  const user = await prisma.user.findUnique({
    where: { email: 'driver@test.com' },
    include: { driverProfile: true }
  });

  if (!user || !user.driverProfile) {
    console.error('Test driver profile not found!');
    return;
  }

  await prisma.ride.updateMany({
    where: { 
        driverId: user.driverProfile.id,
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
    },
    data: {
      status: 'CANCELLED'
    }
  });

  console.log('Active rides cleared.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
