import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('changePassword', () => {
    it('should change password for a valid user with correct current password', async () => {
      const result = await service.changePassword('driver-123', 'password123', 'newPassword456');
      expect(result).toEqual({ message: 'Password changed successfully.' });
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      await expect(service.changePassword('driver-123', 'wrongPassword', 'newPassword456')).rejects.toThrow(BadRequestException);
      await expect(service.changePassword('driver-123', 'wrongPassword', 'newPassword456')).rejects.toThrow('Incorrect current password.');
    });

    it('should throw UnauthorizedException for a non-existent user', async () => {
      await expect(service.changePassword('non-existent-user', 'password123', 'newPassword456')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should return a generic success message for an existing email', async () => {
      const result = await service.forgotPassword('driver-123@example.com');
      expect(result.message).toContain('a password reset link has been sent');
    });

    it('should return the same generic success message for a non-existent email for security', async () => {
      const result = await service.forgotPassword('non-existent@example.com');
      expect(result.message).toContain('a password reset link has been sent');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with a valid token', async () => {
      const validToken = 'mock-reset-token-for-driver-123';
      const result = await service.resetPassword(validToken, 'newPassword789');
      expect(result).toEqual({ message: 'Your password has been reset successfully.' });
    });

    it('should throw BadRequestException for an invalid token', async () => {
      await expect(service.resetPassword('invalid-token', 'newPassword789')).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword('invalid-token', 'newPassword789')).rejects.toThrow('Invalid or expired password reset token.');
    });

    it('should throw BadRequestException for a null token', async () => {
      await expect(service.resetPassword(null, 'newPassword789')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for a token pointing to a non-existent user', async () => {
      const tokenForNonExistentUser = 'mock-reset-token-for-non-existent-user';
      await expect(service.resetPassword(tokenForNonExistentUser, 'newPassword789')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return profile data for an existing user', async () => {
      const profile = await service.getProfile('driver-123');
      expect(profile).toBeDefined();
      expect(profile.id).toBe('driver-123');
      expect(profile.email).toBe('driver-123@example.com');
      expect(profile.firstName).toBe('John'); // As per mock data in service
    });

    it('should throw UnauthorizedException for a non-existent user', async () => {
      await expect(service.getProfile('non-existent-user')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      firstName: 'Jane',
      lastName: 'Doer',
      phone: '555-987-6543',
    };

    it('should update and return the profile for an existing user', async () => {
      const result = await service.updateProfile('driver-123', updateDto);
      expect(result.firstName).toBe(updateDto.firstName);
      expect(result.lastName).toBe(updateDto.lastName);
      expect(result.phone).toBe(updateDto.phone);
      expect(result.id).toBe('driver-123');
      // Email should not be changed by this method
      expect(result.email).toBe('driver-123@example.com');
    });

    it('should throw UnauthorizedException for a non-existent user', async () => {
      await expect(service.updateProfile('non-existent-user', updateDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});