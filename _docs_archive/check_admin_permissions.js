const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPermissions() {
    try {
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
            console.log('User not found');
            return;
        }

        const permissions = new Set();
        user.userRoles.forEach(ur => {
            if (ur.isActive && ur.role.isActive) {
                console.log(`Role: ${ur.role.name} (${ur.role.type}) - Permissions count: ${ur.role.permissions.length}`);
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

        console.log('\nEffective Permissions:');
        console.log(JSON.stringify(Array.from(permissions).sort(), null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPermissions();
