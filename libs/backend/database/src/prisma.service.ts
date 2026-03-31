import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connected successfully');
        } catch (error) {
            // Log but do NOT throw — this allows the server to bind its port
            // even if the initial DB connection is slow or has a transient error.
            // Prisma will retry lazily on the first query.
            this.logger.error('⚠️ Database connection failed on startup — will retry on first query', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
