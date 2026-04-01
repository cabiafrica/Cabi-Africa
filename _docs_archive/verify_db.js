const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rides = await prisma.ride.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            passenger: true,
            driver: {
                include: {
                    user: true
                }
            }
        }
    });

    console.log('Last 5 Rides:');
    console.log(JSON.stringify(rides, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
