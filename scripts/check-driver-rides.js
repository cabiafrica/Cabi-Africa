
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const driver = await prisma.user.findUnique({
    where: { email: 'driver@test.com' },
    include: { driverProfile: true }
  });

  if (!driver || !driver.driverProfile) {
    console.log('Driver not found');
    return;
  }

  const rides = await prisma.ride.findMany({
    where: { driverId: driver.driverProfile.id },
  });

  console.log('Rides for driver:', rides.length);
  console.log(JSON.stringify(rides, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
