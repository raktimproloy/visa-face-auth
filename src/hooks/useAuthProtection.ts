import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const useAuthProtection = () => {
  const router = useRouter();
  const { registrationData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user has basic registration data
    if (!registrationData || !registrationData.firstName || !registrationData.email) {
      console.log('No registration data found, redirecting to register page');
      router.push('/auth/register');
    }
  }, [registrationData, router]);

  return { registrationData, isAuthenticated: !!registrationData?.firstName };
};
