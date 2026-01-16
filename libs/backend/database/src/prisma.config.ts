/**
 * Optimized Prisma Client Configuration
 * 
 * This file provides an optimized Prisma client instance with:
 * - Query logging in development
 * - Automatic result limiting to prevent excessive data fetching
 * - Connection pooling optimization
 * - Performance monitoring
 */

import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
declare global {
    var prisma: PrismaClient | undefined;
}

// Performance logging middleware
const performanceMiddleware = (threshold = 1000) => {
    return async (params: any, next: any) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        const duration = after - before;

        // Log slow queries in development
        if (process.env.NODE_ENV === 'development' && duration > threshold) {
            console.warn(`⚠️ Slow query detected (${duration}ms):`, {
                model: params.model,
                action: params.action,
                duration: `${duration}ms`,
            });
        }

        return result;
    };
};

// Create base Prisma client with optimizations
const createPrismaClient = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'minimal',
    });
};

// Initialize Prisma client (development singleton to prevent connection exhaustion)
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// Extended Prisma client with query optimizations
export const optimizedPrisma = prisma.$extends({
    name: 'Query Optimizer',
    query: {
        $allModels: {
            async findMany({ args, query }) {
                // Automatically limit results if no limit is specified
                // Prevents accidentally fetching entire tables
                if (!args.take && !args.cursor) {
                    args.take = 100; // Default limit
                }

                // Add performance monitoring
                const before = Date.now();
                const result = await query(args);
                const after = Date.now();

                // Log if query took more than 1 second
                if (process.env.NODE_ENV === 'development' && (after - before) > 1000) {
                    console.warn(`⚠️ Slow findMany query (${after - before}ms)`);
                }

                return result;
            },

            async findFirst({ args, query }) {
                // Optimize by limiting to 1 result
                if (!args.take) {
                    args.take = 1;
                }
                return query(args);
            },
        },
    },
});

/**
 * Utility function to create paginated queries
 * 
 * @example
 * const result = await paginatedQuery(prisma.user, {
 *   page: 1,
 *   pageSize: 20,
 *   where: { role: 'DRIVER' },
 *   orderBy: { createdAt: 'desc' }
 * });
 */
export async function paginatedQuery<T>(
    model: any,
    options: {
        page?: number;
        pageSize?: number;
        where?: any;
        orderBy?: any;
        select?: any;
        include?: any;
    }
) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
        model.findMany({
            where: options.where,
            orderBy: options.orderBy,
            select: options.select,
            include: options.include,
            skip,
            take: pageSize,
        }),
        model.count({ where: options.where }),
    ]);

    return {
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
            hasMore: skip + pageSize < total,
        },
    };
}

/**
 * Batch operation helper to prevent overwhelming the database
 * 
 * @example
 * await batchOperation(userIds, async (batch) => {
 *   await prisma.user.updateMany({
 *     where: { id: { in: batch } },
 *     data: { status: 'ACTIVE' }
 *   });
 * });
 */
export async function batchOperation<T>(
    items: T[],
    operation: (batch: T[]) => Promise<void>,
    batchSize = 100
) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
    }

    for (const batch of batches) {
        await operation(batch);
    }
}

/**
 * Helper to gracefully disconnect Prisma
 * Call this in cleanup handlers
 */
export async function disconnectPrisma() {
    await prisma.$disconnect();
}

// Cleanup on process termination
if (process.env.NODE_ENV !== 'test') {
    process.on('beforeExit', async () => {
        await disconnectPrisma();
    });
}

export default prisma;
