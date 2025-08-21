import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
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
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME) {
      throw new Error('DynamoDB table name not configured');
    }

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Login attempt for email:', email);

    // Step 1: Query DynamoDB to find user by email
    console.log('Querying DynamoDB for user...');
    
    const queryCommand = new QueryCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME!,
      IndexName: 'EmailIndex', // Using the GSI we created
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email }
      }
    });

    const queryResult = await dynamoClient.send(queryCommand);
    
    if (!queryResult.Items || queryResult.Items.length === 0) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = queryResult.Items[0];
    console.log('User found, verifying password...');

    // Step 2: Verify password
    const storedPassword = user.password.S;
    if (!storedPassword) {
      console.log('No password stored for user');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    
    if (!isPasswordValid) {
      console.log('Password verification failed for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully for user:', email);

    // Step 3: Return user data (excluding password)
    const userData = {
      customerId: user.customerId.S,
      enrollmentId: user.enrollmentId.S,
      name: user.name.S,
      email: user.email.S,
      photoUrl: user.photoUrl?.S || '',
      biometricStatus: user.biometricStatus.S,
      enrollmentDate: user.enrollmentDate.S,
      idmissionValid: user.idmissionValid?.BOOL || false,
      lastUpdated: user.lastUpdated.S
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { 
        error: 'Failed to authenticate user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
