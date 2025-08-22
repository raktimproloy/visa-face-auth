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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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

        // Redirect based on biometric status
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
    <div className="relative !bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6 bg-dark-overlay">
    <Image
      src={"/images/mobile/bg-1.png"}
      alt="logo"
      quality={100}
      fill={true}
      className="mx-auto lg:object-contain object-cover absolute top-0 left-0 blur-xs"
    />
    <div className="flex justify-end items-center flex-col relative z-10 px-4">
      <form onSubmit={handleLogin} className=" grid grid-cols-1 gap-x-4 max-w-[360px] px-4">
        {/* Header */}
        <div className="col-span-1 mb-14">
          <h3 className="text-2xl font-bold text-white">Login</h3>
          <p className="text-gray-400">Login to your VisaFace account and start entering event effortlessly.</p>
        </div>
        
        {/* Email */}
        <div className="col-span-1 mb-7">
          <input
            type="email"
            className="form-control-glass"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        {/* Password */}
        <div className="col-span-1 mb-8">
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control-glass pr-12"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

            
          
        </div>
        
        {/* Submit button */}
        <div className="col-span-1 mt-6 text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="mobile-btn !text-[#323232] !mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="col-span-1 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm">
            {error}
          </div>
        )}
      </form>
          <p className="text-md text-[#9C9AA5] mt-4">
                         Don&apos;t have an account? <Link href="/auth/register" className="text-blue-500">Register</Link>
          </p>
    </div>
    </div>
  );
}
