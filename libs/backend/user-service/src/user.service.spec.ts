import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock the uuid library to control its output in tests
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  const mockUserId = 'a-unique-user-id-from-uuid';

  beforeEach(async () => {
    // Set the mock return value before each test
    (uuidv4 as jest.Mock).mockReturnValue(mockUserId);

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerPassenger', () => {
    const registerUserDto: RegisterUserDto = {
      fullName: 'Jane Doe',
      phone: '+254712345678',
      password: 'ValidPassword123!',
    };

    it('should successfully register a passenger and return a new userId', async () => {
      // The service method uses mock console logs for AWS SDK calls.
      // We expect it to complete and return the mocked UUID.
      const result = await service.registerPassenger(registerUserDto);

      expect(uuidv4).toHaveBeenCalled();
      expect(result).toEqual({ userId: mockUserId });
    });

    it('should throw a ConflictException if the phone number already exists', async () => {
      // This DTO uses the phone number that is hardcoded in the service's mock
      // logic to simulate a 'UsernameExistsException' from Cognito.
      const existingUserDto: RegisterUserDto = {
        ...registerUserDto,
        phone: '+254700000000',
      };

      // We assert that the promise is rejected with a ConflictException.
      await expect(service.registerPassenger(existingUserDto)).rejects.toThrow(
        new ConflictException('A user with this phone number already exists.'),
      );
    });
  });
});