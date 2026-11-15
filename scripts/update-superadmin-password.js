const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateSuperAdminPassword() {
    try {
        // Get password from command line argument
        const newPassword = process.argv[2];

        if (!newPassword) {
            console.error('\n❌ Error: Password is required!');
            console.log('\nUsage: node update-superadmin-password.js <new-password>');
            console.log('Example: node update-superadmin-password.js MyNewSecurePass123!\n');
            process.exit(1);
        }

        console.log('Updating Super Admin password...\n');

        // Find the super admin user
        const user = await prisma.user.findUnique({
            where: { email: 'ke.africabi@gmail.com' }
        });

        if (!user) {
            console.error('❌ Super Admin user not found!');
            process.exit(1);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        console.log('='.repeat(80));
        console.log('✓ PASSWORD UPDATED SUCCESSFULLY');
        console.log('='.repeat(80));
        console.log('\nLogin Credentials:');
        console.log('------------------');
        console.log(`Email:    ${user.email}`);
        console.log(`Username: ${user.username}`);
        console.log(`Password: ${newPassword}`);
        console.log('\n' + '='.repeat(80));

    } catch (error) {
        console.error('\n❌ Error updating password:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateSuperAdminPassword();
