"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpError, setOtpError] = useState(false);

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

  // Auto-hide success and error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);

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
    setSuccess(null); // Clear success message when user types
    setOtpError(false); // Clear OTP input error when user types
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Enter 6-digit code');
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
        if (registrationData?.biometricStatus === 'completed') {
          router.push('/auth/final');
        } else {
          router.push('/auth/selfie-policy');
        }
      } else {
        setError(result.error || 'Verification failed.');
        // Focus on first input for retry
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Network error.');
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
        setSuccess('New OTP sent successfully!');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setResendCountdown(30); // Start 30-second countdown
        setCanResend(false); // Disable resend button
      } else {
        setError(result.error || 'Failed to resend OTP.');
      }
    } catch (error) {
      setError('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToRegister = () => {
    router.push('/auth/register');
  };

  if (!customerId || !email) {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-16 sm:pt-20">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-[#3F3F3F] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!bg-[url('/images/mobile/bg-two-1.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-16 sm:pt-20 pb-6 sm:pb-10">
      <div className="w-full max-w-md mx-auto px-3 sm:px-4">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Image
            src="/images/mobile/favicon.svg"
            alt="VisaFace Logo"
            width={60}
            height={60}
            className="mx-auto mb-3 sm:mb-4 sm:w-20 sm:h-20"
          />
          
          {/* Show different message based on flow */}
          {!searchParams.get('customerId') && registrationData ? (
            <div className="mb-4">
              <h1 className="font-bold text-white mb-2" style={{fontSize:"16px"}}>Email Verification Required</h1>
              <p className=" text-gray-300" style={{fontSize:"12px"}}>
                Please verify your email to continue with your account access.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Verify Your Email</h1>
              <p className="text-xs sm:text-sm text-gray-300">
                We've sent a verification code to {email}
              </p>
            </div>
          )}
        </div>

        {/* OTP Input */}
        <div className="bg-opacity-50 backdrop-blur-sm rounded-lg p-4 mb-0">
          <div className="mb-4">
            <label className="block text-white text-xs sm:text-sm font-medium mb-3">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-center gap-1 sm:gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="number"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-black opacity-50"
                  style={{
                    borderColor: (error || otpError) ? '#ef4444' : '#d1d5db'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-4">
            <p className="text-xs sm:text-sm text-white">
              OTP validation time: <span className="font-semibold text-white">10 minutes</span>
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <p className="text-xs sm:text-sm text-red-500 text-center mb-3">{error}</p>
          )}
          
          {/* Success Message */}
          {success && (
            <p className="text-xs sm:text-sm text-green-500 text-center mb-3">{success}</p>
          )}
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mobile-btn !text-white !mb-3 sm:!mb-4 !text-sm sm:!text-base disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend Button */}
          <button
            onClick={handleResendOTP}
            disabled={isSubmitting || !canResend}
            className="w-full text-xs sm:text-sm text-white hover:text-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canResend ? 'Resend Code' : `${resendCountdown}s`}
          </button>
        </div>

        {/* Back to Register */}
        <div className="text-center">
          <button
            onClick={handleBackToRegister}
            className="text-[#CFCFCF] text-xs sm:text-sm hover:text-white transition-colors"
          >
            ← Back to Registration
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 sm:mt-8 text-center">
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
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-6 sm:py-9">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-[#3F3F3F] font-medium">
            Loading OTP verification page...
          </p>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
