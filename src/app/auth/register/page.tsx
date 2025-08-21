"use client";
import Image from "next/image";
import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { setRegistrationData } from "../../../store/slices/authSlice";
import { useRouter } from "next/navigation";
import { checkEmailExists, validateEmail } from "../../../utils/emailValidation";
import Link from "next/link";
export default function RegisterPage() {
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hasMinLength = password.length >= 8;
  const hasSymbolOrNumber = /[\d\W]/.test(password);
  const notContainNameOrEmail =
    !password.toLowerCase().includes(firstName.toLowerCase()) &&
    !password.toLowerCase().includes(email.toLowerCase());

  const strength =
    password.length >= 12 && hasSymbolOrNumber && notContainNameOrEmail
      ? "Strong"
      : hasMinLength
      ? "Medium"
      : "Weak";

  // Simple email change handler
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setEmailError(""); // Clear any previous errors
  };

  const handleCreateAccount = async () => {
    if (!firstName || !lastName || !email || !password) {
      setEmailError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if email already exists in DynamoDB
      const emailCheck = await checkEmailExists(email);
      if (emailCheck.exists) {
        setEmailError("This email is already registered. Please use a different email.");
        setIsSubmitting(false);
        return;
      }

      // Email is available, proceed with registration
      dispatch(setRegistrationData({
        firstName,
        lastName,
        email,
        password
      }));
      
      router.push("/auth/selfie-policy");
    } catch (error) {
      console.error("Registration error:", error);
      setEmailError("Unable to verify email. Please try again.");
      setIsSubmitting(false);
    }
  };

  const checkIcon = (active: boolean) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M13.3334 4L6.00008 11.3333L2.66675 8"
        stroke="#465FF1"
        strokeOpacity={active ? "1" : "0.25"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  return (
    <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-6">
      <div className="flex justify-end items-center flex-col">
        <form className="grid grid-cols-2 gap-x-4 max-w-[360px]">
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
          <div className="col-span-1 mb-7">
            <label
              htmlFor="first_name"
              className="block text-base font-normal mb-2"
            >
              First name
            </label>
            <input
              type="text"
              className="form-control"
              id="first_name"
              name="first_name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last name */}
          <div className="col-span-1 mb-7">
            <label
              htmlFor="last_name"
              className="block text-base font-normal mb-2"
            >
              Last name
            </label>
            <input
              type="text"
              className="form-control"
              id="last_name"
              name="last_name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="col-span-2 mb-7">
            <label htmlFor="email" className="block text-base font-normal mb-2">
              Email
            </label>
            <input
              type="email"
              className={`form-control ${emailError ? 'border-red-500' : ''}`}
              id="email"
              name="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Password conditions */}
          <div className="col-span-2">
            <ul className="ml-7">
              <li className="flex items-center gap-2 text-xs font-medium mb-3">
                <div className="icon">{checkIcon(true)}</div>
                <p>Password Strength: {strength}</p>
              </li>
              <li className="flex items-center gap-2 text-xs font-medium mb-3">
                <div className="icon">{checkIcon(notContainNameOrEmail)}</div>
                <p>Cannot contain your name or email address</p>
              </li>
              <li className="flex items-center gap-2 text-xs font-medium mb-3">
                <div className="icon">{checkIcon(hasMinLength)}</div>
                <p>At least 8 characters</p>
              </li>
              <li className="flex items-center gap-2 text-xs font-medium mb-3">
                <div className="icon">{checkIcon(hasSymbolOrNumber)}</div>
                <p>Contains a number or symbol</p>
              </li>
            </ul>
          </div>

          {/* Submit button */}
          <div className="col-span-2 mt-12 text-center">
            <button
              onClick={handleCreateAccount}
              className={`mobile-btn !text-[#323232] !mx-auto ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          <div className="col-span-2 mt-4 text-center">
            <p className="text-md text-[#9C9AA5]">
              Have an account? <Link href="/auth/login" className="text-blue-500 ">Login</Link>
            </p>
          </div>
          {/* Terms */}
          <div className="col-span-2 mt-4 text-center">
            <p className="text-[10px] text-[#9C9AA5]">
              By signing up to create an account I accept Company’s <br />
              <strong className="font-bold italic text-[#26203B]">
                Terms of use & Privacy Policy.
              </strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
