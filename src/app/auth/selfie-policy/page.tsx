"use client";
import Image from "next/image";
import { useState } from "react";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import { useAppSelector } from "../../../store/hooks";
import Link from "next/link";

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
    <div className="!bg-[url('/images/mobile/bg-three.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-10">
      <div className="w-full">
        <Image
          src={"/images/mobile/favicon.svg"}
          alt="logo"
          height={107}
          width={136}
          quality={100}
          className="mx-auto mb-12"
        />
        <div className="grid grid-cols-2 gap-5 max-w-[330px] mx-auto">
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/01.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-xs text-white font-medium mt-1">
              Plain Background
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/02.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-xs text-white font-medium mt-1">
              Use neutral expression
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/03.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-xs text-white font-medium mt-1">
              Center your face
            </p>
          </div>
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/04.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-xs text-white font-medium mt-1">Even lighting</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 max-w-[290px] mx-auto mt-12 mb-14">
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
        <label className="flex items-center justify-center text-white gap-2 mb-3 text-xs  font-medium max-w-[230px] mx-auto">
          <input type="checkbox" checked={acceptPrivacyPolicy} onChange={(e) => handlePrivacyPolicyChange(e.target.checked)} />
          I agree to the privacy policy
          
        </label>
        {privacyPolicyError && (
          <p className="text-red-400 text-xs text-center">{privacyPolicyError}</p>
        )}
        <div className="text-center  mt-12 max-auto">
          <button className="mobile-btn !text-white"
          onClick={handleTakeSelfie}
          >
            Take A Selfie
          </button>
        </div>
      </div>
    </div>
  );
}
