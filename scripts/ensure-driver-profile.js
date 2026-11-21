const { PrismaClient, VehicleType } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking driver account for driver@test.com...');
  
  const user = await prisma.user.findUnique({
    where: { email: 'driver@test.com' },
    include: { 
      driverProfile: {
        include: { vehicles: true }
      }
    }
  });

  if (!user) {
    console.error('❌ User driver@test.com not found!');
    return;
  }

  console.log('User found:', user.id, user.email, 'Role:', user.role);

  let driverProfile = user.driverProfile;

  if (!driverProfile) {
    console.log('⚠️ No driverProfile found for user. Creating one now...');
    driverProfile = await prisma.driverProfile.create({
      data: {
        userId: user.id,
        licenseNumber: 'DL-KENYA-78901',
        isOnline: false,
        acceptanceRate: 98.5,
        averageRating: 4.95,
        totalRidesCompleted: 154,
        isBiometricVerified: true,
        currentLocation: { lat: -1.286389, lng: 36.817223 } // Nairobi CBD
      }
    });
    console.log('✅ Created driverProfile:', driverProfile.id);
  } else {
    console.log('Existing driverProfile found:', driverProfile.id, 'isOnline:', driverProfile.isOnline);
  }

  // Ensure vehicle exists and is linked
  let vehicle = await prisma.vehicle.findFirst({
    where: { driverProfileId: driverProfile.id }
  });

  if (!vehicle) {
    console.log('⚠️ No vehicle found for driver profile. Creating active vehicle...');
    // Use an upsert or check plate number
    const plate = 'KDH 452X';
    vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: plate },
      update: {
        driverProfileId: driverProfile.id,
        make: 'Toyota',
        model: 'Axio Hybrid',
        color: 'Silver',
        year: 2022
      },
      create: {
        driverProfileId: driverProfile.id,
        make: 'Toyota',
        model: 'Axio Hybrid',
        color: 'Silver',
        year: 2022,
        plateNumber: plate,
        type: VehicleType.STANDARD,
        usage: 'TAXI'
      }
    });
    console.log('✅ Linked vehicle:', vehicle.plateNumber, vehicle.make, vehicle.model);
  } else {
    console.log('Existing vehicle found:', vehicle.plateNumber, vehicle.make, vehicle.model);
  }

  console.log('\n🎉 Driver account is now fully configured with active Profile & Vehicle!');
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
