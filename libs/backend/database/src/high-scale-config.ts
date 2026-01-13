// Database Configuration for High Scale
// Supports read replicas, connection pooling, and sharding

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Connection pool configuration
const POOL_CONFIG = {
    max: 100, // Maximum connections per pool
    min: 20,  // Minimum connections to maintain
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Primary database (writes)
export const prismaWrite = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_WRITE_URL,
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Read replica (reads)
export const prismaRead = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_READ_URL || process.env.DATABASE_WRITE_URL,
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
});

// Connection pools for raw queries
export const writePool = new Pool({
    connectionString: process.env.DATABASE_WRITE_URL,
    ...POOL_CONFIG,
});

export const readPool = new Pool({
    connectionString: process.env.DATABASE_READ_URL || process.env.DATABASE_WRITE_URL,
    ...POOL_CONFIG,
});

// Geographic sharding
interface ShardConfig {
    name: string;
    writeUrl: string;
    readUrl: string;
    region: {
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
    };
}

const SHARDS: ShardConfig[] = [
    {
        name: 'east-africa',
        writeUrl: process.env.DB_EAST_AFRICA_WRITE_URL!,
        readUrl: process.env.DB_EAST_AFRICA_READ_URL!,
        region: { minLat: -5, maxLat: 5, minLng: 30, maxLng: 45 },
    },
    {
        name: 'south-africa',
        writeUrl: process.env.DB_SOUTH_AFRICA_WRITE_URL!,
        readUrl: process.env.DB_SOUTH_AFRICA_READ_URL!,
        region: { minLat: -35, maxLat: -20, minLng: 15, maxLng: 35 },
    },
    {
        name: 'west-africa',
        writeUrl: process.env.DB_WEST_AFRICA_WRITE_URL!,
        readUrl: process.env.DB_WEST_AFRICA_READ_URL!,
        region: { minLat: 5, maxLat: 15, minLng: -5, maxLng: 15 },
    },
];

// Shard clients cache
const shardClients = new Map<string, { write: PrismaClient; read: PrismaClient }>();

export function getShardKey(lat: number, lng: number): string {
    for (const shard of SHARDS) {
        const { minLat, maxLat, minLng, maxLng } = shard.region;
        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
            return shard.name;
        }
    }
    return 'default';
}

export function getShardClients(shardKey: string) {
    if (shardClients.has(shardKey)) {
        return shardClients.get(shardKey)!;
    }

    const shard = SHARDS.find((s) => s.name === shardKey);
    if (!shard) {
        // Fallback to default
        return { write: prismaWrite, read: prismaRead };
    }

    const write = new PrismaClient({
        datasources: { db: { url: shard.writeUrl } },
    });

    const read = new PrismaClient({
        datasources: { db: { url: shard.readUrl } },
    });

    shardClients.set(shardKey, { write, read });
    return { write, read };
}

// Helper function to get appropriate client
export function getDbClient(operation: 'read' | 'write', location?: { lat: number; lng: number }) {
    if (!location) {
        return operation === 'write' ? prismaWrite : prismaRead;
    }

    const shardKey = getShardKey(location.lat, location.lng);
    const clients = getShardClients(shardKey);
    return operation === 'write' ? clients.write : clients.read;
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await prismaWrite.$disconnect();
    await prismaRead.$disconnect();
    await writePool.end();
    await readPool.end();

    for (const { write, read } of shardClients.values()) {
        await write.$disconnect();
        await read.$disconnect();
    }

    process.exit(0);
});

// Health check
export async function checkDatabaseHealth() {
    try {
        await prismaWrite.$queryRaw`SELECT 1`;
        await prismaRead.$queryRaw`SELECT 1`;
        return { healthy: true, message: 'All database connections healthy' };
    } catch (error) {
        return { healthy: false, message: `Database health check failed: ${error}` };
    }
}
