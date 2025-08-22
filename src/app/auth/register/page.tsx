"use client";
import Image from "next/image";
import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { setRegistrationData } from "../../../store/slices/authSlice";
import { useRouter } from "next/navigation";
import { validateEmail } from "../../../utils/emailValidation";
import Link from "next/link";

export default function RegisterPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [acceptTermsError, setAcceptTermsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Function to separate full name into first and last name
  const separateFullName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: 'User' }; // Default last name if only one name provided
    } else if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      return { firstName, lastName };
    }
    return { firstName: '', lastName: '' };
  };

  // Simple email change handler
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setEmailError(""); // Clear any previous errors
  };

  const handleCreateAccount = async () => {
    console.log('Starting registration process...');
    
    // Clear all previous errors
    setEmailError("");
    setFullNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setAcceptTermsError("");
    
    if (!fullName || !email || !password || !confirmPassword) {
      setEmailError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setAcceptTermsError("Please accept the terms of service");
      return;
    }

    const { firstName, lastName } = separateFullName(fullName);
    console.log('Name separation result:', { firstName, lastName });
    
    if (!firstName) {
      setFullNameError("Please enter at least your first name");
      return;
    }

    setIsSubmitting(true);
    console.log('Sending registration request with:', { firstName, lastName, email });
    
    try {
      // Register user directly with the new API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setEmailError("This email is already registered. Please use a different email.");
        } else {
          setEmailError(errorData.error || "Registration failed. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Registration successful, storing user data in Redux:', result.user);
        
        // Store user data in Redux for the flow
        dispatch(setRegistrationData({
          firstName,
          lastName,
          email,
          password,
          customerId: result.user.customerId,
          enrollmentId: result.user.enrollmentId,
          enrollmentStatus: result.user.enrollmentStatus,
          biometricStatus: result.user.biometricStatus,
          idmissionValid: result.user.idmissionValid
        }));
        
        console.log('Redux data stored, redirecting to selfie-policy page');
        
        // Redirect to selfie policy page
        router.push("/auth/selfie-policy");
      } else {
        setEmailError("Registration failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setEmailError("Unable to complete registration. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative !bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6 bg-dark-overlay">
    <Image
      src={"/images/mobile/bg-1.png"}
      alt="logo"
      quality={100}
      fill={true}
      className="mx-auto lg:object-contain object-cover absolute top-0 left-0 blur-xs"
    />
      <div className="flex justify-end items-center flex-col relative z-10 px-4">
        <form className="grid grid-cols-1 gap-x-4 max-w-[360px] px-4">
          {/* Header */}
          <div className="col-span-1 mb-14">
            <h3 className="text-2xl font-bold text-white">Create Your Account</h3>
            <p className="text-gray-400">Create your VisaFace account and start entering event effortlessly.</p>
          </div>
          
          {/* Full Name */}
          <div className="col-span-1 mb-7">
            <input
              type="text"
              className={`form-control-glass ${fullNameError ? 'border-red-400' : ''}`}
              id="full_name"
              name="full_name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {fullNameError && (
              <p className="text-red-400 text-sm mt-1">{fullNameError}</p>
            )}
          </div>

          {/* Email */}
          <div className="col-span-1 mb-7">
            <input
              type="email"
              className={`form-control-glass ${emailError ? 'border-red-400' : ''}`}
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {emailError && (
              <p className="text-red-400 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="col-span-1 mb-7">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control-glass pr-12"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="col-span-1 mb-8">
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control-glass pr-12"
                id="confirm_password"
                name="confirm_password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-red-400 text-sm mt-1">{confirmPasswordError}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="col-span-1 mb-3 flex justify-center flex-col items-center">
            <div className="terms-checkbox">
              <input
                type="checkbox"
                className={`${acceptTermsError ? 'border-red-400' : ''}`}
                id="accept_terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="accept_terms">
                Accept the <strong className="text-blue-400">Terms and Service</strong>
              </label>
            </div>
            {acceptTermsError && (
              <p className="text-red-400 text-sm mt-1">{acceptTermsError}</p>
            )}
          </div>

          {/* Submit button */}
          <div className="col-span-1 mt-8 text-center">
            <button
              onClick={(e) => {
                console.log('Button clicked!', e);
                console.log('Form state:', { fullName, email, password, confirmPassword, acceptTerms });
                e.preventDefault();
                handleCreateAccount();
              }}
              onTouchStart={() => {}} // Ensure touch events work
              className={`mobile-btn !text-[#323232] !mx-auto !relative !z-20 !touch-manipulation ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="button"
              disabled={isSubmitting}
              style={{
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
            
          </div>
          
          {/* Sign in link */}
          <div className="col-span-1 mt-4 text-center">
            <p className="text-md text-[#9C9AA5]">
              Have an account? <Link href="/auth/login" className="text-blue-500">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
