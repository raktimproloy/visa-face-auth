import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';

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
    const tableName = process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users';
    
    // Check if table already exists
    const listCommand = new ListTablesCommand({});
    const tables = await dynamoClient.send(listCommand);
    
    if (tables.TableNames?.includes(tableName)) {
      return NextResponse.json({
        success: true,
        message: 'Table already exists',
        tableName
      });
    }

    // Create table
    const createCommand = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: 'customerId',
          KeyType: 'HASH'
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'customerId',
          AttributeType: 'S'
        },
        {
          AttributeName: 'email',
          AttributeType: 'S'
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            {
              AttributeName: 'email',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await dynamoClient.send(createCommand);
    
    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      tableName
    });

  } catch (error) {
    console.error('Table creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
