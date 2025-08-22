"use client";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "../../../store/hooks";
import { useAuthProtection } from "../../../hooks/useAuthProtection";

export default function FinalPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated } = useAuthProtection();
  const { registrationData } = useAppSelector((state) => state.auth);

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
  console.log('FinalPage - registrationData status:', {
    enrollmentStatus: registrationData?.enrollmentStatus,
    biometricStatus: registrationData?.biometricStatus,
    customerId: registrationData?.customerId
  });

  // Validate enrollment or biometric status
  if (registrationData?.enrollmentStatus !== 'completed' && registrationData?.biometricStatus !== 'completed') {
    console.log('FinalPage - Access denied, status not complete');
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
        <div className="w-full text-center">
          <p className="text-sm text-[#3F3F3F] font-medium">
            Your enrollment is not complete. Please complete the face verification process.
          </p>
          <Link href="/auth/selfie-policy" className="mobile-btn !text-[#323232] !mt-4 !inline-block">
            Continue Enrollment
          </Link>
        </div>
      </div>
    );
  }
  
  console.log('FinalPage - Access granted, showing final page');

  return (
    <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
      <div className="w-full text-center">
        <Image
          src={"/icon-logo.svg"}
          alt="logo"
          height={107}
          width={136}
          quality={100}
          className="mx-auto mb-12"
        />
        
        {/* Success Icon */}
        <div className="text-8xl mb-8">✅</div>
        
        <div className="max-w-[400px] mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#28A300] mb-4">
            Enrollment Complete!
          </h1>
          
          <p className="text-lg text-[#3F3F3F] mb-6">
            Congratulations! Your face verification has been successfully completed and approved.
          </p>
          
          <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-[#3F3F3F] mb-4">
              Enrollment Details
            </h2>
            
            <div className="text-left space-y-2 text-sm text-[#3F3F3F]">
              <div className="flex justify-between">
                <span className="font-medium">Customer ID:</span>
                <span className="font-mono">{registrationData?.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{registrationData?.firstName} {registrationData?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{registrationData?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="text-[#28A300] font-semibold">Approved</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-[#3F3F3F]">
              Your biometric enrollment has been successfully processed. You can now access all services.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> You will receive a confirmation email with further instructions.
              </p>
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="mobile-btn !text-[#323232] !w-full"
            >
              Refresh Page
            </button>
            
            <Link 
              href="/auth/login" 
              className="mobile-btn !text-[#B20610] !w-full !bg-transparent !border-2 !border-[#B20610]"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
