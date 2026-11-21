
const { PrismaClient, VehicleType } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring test driver has a vehicle...');
  
  const user = await prisma.user.findUnique({
    where: { email: 'driver@test.com' },
    include: { 
      driverProfile: {
        include: { vehicles: true }
      }
    }
  });

  if (!user || !user.driverProfile) {
    console.error('Test driver profile not found!');
    return;
  }

  const driver = user.driverProfile;

  if (!driver.vehicles) {
    console.log('Adding vehicle to test driver...');
    await prisma.vehicle.create({
      data: {
        driverProfileId: driver.id,
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        plateNumber: 'KDM 123A',
        type: VehicleType.STANDARD,
        usage: 'TAXI'
      }
    });
    console.log('Vehicle added successfully.');
  } else {
    console.log('Test driver already has a vehicle:', driver.vehicles.plateNumber);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
