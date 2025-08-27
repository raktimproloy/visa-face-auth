"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import { useRouter } from "next/navigation";

export default function FinalPage() {
  const router = useRouter();
  // Auth protection - redirect to register if no user data
  const { isAuthenticated, userData } = useAuthProtection();

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

  // Debug logging
  console.log('FinalPage - userData:', userData);
  console.log('FinalPage - status values:', {
    enrollmentStatus: userData?.enrollmentStatus,
    biometricStatus: userData?.biometricStatus,
    customerId: userData?.customerId
  });

  // Check if user has completed biometric verification
  // Only allow access if biometric status is 'completed'
  const hasCompletedBiometric = userData?.biometricStatus === 'completed';
  const canAccessFinalPage = hasCompletedBiometric;

  if (!canAccessFinalPage) {
    console.log('FinalPage - Access denied, biometric status not complete');
    console.log('FinalPage - biometricStatus:', userData?.biometricStatus);
    router.push('/auth/selfie-policy');
    return null;
  }
  
  console.log('FinalPage - Access granted, showing final page');
  console.log('FinalPage - User completed:', {
    biometric: hasCompletedBiometric
  });
  console.log('FinalPage - Full user data:', userData);

  return (
    <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-25">
    <div className="flex justify-center items-center flex-col text-center">
      <div className="flex justify-center items-center flex-col">
        <Image src={'/logo.svg'} alt="logo" height={115} width={220} quality={100} />
        <Image src={'/images/mobile/01.png'} alt="logo" height={398} width={335} quality={100} className="opacity-20 text-center" />
      </div>
      <div className="mt-1">
        <h3 className="md:text-xl text-base text-white font-bold" style={{fontSize:"16px"}}>Effortless Access. Every Time.</h3>
        <p className=" text-sm text-white mt-2" style={{fontSize:"15px"}}>Experience a new, secure <br /> and seamless way to enter.</p>
      </div>
    </div>
    </div>
  );
}
