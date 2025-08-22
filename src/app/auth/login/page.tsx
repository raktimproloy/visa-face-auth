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

        // Redirect based on enrollment status
        if (result.user.enrollmentStatus === 'pending') {
          console.log('User enrollment pending, redirecting to selfie-policy');
          router.push('/auth/selfie-policy');
        } else {
          console.log('User enrollment completed, redirecting to final');
          router.push('/auth/final');
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
    <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6 flex justify-between items-center flex-col">
        <form onSubmit={handleLogin} className="grid grid-cols-2 gap-x-4 max-w-[360px]">
          {/* First name */}
          <div className="col-span-2 mb-14">
            <Image
              src={"/icon-logo.svg"}
              alt="logo"
              height={107}
              width={136}
              quality={100}
              className="mx-auto"
            />
          </div>
          <div className="col-span-2 mb-7">
            <label htmlFor="email" className="block text-base font-normal mb-2">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 mb-8">
            <label
              htmlFor="password"
              className="block text-base font-normal mb-2"
            >
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            
            <Link
              href={"/auth/register"}
              className="!block text-left mt-5"
            >
              Don't have an account? Register
            </Link>
          </div>
          <div className="col-span-2 mt-6 text-center">
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
            <div className="col-span-2 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm">
              {error}
            </div>
          )}



          {/* Test Credentials Info */}
          <div className="col-span-2 mt-4 text-center text-xs text-[#9C9AA5]">
            <p>Login with your registered email and password</p>
            <p className="mt-1">
              <strong>Note:</strong><br />
              • Pending enrollment → Redirected to selfie-policy<br />
              • Completed enrollment → Redirected to final page
            </p>
          </div>

          {/* Register Link */}
          <div className="col-span-2 mt-4 text-center">
            <p className="text-md text-[#9C9AA5]">
              Don't have an account? <Link href="/auth/register" className="text-blue-500">Register</Link>
            </p>
          </div>

        </form>
        
          {/* Terms */}
          <div className="col-span-2 mt-14 text-center">
            <p className="text-[10px] text-[#9C9AA5]">
              By signing up to create an account I accept Company’s <br />
              <strong className="font-bold italic text-[#26203B]">
                Terms of use & Privacy Policy.
              </strong>
            </p>
      </div>
    </div>
  );
}
