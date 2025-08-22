import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setRegistrationData, setBiometricEnrollmentData, updateEnrollmentStatus } from '../store/slices/authSlice';

export const useAuthProtection = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { registrationData } = useSelector((state: RootState) => state.auth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('useAuthProtection - checking auth, registrationData:', {
        hasCustomerId: !!registrationData?.customerId,
        enrollmentStatus: registrationData?.enrollmentStatus,
        hasData: !!registrationData
      });
      
      try {
        // First check if we have registration data in Redux (for immediate access)
        if (registrationData?.customerId) {
          console.log('useAuthProtection - Redux data check:', {
            customerId: registrationData.customerId,
            enrollmentStatus: registrationData.enrollmentStatus,
            biometricStatus: registrationData.biometricStatus
          });
          
          // Check if user should be redirected based on enrollment or biometric status
          if (registrationData.enrollmentStatus === 'pending' && registrationData.biometricStatus !== 'completed') {
            // User is in pending status and biometric not completed, allow access to selfie flow
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
                     } else if (registrationData.enrollmentStatus === 'completed' || registrationData.biometricStatus === 'completed') {
             // User has completed enrollment or biometric verification
             // Check if we're already on the success page to avoid redirect loops
             if (window.location.pathname === '/auth/success') {
               console.log('User already on success page, allowing access');
               setIsAuthenticated(true);
               setIsLoading(false);
               return;
             } else {
               console.log('User enrollment/biometric completed, redirecting to success page');
               router.push('/auth/success');
               return;
             }
           }
        }

        // Check if JWT token exists in cookies
        const response = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const authData = await response.json();
          console.log('useAuthProtection - JWT auth check successful:', {
            enrollmentStatus: authData.user.enrollmentStatus,
            biometricStatus: authData.user.biometricStatus
          });
          
          // Update Redux with user data from JWT to keep state synchronized
          if (!registrationData?.customerId || registrationData.customerId !== authData.user.customerId) {
            console.log('Updating Redux with JWT user data');
            dispatch(setRegistrationData({
              customerId: authData.user.customerId,
              enrollmentId: authData.user.enrollmentId,
              firstName: authData.user.firstName,
              lastName: authData.user.lastName,
              email: authData.user.email,
              enrollmentStatus: authData.user.enrollmentStatus,
              biometricStatus: authData.user.biometricStatus,
              idmissionValid: authData.user.idmissionValid
            }));
          }
          
          // Check enrollment or biometric status and handle routing
          if (authData.user.enrollmentStatus === 'pending' && authData.user.biometricStatus !== 'completed') {
            setIsAuthenticated(true);
                     } else if (authData.user.enrollmentStatus === 'completed' || authData.user.biometricStatus === 'completed') {
             // User has completed enrollment or biometric verification
             // Check if we're already on the success page to avoid redirect loops
             if (window.location.pathname === '/auth/success') {
               console.log('User already on success page (JWT check), allowing access');
               setIsAuthenticated(true);
               setIsLoading(false);
               return;
             } else {
               console.log('User enrollment/biometric completed, redirecting to success page');
               router.push('/auth/success');
               return;
             }
           } else {
            console.log('User enrollment status not valid, redirecting to register');
            router.push('/auth/register');
            return;
          }
        } else {
          console.log('No valid auth token found, redirecting to register page');
          setIsAuthenticated(false);
          router.push('/auth/register');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.push('/auth/register');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, registrationData]);

  // If still loading, return loading state
  if (isLoading) {
    return { isAuthenticated: false, isLoading: true };
  }

  return { isAuthenticated, isLoading: false };
};
