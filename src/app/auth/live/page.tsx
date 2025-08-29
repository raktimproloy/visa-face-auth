"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Camera } from "react-camera-pro";
import { useRouter } from "next/navigation";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import { useFaceDetection } from "../../../utils/faceDetection";

export default function SelfiePage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated, userData } = useAuthProtection();
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  
  const cameraRef = useRef<{ takePhoto: () => Promise<string> } | null>(null);
  const router = useRouter();

  // Face detection hook
  const {
    faceDetected,
    faceConfidence,
    isDetecting,
    startDetection,
    stopDetection
  } = useFaceDetection();

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

  // Start face detection when camera is active
  useEffect(() => {
    if (isCameraActive && autoCaptureEnabled) {
      // Wait a bit for camera to initialize and find video element
      const timer = setTimeout(() => {
        const videoElement = document.querySelector('video');
        if (videoElement) {
          startDetection(videoElement);
          setFaceDetectionReady(true);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCameraActive, autoCaptureEnabled, startDetection]);

  // Auto-capture when face is detected with high confidence
  useEffect(() => {
    if (faceDetected && faceConfidence > 0.7 && autoCaptureEnabled && !isVerifying) {
      // Wait a moment to ensure face is stable
      const timer = setTimeout(() => {
        if (faceDetected && faceConfidence > 0.7) {
          console.log('Auto-capturing photo - face detected with confidence:', faceConfidence);
          takePhoto();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [faceDetected, faceConfidence, autoCaptureEnabled, isVerifying]);

  const performLiveCheck = useCallback(async (selfieImage: string) => {
    try {
      setIsVerifying(true);
      setError(null);

      const response = await fetch('/api/idmission-live-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selfieImage: selfieImage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Live-check verification failed');
      }

      const result = await response.json();
      console.log('Live-check result:', result);

      // Store photo data in localStorage for review
      localStorage.setItem('capturedPhoto', selfieImage);
      localStorage.setItem('liveCheckResult', JSON.stringify(result.data));
      
      // Redirect to review page
      router.push('/auth/selfie-review');
      
    } catch (error) {
      console.error('Live-check error:', error);
      setError(error instanceof Error ? error.message : 'Live-check verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [router]);

  const takePhoto = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto();
        console.log('Photo captured, size:', photo.length);
        
        // Perform live-check verification immediately
        await performLiveCheck(photo);
        
      } catch (error) {
        console.error('Error taking photo:', error);
        setError('Failed to take photo. Please try again.');
      }
    }
  }, [performLiveCheck]);

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
              onClick={() => startCamera()}
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
            {isVerifying ? 'Verification Error' : 'Camera Access Error'}
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
              onClick={() => {
                setError(null);
                if (isCameraActive) {
                  startCamera();
                }
              }}
              className="mobile-btn !text-[#28A300] !mx-auto"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show camera interface
  return (
    <div className="relative h-screen w-screen pb-20 flex flex-col justify-between items-center">
      {isCameraActive && (
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
          
          {/* Face positioning guide with live detection feedback */}
          <div className="absolute inset-0 -top-35 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className={`w-[90%] h-[40%] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border-8 border-dashed ${
                faceDetected && faceConfidence > 0.7 
                  ? 'border-green-500 animate-pulse' 
                  : 'border-green-400'
              }`}></div>
              
              {/* Face detection status indicator */}
              {faceDetectionReady && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                  {faceDetected ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      Face Detected ({Math.round(faceConfidence * 100)}%)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      No Face Detected
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Top status bar */}
          <div className="absolute mt-15 top-0 left-0 right-0">
            <button className="sm-btn">
              {isVerifying ? 'Verifying...' : 
               faceDetected && faceConfidence > 0.7 ? 'Face Detected - Hold Still!' : 
               'Position Your Face in the Circle'}
            </button>
          </div>
          
          {/* Auto-capture toggle */}
          <div className="absolute top-20 right-4">
            <button
              onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                autoCaptureEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}
            >
              {autoCaptureEnabled ? 'Auto-Capture ON' : 'Auto-Capture OFF'}
            </button>
          </div>
          
          {/* Bottom capture button */}
          <div className="absolute mb-20 bottom-15 left-0 right-0">
            <button
              onClick={takePhoto}
              disabled={isVerifying}
              className={`mobile-btn !flex items-center gap-2 max-w-[313px] !px-10 mt-0 ${
                isVerifying ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{fontSize:"14px"}}
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="22"
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
                  {faceDetected && faceConfidence > 0.7 ? 'Auto-Capture Ready' : 'Take Photo Now'}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}