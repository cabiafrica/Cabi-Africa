
import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL,
        },
    },
});

async function measureQuery(name: string, queryFn: () => Promise<any>) {
    const start = performance.now();
    await queryFn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return end - start;
}

async function main() {
    console.log('🚀 Starting Database Performance Verification...\n');

    try {
        // 1. Connection Overhead
        await measureQuery('Connection & Handshake', async () => {
            await prisma.$connect();
            await prisma.$queryRaw`SELECT 1`;
        });

        // 2. Simple Lookup (Indexed)
        await measureQuery('User Lookup by Email (Indexed)', async () => {
            // Use a non-existent email to force index seek
            await prisma.user.findFirst({ where: { email: 'performance_test_non_existent@cabi.com' } });
        });

        // 3. Simple Lookup (Indexed)
        await measureQuery('Ride Lookup by Status (Indexed)', async () => {
            await prisma.ride.findFirst({ where: { status: 'COMPLETED' } });
        });

        // 4. Complex Filtering (Multi-Index)
        await measureQuery('Complex Occurrence Filter (Multi-Index)', async () => {
            await prisma.occurrence.findMany({
                where: {
                    status: 'OPEN',
                    severity: 'CRITICAL',
                    category: 'CRIME'
                },
                take: 10
            });
        });

        // 5. Sorting (Indexed)
        await measureQuery('Sort Users by CreatedAt (Indexed)', async () => {
            await prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50
            });
        });

        console.log('\n✅ Performance Verification Complete!');
    } catch (error) {
        console.error('❌ Performance Verification Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
