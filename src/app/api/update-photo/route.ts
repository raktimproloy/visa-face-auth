import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, UpdateItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import jwt from 'jsonwebtoken';

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

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { photoData } = await request.json();

    if (!photoData) {
      return NextResponse.json(
        { error: 'Photo data is required' },
        { status: 400 }
      );
    }

    // Get user from DynamoDB to verify they exist
    const getCommand = new GetItemCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users',
      Key: marshall({
        customerId: decoded.customerId
      })
    });

    const userResult = await dynamoClient.send(getCommand);
    if (!userResult.Item) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = unmarshall(userResult.Item);
    
    console.log('Photo update request - User status:', {
      customerId: user.customerId,
      enrollmentStatus: user.enrollmentStatus,
      biometricStatus: user.biometricStatus,
      idmissionValid: user.idmissionValid
    });

    // Validate biometric status - allow photo updates if biometric verification failed or is pending
    if (user.biometricStatus === 'completed') {
      console.log('Photo update rejected - User has completed biometric verification');
      return NextResponse.json(
        { error: 'User has already completed biometric verification. Cannot update photo.' },
        { status: 403 }
      );
    }
    
    console.log('Photo update allowed - User can retry biometric verification');

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-selfie.jpg`;
    
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

    // Update user record in DynamoDB with photo information
    const updateCommand = new UpdateItemCommand({
      TableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'face-visa-users',
      Key: marshall({
        customerId: decoded.customerId
      }),
      UpdateExpression: 'SET photoUrl = :photoUrl, photoFileName = :photoFileName, updatedAt = :updatedAt',
      ExpressionAttributeValues: marshall({
        ':photoUrl': photoUrl,
        ':photoFileName': uniqueFileName,
        ':updatedAt': new Date().toISOString()
      })
    });

    await dynamoClient.send(updateCommand);
    console.log('Photo updated for user:', decoded.customerId);

    return NextResponse.json({
      success: true,
      photoUrl,
      fileName: uniqueFileName,
      message: 'Photo updated successfully'
    });

  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}
