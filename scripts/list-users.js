require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
    try {
        console.log('Fetching users from the database...\n');

        const users = await prisma.user.findMany({
            include: {
                userRoles: {
                    include: {
                        role: true,
                        organizations: true
                    }
                },
                driverProfile: {
                    include: {
                        vehicles: true,
                        organizations: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Total Users: ${users.length}\n`);
        console.log('='.repeat(120));

        users.forEach((user, index) => {
            console.log(`\n${index + 1}. USER DETAILS`);
            console.log('-'.repeat(120));
            console.log(`ID:           ${user.id}`);
            console.log(`Full Name:    ${user.fullName}`);
            console.log(`Email:        ${user.email}`);
            console.log(`Phone:        ${user.phone}`);
            console.log(`Username:     ${user.username || 'N/A'}`);
            console.log(`Legacy Role:  ${user.role}`);
            console.log(`ID Number:    ${user.idNumber || 'N/A'}`);

            // Verification Status
            console.log(`\nVerification Status:`);
            console.log(`  Email:      ${user.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}`);
            console.log(`  Phone:      ${user.isPhoneVerified ? '✓ Verified' : '✗ Not Verified'}`);
            console.log(`  Identity:   ${user.isIdentityVerified ? '✓ Verified' : '✗ Not Verified'}`);

            // RBAC Roles
            if (user.userRoles && user.userRoles.length > 0) {
                console.log(`\nRBAC Roles (${user.userRoles.length}):`);
                user.userRoles.forEach(ur => {
                    const orgInfo = ur.organizations ? ` [Org: ${ur.organizations.name}]` : '';
                    const status = ur.isActive ? '✓ Active' : '✗ Inactive';
                    console.log(`  - ${ur.role.displayName} (${ur.role.type})${orgInfo} - ${status}`);
                });
            } else {
                console.log(`\nRBAC Roles: None assigned`);
            }

            // Driver Profile
            if (user.driverProfile) {
                console.log(`\nDriver Profile:`);
                console.log(`  License:    ${user.driverProfile.licenseNumber}`);
                console.log(`  Online:     ${user.driverProfile.isOnline ? 'Yes' : 'No'}`);
                console.log(`  Biometric:  ${user.driverProfile.isBiometricVerified ? '✓ Verified' : '✗ Not Verified'}`);

                if (user.driverProfile.vehicles) {
                    console.log(`  Vehicle:    ${user.driverProfile.vehicles.make} ${user.driverProfile.vehicles.model} (${user.driverProfile.vehicles.plateNumber})`);
                }

                if (user.driverProfile.organizations) {
                    console.log(`  Organization: ${user.driverProfile.organizations.name}`);
                }
            }

            // Referral Info
            if (user.referralCode) {
                console.log(`\nReferral Code: ${user.referralCode}`);
            }

            console.log(`\nCreated:      ${user.createdAt.toISOString()}`);
            console.log(`Updated:      ${user.updatedAt.toISOString()}`);
            console.log('='.repeat(120));
        });

        // Summary Statistics
        console.log(`\n\nSUMMARY STATISTICS`);
        console.log('='.repeat(120));

        const stats = {
            total: users.length,
            passengers: users.filter(u => u.role === 'PASSENGER').length,
            drivers: users.filter(u => u.driverProfile).length,
            admins: users.filter(u => u.role === 'ADMIN').length,
            dispatchers: users.filter(u => u.role === 'DISPATCHER').length,
            emailVerified: users.filter(u => u.isEmailVerified).length,
            phoneVerified: users.filter(u => u.isPhoneVerified).length,
            identityVerified: users.filter(u => u.isIdentityVerified).length,
            withRBACRoles: users.filter(u => u.userRoles && u.userRoles.length > 0).length
        };

        console.log(`Total Users:           ${stats.total}`);
        console.log(`Passengers:            ${stats.passengers}`);
        console.log(`Drivers:               ${stats.drivers}`);
        console.log(`Admins:                ${stats.admins}`);
        console.log(`Dispatchers:           ${stats.dispatchers}`);
        console.log(`Email Verified:        ${stats.emailVerified}`);
        console.log(`Phone Verified:        ${stats.phoneVerified}`);
        console.log(`Identity Verified:     ${stats.identityVerified}`);
        console.log(`With RBAC Roles:       ${stats.withRBACRoles}`);
        console.log('='.repeat(120));

    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
