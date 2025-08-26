"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatRemainingTime, getResendCountdown } from "../../../utils/otpUtils";
import { useAppSelector } from "../../../store/hooks";

// Wrapper component to handle useSearchParams with Suspense
function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registrationData } = useAppSelector((state) => state.auth);
  
  // Get data from URL params (for registration flow) or Redux (for login flow)
  const customerId = searchParams.get('customerId') || registrationData?.customerId;
  const email = searchParams.get('email') || registrationData?.email;
  const firstName = searchParams.get('firstName') || registrationData?.firstName;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<number>(Date.now() + 10 * 60 * 1000); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [lastOtpSent, setLastOtpSent] = useState<number>(Date.now());

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no customerId or email (either from URL params or Redux)
  useEffect(() => {
    console.log('Verify OTP page - checking user data:', {
      customerId,
      email,
      hasRegistrationData: !!registrationData,
      registrationDataKeys: registrationData ? Object.keys(registrationData) : []
    });
    
    if (!customerId || !email) {
      // If we have some data in Redux but missing customerId, user might be coming from login
      if (registrationData && !customerId) {
        console.log('User data found in Redux but missing customerId, redirecting to login');
        router.push('/auth/login');
        return;
      }
      
      // If no data at all, redirect to register
      console.log('No user data found, redirecting to register');
      router.push('/auth/register');
    } else {
      console.log('User data verified, proceeding with OTP verification');
    }
  }, [customerId, email, router, registrationData]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (now >= expiryTime) {
        setError('OTP has expired. Please request a new one.');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCountdown]);

  // Initialize resend countdown
  useEffect(() => {
    const countdown = getResendCountdown(lastOtpSent);
    setResendCountdown(countdown);
    setCanResend(countdown === 0);
  }, [lastOtpSent]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move to previous input if value is deleted
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    setError(null); // Clear error when user types
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          otp: otpString
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully! Redirecting...');
        setTimeout(() => {
          // Check if user has completed biometric enrollment
          if (registrationData?.biometricStatus === 'completed') {
            router.push('/auth/final');
          } else {
            router.push('/auth/selfie-policy');
          }
        }, 2000);
      } else {
        setError(result.error || 'Verification failed. Please try again.');
        // Focus on first input for retry
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('New OTP sent successfully! Please check your email.');
        setLastOtpSent(Date.now());
        setExpiryTime(Date.now() + 10 * 60 * 1000);
        setCanResend(false);
        setResendCountdown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        if (response.status === 429) {
          setResendCountdown(result.remainingTime || 60);
          setCanResend(false);
        }
        setError(result.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToRegister = () => {
    router.push('/auth/register');
  };

  if (!customerId || !email) {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-[#3F3F3F] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!bg-[url('/images/mobile/bg-two-1.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-10">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/mobile/favicon.svg"
            alt="VisaFace Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          
          {/* Show different message based on flow */}
          {!searchParams.get('customerId') && registrationData ? (
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white mb-2">Email Verification Required</h1>
              <p className="text-sm text-gray-300">
                Please verify your email to continue with your account access.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
              <p className="text-sm text-gray-300">
                We've sent a verification code to {email}
              </p>
            </div>
          )}
        </div>

        {/* OTP Input */}
        <div className=" bg-opacity-50 backdrop-blur-sm rounded-lg p-6 mb-0">
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-3">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2  border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-black opacity-50"
                  style={{
                    borderColor: error ? '#ef4444' : '#d1d5db'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-4">
            <p className="text-sm text-white">
              Code expires in: <span className="font-semibold text-white">
                {formatRemainingTime(expiryTime)}
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || otp.join('').length !== 6}
            className="w-full mobile-btn !text-white !mb-4  disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend Button */}
          <button
            onClick={handleResendOTP}
            disabled={!canResend || isSubmitting}
            className="w-full text-sm text-white hover:text-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canResend ? (
              'Resend Code'
            ) : (
              `Resend in ${resendCountdown}s`
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Back to Register */}
        <div className="text-center">
          <button
            onClick={handleBackToRegister}
            className="text-[#CFCFCF] text-sm hover:text-white transition-colors"
          >
            ← Back to Registration
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#A8AFC0]">
            Didn't receive the code? Check your spam folder or<br />
            contact support at <span className="text-[#D3D3D3]">support@visaface.online</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-[#3F3F3F] font-medium">
            Loading OTP verification page...
          </p>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
