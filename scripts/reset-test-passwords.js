const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetTestPasswords() {
    const NEW_PASSWORD = 'Driver@2026';
    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

    const emails = ['driver@test.com', 'passenger@test.com'];
    for (const email of emails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            await prisma.user.update({
                where: { email },
                data: { password: hashed },
            });
            console.log(`✓ Reset password for ${email}`);
        } else {
            console.log(`✗ User not found: ${email}`);
        }
    }

    console.log(`\nNew password for all updated accounts: ${NEW_PASSWORD}`);
    await prisma.$disconnect();
}

resetTestPasswords().catch(console.error);
