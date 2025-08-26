import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAuthProtection = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Function to clear invalid auth tokens
  const clearAuthToken = () => {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('Auth token cleared due to invalid verification status');
  };

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
          biometricStatus: decodedUser.biometricStatus,
          emailVerified: decodedUser.emailVerified
        });

        // Additional validation: ensure all required fields are present
        const requiredFields = ['customerId', 'email', 'emailVerified'];
        const missingFields = requiredFields.filter(field => !decodedUser[field]);
        
        if (missingFields.length > 0) {
          console.log('JWT token missing required fields:', missingFields);
          clearAuthToken();
          router.push('/auth/register');
          return;
        }

        // Validate that the JWT token has all required fields
        // Check if emailVerified field exists, is a boolean, and is explicitly true
        // Also check that it's not a string "true" but actually boolean true
        if (!decodedUser.hasOwnProperty('emailVerified') || 
            typeof decodedUser.emailVerified !== 'boolean' || 
            decodedUser.emailVerified !== true ||
            decodedUser.emailVerified === "true" ||  // String "true" is not valid
            decodedUser.emailVerified === 1) {       // Number 1 is not valid
          console.log('JWT token emailVerified field invalid. Token is invalid.', {
            hasEmailVerifiedField: decodedUser.hasOwnProperty('emailVerified'),
            emailVerifiedValue: decodedUser.emailVerified,
            emailVerifiedType: typeof decodedUser.emailVerified,
            isStringTrue: decodedUser.emailVerified === "true",
            isNumberOne: decodedUser.emailVerified === 1,
            tokenPayload: decodedUser
          });
          
          // Clear the invalid token
          clearAuthToken();
          
          // Redirect to OTP verification
          router.push('/auth/verify-otp');
          return;
        }

        // Store user data locally
        setUserData(decodedUser);
        setIsAuthenticated(true);

            // Double-check email verification status (redundant but extra security)
    // At this point, emailVerified should already be validated as true above
    // Additional check to ensure it's boolean true, not string "true" or number 1
    const isEmailVerified = decodedUser.emailVerified === true && 
                           typeof decodedUser.emailVerified === 'boolean' &&
                           decodedUser.emailVerified !== "true" &&
                           decodedUser.emailVerified !== 1;
    const currentPath = window.location.pathname;

    console.log('Double-checking email verification status:', {
      emailVerified: decodedUser.emailVerified,
      isEmailVerified,
      currentPath,
      hasEmailVerifiedField: 'emailVerified' in decodedUser,
      emailVerifiedType: typeof decodedUser.emailVerified,
      isStringTrue: decodedUser.emailVerified === "true",
      isNumberOne: decodedUser.emailVerified === 1
    });

    if (!isEmailVerified) {
      // User email is not verified - redirect to OTP verification
      // But don't redirect if they're already on the OTP verification page
      if (currentPath !== '/auth/verify-otp') {
        console.log('User email not verified, redirecting to OTP verification. Clearing invalid auth token.');
        
        // Clear the invalid auth token since user is not properly verified
        clearAuthToken();
        
        router.push('/auth/verify-otp');
        return;
      } else {
        // User is on OTP verification page, allow access
        console.log('User email not verified but on OTP verification page, allowing access');
        setIsLoading(false);
        return;
      }
    }

    // Additional security: if user is on OTP verification page but email is verified,
    // redirect them to the appropriate page based on their status
    if (currentPath === '/auth/verify-otp' && isEmailVerified) {
      console.log('User email already verified but on OTP page, redirecting based on biometric status');
      if (decodedUser.biometricStatus === 'completed') {
        router.push('/auth/final');
      } else {
        router.push('/auth/selfie-policy');
      }
      return;
    }

        // Email is verified, now check biometric status and handle routing
        const isBiometricCompleted = decodedUser.biometricStatus === 'completed';
        
        console.log('Email verification passed, checking biometric status:', {
          biometricStatus: decodedUser.biometricStatus,
          isBiometricCompleted,
          currentPath
        });
        
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
