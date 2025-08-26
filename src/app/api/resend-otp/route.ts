import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { EmailService } from '../../../utils/emailService';
import { createOTPData, canResendOTP } from '../../../utils/otpUtils';

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
    const { customerId } = await request.json();

    // Validate required fields
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    console.log('OTP resend request for customerId:', customerId);

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
    console.log('User found for OTP resend:', {
      customerId: user.customerId,
      email: user.email,
      emailVerified: user.emailVerified,
      lastOtpSent: user.lastOtpSent
    });

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check if enough time has passed since last OTP send
    if (user.lastOtpSent && !canResendOTP(user.lastOtpSent)) {
      const remainingTime = Math.ceil((60 * 1000 - (Date.now() - user.lastOtpSent)) / 1000);
      return NextResponse.json(
        { 
          error: `Please wait ${remainingTime} seconds before requesting a new OTP`,
          remainingTime
        },
        { status: 429 }
      );
    }

    // Generate new OTP data
    const newOtpData = createOTPData();

    // Update user with new OTP data
    const updateCommand = new UpdateItemCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users',
      Key: marshall({
        customerId: customerId
      }),
      UpdateExpression: 'SET otpCode = :code, otpExpiresAt = :expiresAt, otpAttempts = :attempts, otpVerified = :verified, lastOtpSent = :lastSent, updatedAt = :updatedAt',
      ExpressionAttributeValues: marshall({
        ':code': newOtpData.code,
        ':expiresAt': newOtpData.expiresAt,
        ':attempts': 0, // Reset attempts
        ':verified': false, // Reset verification status
        ':lastSent': Date.now(),
        ':updatedAt': new Date().toISOString()
      })
    });

    await dynamoClient.send(updateCommand);
    console.log('New OTP generated for user:', customerId);

    // Send new OTP verification email
    try {
      const emailSent = await EmailService.sendOTPEmail(
        user.email,
        newOtpData.code,
        user.firstName
      );

      if (!emailSent) {
        console.error('Failed to send new OTP email');
        return NextResponse.json(
          { error: 'Failed to send OTP email. Please try again.' },
          { status: 500 }
        );
      }

      console.log('New OTP email sent successfully');
    } catch (emailError) {
      console.error('Error sending new OTP email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'New OTP sent successfully! Please check your email.',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('OTP resend error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again.' },
      { status: 500 }
    );
  }
}
