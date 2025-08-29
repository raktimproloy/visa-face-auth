import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { selfieImage } = await request.json();

    if (!selfieImage) {
      return NextResponse.json(
        { error: 'Selfie image is required' },
        { status: 400 }
      );
    }

    // For testing purposes - simulate IDMission response
    // TODO: Replace with actual IDMission API call when credentials are available
    console.log('Selfie received, size:', selfieImage.length);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful verification
    const mockResult = {
      success: true,
      data: {
        verificationId: `mock_${Date.now()}`,
        status: 'verified',
        confidence: 0.95,
        livenessScore: 0.92,
        qualityScore: 0.88,
        timestamp: new Date().toISOString()
      },
      message: 'Live-check verification completed successfully (MOCK)'
    };

    console.log('Mock IDMission live-check successful:', mockResult);

    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('Mock IDMission live-check error:', error);
    return NextResponse.json(
      { 
        error: 'Live-check verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
