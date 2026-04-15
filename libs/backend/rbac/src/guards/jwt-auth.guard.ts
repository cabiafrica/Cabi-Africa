import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@cabi/backend/database';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No authorization token provided');
        }

        const token = authHeader.substring(7);

        try {
            const payload = await this.jwtService.verifyAsync(token);
            
            // Load user from database to ensure they still exist and get updated roles/permissions
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    userRoles: {
                        include: { role: true }
                    },
                    userPermissions: true,
                    driverProfile: true
                }
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Attach user to request
            request.user = user;

            return true;
        } catch (error) {
            console.error('JWT Verification failed:', error.message);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
