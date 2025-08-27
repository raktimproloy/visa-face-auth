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
      return { firstName: nameParts[0], lastName: '' }; // Default last name if only one name provided
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
    
    if (!fullName) {
      setFullNameError("Please enter your full name");
      return;
    }
    
    if (!email) {
      setEmailError("Please enter your email address");
      return;
    }
    
    if (!password) {
      setPasswordError("Please enter a password");
      return;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
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
      setFullNameError("Please enter your first name");
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
          setEmailError("email is already registered");
        } else {
          setEmailError(errorData.error || "Registration failed. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Registration successful, storing user data in Redux:', result.user);
        
        console.log('Registration successful, redirecting to OTP verification');
        
        // Redirect to OTP verification page
        router.push(`/auth/verify-otp?customerId=${result.user.customerId}&email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}`);
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
    <div className="!bg-[url('/images/mobile/bg-two-1.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6">
      <div className="flex justify-center items-center flex-col">
        <form className="grid grid-cols-2 gap-x-4 max-w-[360px] px-0">
          {/* First name */}
          <div className="col-span-2 mb-10 text-center">
            <h2 className="text-xl text-white font-bold mb-3" style={{fontSize:"16px"}}>
              Create Account
            </h2>
            <p className="text-sm text-[#CFCFCF]" style={{fontSize:"12px"}}>
              Create your VisaFace account and <br /> start entering event
              effortlessly.
            </p>
          </div>
          <div className="col-span-2 mb-5">
            <input
              type="text"
              className={`form-control ${fullNameError ? 'border-red-400' : ''}`}
              id="first_name"
              placeholder="Enter your full name"
              name="first_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="col-span-2 mb-5">
            <input
              type="email"
              className={`form-control ${emailError ? 'border-red-400' : ''}`}
              placeholder="Enter your email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
          {emailError && (
              <p className="text-red-400 text-sm mt-1 text-center w-full">{emailError}</p>
            )}
          </div>
          {/* Password */}
          <div className="col-span-2 mb-5">
            <div className="relative">
              <span
                className="right-4 absolute top-2 z-10 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="26"
                  viewBox="0 0 27 26"
                  fill="none"
                >
                  <path
                    d="M18.3914 17.7776C16.9611 18.8316 15.2193 19.4154 13.421 19.4438C8.99059 19.4438 5.99634 15.7418 4.8004 13.9381C4.40821 13.3466 4.4117 12.5991 4.80243 12.0067C5.77454 10.5328 7.00868 9.23292 8.45063 8.16858M11.6638 6.69637C12.2398 6.56605 12.8295 6.5009 13.421 6.50224C17.8531 6.50224 20.8479 10.2069 22.043 12.0099C22.4344 12.6005 22.4314 13.3464 22.0426 13.9385C21.6724 14.5022 21.2634 15.0417 20.8181 15.5532M15.195 14.6877C14.5692 15.3369 13.6267 15.6041 12.7372 15.3845C11.8478 15.165 11.1533 14.4936 10.9262 13.6339C10.699 12.7741 10.9755 11.8631 11.6471 11.2582M5.59192 5.40527L21.2501 20.5409"
                    stroke="#F4F8FC"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${passwordError ? 'border-red-400' : ''}`}
                id="password"
                name="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {/* Confirm Password */}
          <div className="col-span-2 mb-5">
            <div className="relative">
              <span
                className="right-4 absolute top-2 z-10 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="26"
                  viewBox="0 0 27 26"
                  fill="none"
                >
                  <path
                    d="M18.3914 17.7776C16.9611 18.8316 15.2193 19.4154 13.421 19.4438C8.99059 19.4438 5.99634 15.7418 4.8004 13.9381C4.40821 13.3466 4.4117 12.5991 4.80243 12.0067C5.77454 10.5328 7.00868 9.23292 8.45063 8.16858M11.6638 6.69637C12.2398 6.56605 12.8295 6.5009 13.421 6.50224C17.8531 6.50224 20.8479 10.2069 22.043 12.0099C22.4344 12.6005 22.4314 13.3464 22.0426 13.9385C21.6724 14.5022 21.2634 15.0417 20.8181 15.5532M15.195 14.6877C14.5692 15.3369 13.6267 15.6041 12.7372 15.3845C11.8478 15.165 11.1533 14.4936 10.9262 13.6339C10.699 12.7741 10.9755 11.8631 11.6471 11.2582M5.59192 5.40527L21.2501 20.5409"
                    stroke="#F4F8FC"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-control ${confirmPasswordError ? 'border-red-400' : ''}`}
                id="confirm_password"
                name="confirm_password"
                placeholder="Re-type password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-2 text-center">
            <label className="flex items-center justify-center gap-3 text-white text-xs underline ">
              {/* <input 
              type="checkbox"
              className={` ${acceptTermsError ? 'checkbox-error' : ''}`}
              id="accept_terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{width:"16px",height:"16px",borderRadius:"4px"}}
              /> */}
              <input 
            type="checkbox" 
            checked={acceptTerms} 
            onChange={(e) => setAcceptTerms(e.target.checked)} 
            className={`
              w-4 h-4 rounded border-2 transition-all duration-200 cursor-pointer
              ${acceptTerms 
                ? 'bg-blue-500 border-blue-500' 
                : acceptTermsError 
                  ? 'bg-transparent border-red-400' 
                  : 'bg-transparent border-white'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-300
            `}
          />
              Accept term of service
            </label>
          </div>
          <div className="col-span-2 mt-12 text-center">

            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Sign Up button clicked!');
                console.log('Form state:', { 
                  fullName, 
                  email, 
                  password: password ? '***' : 'empty', 
                  confirmPassword: confirmPassword ? '***' : 'empty', 
                  acceptTerms 
                });
                console.log('Validation errors:', { fullNameError, emailError, passwordError, confirmPasswordError, acceptTermsError });
                handleCreateAccount();
              }}
              type="button"
              disabled={isSubmitting}
              className="mobile-btn !text-white !mx-auto cursor-pointer w-full"
              style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
            >
              {isSubmitting ? 'Loading...' : 'Sign Up'}
            </button>
          </div>
          <div className="col-span-2 mt-5 text-center">
            <p className="text-xs text-[#A8AFC0]">
              Have an account?{" "}
              <Link
                className="text-sm text-[#D3D3D3] font-bold"
                href={"/auth/login"}
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
