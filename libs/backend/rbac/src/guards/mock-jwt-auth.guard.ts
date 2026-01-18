import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

@Injectable()
export class MockJwtAuthGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No authorization token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Parse mock token: 'mock-jwt-token-{userId}'
        if (!token.startsWith('mock-jwt-token-')) {
            throw new UnauthorizedException('Invalid token format');
        }

        const userId = token.replace('mock-jwt-token-', '');

        if (!userId) {
            throw new UnauthorizedException('Invalid token');
        }

        // Load user from database
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: { role: true }
                },
                userPermissions: true
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Attach user to request
        request.user = user;

        return true;
    }
}
