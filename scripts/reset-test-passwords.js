const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetTestPasswords() {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Refusing to reset test passwords when NODE_ENV=production.');
        process.exit(1);
    }
    const NEW_PASSWORD = process.env.TEST_RESET_PASSWORD;
    if (!NEW_PASSWORD || NEW_PASSWORD.length < 10) {
        console.error('❌ Set TEST_RESET_PASSWORD (min 10 chars) in your environment before running this script.');
        process.exit(1);
    }
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

    console.log('\n✓ Test account passwords updated.');
    await prisma.$disconnect();
}

resetTestPasswords().catch(console.error);
