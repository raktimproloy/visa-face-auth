"use client";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { useRouter } from "next/navigation";
import { setUploadedPhotoUrl, setBiometricEnrollmentData } from "../../../store/slices/authSlice";
import Image from "next/image";
import { useAuthProtection } from "../../../hooks/useAuthProtection";

export default function SelfieReviewPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated } = useAuthProtection();
  
  const { registrationData } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleRetake = () => {
    router.push('/auth/selfie');
  };

  const handleUpload = async () => {
    if (!registrationData?.photo) {
      setUploadError('No photo available to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Prepare user data for the API
      const userData = {
        firstName: registrationData.firstName || '',
        lastName: registrationData.lastName || '',
        email: registrationData.email || '',
        password: registrationData.password || ''
      };

      // Call our updated upload API that handles S3, DynamoDB, and Lambda
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoData: registrationData.photo,
          fileName: 'selfie.jpg',
          userData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update Redux with the S3 URL and user IDs
      dispatch(setUploadedPhotoUrl(result.photoUrl));
      dispatch(setBiometricEnrollmentData({
        customerId: result.customerId,
        enrollmentId: result.enrollmentId,
        biometricStatus: 'pending',
        idmissionValid: false,
      }));

      console.log('Upload completed successfully:', result);
      console.log('User created with ID:', result.customerId);
      console.log('Biometric enrollment initiated for:', result.enrollmentId);
      
      // Navigate to success page
      router.push('/auth/success');
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to complete upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen pt-20">
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-[#3F3F3F] font-medium">
            Checking Registration...
          </p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('SelfieReviewPage - registrationData:', registrationData);
  console.log('SelfieReviewPage - photo exists:', !!registrationData?.photo);

  // If no photo is available, redirect to selfie page
  if (!registrationData?.photo) {
    console.log('No photo found, redirecting to selfie page');
    router.push('/auth/selfie');
    return null;
  }

  return (
    <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
      <div className="w-full">
        <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">
          Satisfied with your photo?
        </button>
        
        {/* Display captured photo */}
        <div className="flex justify-center mb-8">
          <Image
            src={registrationData.photo}
            alt="Captured selfie"
            width={424}
            height={500}
            className="max-h-[500px] max-w-full rounded-lg shadow-lg"
            style={{ maxWidth: '424px' }}
          />
        </div>

        <div className="text-center mt-12 max-auto">
          {/* Upload Error Display */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {uploadError}
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`mobile-btn !text-[#28A300] !mb-3 !block max-w-[313px] !mx-auto ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#28A300]"></div>
                Uploading & Creating Account...
              </div>
            ) : (
              'Upload & Create Account'
            )}
          </button>
          
          <button
            onClick={handleRetake}
            disabled={isUploading}
            className={`mobile-btn !text-[#B20610] mb-3 !block max-w-[208px] !min-w-[208px] !px-4 !py-3 !mx-auto ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Re-Take
          </button>
        </div>
      </div>
    </div>
  );
}
