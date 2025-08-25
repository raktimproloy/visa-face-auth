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
    // <div className="relative !bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6 bg-dark-overlay">
    // <Image
    //   src={"/images/mobile/bg-1.png"}
    //   alt="logo"
    //   quality={100}
    //   fill={true}
    //   className="mx-auto lg:object-contain object-cover absolute top-0 left-0 blur-xs"
    // />
    // <div className="flex justify-end items-center flex-col relative z-10 px-4">
    //   <form onSubmit={handleLogin} className=" grid grid-cols-1 gap-x-4 max-w-[360px] px-4">
    //     {/* Header */}
    //     <div className="col-span-1 mb-14">
    //       <h3 className="text-2xl font-bold text-white">Login</h3>
    //       <p className="text-gray-400">Login to your VisaFace account and start entering event effortlessly.</p>
    //     </div>
        
    //     {/* Email */}
    //     <div className="col-span-1 mb-7">
    //       <input
    //         type="email"
    //         className="form-control-glass"
    //         id="email"
    //         name="email"
    //         placeholder="Enter your email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //         required
    //       />
    //     </div>
        
    //     {/* Password */}
    //     <div className="col-span-1 mb-8">
    //       <div className="password-input-wrapper">
    //         <input
    //           type={showPassword ? "text" : "password"}
    //           className="form-control-glass pr-12"
    //           id="password"
    //           name="password"
    //           placeholder="Enter your password"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           required
    //         />
    //         <button
    //           type="button"
    //           className="password-toggle-btn"
    //           onClick={() => setShowPassword(!showPassword)}
    //         >
    //           {showPassword ? (
    //             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    //               <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    //             </svg>
    //           ) : (
    //             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //               <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    //               <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    //             </svg>
    //           )}
    //         </button>
    //       </div>

            
          
    //     </div>
        
    //     {/* Submit button */}
    //     <div className="col-span-1 mt-6 text-center">
    //       <button
    //         type="submit"
    //         disabled={isLoading}
    //         className="mobile-btn !text-white !mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
    //       >
    //         {isLoading ? 'Logging in...' : 'Login'}
    //       </button>
    //     </div>

    //     {/* Error Message */}
    //     {error && (
    //       <div className="col-span-1 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm">
    //         {error}
    //       </div>
    //     )}
    //   </form>
    //       <p className="text-md text-[#9C9AA5] mt-4">
    //                      Don&apos;t have an account? <Link href="/auth/register" className="text-blue-500">Register</Link>
    //       </p>
    // </div>
    // </div>
    <div className="!bg-[url('/images/mobile/bg-two-1.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6">
      <div className="flex justify-center items-center flex-col">
        <form  onSubmit={handleLogin} className="grid grid-cols-2 gap-x-4 max-w-[360px]">
          {/* First name */}
          <div className="col-span-2 mb-25">
            <h2 className="text-xl text-white font-bold mb-3">Welcome back!</h2>
            <p className="text-sm text-[#CFCFCF]">
              Login to your VisaFace account and <br />
              start entering event effortlessly.
            </p>
          </div>

          {/* Email */}
          <div className="col-span-2 mb-5">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Password */}
          <div className="col-span-2 mb-5">
            <div className="relative">
              <span
                className="right-4 absolute top-3 z-10"
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
                className="form-control"
                id="password"
                name="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-span-2 mt-20 text-center">
          <button
            type="submit"
            disabled={isLoading}
              className="mobile-btn !text-white !mx-auto"
            >
              {isLoading ? 'Logging in...' : 'Login'}
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
              By logging into my VisaFace account, I accept the Company’s <br />{" "}
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
