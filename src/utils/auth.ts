export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    customerId: string;
    enrollmentId: string;
    name: string;
    email: string;
    photoUrl: string;
    biometricStatus: string;
    enrollmentDate: string;
    idmissionValid: boolean;
    lastUpdated: string;
  };
  error?: string;
  details?: string;
}

export const loginUser = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }

    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};
