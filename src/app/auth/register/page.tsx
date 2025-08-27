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
                className="right-4 absolute top-1/2 -translate-y-1/2 z-10 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // Eye-off icon when password is visible
                  <svg viewBox="0 0 24 24" width="27" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                ) : (
                  // Eye icon when password is hidden
                  <svg viewBox="0 0 24 24" width="27" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                )}
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
                className="right-4 absolute top-1/2 -translate-y-1/2 z-10 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  // Eye-off icon when password is visible
                  <svg viewBox="0 0 24 24" width="27" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                ) : (
                  // Eye icon when password is hidden
                  <svg viewBox="0 0 24 24" width="27" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                )}
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
