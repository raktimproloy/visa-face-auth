import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setRegistrationData, setBiometricEnrollmentData, updateEnrollmentStatus, updateUserDataFromJWT } from '../store/slices/authSlice';

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
        biometricStatus: registrationData?.biometricStatus,
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
          
          // Check biometric status for routing
          const isBiometricCompleted = registrationData.biometricStatus === 'completed';
          const currentPath = window.location.pathname;
          
          if (isBiometricCompleted) {
            // User has completed biometric verification
            // Can access final and success pages, but don't force redirect to final
            if (currentPath === '/auth/final' || currentPath === '/auth/success') {
              console.log('User biometric completed, allowing access to final/success page');
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            } else if (currentPath === '/auth/selfie-review') {
              // Allow access to selfie-review even if biometric is completed (for the redirect flow)
              console.log('User biometric completed but on selfie-review, allowing access for redirect flow');
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            } else {
              // Only redirect to final if on other selfie pages
              console.log('User biometric completed, redirecting to final page');
              router.push('/auth/final');
              return;
            }
          } else {
            // User has NOT completed biometric verification
            // Can only access selfie-related pages
            if (currentPath === '/auth/selfie-policy' || currentPath === '/auth/selfie' || currentPath === '/auth/selfie-review') {
              console.log('User biometric not completed, allowing access to selfie pages');
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            } else if (currentPath === '/auth/final' || currentPath === '/auth/success') {
              // Redirect to selfie-policy if trying to access final/success pages
              console.log('User biometric not completed, redirecting to selfie-policy');
              router.push('/auth/selfie-policy');
              return;
            } else {
              // Allow access to other pages (like register, login)
              setIsAuthenticated(true);
              setIsLoading(false);
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
            dispatch(updateUserDataFromJWT({
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
          
          // Check biometric status and handle routing
          const isBiometricCompleted = authData.user.biometricStatus === 'completed';
          const currentPath = window.location.pathname;
          
          if (isBiometricCompleted) {
            // User has completed biometric verification
            // Can access final and success pages, but don't force redirect to final
            if (currentPath === '/auth/final' || currentPath === '/auth/success') {
              console.log('User biometric completed (JWT check), allowing access to final/success page');
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            } else if (currentPath === '/auth/selfie-review') {
              // Allow access to selfie-review even if biometric is completed (for the redirect flow)
              console.log('User biometric completed but on selfie-review, allowing access for redirect flow');
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            } else {
              // Only redirect to final if on other selfie pages
              console.log('User biometric completed (JWT check), redirecting to final page');
              router.push('/auth/final');
              return;
            }
          } else {
            // User has NOT completed biometric verification
            // Can only access selfie-related pages
            if (currentPath === '/auth/selfie-policy' || currentPath === '/auth/selfie' || currentPath === '/auth/selfie-review') {
              console.log('User biometric not completed (JWT check), allowing access to selfie pages');
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            } else if (currentPath === '/auth/final' || currentPath === '/auth/success') {
              // Redirect to selfie-policy if trying to access final/success pages
              console.log('User biometric not completed (JWT check), redirecting to selfie-policy');
              router.push('/auth/selfie-policy');
              return;
            } else {
              // Allow access to other pages (like register, login)
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }
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
  }, [router, registrationData, dispatch]);

  // If still loading, return loading state
  if (isLoading) {
    return { isAuthenticated: false, isLoading: true };
  }

  return { isAuthenticated, isLoading: false };
};
