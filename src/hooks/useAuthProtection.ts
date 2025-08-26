import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAuthProtection = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Since the cookie is HTTP-only, we need to call the API to check auth
        const response = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (!response.ok) {
          console.log('No valid auth token found, redirecting to register');
          setIsAuthenticated(false);
          router.push('/auth/register');
          return;
        }

        const authData = await response.json();
        const decodedUser = authData.user;
        
        if (!decodedUser) {
          console.log('Invalid auth data, redirecting to register');
          setIsAuthenticated(false);
          router.push('/auth/register');
          return;
        }

        console.log('JWT token verified successfully:', {
          customerId: decodedUser.customerId,
          enrollmentStatus: decodedUser.enrollmentStatus,
          biometricStatus: decodedUser.biometricStatus
        });

        // Store user data locally
        setUserData(decodedUser);
        setIsAuthenticated(true);

        // Check biometric status and handle routing
        const isBiometricCompleted = decodedUser.biometricStatus === 'completed';
        const currentPath = window.location.pathname;
        
        if (isBiometricCompleted) {
          // User has completed biometric verification
          if (currentPath === '/auth/final' || currentPath === '/auth/success') {
            console.log('User biometric completed, allowing access to final/success page');
            setIsLoading(false);
            return;
          } else if (currentPath === '/auth/selfie-review') {
            // Allow access to selfie-review even if biometric is completed (for the redirect flow)
            console.log('User biometric completed but on selfie-review, allowing access for redirect flow');
            setIsLoading(false);
            return;
          } else if (currentPath === '/auth/selfie-policy' || currentPath === '/auth/selfie') {
            // Redirect to final if on selfie pages
            console.log('User biometric completed, redirecting to final page');
            router.push('/auth/final');
            return;
          }
        } else {
          // User has NOT completed biometric verification
          if (currentPath === '/auth/selfie-policy' || currentPath === '/auth/selfie' || currentPath === '/auth/selfie-review') {
            console.log('User biometric not completed, allowing access to selfie pages');
            setIsLoading(false);
            return;
          } else if (currentPath === '/auth/final' || currentPath === '/auth/success') {
            // Redirect to selfie-policy if trying to access final/success pages
            console.log('User biometric not completed, redirecting to selfie-policy');
            router.push('/auth/selfie-policy');
            return;
          }
        }

        // If we reach here, user is authenticated and can access the current page
        setIsLoading(false);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.push('/auth/register');
      }
    };

    checkAuth();
  }, [router]);

  // If still loading, return loading state
  if (isLoading) {
    return { isAuthenticated: false, isLoading: true, userData: null };
  }

  return { isAuthenticated, isLoading: false, userData };
};
