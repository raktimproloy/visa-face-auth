export interface EmailCheckResponse {
  exists: boolean;
  message: string;
  error?: string;
}

export const checkEmailExists = async (email: string): Promise<EmailCheckResponse> => {
  try {
    const response = await fetch('/api/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to check email');
    }

    return result;
  } catch (error) {
    console.error('Error checking email:', error);
    return {
      exists: false,
      message: 'Unable to verify email',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
