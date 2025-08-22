'use client';

import { useAppSelector } from '../../store/hooks';

export default function RegistrationSummary() {
  const { registrationData, isRegistered } = useAppSelector((state) => state.auth);

  if (!isRegistered || !registrationData) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No registration data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Registration Summary</h3>
      <div className="space-y-2 text-sm">
        <p><strong>First Name:</strong> {registrationData.firstName}</p>
        <p><strong>Last Name:</strong> {registrationData.lastName}</p>
        <p><strong>Email:</strong> {registrationData.email}</p>
        {registrationData.password && (
          <p><strong>Password:</strong> {'•'.repeat(registrationData.password.length)}</p>
        )}
        {registrationData.photo && (
          <div className="mt-3">
            <p><strong>Photo:</strong></p>
            <img 
              src={registrationData.photo} 
              alt="User selfie" 
              className="w-24 h-24 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>
    </div>
  );
}
