import jwt from 'jsonwebtoken';

export interface JWTPayload {
  customerId: string;
  enrollmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentStatus: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return null;
    }
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function generateToken(payload: JWTPayload): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
}
