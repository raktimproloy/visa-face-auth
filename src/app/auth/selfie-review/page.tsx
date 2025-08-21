"use client";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { useRouter } from "next/navigation";
import { setUploadedPhotoUrl, setBiometricEnrollmentData } from "../../../store/slices/authSlice";
import { uploadPhotoToS3 } from "../../../utils/s3Upload";
import { enrollBiometrics, generateCustomerId, generateEnrollmentId } from "../../../utils/biometricEnrollment";
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
      // Step 1: Upload photo to S3
      console.log('Step 1: Uploading photo to S3...');
      const uploadResult = await uploadPhotoToS3(registrationData.photo, 'selfie.jpg');
      
      if (!uploadResult.success || !uploadResult.photoUrl) {
        throw new Error(uploadResult.error || 'S3 upload failed');
      }

      // Update Redux with the S3 URL
      dispatch(setUploadedPhotoUrl(uploadResult.photoUrl));
      console.log('Photo uploaded successfully to S3:', uploadResult.photoUrl);

      // Step 2: Enroll biometrics via IDMission Lambda
      console.log('Step 2: Starting biometric enrollment...');
      
      // Generate unique IDs for the user
      const customerId = generateCustomerId();
      const enrollmentId = generateEnrollmentId();
      
      // Get user data with dummy data if needed
      const userData = {
        customerId,
        enrollmentId,
        name: `${registrationData.firstName || 'John'} ${registrationData.lastName || 'Doe'}`.trim() || 'John Doe',
        email: registrationData.email || 'john.doe@example.com',
        password: registrationData.password || 'password123',
        photoUrl: uploadResult.photoUrl,
        photoData: registrationData.photo, // Original base64 photo data
      };

      const enrollmentResult = await enrollBiometrics(userData);
      
      if (!enrollmentResult.success) {
        throw new Error(enrollmentResult.error || 'Biometric enrollment failed');
      }

      // Update Redux with enrollment data
      dispatch(setBiometricEnrollmentData({
        customerId: enrollmentResult.customerId!,
        enrollmentId: enrollmentResult.enrollmentId!,
        biometricStatus: enrollmentResult.biometricStatus!,
        idmissionValid: enrollmentResult.idmissionValid!,
      }));

      console.log('Biometric enrollment completed successfully:', enrollmentResult);
      
      // Navigate to success page
      router.push('/auth/success');
      
    } catch (error) {
      console.error('Upload/Enrollment error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to complete process. Please try again.');
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
                Uploading...
              </div>
            ) : (
              'Upload'
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
