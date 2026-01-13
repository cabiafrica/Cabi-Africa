import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('auth')
export class AuthController {
    constructor(private userService: UserService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.userService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return {
            token: 'mock_jwt_token_' + user.id,
            user: user
        };
    }
}
