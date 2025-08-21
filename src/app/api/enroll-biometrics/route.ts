import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcryptjs';

// Initialize AWS clients
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
    
    const { 
      customerId, 
      enrollmentId, 
      name, 
      email, 
      password, 
      photoUrl,
      photoData 
    } = await request.json();

    // Validate required fields
    if (!customerId || !enrollmentId || !name || !email || !password || !photoData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Hash the password
    console.log('Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Step 2: Create user in DynamoDB (skip IDMission for now)
    console.log('Creating user in DynamoDB...');

    // Step 3: Persist user metadata in DynamoDB
    console.log('Persisting user metadata to DynamoDB...');
    
    const userItem = {
      customerId: { S: customerId },
      enrollmentId: { S: enrollmentId },
      name: { S: name },
      email: { S: email },
      password: { S: hashedPassword }, // Now hashed
      photoUrl: { S: photoUrl || '' },
      biometricStatus: { S: 'pending' }, // Changed from 'enrolled' to 'pending'
      enrollmentDate: { S: new Date().toISOString() },
      lastUpdated: { S: new Date().toISOString() },
      idmissionValid: { BOOL: false }, // New field: default false
      photoData: { S: photoData.substring(0, 100) + '...' } // Store truncated photo data for reference
    };

    console.log('DynamoDB Item to insert:', JSON.stringify(userItem, null, 2));
    
    const putCommand = new PutItemCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME!,
      Item: userItem,
      // Add condition to prevent duplicate emails
      ConditionExpression: 'attribute_not_exists(customerId)'
    });

    console.log('Sending PutItemCommand to DynamoDB...');
    await dynamoClient.send(putCommand);
    console.log('User metadata persisted to DynamoDB successfully');

    return NextResponse.json({
      success: true,
      message: 'User created successfully in DynamoDB',
      enrollmentId,
      customerId,
      biometricStatus: 'pending',
      idmissionValid: false
    });

  } catch (error: unknown) {
    console.error('Error in biometric enrollment:', error);
    
    // Handle duplicate email/customer ID
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return NextResponse.json(
        { 
          error: 'User already exists',
          details: 'This email is already registered. Please use a different email.'
        },
        { status: 409 } // Conflict status
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to complete biometric enrollment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
