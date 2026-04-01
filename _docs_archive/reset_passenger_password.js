
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
    try {
        const email = 'mailtosamkaranja@gmail.com';
        const newPassword = 'Prospect@2026';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`Resetting password for: ${email}`);

        const user = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                status: 'ACTIVE',
                isEmailVerified: true,
                isPhoneVerified: true
            }
        });

        console.log('✅ Password Reset Successfully!');
        console.log('-----------------------------------');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log('-----------------------------------');
        console.log('Account Status: ACTIVE');
        console.log('Verification:   VERIFIED');

    } catch (error) {
        console.error('❌ Reset failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
