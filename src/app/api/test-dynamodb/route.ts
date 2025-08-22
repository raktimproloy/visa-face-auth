import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  try {
    // Test 1: List tables
    console.log('Testing DynamoDB connection...');
    const listCommand = new ListTablesCommand({});
    const tables = await dynamoClient.send(listCommand);
    console.log('Available tables:', tables.TableNames);

    // Test 2: Describe our specific table
    const tableName = process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users';
    console.log('Checking table:', tableName);
    
    const describeCommand = new DescribeTableCommand({
      TableName: tableName
    });
    
    const tableInfo = await dynamoClient.send(describeCommand);
    console.log('Table info:', {
      tableName: tableInfo.Table?.TableName,
      keySchema: tableInfo.Table?.KeySchema,
      gsi: tableInfo.Table?.GlobalSecondaryIndexes
    });

    return NextResponse.json({
      success: true,
      message: 'DynamoDB connection test successful',
      tables: tables.TableNames,
      targetTable: {
        name: tableInfo.Table?.TableName,
        keySchema: tableInfo.Table?.KeySchema,
        gsi: tableInfo.Table?.GlobalSecondaryIndexes
      }
    });

  } catch (error) {
    console.error('DynamoDB test error:', error);
    return NextResponse.json(
      { 
        error: 'DynamoDB connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
