'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import Image from "next/image";
import Link from "next/link";
import { useAuthProtection } from '../../../hooks/useAuthProtection';

export default function SuccessPage() {
  // Auth protection - redirect to register if no user data
  const { isAuthenticated } = useAuthProtection();
  
  const { registrationData } = useSelector((state: RootState) => state.auth);

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

  // Get user data with fallbacks
  const userData = {
    name: `${registrationData?.firstName || ''} ${registrationData?.lastName || ''}`.trim() || 'User',
    customerId: registrationData?.customerId || 'N/A',
    enrollmentId: registrationData?.enrollmentId || 'N/A',
    biometricStatus: registrationData?.biometricStatus || 'pending',
    idmissionValid: registrationData?.idmissionValid || false,
    photoUrl: registrationData?.photo || ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Registration Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome to Face Visa! Your account has been created successfully.
        </p>

        {/* User Photo */}
        {userData.photoUrl && (
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
              <Image
                src={userData.photoUrl}
                alt="User Photo"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* User Information */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Account Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="text-gray-800 font-semibold">{userData.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Customer ID:</span>
              <span className="text-gray-800 font-mono text-sm">{userData.customerId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Enrollment ID:</span>
              <span className="text-gray-800 font-mono text-sm">{userData.enrollmentId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userData.biometricStatus === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {userData.biometricStatus}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">IDMission Valid:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userData.idmissionValid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {userData.idmissionValid ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            href="/auth/login-test"
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Login to Your Account
          </Link>
          
          <Link 
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            Back to Home
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Your photo has been uploaded to our secure servers.</p>
          <p className="mt-1">You can now log in and access your account.</p>
        </div>
      </div>
    </div>
  );
}
