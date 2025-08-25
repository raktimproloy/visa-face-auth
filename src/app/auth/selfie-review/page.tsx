"use client";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { useRouter } from "next/navigation";
import { setUploadedPhotoUrl, setBiometricEnrollmentData, updateEnrollmentStatus } from "../../../store/slices/authSlice";
import Image from "next/image";
import { useAuthProtection } from "../../../hooks/useAuthProtection";
import Link from "next/link";

export default function SelfieReviewPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated } = useAuthProtection();
  
  const { registrationData } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);

  // Check if user has already completed biometric verification
  useEffect(() => {
    if (registrationData?.biometricStatus === 'completed') {
      // Only redirect if they haven't just completed it
      if (!hasAttemptedUpload) {
        console.log('User already completed biometric, redirecting to final');
        router.push('/auth/final');
      }
    }
  }, [registrationData?.biometricStatus, hasAttemptedUpload, router]);

  const handleRetake = () => {
    // Clear any previous upload attempts
    setHasAttemptedUpload(false);
    setUploadError(null);
    setSuccessMessage(null);
    router.push('/auth/selfie');
  };

  const handleUpload = async () => {
    // Validate enrollment status and authentication
    if (!registrationData?.customerId) {
      setUploadError('Invalid enrollment status. Please register again.');
      return;
    }

    if (!registrationData?.photo) {
      setUploadError('No photo available to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    setHasAttemptedUpload(true);

    try {
      // Step 1: Upload photo to S3 and update DynamoDB
      console.log('Uploading photo to S3 and updating DynamoDB...');
      const uploadResponse = await fetch('/api/update-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoData: registrationData.photo
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload photo');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Photo uploaded successfully:', uploadResult.photoUrl);

      // Update Redux with the S3 URL
      dispatch(setUploadedPhotoUrl(uploadResult.photoUrl));

      // Step 2: Call the enrollment verification API through our proxy
      console.log('Calling enrollment verification API...');
      
      const enrollmentPayload = {
        customerId: registrationData.customerId
      };

      console.log('Calling enrollment API with payload:', enrollmentPayload);
      
      const enrollmentResponse = await fetch('/api/enroll-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentPayload),
      });

      if (!enrollmentResponse.ok) {
        const errorData = await enrollmentResponse.json();
        throw new Error(errorData.error || `Enrollment API failed with status: ${enrollmentResponse.status}`);
      }

      const enrollmentResult = await enrollmentResponse.json();
      console.log('Enrollment API response:', enrollmentResult);

      // Parse the body string to get the actual response data
      let enrollmentData;
      try {
        enrollmentData = JSON.parse(enrollmentResult.body);
      } catch (parseError) {
        console.error('Failed to parse enrollment response body:', parseError);
        throw new Error('Invalid response from enrollment API');
      }

      console.log('Parsed enrollment data:', enrollmentData);

      // Check if enrollment was approved
      if (enrollmentData.approved === true) {
        // Update Redux with successful enrollment data
        dispatch(setBiometricEnrollmentData({
          customerId: registrationData.customerId,
          enrollmentId: enrollmentData.enrollmentId || registrationData.enrollmentId || '',
          biometricStatus: 'completed',
          idmissionValid: true,
        }));

        // Update enrollment status to completed
        dispatch(updateEnrollmentStatus('completed'));

        console.log('Enrollment approved for user:', registrationData.customerId);
        
        // Show success message
        setSuccessMessage('Enrollment successful! Your face verification has been approved.');
        
        // Update JWT token with new enrollment data
        try {
          console.log('Updating JWT token with new enrollment data:', {
            customerId: registrationData.customerId,
            enrollmentId: enrollmentData.enrollmentId || registrationData.enrollmentId || '',
            enrollmentStatus: 'completed',
            biometricStatus: 'completed',
            idmissionValid: true
          });
          
          const updateJWTResponse = await fetch('/api/update-jwt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: registrationData.customerId,
              enrollmentId: enrollmentData.enrollmentId || registrationData.enrollmentId || '',
              enrollmentStatus: 'completed',
              biometricStatus: 'completed',
              idmissionValid: true
            }),
          });

          if (updateJWTResponse.ok) {
            const jwtResult = await updateJWTResponse.json();
            console.log('JWT token updated successfully:', jwtResult);
          } else {
            const jwtError = await updateJWTResponse.json();
            console.error('Failed to update JWT token:', jwtError);
          }
        } catch (jwtError) {
          console.error('Error updating JWT token:', jwtError);
        }
        
        // Show success message and provide option to continue
        setSuccessMessage('Enrollment successful! Your face verification has been approved. You can now proceed to the final step.');
        
      } else {
        // Enrollment not approved
        console.log('Enrollment not approved for user:', registrationData.customerId, 'Reason:', enrollmentData.verificationResult);
        
        // Update Redux with failed biometric status to allow retry
        dispatch(setBiometricEnrollmentData({
          customerId: registrationData.customerId,
          enrollmentId: enrollmentData.enrollmentId || registrationData.enrollmentId || '',
          biometricStatus: 'failed',
          idmissionValid: false,
        }));
        
        // Update JWT token with failed biometric status to allow retry
        try {
          console.log('Updating JWT token with failed biometric status for retry');
          
          const updateJWTResponse = await fetch('/api/update-jwt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: registrationData.customerId,
              enrollmentId: enrollmentData.enrollmentId || registrationData.enrollmentId || '',
              enrollmentStatus: 'pending', // Keep as pending to allow retry
              biometricStatus: 'failed',
              idmissionValid: false
            }),
          });

          if (updateJWTResponse.ok) {
            const jwtResult = await updateJWTResponse.json();
            console.log('JWT token updated with failed status for retry:', jwtResult);
          } else {
            const jwtError = await updateJWTResponse.json();
            console.error('Failed to update JWT token for retry:', jwtError);
          }
        } catch (jwtError) {
          console.error('Error updating JWT token for retry:', jwtError);
        }
        
        // Show rejection message
        setUploadError(`Enrollment not approved: ${enrollmentData.verificationResult || 'Please try again with a better photo.'}`);
      }
      
    } catch (error) {
      console.error('Upload/Enrollment error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to complete photo upload and enrollment verification. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Enrollment verification timed out. The service may be busy. Please try again.';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.message.includes('Failed to communicate')) {
          errorMessage = 'Enrollment service is temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUploadError(errorMessage);
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
            Checking Authentication...
          </p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('SelfieReviewPage - registrationData:', registrationData);
  console.log('SelfieReviewPage - photo exists:', !!registrationData?.photo);

  // If no photo is available, show error instead of redirecting
  if (!registrationData?.photo) {
    return (
      <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
        <div className="w-full text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-lg text-[#3E3E3E] mb-6">No photo available</p>
          <p className="text-sm text-[#3E3E3F] mb-8">Please take a new selfie to continue.</p>
          <button
            onClick={handleRetake}
            className="mobile-btn !text-[#28A300] !mx-auto"
          >
            Take New Selfie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="!bg-[url('/images/mobile/bg-two.jpg')] bg-no-repeat bg-cover bg-center min-h-screen py-9">
      <div className="w-full">
        <button className="sm-btn two !text-sm !font-normal !text-[#3E3E3E] !px-5 !mb-5">Satisfied with your photo?</button>
        
        <Image
          src={registrationData.photo}
          alt="Selfie preview"
          width={424}
          height={502}
          className="mx-auto max-h-[500px]"
        />
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 mt-4 text-green-700 rounded-lg mx-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span>{successMessage}</span>
            </div>
            <div className="mt-3 text-center">
              <button
                onClick={() => router.push('/auth/final')}
                className="mobile-btn !text-[#28A300] !mx-auto"
              >
                Continue to Final Step
              </button>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {uploadError && (
          <div className="mb-4 p-4 mt-4 text-red-700 rounded-lg mx-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{uploadError}</span>
            </div>
          </div>
        )}
        
        {/* Action Buttons - Show Verify Face only if no error, show Re-Take always */}
        <div className="text-center mt-12 max-auto">
          {!uploadError && !successMessage && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mobile-btn !text-[#28A300] !mb-3 !block max-w-[313px] !mx-auto"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#28A300]"></div>
                  Verifying Face...
                </div>
              ) : (
                'Verify Face'
              )}
            </button>
          )}
          
          <button
            onClick={handleRetake}
            disabled={isUploading}
            className={`mobile-btn !text-[#B20610] mb-3 !block max-w-[208px] !min-w-[208px] !px-4 !py-3 !mx-auto ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Re-Take Photo
          </button>
        </div>
      </div>
    </div>
  );
}
