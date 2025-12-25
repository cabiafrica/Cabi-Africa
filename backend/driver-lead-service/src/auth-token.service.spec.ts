import { Test, TestingModule } from '@nestjs/testing';
import { AuthTokenService } from './auth-token.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthTokenService>(AuthTokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should call jwtService.signAsync with the correct payload and return a token', async () => {
    const mockUser: Pick<User, 'id' | 'email'> = {
      id: 'user-id-123',
      email: 'test@example.com',
    };
    const expectedToken = 'a-signed-jwt-token';
    (jwtService.signAsync as jest.Mock).mockResolvedValue(expectedToken);

    const token = await service.generateAccessToken(mockUser);

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
    expect(token).toBe(expectedToken);
  });

  describe('generateImpersonationToken', () => {
    it('should call jwtService.signAsync with impersonation claims and a short expiry', async () => {
      const mockUser: Pick<User, 'id' | 'email'> = {
        id: 'user-to-impersonate-id',
        email: 'impersonated@example.com',
      };
      const adminId = 'admin-id-456';
      const expectedToken = 'an-impersonation-jwt-token';
      (jwtService.signAsync as jest.Mock).mockResolvedValue(expectedToken);

      const token = await service.generateImpersonationToken(mockUser, adminId);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          impersonatorId: adminId,
        },
        {
          expiresIn: '30m',
        },
      );
      expect(token).toBe(expectedToken);
    });
  });
});