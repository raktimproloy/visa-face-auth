import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { customerId, enrollmentId, enrollmentStatus, biometricStatus, idmissionValid } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get the current JWT token from cookies
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('auth-token');

    if (!currentToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify the current token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(currentToken.value, jwtSecret) as any;
      
      // Create new JWT token with updated enrollment data
      // IMPORTANT: Preserve emailVerified status from original token
      const newToken = jwt.sign(
        {
          customerId: decoded.customerId,
          enrollmentId: enrollmentId || decoded.enrollmentId,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          email: decoded.email,
          enrollmentStatus: enrollmentStatus || decoded.enrollmentStatus,
          biometricStatus: biometricStatus || decoded.biometricStatus,
          idmissionValid: idmissionValid !== undefined ? idmissionValid : decoded.idmissionValid,
          emailVerified: decoded.emailVerified  // Preserve email verification status
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'JWT token updated successfully',
        updatedData: {
          customerId,
          enrollmentId,
          enrollmentStatus,
          biometricStatus,
          idmissionValid
        }
      });

      // Set the new JWT token in HTTP-only cookie
      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      console.log('JWT token updated for user:', customerId, 'with new enrollment status:', enrollmentStatus, 'preserving emailVerified:', decoded.emailVerified);
      return response;

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Update JWT error:', error);
    return NextResponse.json(
      { error: 'Failed to update JWT token' },
      { status: 500 }
    );
  }
}
