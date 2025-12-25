import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { CreateUserDto } from './dto/create-user.dto';

// Mock the entire 'aws-sdk' library
jest.mock('aws-sdk', () => {
  // Mock the signUp function and its promise method
  const signUpMock = jest.fn().mockReturnThis();
  const promiseMock = jest.fn();
  signUpMock.mockImplementation(() => ({ promise: promiseMock }));

  // Mock the CognitoIdentityServiceProvider class
  return {
    CognitoIdentityServiceProvider: jest.fn(() => ({
      signUp: signUpMock,
    })),
  };
});

describe('UsersService', () => {
  let service: UsersService;
  let cognito: CognitoIdentityServiceProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    cognito = new CognitoIdentityServiceProvider(); // This will be our mocked instance
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      fullName: 'Test User',
      phone: '0712345678',
      password: 'Password123!',
    };

    it('should successfully register a user and return the user sub', async () => {
      const mockCognitoResponse = { UserSub: 'a-mock-user-sub-uuid' };
      // Set the promise to resolve with the mock response
      (cognito.signUp({}).promise as jest.Mock).mockResolvedValue(mockCognitoResponse);

      const result = await service.register(createUserDto);

      expect(cognito.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          Username: '+254712345678', // Check for normalized phone number
          UserAttributes: expect.arrayContaining([
            { Name: 'name', Value: 'Test User' },
            { Name: 'phone_number', Value: '+254712345678' },
          ]),
        }),
      );
      expect(result).toEqual({
        message: 'User registration successful. Please check your phone for an OTP to verify your account.',
        userId: mockCognitoResponse.UserSub,
      });
    });

    it('should throw a ConflictException if the username already exists', async () => {
      const error = { code: 'UsernameExistsException' };
      // Set the promise to reject with a Cognito error
      (cognito.signUp({}).promise as jest.Mock).mockRejectedValue(error);

      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('A user with this phone number already exists.'),
      );
    });

    it('should throw an InternalServerErrorException for other errors', async () => {
      const error = new Error('Something went wrong');
      (cognito.signUp({}).promise as jest.Mock).mockRejectedValue(error);

      await expect(service.register(createUserDto)).rejects.toThrow(
        new InternalServerErrorException('An error occurred during registration.'),
      );
    });
  });
});