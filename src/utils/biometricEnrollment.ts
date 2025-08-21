export interface BiometricEnrollmentRequest {
  customerId: string;
  enrollmentId: string;
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
  photoData: string;
}

export interface BiometricEnrollmentResponse {
  success: boolean;
  message?: string;
  enrollmentId?: string;
  customerId?: string;
  biometricStatus?: string;
  idmissionValid?: boolean;
  error?: string;
  details?: string;
}

export const enrollBiometrics = async (
  enrollmentData: BiometricEnrollmentRequest
): Promise<BiometricEnrollmentResponse> => {
  try {
    const response = await fetch('/api/enroll-biometrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrollmentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Enrollment failed');
    }

    return result;
  } catch (error) {
    console.error('Error enrolling biometrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Enrollment failed',
    };
  }
};

// Generate unique IDs
export const generateCustomerId = (): string => {
  return `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateEnrollmentId = (): string => {
  return `ENR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
