"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Camera } from "react-camera-pro";
import { useRouter } from "next/navigation";


import { useAuthProtection } from "../../../hooks/useAuthProtection";


export default function SelfiePage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated, userData } = useAuthProtection();
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  
  const cameraRef = useRef<{ takePhoto: () => Promise<string> } | null>(null);
  const router = useRouter();

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported in this browser.');
        return;
      }

      // Check camera permission
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionState(permission.state);
          
          if (permission.state === 'denied') {
            setError('Camera access has been denied. Please enable camera permissions in your browser settings.');
            return;
          }
        } catch {
          // Permissions API not supported, continue
        }
      }

      setIsCameraActive(true);
      setPermissionState('granted');
    } catch (err: unknown) {
      console.error('Error starting camera:', err);
      setError('Unable to start camera. Please check your camera permissions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const takePhoto = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto();
        console.log('Photo captured, size:', photo.length);
        
        // Store photo data in localStorage for review (base64 format)
        localStorage.setItem('capturedPhoto', photo);
        console.log('Photo stored in localStorage, redirecting to review page...');
        
        // Redirect to review page
        router.push('/auth/selfie-review');
      } catch (error) {
        console.error('Error taking photo:', error);
        setError('Failed to take photo. Please try again.');
      }
    }
  }, [router]);



  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">
            Checking Authentication...
          </button>
          <p className="text-sm text-[#3E3E3E]">
            Please wait while we verify your authentication
          </p>
        </div>
      </div>
    );
  }

  // Check if user has already completed biometric verification
  if (userData?.biometricStatus === 'completed') {
    // Show completion message instead of redirecting
    return (
      <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
        <div className="w-full text-center max-w-md mx-4">
          <div className="text-6xl mb-4">✅</div>
          <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">
            Biometric Verification Completed
          </button>
          <p className="text-[#3E3E3E] mb-6">
            You have already completed your face verification. You can proceed to the final step or take a new photo if needed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                // For now, just start camera for new photo
                // In a real app, you'd call an API to reset the status
                startCamera();
              }}
              className="mobile-btn !text-[#B20610] !mx-auto !block"
            >
              Take New Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">
            Starting Camera...
          </button>
          <p className="text-sm text-[#3E3E3E]">
            Please wait while we access your camera
          </p>
        </div>
      </div>
    );
  }

  // Show permission prompt if needed
  if (permissionState === 'prompt' && !isLoading && !error) {
    return (
      <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
        <div className="w-full text-center max-w-md mx-4">
          <div className="text-6xl mb-4">📷</div>
          <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">
            Camera Permission Required
          </button>
          <p className="text-[#3E3E3E] mb-6">
            We need access to your camera to take your selfie. Please allow camera access when prompted.
          </p>
          <button
            onClick={startCamera}
            className="mobile-btn !text-[#323232] !mx-auto mb-4"
          >
            Allow Camera Access
          </button>
          <p className="text-sm text-[#3E3E3E]">
            Your privacy is important to us. The camera is only used to capture your selfie.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="!bg-[url('/images/mobile/bg-one.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
        <div className="w-full text-center max-w-md mx-4">
          <div className="text-6xl mb-4">⚠️</div>
          <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">
            Camera Access Error
          </button>
          <p className="text-[#3E3E3E] mb-6">{error}</p>
          
          {permissionState === 'denied' ? (
            <div className="space-y-4">
              <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-2 text-[#3E3E3E]">How to enable camera access:</h3>
                <ul className="text-sm text-left space-y-1 text-[#3E3E3E]">
                  <li>• Click the camera icon in your browser&apos;s address bar</li>
                  <li>• Select &quot;Allow&quot; for camera access</li>
                  <li>• Refresh the page and try again</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mobile-btn !text-[#B20610] !mx-auto"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="mobile-btn !text-[#28A300] !mx-auto"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }



  // Show camera or start button
  return (
    <div className="relative h-screen w-screen pb-20 flex flex-col justify-between items-center">
      {isCameraActive ? 
      (
        // Camera not active - show original design
        <>
          <Camera
            ref={cameraRef}
            facingMode="user"
            aspectRatio={1}
            errorMessages={{
              noCameraAccessible: 'No camera accessible',
              permissionDenied: 'Permission denied',
              switchCamera: 'Switch camera'
            }}
          />
          {/* Face positioning guide - circular dotted green border */}
          <div className="absolute inset-0 -top-20  flex items-center justify-center pointer-events-none">
            <div className="w-64 h-74 border-5 border-dashed border-green-600 rounded-full opacity-80"></div>
          </div>
          <div className="absolute mt-10 top-0 left-0 right-0">
            <button className="sm-btn">Hold Still</button>
          </div>
          <div className="absolute mb-10 bottom-15 left-0 right-0">
              
            <button
              onClick={takePhoto}
              className="mobile-btn !flex items-center gap-2 max-w-[313px] !px-10 mt-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="30"
                viewBox="0 0 45 42"
                fill="none"
              >
                <path
                  d="M43.125 33.25C43.125 34.1783 42.7299 35.0685 42.0266 35.7249C41.3234 36.3813 40.3696 36.75 39.375 36.75H5.625C4.63044 36.75 3.67661 36.3813 2.97335 35.7249C2.27009 35.0685 1.875 34.1783 1.875 33.25V14C1.875 13.0717 2.27009 12.1815 2.97335 11.5251C3.67661 10.8687 4.63044 10.5 5.625 10.5H13.125L16.875 5.25H28.125L31.875 10.5H39.375C40.3696 10.5 41.3234 10.8687 42.0266 11.5251C42.7299 12.1815 43.125 13.0717 43.125 14V33.25Z"
                  stroke="#EBEBEB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22.5 29.75C26.6421 29.75 30 26.616 30 22.75C30 18.884 26.6421 15.75 22.5 15.75C18.3579 15.75 15 18.884 15 22.75C15 26.616 18.3579 29.75 22.5 29.75Z"
                  stroke="#EBEBEB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Take Photo Now
            </button>
          </div>
        </>
      )
      : null
    }
    </div>
  );
}