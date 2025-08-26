import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { validateOTPAttempt, isOTPExpired } from '../../../utils/otpUtils';
import jwt from 'jsonwebtoken';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { customerId, otp } = await request.json();

    // Validate required fields
    if (!customerId || !otp) {
      return NextResponse.json(
        { error: 'Customer ID and OTP are required' },
        { status: 400 }
      );
    }

    console.log('OTP verification request for customerId:', customerId);

    // Get user from DynamoDB
    const getCommand = new GetItemCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users',
      Key: marshall({
        customerId: customerId
      })
    });

    const userResult = await dynamoClient.send(getCommand);
    if (!userResult.Item) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = unmarshall(userResult.Item);
    console.log('User found for OTP verification:', {
      customerId: user.customerId,
      email: user.email,
      emailVerified: user.emailVerified,
      otpVerified: user.otpVerified
    });

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check if OTP is already verified
    if (user.otpVerified) {
      return NextResponse.json(
        { error: 'OTP has already been used' },
        { status: 400 }
      );
    }

    // Validate OTP attempt
    const storedOTP = {
      code: user.otpCode,
      expiresAt: user.otpExpiresAt,
      attempts: user.otpAttempts || 0,
      isVerified: user.otpVerified || false
    };

    const validation = validateOTPAttempt(otp, storedOTP, 3);
    if (!validation.isValid) {
      // Increment OTP attempts
      const updateAttemptsCommand = new UpdateItemCommand({
        TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users',
        Key: marshall({
          customerId: customerId
        }),
        UpdateExpression: 'SET otpAttempts = :attempts, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':attempts': (user.otpAttempts || 0) + 1,
          ':updatedAt': new Date().toISOString()
        })
      });

      await dynamoClient.send(updateAttemptsCommand);

      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // OTP is valid - mark user as verified
    const updateCommand = new UpdateItemCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users',
      Key: marshall({
        customerId: customerId
      }),
      UpdateExpression: 'SET emailVerified = :verified, otpVerified = :otpVerified, updatedAt = :updatedAt',
      ExpressionAttributeValues: marshall({
        ':verified': true,
        ':otpVerified': true,
        ':updatedAt': new Date().toISOString()
      })
    });

    await dynamoClient.send(updateCommand);
    console.log('User email verified successfully:', customerId);

    // Generate JWT token for verified user
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        customerId: user.customerId,
        enrollmentId: user.enrollmentId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        enrollmentStatus: user.enrollmentStatus,
        biometricStatus: user.biometricStatus,
        idmissionValid: user.idmissionValid,
        emailVerified: true
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Create response with user data
    const userResponse = {
      customerId: user.customerId,
      enrollmentId: user.enrollmentId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      enrollmentStatus: user.enrollmentStatus,
      biometricStatus: user.biometricStatus,
      idmissionValid: user.idmissionValid,
      emailVerified: true
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      user: userResponse
    });

    // Set JWT token in HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log('OTP verification successful, JWT token set for user:', customerId);
    return response;

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
