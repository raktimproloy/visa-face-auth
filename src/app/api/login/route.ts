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

      // Generate JWT token
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
          email: user.email.toLowerCase(),
          enrollmentStatus: user.enrollmentStatus
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
        photoUrl: user.photoUrl || ''
      };

      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: userResponse
      });

      // Set JWT token in HTTP-only cookie
      console.log('Setting auth-token cookie for login with token length:', token.length);
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      console.log('Login successful for user:', user.email, 'enrollmentStatus:', user.enrollmentStatus);
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
