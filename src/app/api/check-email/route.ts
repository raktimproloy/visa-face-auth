import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

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

    const { email } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Checking if email exists:', email);

    // Query DynamoDB to check if email exists
    const queryCommand = new QueryCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME!,
      IndexName: 'EmailIndex', // Using the GSI we created
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email }
      },
      Select: 'COUNT' // Only return count, not the actual items
    });

    const queryResult = await dynamoClient.send(queryCommand);
    
    const emailExists = (queryResult.Count || 0) > 0;
    
    console.log('Email exists:', emailExists);

    return NextResponse.json({
      exists: emailExists,
      message: emailExists ? 'Email already registered' : 'Email available'
    });

  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check email availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
