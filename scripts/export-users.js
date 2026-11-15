const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const users = await p.user.findMany({
        where: {
            email: {
                in: ['driver@test.com', 'passenger@test.com', 'ke.africabi@gmail.com']
            }
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            password: true,
            role: true,
            username: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            isIdentityVerified: true,
            status: true,
        }
    });
    console.log(JSON.stringify(users, null, 2));
    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
