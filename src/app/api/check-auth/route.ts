import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../utils/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const allCookies = request.cookies.getAll();
    console.log('Auth check - all cookies received:', allCookies.map(c => ({ name: c.name, value: c.value ? 'present' : 'missing' })));
    
    const token = request.cookies.get('auth-token')?.value;
    console.log('Auth check - auth-token found:', !!token);
    if (token) {
      console.log('Auth check - token length:', token.length);
    }
    
    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('JWT token verification failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('JWT token verified successfully:', decoded);

    // Return user data from token
    return NextResponse.json({
      success: true,
      user: decoded,
      message: 'User authenticated successfully'
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
