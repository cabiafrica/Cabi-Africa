
import { PrismaClient, LegacyRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'super@cabi.com';
    const password = 'simplepassword'; // Creating a simple password as requested
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Recreating Super Admin user: ${email}`);

    // 1. Find or create the SUPER_ADMIN role (ensure it exists)
    // We expect seed_roles.ts to have run, but we can double check or fail
    const superAdminRole = await prisma.role.findUnique({
        where: { name: 'SUPER_ADMIN' },
    });

    if (!superAdminRole) {
        console.error('Error: SUPER_ADMIN role not found. Please run "npx ts-node scripts/seed_roles.ts" first.');
        process.exit(1);
    }

    // 2. Upsert the user
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            fullName: 'Super Administrator',
            role: LegacyRole.ADMIN, // Set legacy role for backward compatibility
            phone: '+254700000000', // Dummy phone number for super admin
        },
        create: {
            email,
            password: hashedPassword,
            fullName: 'Super Administrator',
            role: LegacyRole.ADMIN,
            phone: '+254700000000',
            isEmailVerified: true,
            isPhoneVerified: true,
            isIdentityVerified: true,
        },
    });

    console.log(`User upserted: ${user.id}`);

    // 3. Assign SUPER_ADMIN role
    // Check if mapping exists
    const existingUserRole = await prisma.userRole.findFirst({
        where: {
            userId: user.id,
            roleId: superAdminRole.id,
            organizationId: null,
        },
    });

    if (!existingUserRole) {
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: superAdminRole.id,
                assignedById: user.id, // Self-assigned or leave null
            },
        });
        console.log(`Assigned SUPER_ADMIN role to user.`);
    } else {
        console.log(`User already has SUPER_ADMIN role.`);
    }

    console.log('Super Admin recreation completed successfully.');
    console.log(`Credentials: ${email} / ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
