import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Get user from DynamoDB using EmailIndex GSI
    const tableName = process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME;
    if (!tableName) {
      console.error('NEXT_PUBLIC_DYNAMODB_TABLE_NAME environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

          try {
        // Use QueryCommand instead of GetItemCommand for GSI
        const { QueryCommand } = await import('@aws-sdk/client-dynamodb');
        
        const queryCommand = new QueryCommand({
          TableName: tableName,
          IndexName: 'EmailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': { S: email.toLowerCase() }
          }
        });

        const userResult = await dynamoClient.send(queryCommand);
        
        if (!userResult.Items || userResult.Items.length === 0) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        const user = unmarshall(userResult.Items[0]);

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check if email is verified
      if (!user.emailVerified) {
        console.log('User email not verified, generating new OTP and redirecting to verification');
        console.log('User details:', {
          customerId: user.customerId,
          email: user.email,
          firstName: user.firstName,
          emailVerified: user.emailVerified
        });
        
        // Generate new OTP data
        const { createOTPData } = await import('../../../utils/otpUtils');
        const otpData = createOTPData();
        
        console.log('Generated new OTP for user:', {
          customerId: user.customerId,
          otpCode: otpData.code,
          expiresAt: otpData.expiresAt
        });
        
        // Update user with new OTP
        const { UpdateItemCommand } = await import('@aws-sdk/client-dynamodb');
        const updateCommand = new UpdateItemCommand({
          TableName: tableName,
          Key: marshall({
            customerId: user.customerId
          }),
          UpdateExpression: 'SET otpCode = :otpCode, otpExpiresAt = :otpExpiresAt, otpAttempts = :otpAttempts, otpVerified = :otpVerified, updatedAt = :updatedAt',
          ExpressionAttributeValues: marshall({
            ':otpCode': otpData.code,
            ':otpExpiresAt': otpData.expiresAt,
            ':otpAttempts': 0,
            ':otpVerified': false,
            ':updatedAt': new Date().toISOString()
          })
        });

        await dynamoClient.send(updateCommand);
        console.log('Updated user with new OTP in DynamoDB');
        
        // Send new OTP email
        const { EmailService } = await import('../../../utils/emailService');
        let emailSent = false;
        try {
          emailSent = await EmailService.sendOTPEmail(
            user.email.toLowerCase(),
            otpData.code,
            user.firstName
          );
          console.log('OTP email sent successfully:', emailSent);
        } catch (emailError) {
          console.error('Error sending OTP email during login:', emailError);
        }

              // Return response indicating email verification needed
      // IMPORTANT: Do NOT generate JWT token for unverified users
      const response = {
        success: true,
        message: 'Login successful but email verification required',
        user: {
          customerId: user.customerId,
          enrollmentId: user.enrollmentId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.toLowerCase(),
          enrollmentStatus: user.enrollmentStatus,
          biometricStatus: user.biometricStatus,
          idmissionValid: user.idmissionValid,
          photoUrl: user.photoUrl || '',
          emailVerified: false
        },
        requiresEmailVerification: true,
        emailSent
      };
      
      console.log('Returning email verification response (NO JWT token generated):', response);
      return NextResponse.json(response);
      }

      // Generate JWT token ONLY for users with verified email
      console.log('User email verified, generating JWT token for:', user.email);
      
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET environment variable is not set');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      // Create JWT token with verified email status
      const token = jwt.sign(
        {
          customerId: user.customerId,
          enrollmentId: user.enrollmentId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.toLowerCase(),
          enrollmentStatus: user.enrollmentStatus,
          biometricStatus: user.biometricStatus,
          idmissionValid: user.idmissionValid,
          photoUrl: user.photoUrl || '',
          emailVerified: user.emailVerified  // This should be true for verified users
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // Create response with user data (excluding password)
      const userResponse = {
        customerId: user.customerId,
        enrollmentId: user.enrollmentId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email.toLowerCase(),
        enrollmentStatus: user.enrollmentStatus,
        biometricStatus: user.biometricStatus,
        idmissionValid: user.idmissionValid,
        photoUrl: user.photoUrl || '',
        emailVerified: user.emailVerified
      };

      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: userResponse
      });

      // Set JWT token in HTTP-only cookie for verified user
      console.log('Setting auth-token cookie for verified user login with token length:', token.length);
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      console.log('Login successful for verified user:', user.email, 'enrollmentStatus:', user.enrollmentStatus, 'emailVerified:', user.emailVerified);
      return response;

    } catch (gsiError) {
      console.error('Error querying user (GSI may not be ready):', gsiError);
      return NextResponse.json(
        { error: 'Authentication service temporarily unavailable' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    );
  }
}
