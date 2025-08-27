"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../../store/hooks";
import { setRegistrationData } from "../../../store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Clear previous validation errors
    setEmailError("");
    setPasswordError("");

    // Validate inputs
    if (!email) {
      setEmailError("Please enter your email");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setPasswordError("Please enter your password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Login successful:', result.user);
        
        // Store user data in Redux
        dispatch(setRegistrationData({
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          password: '', // Don't store password in Redux
          customerId: result.user.customerId,
          enrollmentId: result.user.enrollmentId,
          enrollmentStatus: result.user.enrollmentStatus,
          biometricStatus: result.user.biometricStatus,
          idmissionValid: result.user.idmissionValid,
          photo: result.user.photoUrl
        }));

        // Check if email verification is required
        if (result.requiresEmailVerification) {
          console.log('Email verification required, redirecting to OTP verification');
          router.push('/auth/verify-otp');
          return;
        }

        // Redirect based on biometric status (only for verified users)
        if (result.user.biometricStatus === 'completed') {
          console.log('User biometric completed, redirecting to final page');
          router.push('/auth/final');
        } else {
          console.log('User biometric not completed, redirecting to selfie-policy');
          router.push('/auth/selfie-policy');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="!bg-[url('/images/mobile/bg-two-1.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6">
      <div className="flex justify-center items-center flex-col">
        <form  onSubmit={handleLogin} className="grid grid-cols-2 gap-x-4 max-w-[360px] px-10 justify-center">
          {/* First name */}
          <div className="col-span-2 mb-25 text-center">
            <h2 className="text-xl text-white font-bold mb-3">Welcome back!</h2>
            <p className="text-sm text-[#CFCFCF]">
              Login to your VisaFace account and <br />
              start entering event effortlessly.
            </p>
          </div>

          {/* Email */}
          <div className="col-span-2 mb-5 flex justify-center">
            <input
              type="email"
              className={`form-control ${emailError ? 'border-red-400' : ''}`}
              placeholder="Enter your email"
              style={{width:"100%"}}
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Password */}
          <div className="col-span-2 mb-5 flex justify-center w-full">
            <div className="relative w-full">
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
                style={{width:"100%"}}
                id="password"
                name="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Error Message Display */}
          {error && (
            <div className="col-span-2 text-red-400 text-sm text-center mb-4">
              {error}
            </div>
          )}
          <div className="col-span-2 mt-12 text-center">
          <button
            type="submit"
            disabled={isLoading}
              className="mobile-btn !text-white !mx-auto"
              style={{fontSize:"14px",width:"100%"}}
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </div>
          <div className="col-span-2 mt-2 text-center">
            {/* <Link
              className="text-xs text-[#A8AFC0] font-bold"
              href={"/auth/login"}
            >
              Forgot Password?
            </Link> */}
            <p className="text-[10px] text-[#D5D4D7] mt-20">
              By logging into my VisaFace account, I accept the Company's <br />{" "}
              <i className="text-[#D1D0D3] font-bold">
                Terms of use & Privacy Policy.
              </i>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
