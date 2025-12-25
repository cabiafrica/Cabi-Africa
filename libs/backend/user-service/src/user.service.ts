import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { v4 as uuidv4 } from 'uuid';

// Placeholder for AWS SDK clients. In a real app, these would be injected.
// import { CognitoIdentityServiceProvider } from 'aws-sdk';
// import { DynamoDB } from 'aws-sdk';

@Injectable()
export class UserService {
  // private cognito = new CognitoIdentityServiceProvider();
  // private dynamoDb = new DynamoDB.DocumentClient();

  async registerPassenger(registerUserDto: RegisterUserDto) {
    const { fullName, phone, password, referrerId } = registerUserDto;
    const userId = uuidv4();

    // --- Step 1: Create user in Cognito ---
    // const cognitoParams = {
    //   ClientId: process.env.COGNITO_CLIENT_ID,
    //   Username: phone, // Using phone number as the username
    //   Password: password,
    //   UserAttributes: [
    //     { Name: 'phone_number', Value: phone },
    //     { Name: 'name', Value: fullName },
    //     { Name: 'custom:userId', Value: userId }, // Custom attribute to link Cognito user to our DB user
    //   ],
    // };

    try {
      // const cognitoUser = await this.cognito.signUp(cognitoParams).promise();
      console.log(`[Mock] Signing up user ${phone} in Cognito.`);
    } catch (error) {
      // if (error.code === 'UsernameExistsException') {
      //   throw new ConflictException('A user with this phone number already exists.');
      // }
      // throw new InternalServerErrorException('Failed to register user with identity provider.');
      console.error('[Mock] Error during Cognito sign up:', error);
      // Simulating a potential conflict for demonstration
      if (phone === '+254700000000') {
        throw new ConflictException('A user with this phone number already exists.');
      }
    }

    // --- Step 2: Create user record in DynamoDB ---
    const userRecord = {
      userId: userId,
      phone: phone,
      fullName: fullName,
      userType: 'PASSENGER',
      status: 'PENDING_VERIFICATION', // User must verify with OTP from Cognito
      rating: 3.0, // Default rating
      upline1_userId: null, // To be determined from referrerId
      upline2_userId: null, // To be determined from referrerId's upline
      createdAt: new Date().toISOString(),
    };

    // Logic to find uplines
    if (referrerId) {
      // In a real scenario, we would query the database to find the referrer's ID and their referrer's ID.
      // const referrer = await this.userRepo.findOne({ referralCode: referrerId });
      // userRecord.upline1_userId = referrer?.id;
      // userRecord.upline2_userId = referrer?.upline1_userId;
      console.log(`[Mock] Linking user to referrer: ${referrerId}`);
      userRecord.upline1_userId = 'mock-referrer-uuid';
    }

    // const dynamoParams = {
    //   TableName: process.env.USERS_TABLE_NAME, // e.g., 'cabi-users'
    //   Item: userRecord,
    // };

    try {
      // await this.dynamoDb.put(dynamoParams).promise();
      console.log(`[Mock] Saving user ${userId} to DynamoDB.`);
    } catch (error) {
      // If DynamoDB write fails, we should ideally roll back the Cognito user creation.
      // This is a complex process (e.g., using a Saga pattern or cleanup lambda).
      // For now, we log the error.
      console.error('[Mock] Error saving user to DynamoDB:', error);
      throw new InternalServerErrorException('Failed to save user profile.');
    }

    return {
      userId: userId,
    };
  }
}