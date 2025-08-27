"use client";
import Image from "next/image";
import { useState } from "react";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import Link from "next/link";

export default function SelfiePolicyPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated, userData } = useAuthProtection();
  
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
  if (userData?.biometricStatus === 'completed') {
    // Show completion message instead of redirecting
    return (
      <div className="!bg-[url('/images/mobile/bg-three.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20 pb-10">
        <div className="w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">
            Biometric Verification Completed
          </button>
          <p className="text-[#3E3E3E] mb-6">
            You have already completed your face verification. You can proceed to the final step or review your current status.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/auth/final'}
              className="mobile-btn !text-[#28A300] !mx-auto !block"
            >
              Continue to Final Step
            </button>
            <button
              onClick={() => window.location.href = '/auth/selfie-review'}
              className="mobile-btn !text-[#B20610] !mx-auto !block"
            >
              Review Status
            </button>
          </div>
        </div>
      </div>
    );
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
        {/* <Image
          src={"/images/mobile/favicon.svg"}
          alt="logo"
          height={107}
          width={136}
          quality={100}
          className="mx-auto mb-12"
        /> */}
        <div className="col-span-2 mb-10 text-center">
            <h2 className="text-xl text-white font-bold mb-3" style={{fontSize:"16px"}}>
            Instructions
            </h2>
            <p className="text-sm text-[#CFCFCF]" style={{fontSize:"12px"}}>
            Please follow the guide below for best <br/>
             results.
            </p>
          </div>
        <div className="grid grid-cols-2 gap-5 max-w-[330px] mx-auto">
          <div className="text-center">
            <Image
              src={"/images/mobile/icon/01.svg"}
              alt="logo"
              width={26}
              height={21}
              className="mx-auto h-6"
            />
            <p className="text-xs text-white font-medium mt-1" style={{fontSize:"12px"}}>
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
            <p className="text-xs text-white font-medium mt-1" style={{fontSize:"12px"}}>
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
            <p className="text-xs text-white font-medium mt-1" style={{fontSize:"12px"}}>
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
            <p className="text-xs text-white font-medium mt-1" style={{fontSize:"12px"}}>Even lighting</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 max-w-[290px] mx-auto mt-12 mb-5">
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
        <label className="flex items-center justify-center text-white gap-2 mb-3 text-xs font-medium max-w-[230px] mx-auto">
          <input 
            type="checkbox" 
            checked={acceptPrivacyPolicy} 
            onChange={(e) => handlePrivacyPolicyChange(e.target.checked)} 
            className={`
              w-4 h-4 rounded border-2 transition-all duration-200 cursor-pointer
              ${acceptPrivacyPolicy 
                ? 'bg-blue-500 border-blue-500' 
                : privacyPolicyError 
                  ? 'bg-transparent border-red-400' 
                  : 'bg-transparent border-white'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-300
            `}
          />
          I agree to the<span className="underline">privacy policy</span>
        </label>
        <div className="text-center  mt-20 max-auto">
          <button className="mobile-btn !text-white" style={{fontSize:"14px"}}
          onClick={handleTakeSelfie}
          >
            Take A Selfie
          </button>
        </div>
      </div>
    </div>
  );
}
