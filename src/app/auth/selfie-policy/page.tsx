"use client";
import Image from "next/image";
import { useState } from "react";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import { useAppSelector } from "../../../store/hooks";

export default function SelfiePolicyPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated } = useAuthProtection();
  const { registrationData } = useAppSelector((state) => state.auth);
  
  // State for privacy policy checkbox
  const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false);
  const [privacyPolicyError, setPrivacyPolicyError] = useState("");

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-[#3F3F3F] font-medium">
            Checking Authentication...
          </p>
        </div>
      </div>
    );
  }

  // Check if user has already completed biometric verification
  if (registrationData?.biometricStatus === 'completed') {
    // Redirect to final page if biometric is already completed
    window.location.href = '/auth/final';
    return null;
  }

  // Handle privacy policy checkbox change
  const handlePrivacyPolicyChange = (checked: boolean) => {
    setAcceptPrivacyPolicy(checked);
    if (checked) {
      setPrivacyPolicyError(""); // Clear error when checkbox is checked
    }
  };

  // Handle take selfie button click
  const handleTakeSelfie = () => {
    if (!acceptPrivacyPolicy) {
      setPrivacyPolicyError("Please accept the privacy policy to continue");
      return;
    }
    // If checkbox is checked, navigate to selfie page
    window.location.href = '/auth/selfie';
  };

  return (
    <div className="relative !bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
    <Image
      src={"/images/mobile/bg-2.png"}
      alt="logo"
      quality={100}
      fill={true}
      className="mx-auto lg:object-contain object-cover absolute top-0 left-0 blur-xs"
    />
      <div className="w-full absolute top-0 left-0">
        <Image
          src={"/icon_logo.png"}
          alt="logo"
          height={100}
          width={100}
          quality={100}
          className="mx-auto mb-12 mt-10"
        />
        <div className="grid grid-cols-2 gap-5 max-w-[330px] mx-auto">
          <div className="text-center">
            <Image
              src={"/icon/01.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm  font-medium mt-1 text-white">
              Plain Background
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/03.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1 text-white">
              Use neutral expression
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/04.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1 text-white">
              Center your face
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/icon/02.png"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-sm text-[#3F3F3F] font-medium mt-1 text-white">
              Even lighting
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 max-w-[290px] mx-auto mt-12 mb-6 text-white">
          <div className="text-center">
            <Image
              src={"/images/01.png"}
              alt="logo"
              width={130}
              height={170}
              className="mx-auto h-[160px]"
            />
          </div>
          <div className="text-center">
            <Image
              src={"/images/02.png"}
              alt="logo"
              width={130}
              height={170}
              className="mx-auto h-[160px]"
            />
          </div>
        </div>
          <div className="flex flex-col items-center gap-2 max-w-[230px] mx-auto">
            <label className="flex items-center justify-center gap-2 text-xs font-medium text-white">
              <input 
                type="checkbox" 
                checked={acceptPrivacyPolicy}
                onChange={(e) => handlePrivacyPolicyChange(e.target.checked)}
                className=""
              />
              I agree to the privacy policy
            </label>
            {privacyPolicyError && (
              <p className="text-red-400 text-xs text-center">{privacyPolicyError}</p>
            )}
          </div>
          <div className="text-center mt-4 max-auto">
            <button
              onClick={handleTakeSelfie}
              className={`mobile-btn !text-white mb-5 ${
                !acceptPrivacyPolicy ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={!acceptPrivacyPolicy}
            >
              Take A Selfie
            </button>
          </div>
      </div>
      
    </div>
  );
}
