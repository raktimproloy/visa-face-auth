"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, LoginResponse } from "../../../utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await loginUser({ email, password });
      
      if (response.success) {
        setResult(response);
        console.log('Login successful:', response);
        
        // Redirect to final page after successful login
        setTimeout(() => {
          router.push('/auth/final');
        }, 2000); // 2 second delay to show success message
      } else {
        setError(response.error || 'Login failed');
        console.error('Login failed:', response);
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
              href={"/auth/selfie-policy"}
              className="!block text-left mt-5"
            >
              Forgot Password?
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

          {/* Success Message */}
          {result && (
            <div className="col-span-2 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded text-center">
              <h3 className="font-semibold mb-2">Login Successful!</h3>
              <p className="text-sm mb-2">Redirecting to your dashboard in 2 seconds...</p>
            </div>
          )}

          {/* Test Credentials Info */}
          <div className="col-span-2 mt-4 text-center text-xs text-[#9C9AA5]">
            <p>Test with a user created from the selfie upload process</p>
            <p className="mt-1">
              <strong>Default test data:</strong><br />
              Email: john.doe@example.com<br />
              Password: password123
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
