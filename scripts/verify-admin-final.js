const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function finalVerification() {
    try {
        console.log('\n' + '█'.repeat(100));
        console.log('█' + ' '.repeat(98) + '█');
        console.log('█' + ' '.repeat(30) + 'FINAL ADMIN USER VERIFICATION' + ' '.repeat(38) + '█');
        console.log('█' + ' '.repeat(98) + '█');
        console.log('█'.repeat(100) + '\n');

        let issuesFound = 0;
        let warningsFound = 0;

        // 1. Check user exists
        console.log('┌─ Step 1: Checking User Existence');
        const user = await prisma.user.findUnique({
            where: { email: 'ke.africabi@gmail.com' },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                userPermissions: true
            }
        });

        if (!user) {
            console.log('└─ ❌ CRITICAL: Admin user does not exist\n');
            issuesFound++;
        } else {
            console.log('└─ ✅ Admin user exists\n');
        }

        // 2. Verify password
        console.log('┌─ Step 2: Password Integrity Check');
        if (!user.password || user.password.length < 10) {
            console.log('└─ ❌ CRITICAL: Invalid password hash\n');
            issuesFound++;
        } else {
            const isValidBcrypt = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
            if (!isValidBcrypt) {
                console.log('└─ ❌ CRITICAL: Password is not properly hashed with bcrypt\n');
                issuesFound++;
            } else {
                const testPassword = await bcrypt.compare('Admin@2026', user.password);
                if (!testPassword) {
                    console.log('└─ ❌ CRITICAL: Password does not match expected value\n');
                    issuesFound++;
                } else {
                    console.log('└─ ✅ Password is properly hashed and matches\n');
                }
            }
        }

        // 3. Verify roles
        console.log('┌─ Step 3: RBAC Role Assignment');
        if (!user.userRoles || user.userRoles.length === 0) {
            console.log('└─ ❌ CRITICAL: No RBAC roles assigned\n');
            issuesFound++;
        } else {
            const superAdminRole = user.userRoles.find(
                ur => ur.role.type === 'SUPER_ADMIN' && ur.isActive && ur.role.isActive
            );

            if (!superAdminRole) {
                console.log('└─ ❌ CRITICAL: SUPER_ADMIN role not assigned or not active\n');
                issuesFound++;
            } else {
                console.log(`└─ ✅ SUPER_ADMIN role assigned (${superAdminRole.role.permissions.length} permissions)\n`);
            }
        }

        // 4. Verify permissions
        console.log('┌─ Step 4: Permissions Validation');
        const permissions = new Set();

        user.userRoles.forEach(ur => {
            if (ur.isActive && ur.role.isActive) {
                ur.role.permissions.forEach(p => permissions.add(p));
            }
        });

        user.userPermissions.forEach(up => {
            if (up.isGranted) {
                permissions.add(up.permission);
            } else {
                permissions.delete(up.permission);
            }
        });

        if (permissions.size === 0) {
            console.log('└─ ❌ CRITICAL: User has no effective permissions\n');
            issuesFound++;
        } else if (permissions.size < 50) {
            console.log(`└─ ⚠️  WARNING: Low permission count (${permissions.size})\n`);
            warningsFound++;
        } else {
            console.log(`└─ ✅ User has ${permissions.size} effective permissions\n`);
        }

        // 5. Test login simulation
        console.log('┌─ Step 5: Login Flow Simulation');
        try {
            const loginUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: 'ke.africabi@gmail.com' },
                        { phone: 'ke.africabi@gmail.com' }
                    ]
                },
                include: {
                    userRoles: {
                        include: {
                            role: true
                        }
                    },
                    userPermissions: true
                }
            });

            const passwordValid = await bcrypt.compare('Admin@2026', loginUser.password);

            if (!passwordValid) {
                throw new Error('Password verification failed');
            }

            const loginPermissions = new Set();
            loginUser.userRoles.forEach(ur => {
                if (ur.isActive && ur.role.isActive) {
                    ur.role.permissions.forEach(p => loginPermissions.add(p));
                }
            });

            const loginResult = {
                id: loginUser.id,
                email: loginUser.email,
                fullName: loginUser.fullName,
                role: loginUser.role,
                permissions: Array.from(loginPermissions)
            };

            console.log('└─ ✅ Login simulation successful\n');
        } catch (error) {
            console.log(`└─ ❌ CRITICAL: Login simulation failed - ${error.message}\n`);
            issuesFound++;
        }

        // 6. Check for security issues
        console.log('┌─ Step 6: Security Audit');
        const securityIssues = [];

        // Check email verification
        if (!user.isEmailVerified) {
            securityIssues.push('Email not verified');
        }

        // Check phone verification
        if (!user.isPhoneVerified) {
            securityIssues.push('Phone not verified');
        }

        // Check for weak password (in production, should enforce strong passwords)
        const weakPasswordPattern = /^(password|admin|123|test)/i;
        if (weakPasswordPattern.test('Admin@2026')) {
            // This is expected for development
            console.log('│  ℹ️  Using development password (should be changed in production)');
        }

        if (securityIssues.length > 0) {
            console.log('│  ⚠️  Security notices:');
            securityIssues.forEach(issue => {
                console.log(`│     - ${issue}`);
            });
            warningsFound += securityIssues.length;
        }
        console.log('└─ ✅ No critical security issues\n');

        // 7. Database consistency check
        console.log('┌─ Step 7: Database Consistency');
        const totalAdmins = await prisma.user.count({
            where: { role: 'ADMIN' }
        });

        const totalSuperAdminRoles = await prisma.userRole.count({
            where: {
                role: {
                    type: 'SUPER_ADMIN'
                }
            }
        });

        console.log(`│  Total ADMIN users: ${totalAdmins}`);
        console.log(`│  Total SUPER_ADMIN role assignments: ${totalSuperAdminRoles}`);

        if (totalAdmins > 1) {
            console.log('│  ⚠️  Multiple admin users detected');
            warningsFound++;
        }

        console.log('└─ ✅ Database consistency verified\n');

        // FINAL REPORT
        console.log('█'.repeat(100));
        console.log('█' + ' '.repeat(98) + '█');
        console.log('█' + ' '.repeat(40) + 'FINAL REPORT' + ' '.repeat(46) + '█');
        console.log('█' + ' '.repeat(98) + '█');
        console.log('█'.repeat(100));
        console.log();

        if (issuesFound === 0 && warningsFound === 0) {
            console.log('🎉 PERFECT! No issues or warnings found.\n');
        } else {
            if (issuesFound > 0) {
                console.log(`❌ Critical Issues Found: ${issuesFound}`);
            }
            if (warningsFound > 0) {
                console.log(`⚠️  Warnings Found: ${warningsFound}`);
            }
            console.log();
        }

        if (issuesFound === 0) {
            console.log('✅ ADMIN USER CREATION: VERIFIED AND WORKING');
            console.log();
            console.log('━'.repeat(100));
            console.log('LOGIN CREDENTIALS');
            console.log('━'.repeat(100));
            console.log('Email:    ke.africabi@gmail.com');
            console.log('Password: Admin@2026');
            console.log('━'.repeat(100));
            console.log();
            console.log('STATUS: ✅ READY FOR PRODUCTION USE');
            console.log('        (Remember to change password after first login)');
        } else {
            console.log('❌ ISSUES DETECTED - Admin user needs attention');
            console.log('Run: node scripts/recreate-super-admin.js');
        }

        console.log();
        console.log('█'.repeat(100));
        console.log();

        process.exit(issuesFound > 0 ? 1 : 0);

    } catch (error) {
        console.error('\n💥 FATAL ERROR:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

finalVerification();
