require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching roles...');
    const roles = await prisma.role.findMany();
    roles.forEach(role => {
        console.log(`Role: ${role.name} [Type: ${role.type}] [Platform: ${role.platform}]`);
        console.log(`- Total Permissions: ${role.permissions.length}`);
        const dispatchPerms = role.permissions.filter(p => p.startsWith('DISPATCH_'));
        const driverPerms = role.permissions.filter(p => p.startsWith('DRIVER_'));
        const vehPerms = role.permissions.filter(p => p.startsWith('VEHICLES_'));
        const occPerms = role.permissions.filter(p => p.startsWith('OCCURRENCE_'));

        console.log(`- Dispatch: ${dispatchPerms.length} (${dispatchPerms.join(', ') || 'None'})`);
        console.log(`- Driver: ${driverPerms.length}`);
        console.log(`- Vehicle: ${vehPerms.length}`);
        console.log(`- Occurrence: ${occPerms.length}`);
        console.log('---');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
