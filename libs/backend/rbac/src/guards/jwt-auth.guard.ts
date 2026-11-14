import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@cabi/backend/database';
import { PermissionService } from '../services/permission.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly permissionService: PermissionService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Check if route is public using standard reflector lookup
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
        
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        
        // Handle cases where the request is from a known safe internal service
        // or has already been authenticated by a gateway
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

            // Flatten permissions
            const permissionsSet = await this.permissionService.getUserPermissions(user.id);
            
            // Attach user to request with flat permissions array
            request.user = {
                ...user,
                identityVerified: payload.identityVerified === true,
                permissions: Array.from(permissionsSet)
            };

            return true;
        } catch (error) {
            console.error('JWT Verification failed:', error.message);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}

