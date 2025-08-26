'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuthProtection } from '../../../hooks/useAuthProtection';

export default function SuccessPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated, userData } = useAuthProtection();

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Checking Registration...</h3>
          <p className="text-gray-600">Please wait while we verify your registration</p>
        </div>
      </div>
    );
  }

  // Check if user has completed biometric verification
  if (userData?.biometricStatus !== 'completed') {
    // Redirect to selfie-policy if biometric is not completed
    window.location.href = '/auth/selfie-policy';
    return null;
  }

  // Get user data with fallbacks
  const userDisplayData = {
    name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || '',
    customerId: userData?.customerId || 'N/A',
    enrollmentId: userData?.enrollmentId || 'N/A',
    biometricStatus: userData?.biometricStatus || 'pending',
    idmissionValid: userData?.idmissionValid || false,
    photoUrl: userData?.photo || ''
  };

  return (
    <div className="!bg-[url('/images/mobile/bg-four.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
    <div className="w-full text-center">
      <Image
        src={"/logo.svg"}
        alt="logo"
        height={107}
        width={220}
        quality={100}
        className="mx-auto mb-12"
      />
      <h2 className="mt-20 mb-9 text-base text-white font-bold text-center font-inter">
        Hello {userDisplayData.name},
      </h2>
      <p className="text-[15px] text-white font-normal text-center mb-3">
        Your face has been successfully <br /> enrolled.
      </p>
      <p className="text-[15px] text-white font-normal text-center mb-[230px]">
        From now on, just smile at <br />
        any of our Verifier screens and <br />
        you’ll breeze right in.
      </p>
      <Link href={"/auth/final"} className="mobile-btn two !mt-5 !text-white">
        I’m all set
      </Link>

      <p className="text-xs text-white mt-4">
        How to Troubleshoot <br />
        If you ever have trouble, email <i>support@visaface.online</i>
      </p>
    </div>
  </div>
  );
}
