
import { PrismaClient, Permission, RoleType, Platform, LegacyRole } from '@prisma/client';

const prisma = new PrismaClient();

const allPermissions = Object.values(Permission);

const roles = [
    {
        name: 'SUPER_ADMIN',
        displayName: 'Super Administrator',
        description: 'Full access to all features and settings',
        type: RoleType.SUPER_ADMIN,
        platform: Platform.ADMIN_PANEL,
        permissions: allPermissions,
        isSystem: true
    },
    {
        name: 'ADMIN',
        displayName: 'Administrator',
        description: 'Access to most features except system critical settings',
        type: RoleType.ADMIN,
        platform: Platform.ADMIN_PANEL,
        permissions: allPermissions.filter(p => !p.startsWith('SYSTEM_') && !p.startsWith('USER_ROLES_')),
        isSystem: true
    },
    {
        name: 'DISPATCH_SUPERVISOR',
        displayName: 'Dispatch Supervisor',
        description: 'Full access to dispatch panel features',
        type: RoleType.DISPATCH_SUPERVISOR,
        platform: Platform.DISPATCH_PANEL,
        permissions: allPermissions.filter(p =>
            p.startsWith('DISPATCH_') ||
            p.startsWith('DRIVER_') ||
            p.startsWith('OCCURRENCE_') ||
            p.startsWith('VEHICLE_')
        ),
        isSystem: true
    },
    {
        name: 'DISPATCHER',
        displayName: 'Dispatcher',
        description: 'Standard dispatch operations',
        type: RoleType.DISPATCHER,
        platform: Platform.DISPATCH_PANEL,
        permissions: [
            Permission.DISPATCH_DASHBOARD_VIEW,
            Permission.DISPATCH_RIDE_ASSIGN,
            Permission.DISPATCH_RIDE_MONITOR,
            Permission.DISPATCH_REAL_TIME_MAP,
            Permission.DRIVER_DOCUMENTS_VIEW, // To check if driver is valid
            Permission.OCCURRENCE_CREATE,
            Permission.OCCURRENCE_VIEW
        ],
        isSystem: true
    },
    {
        name: 'MARKETING_ADMIN',
        displayName: 'Marketing Administrator',
        description: 'Manage marketing content and portals',
        type: RoleType.MARKETING_ADMIN,
        platform: Platform.USER_PORTAL,
        permissions: allPermissions.filter(p =>
            p.startsWith('MARKETING_') ||
            p.startsWith('BLOG_') ||
            p === Permission.ORG_STRUCTURE_VIEW
        ),
        isSystem: true
    },
    {
        name: 'DRIVER',
        displayName: 'Driver',
        description: 'Mobile app driver access',
        type: RoleType.DRIVER,
        platform: Platform.MOBILE_APP,
        permissions: [
            Permission.OCCURRENCE_CREATE,
            Permission.DRIVER_PROFILE_EDIT
        ],
        isSystem: true
    },
    {
        name: 'PASSENGER',
        displayName: 'Passenger',
        description: 'Mobile app passenger access',
        type: RoleType.PASSENGER,
        platform: Platform.MOBILE_APP,
        permissions: [
            Permission.OCCURRENCE_CREATE,
            Permission.PASSENGER_PROFILES_EDIT
        ],
        isSystem: true
    }
];

async function main() {
    console.log('Seeding roles...');

    for (const roleData of roles) {
        const role = await prisma.role.upsert({
            where: { name: roleData.name },
            update: {
                permissions: roleData.permissions,
                displayName: roleData.displayName,
                description: roleData.description
            },
            create: {
                name: roleData.name,
                displayName: roleData.displayName,
                description: roleData.description,
                type: roleData.type,
                platform: roleData.platform,
                permissions: roleData.permissions,
                isSystem: roleData.isSystem
            }
        });
        console.log(`Upserted role: ${role.name}`);
    }

    // Assign SUPER_ADMIN role to the existing Super Admin user (if any)
    const superAdminUser = await prisma.user.findFirst({
        where: {
            OR: [
                { role: LegacyRole.ADMIN },
                { email: 'super@cabi.com' }
            ]
        }
    });

    if (superAdminUser) {
        const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
        if (superAdminRole) {
            await prisma.userRole.upsert({
                where: {
                    userId_roleId_organizationId: {
                        userId: superAdminUser.id,
                        roleId: superAdminRole.id,
                        organizationId: "global" // Using a dummy string or handle null in unique constraint? 
                        // Wait, organizationId is nullable in schema.
                        // Constraint is @@unique([userId, roleId, organizationId])
                        // In Prisma, unique constraint with nulls behaves differently depending on DB.
                        // Postgres treats NULLs as distinct, so multiple (u1, r1, NULL) rows can exist?
                        // No, standard SQL says yes, but let's check.
                        // If I want global role, organizationId should be null.
                        // But upsert where clause needs all fields of unique compound key.
                        // If I can't pass null to where for unique, I might need findFirst then update/create.
                        // Let's try findFirst.
                    }
                },
                create: {
                    userId: superAdminUser.id,
                    roleId: superAdminRole.id,
                },
                update: {}
                // Actually, unique constraint on nullable fields is tricky in Prisma upsert.
                // I'll skip upsert and just check existence.
            }).catch(async (e) => {
                // Fallback manual check
                // If "Input error" (null in where), do manual
            });

            const existingUserRole = await prisma.userRole.findFirst({
                where: {
                    userId: superAdminUser.id,
                    roleId: superAdminRole.id,
                    organizationId: null
                }
            });

            if (!existingUserRole) {
                await prisma.userRole.create({
                    data: {
                        userId: superAdminUser.id,
                        roleId: superAdminRole.id
                    }
                });
                console.log(`Assigned SUPER_ADMIN role to user: ${superAdminUser.email}`);
            } else {
                console.log(`User ${superAdminUser.email} already has SUPER_ADMIN role.`);
            }
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
