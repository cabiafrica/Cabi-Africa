import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly cognito: CognitoIdentityServiceProvider;

  constructor() {
    // This should be configured properly in a real app, e.g., via a config module.
    this.cognito = new CognitoIdentityServiceProvider({
      region: process.env.AWS_REGION,
    });
  }

  /**
   * Normalizes a Kenyan phone number to E.164 format.
   * Example: 0712345678 -> +254712345678
   * @param phone - The phone number to normalize.
   * @returns The normalized phone number.
   */
  private normalizePhoneNumber(phone: string): string {
    if (phone.startsWith('0')) {
      return `+254${phone.substring(1)}`;
    }
    if (phone.startsWith('254')) {
      return `+${phone}`;
    }
    return phone; // Assumes it's already in +254 format
  }

  async register(createUserDto: CreateUserDto): Promise<{ message: string; userId: string }> {
    const { fullName, phone, password } = createUserDto;
    const normalizedPhone = this.normalizePhoneNumber(phone);

    const params: CognitoIdentityServiceProvider.SignUpRequest = {
      ClientId: process.env.COGNITO_CLIENT_ID, // Ensure this is in your .env file
      Username: normalizedPhone,
      Password: password,
      UserAttributes: [
        { Name: 'phone_number', Value: normalizedPhone },
        { Name: 'name', Value: fullName },
      ],
    };

    try {
      const response = await this.cognito.signUp(params).promise();
      this.logger.log(`User registration initiated for ${normalizedPhone}`);
      return { message: 'User registration successful. Please check your phone for an OTP to verify your account.', userId: response.UserSub };
    } catch (error) {
      this.logger.error(`Failed to register user ${normalizedPhone}`, error.stack);
      if (error.code === 'UsernameExistsException') {
        throw new ConflictException('A user with this phone number already exists.');
      }
      throw new InternalServerErrorException('An error occurred during registration.');
    }
  }

  async findAll(limit: number = 20, paginationToken?: string): Promise<any> {
    try {
      const params: CognitoIdentityServiceProvider.ListUsersRequest = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Limit: limit,
        PaginationToken: paginationToken
      };
      const result = await this.cognito.listUsers(params).promise();
      return {
        users: result.Users.map(user => ({
          username: user.Username,
          status: user.UserStatus,
          enabled: user.Enabled,
          created: user.UserCreateDate,
          attributes: user.Attributes.reduce((acc, attr) => ({ ...acc, [attr.Name]: attr.Value }), {}),
        })),
        paginationToken: result.PaginationToken
      };
    } catch (e) {
      this.logger.error('Failed to list users', e);
      // If env var is missing or other error, return mock data for dev
      return {
        users: [
          { username: 'mock-user-1', status: 'CONFIRMED', enabled: true, created: new Date(), attributes: { name: 'Alice Driver', email: 'alice@example.com', 'custom:role': 'driver' } },
          { username: 'mock-user-2', status: 'CONFIRMED', enabled: true, created: new Date(), attributes: { name: 'Bob Passenger', email: 'bob@example.com', 'custom:role': 'passenger' } },
        ],
        paginationToken: null
      };
    }
  }

  async uploadDocument(userId: string, documentType: string, file: any): Promise<{ message: string; fileUrl: string }> {
    this.logger.log(`Uploading document ${documentType} for user ${userId}`);
    // In real implementation: Upload to S3, get URL, save to DB.
    // Mock implementation:
    return {
      message: 'Document uploaded successfully, available for review.',
      fileUrl: `https://mock-storage.com/${userId}/${documentType}/${file ? file.originalname : 'unknown'}`
    };
  }
}