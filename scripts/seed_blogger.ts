require('dotenv').config();
import { PrismaClient, Permission, RoleType, Platform, LegacyRole } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting DB Seed: Blogger Role & User');

    // 1. Create or Update the BLOGGER role
    const bloggerRole = await prisma.role.upsert({
        where: { name: 'BLOGGER' },
        update: {
            permissions: ['BLOG_POSTS_VIEW' as any, 'BLOG_POSTS_EDIT' as any],
            displayName: 'Content Blogger',
            description: 'Dedicated role for blog writers. Grants access only to the CMS dashboard.',
            platform: Platform.ADMIN_PANEL,
            type: RoleType.BLOG_WRITER,
            isSystem: true
        },
        create: {
            name: 'BLOGGER',
            displayName: 'Content Blogger',
            description: 'Dedicated role for blog writers. Grants access only to the CMS dashboard.',
            type: RoleType.BLOG_WRITER,
            platform: Platform.ADMIN_PANEL,
            permissions: ['BLOG_POSTS_VIEW' as any, 'BLOG_POSTS_EDIT' as any],
            isSystem: true
        }
    });
    console.log(`✅ Upserted role: ${bloggerRole.name}`);

    // 2. Create the Blogger User
    const bloggerEmail = 'blogger@cabi.africa';
    const hashedPassword = await bcrypt.hash('CabiBlogger2026!', 10);
    
    // Check if user exists first to safely upsert based on email
    let user = await prisma.user.findUnique({
        where: { email: bloggerEmail }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: bloggerEmail,
                phone: '+254700000001', // Example phone
                password: hashedPassword,
                fullName: 'Cabi Blogger',
                role: LegacyRole.DISPATCHER, // Base legacy role needs to be non-ADMIN to allow granular RBAC to take effect in the UI
            }
        });
        console.log(`✅ Created new user: ${user.email}`);
    } else {
        // Update the role to DISPATCHER to ensure granular permissions work
        user = await prisma.user.update({
            where: { email: bloggerEmail },
            data: { role: LegacyRole.DISPATCHER }
        });
        console.log(`✅ Updated existing user ${user.email} to DISPATCHER role.`);
    }

    // 3. Assign the BLOGGER role to the user
    // The compound unique constraint is userId_roleId_organizationId
    // We search for an existing assignment first
    const existingUserRole = await prisma.userRole.findFirst({
        where: {
            userId: user.id,
            roleId: bloggerRole.id,
            organizationId: null
        }
    });

    if (!existingUserRole) {
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: bloggerRole.id,
                // organizationId omitted or null means it applies globally
            }
        });
        console.log(`✅ Assigned BLOGGER role to user: ${user.email}`);
    } else {
        console.log(`✅ User ${user.email} already has the BLOGGER role assigned.`);
    }

    // 4. Create Senior Blogger Role
    const seniorRole = await prisma.role.upsert({
        where: { name: 'SENIOR_BLOGGER' },
        update: {
            permissions: [
                'BLOG_POSTS_VIEW' as any, 
                'BLOG_POSTS_EDIT' as any,
                'BLOG_POSTS_PUBLISH' as any // Grant publishing rights
            ],
            displayName: 'Senior Blog Manager',
            description: 'Can review and publish blog posts.',
            platform: Platform.ADMIN_PANEL,
            type: RoleType.CONTENT_EDITOR,
            isSystem: true
        },
        create: {
            name: 'SENIOR_BLOGGER',
            displayName: 'Senior Blog Manager',
            description: 'Can review and publish blog posts.',
            type: RoleType.CONTENT_EDITOR,
            platform: Platform.ADMIN_PANEL,
            permissions: [
                'BLOG_POSTS_VIEW' as any, 
                'BLOG_POSTS_EDIT' as any,
                'BLOG_POSTS_PUBLISH' as any
            ],
            isSystem: true
        }
    });
    console.log(`✅ Upserted role: ${seniorRole.name}`);

    // 5. Create Senior Manager User
    const seniorEmail = 'senior.blogger@cabi.africa';
    const seniorPassword = await bcrypt.hash('CabiSenior2026!', 10);
    
    let seniorUser = await prisma.user.findUnique({ where: { email: seniorEmail } });

    if (!seniorUser) {
        seniorUser = await prisma.user.create({
            data: {
                email: seniorEmail,
                phone: '+254700000002',
                password: seniorPassword,
                fullName: 'Senior Blog Manager',
                role: LegacyRole.DISPATCHER,
            }
        });
        console.log(`✅ Created senior user: ${seniorUser.email}`);
    }

    // Assign SENIOR_BLOGGER role
    const existingSeniorRole = await prisma.userRole.findFirst({
        where: { userId: seniorUser.id, roleId: seniorRole.id }
    });

    if (!existingSeniorRole) {
        await prisma.userRole.create({
            data: { userId: seniorUser.id, roleId: seniorRole.id }
        });
        console.log(`✅ Assigned SENIOR_BLOGGER role to: ${seniorUser.email}`);
    }

    console.log('\n=======================================');
    console.log('🎉 Seeding completed successfully!');
    console.log('Blogger Credentials:');
    console.log('Email: blogger@cabi.africa / Pass: CabiBlogger2026!');
    console.log('Senior Manager Credentials:');
    console.log('Email: senior.blogger@cabi.africa / Pass: CabiSenior2026!');
    console.log('=======================================\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding: ', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
