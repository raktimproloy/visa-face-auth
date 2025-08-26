/**
 * OTP Utility Functions
 * Handles OTP generation, validation, and expiration
 */

export interface OTPData {
  code: string;
  expiresAt: number;
  attempts: number;
  isVerified: boolean;
}

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Get OTP expiration time (10 minutes from now)
 */
export function getOTPExpirationTime(): number {
  return Date.now() + (10 * 60 * 1000); // 10 minutes
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  
  if (remaining <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Validate OTP format (6 digits)
 */
export function validateOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Check if OTP can be resent (minimum 60 seconds between resends)
 */
export function canResendOTP(lastSentAt: number): boolean {
  const minInterval = 60 * 1000; // 60 seconds
  return Date.now() - lastSentAt >= minInterval;
}

/**
 * Get resend countdown time
 */
export function getResendCountdown(lastSentAt: number): number {
  const minInterval = 60 * 1000; // 60 seconds
  const remaining = Math.max(0, minInterval - (Date.now() - lastSentAt));
  return Math.ceil(remaining / 1000);
}

/**
 * Create new OTP data
 */
export function createOTPData(): OTPData {
  return {
    code: generateOTP(),
    expiresAt: getOTPExpirationTime(),
    attempts: 0,
    isVerified: false
  };
}

/**
 * Validate OTP attempt
 */
export function validateOTPAttempt(
  inputOTP: string, 
  storedOTP: OTPData, 
  maxAttempts: number = 3
): { isValid: boolean; error?: string } {
  // Check if OTP is expired
  if (isOTPExpired(storedOTP.expiresAt)) {
    return { isValid: false, error: 'OTP has expired. Please request a new one.' };
  }
  
  // Check if max attempts exceeded
  if (storedOTP.attempts >= maxAttempts) {
    return { isValid: false, error: 'Maximum attempts exceeded. Please request a new OTP.' };
  }
  
  // Check if already verified
  if (storedOTP.isVerified) {
    return { isValid: false, error: 'OTP has already been used.' };
  }
  
  // Validate format
  if (!validateOTPFormat(inputOTP)) {
    return { isValid: false, error: 'Please enter a valid 6-digit code.' };
  }
  
  // Check if OTP matches
  if (inputOTP !== storedOTP.code) {
    return { isValid: false, error: 'Invalid OTP code. Please try again.' };
  }
  
  return { isValid: true };
}
