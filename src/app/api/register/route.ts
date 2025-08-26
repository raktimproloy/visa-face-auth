import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { EmailService } from '../../../utils/emailService';
import { createOTPData } from '../../../utils/otpUtils';
import bcrypt from 'bcryptjs';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

console.log('DynamoDB client initialized with region:', process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1');

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const tableName = process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;
    const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
    
    console.log('Environment variables:', {
      tableName: !!tableName,
      region: !!region,
      accessKeyId: !!accessKeyId,
      sesFromEmail: !!process.env.SES_FROM_EMAIL
    });
    
    if (!tableName) {
      console.error('NEXT_PUBLIC_DYNAMODB_TABLE_NAME environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const { firstName, lastName, email, password } = await request.json();

    // Validate required fields (lastName can be blank)
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists using the EmailIndex GSI
    try {
      const queryCommand = new QueryCommand({
        TableName: tableName,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': { S: email.toLowerCase() }
        }
      });

      const existingUser = await dynamoClient.send(queryCommand);
      if (existingUser.Items && existingUser.Items.length > 0) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
    } catch (gsiError) {
      console.error('Error checking email uniqueness (GSI may not be ready):', gsiError);
      // If GSI is not ready, we'll proceed with registration
      // In production, you might want to handle this differently
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique IDs
    const customerId = generateCustomerId();
    const enrollmentId = generateEnrollmentId();

    // Generate OTP data
    const otpData = createOTPData();

    // Create temporary user item (pending verification)
    const userItem = {
      customerId,
      enrollmentId,
      firstName,
      lastName: lastName || '', // Handle blank lastName
      email: email.toLowerCase(),
      password: hashedPassword,
      photoUrl: '', // Blank photo initially
      photoFileName: '',
      biometricStatus: 'pending',
      idmissionValid: false,
      enrollmentStatus: 'pending',
      emailVerified: false, // New field for email verification
      otpCode: otpData.code, // Store OTP code
      otpExpiresAt: otpData.expiresAt, // Store OTP expiration
      otpAttempts: 0, // Store OTP attempts
      otpVerified: false, // Store OTP verification status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user to DynamoDB
    console.log('Attempting to save user to DynamoDB:', {
      tableName: tableName,
      customerId,
      email: email.toLowerCase(),
      otpCode: otpData.code
    });
    
    const putCommand = new PutItemCommand({
      TableName: tableName,
      Item: marshall(userItem)
    });

    await dynamoClient.send(putCommand);
    console.log('User registered successfully (pending verification):', customerId);

    // Send OTP verification email
    let emailStatus = 'pending';
    let emailErrorDetails = null;
    
    try {
      const emailSent = await EmailService.sendOTPEmail(
        email.toLowerCase(),
        otpData.code,
        firstName
      );

      if (!emailSent) {
        console.error('Failed to send OTP email, but user was created');
        emailStatus = 'failed';
        emailErrorDetails = 'Email service temporarily unavailable';
        // User was created but email failed - they can request resend later
      } else {
        console.log('OTP verification email sent successfully');
        emailStatus = 'sent';
      }
    } catch (emailError: any) {
      console.error('Error sending OTP email:', emailError);
      emailStatus = 'failed';
      emailErrorDetails = emailError.message || 'Unknown email error';
      // User was created but email failed - they can request resend later
    }

    // Create response with user data (excluding sensitive info)
    const userResponse = {
      customerId,
      enrollmentId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      enrollmentStatus: 'pending',
      biometricStatus: 'pending',
      idmissionValid: false,
      emailVerified: false,
      emailStatus,
      message: emailStatus === 'sent' ? 'Please check your email for verification code' : 'Registration successful but email verification pending'
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: emailStatus === 'sent' 
        ? 'Registration successful! Please check your email for verification code.'
        : 'Registration successful! Email verification will be sent shortly.',
      user: userResponse,
      requiresVerification: true,
      emailStatus,
      ...(emailErrorDetails && { emailError: emailErrorDetails })
    });

    console.log('Registration response sent successfully');
    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific DynamoDB errors
    if (error instanceof Error) {
      if (error.name === 'ResourceNotFoundException') {
        return NextResponse.json(
          { error: 'Database table not found. Please contact support.' },
          { status: 500 }
        );
      } else if (error.name === 'ValidationException') {
        return NextResponse.json(
          { error: 'Database schema validation failed. Please contact support.' },
          { status: 500 }
        );
      } else if (error.name === 'AccessDeniedException') {
        return NextResponse.json(
          { error: 'Database access denied. Please contact support.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to register user. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateCustomerId(): string {
  return `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateEnrollmentId(): string {
  return `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
