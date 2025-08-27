import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response with cleared cookies
    const response = NextResponse.json({ success: true });
    
    // Clear authToken cookie by setting it to empty and expired
    response.cookies.set('authToken', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Clear auth-token cookie (with hyphen)
    response.cookies.set('auth-token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Clear any other potential auth cookies
    response.cookies.set('session', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    response.cookies.set('token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
