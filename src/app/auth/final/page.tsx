"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../../store/hooks";
import { clearRegistrationData } from "../../../store/slices/authSlice";
import { clearAllCookies, clearAuthCookies } from "../../../utils/cookieUtils";

export default function FinalPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  // Logout function
  const handleLogout = async () => {
    setIsLoggingOut(true);
    console.log('Starting logout process...');
    
    try {
      // Call logout API to clear cookies server-side
      console.log('Calling logout API...');
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('Logout API successful, cookies cleared server-side');
      } else {
        console.log('Logout API failed, falling back to client-side clearing');
      }
    } catch (error) {
      console.log('Logout API not available, clearing client-side only:', error);
    }

    // Clear all accessible cookies with multiple approaches as fallback
    console.log('Current cookies before clearing:', document.cookie);
    const cookies = document.cookie.split(";");
    console.log('Found cookies:', cookies);
    
    cookies.forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      console.log('Clearing cookie:', name);
      // Try multiple ways to clear each cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
    });

    console.log('Cookies after clearing:', document.cookie);

    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();

    // Force a complete page reload to clear everything
    console.log('Reloading page...');
    router.push('/auth/login');
  };

  return (
    <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-25">
      {/* Loading overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Logging out...</p>
            <p className="text-white/80 text-sm">Please wait while we clear your session</p>
          </div>
        </div>
      )}
      
      <div className="absolute top-5 right-5">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 ${
            isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Logout"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
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
