
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../../.env' }); // Adjust path to root .env
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
            email: true,
            role: true,
            referralCode: true,
            fullName: true
        }
    });

    console.log('Latest User:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
