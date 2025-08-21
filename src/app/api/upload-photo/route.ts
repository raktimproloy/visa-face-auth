import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// Initialize AWS clients
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const lambdaClient = new LambdaClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { photoData, fileName, userData } = await request.json();

    if (!photoData || !fileName || !userData) {
      return NextResponse.json(
        { error: 'Photo data, filename, and user data are required' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    
    // Convert base64 to buffer
    const base64Data = photoData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create S3 upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: `photos/${uniqueFileName}`,
      Body: buffer,
      ContentType: 'image/jpeg',
    });

    // Upload to S3
    await s3Client.send(uploadCommand);

    // Generate the public URL
    const photoUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/photos/${uniqueFileName}`;

    // Step 1: Create user in DynamoDB
    const customerId = generateCustomerId();
    const enrollmentId = generateEnrollmentId();
    
    const userItem = {
      customerId,
      enrollmentId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password, // Note: In production, hash this password
      photoUrl,
      photoFileName: uniqueFileName,
      biometricStatus: 'pending',
      idmissionValid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user to DynamoDB
    const putCommand = new PutItemCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users',
      Item: marshall(userItem)
    });

    await dynamoClient.send(putCommand);
    console.log('User saved to DynamoDB:', customerId);

    // Step 2: Invoke Lambda function for IDMission enrollment
    const lambdaPayload = {
      customerId,
      enrollmentId,
      photoData,
      metadata: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        photoUrl,
        timestamp: new Date().toISOString()
      }
    };

    const lambdaCommand = new InvokeCommand({
      FunctionName: process.env.NEXT_PUBLIC_IDMISSION_LAMBDA_FUNCTION || 'idmission-biometric-enrollment',
      InvocationType: 'Event', // Asynchronous invocation
      Payload: JSON.stringify(lambdaPayload)
    });

    try {
      await lambdaClient.send(lambdaCommand);
      console.log('Lambda function invoked for IDMission enrollment');
    } catch (lambdaError) {
      console.error('Error invoking Lambda function:', lambdaError);
      // Continue with the process even if Lambda fails
    }

    return NextResponse.json({
      success: true,
      photoUrl,
      fileName: uniqueFileName,
      customerId,
      enrollmentId,
      message: 'Photo uploaded and user created successfully. Biometric enrollment initiated.'
    });

  } catch (error) {
    console.error('Error in upload process:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload process' },
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
