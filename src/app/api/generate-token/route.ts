import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.IDMISSION_USERNAME || 
        !process.env.IDMISSION_PASSWORD || 
        !process.env.IDMISSION_CLIENT_ID || 
        !process.env.IDMISSION_CLIENT_SECRET) {
      throw new Error('IDMission credentials not configured');
    }

    // Prepare form data for the token request
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('client_id', process.env.IDMISSION_CLIENT_ID);
    formData.append('client_secret', process.env.IDMISSION_CLIENT_SECRET);
    formData.append('username', process.env.IDMISSION_USERNAME);
    formData.append('password', process.env.IDMISSION_PASSWORD);
    formData.append('scope', 'api_access');

    console.log('Requesting IDMission token...');

    // Make POST request to IDMission auth endpoint
    const response = await fetch('https://auth.idmission.com/auth/realms/identity/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IDMission auth error:', response.status, errorText);
      throw new Error(`IDMission authentication failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json();
    
    if (!tokenData.access_token) {
      throw new Error('No access token received from IDMission');
    }

    console.log('IDMission token generated successfully');

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope
    });

  } catch (error) {
    console.error('Error generating IDMission token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate IDMission token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
