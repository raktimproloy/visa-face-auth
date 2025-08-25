import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
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
      jwtSecret: !!process.env.JWT_SECRET
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

    // Create user item
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user to DynamoDB
    console.log('Attempting to save user to DynamoDB:', {
      tableName: tableName,
      customerId,
      email: email.toLowerCase()
    });
    
    const putCommand = new PutItemCommand({
      TableName: tableName,
      Item: marshall(userItem)
    });

    await dynamoClient.send(putCommand);
    console.log('User registered successfully:', customerId);

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
        customerId,
        enrollmentId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        enrollmentStatus: 'pending'
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Create response with user data (excluding password)
    const userResponse = {
      customerId,
      enrollmentId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      enrollmentStatus: 'pending',
      biometricStatus: 'pending',
      idmissionValid: false
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });

    // Set JWT token in HTTP-only cookie
    console.log('Setting auth-token cookie with token length:', token.length);
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log('Cookie set successfully, returning response');
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
