'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Camera as CameraComponent } from 'react-camera-pro';
import { useRouter } from 'next/navigation';

interface CameraProps {
  onPhotoTaken: (photoData: string) => void;
}

export default function Camera({ onPhotoTaken }: CameraProps) {
  const cameraRef = useRef<{ takePhoto: (options?: { quality?: number; imageType?: string }) => Promise<string> }>(null);
  const router = useRouter();
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showCameraSelection, setShowCameraSelection] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  // Camera activation function
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setPermissionStatus('granted');
      setIsCameraActive(true);
      
      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
      
      // Stop the stream as react-camera-pro will handle it
      stream.getTracks().forEach(track => track.stop());
      
          } catch (err: unknown) {
        console.error('Camera activation error:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setPermissionStatus('denied');
            setError('Camera access denied. Please allow camera access to continue.');
          } else if (err.name === 'NotFoundError') {
            setError('No camera found on your device.');
          } else {
            setError('Failed to activate camera. Please try again.');
          }
        } else {
          setError('Failed to activate camera. Please try again.');
        }
      } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop camera function
  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
    setError(null);
  }, []);

  // Take photo function
  const takePhoto = useCallback(async () => {
    if (cameraRef.current) {
      try {
        setIsLoading(true);
        const photo = await cameraRef.current.takePhoto({
          quality: 0.8,
          imageType: 'image/jpeg'
        });
        
        console.log('Photo captured successfully');
        onPhotoTaken(photo);
        
      } catch (err: unknown) {
        console.error('Photo capture error:', err);
        setError('Failed to capture photo. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [onPhotoTaken]);

  // Note: react-camera-pro handles errors and start events internally

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border border-white/20">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Activating Camera</h3>
          <p className="text-gray-600">Please wait while we set up your camera...</p>
        </div>
      </div>
    );
  }

  // Permission denied state
  if (permissionStatus === 'denied') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border border-white/20 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Camera Access Required</h3>
          <p className="text-gray-600 mb-6">
            To take a selfie, we need access to your camera. Please enable camera permissions in your browser settings.
          </p>
          <button
            onClick={startCamera}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border border-white/20 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Camera Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={startCamera}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Camera interface
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-4">
        {/* Camera Container */}
        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          {/* Camera Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white text-center">
            <h3 className="text-xl font-bold">Take Your Selfie</h3>
            <p className="text-sm opacity-90">Position your face in the center</p>
          </div>

          {/* Camera View */}
          <div className="relative">
                         {isCameraActive && (
               <div className="w-full h-80 overflow-hidden">
                 <CameraComponent
                   ref={cameraRef}
                   facingMode="user"
                   errorMessages={{
                     noCameraAccessible: 'No camera accessible',
                     permissionDenied: 'Permission denied',
                     switchCamera: 'Switch camera'
                   }}
                 />
               </div>
             )}
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Face Guide Frame */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-white/60 rounded-full flex items-center justify-center">
                  <div className="w-40 h-40 border border-white/40 rounded-full"></div>
                </div>
              </div>
              
              {/* Corner Indicators */}
              <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-white/60 rounded-tl-lg"></div>
              <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-white/60 rounded-tr-lg"></div>
              <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-white/60 rounded-bl-lg"></div>
              <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-white/60 rounded-br-lg"></div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="p-6 bg-gradient-to-t from-gray-50 to-white">
            <div className="flex justify-center space-x-6">
              {/* Retake Button */}
              <button
                onClick={stopCamera}
                className="flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Retake</span>
              </button>

              {/* Capture Button */}
              <button
                onClick={takePhoto}
                disabled={!isCameraActive || isLoading}
                className="flex flex-col items-center space-y-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-700">Capture</span>
              </button>

              {/* Switch Camera Button */}
              {availableCameras.length > 1 && (
                <button
                  onClick={() => setShowCameraSelection(!showCameraSelection)}
                  className="flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Switch</span>
                </button>
              )}
            </div>

            {/* Camera Selection Dropdown */}
            {showCameraSelection && availableCameras.length > 1 && (
              <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Camera</h4>
                <div className="space-y-2">
                  {availableCameras.map((camera) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => {
                        setSelectedCameraId(camera.deviceId);
                        setShowCameraSelection(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        selectedCameraId === camera.deviceId
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => router.back()}
          className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

