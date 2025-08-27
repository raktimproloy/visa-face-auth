import Cookies from 'js-cookie';

/**
 * Cookie utility functions using js-cookie package
 * Provides reliable cookie management across the application
 */

/**
 * Clear all cookies from the application
 * This function removes cookies from all possible paths and domains
 */
export const clearAllCookies = (): void => {
  try {
    // Get all current cookies
    const allCookies = Cookies.get();
    
    // Remove each cookie from all possible paths and domains
    Object.keys(allCookies).forEach(cookieName => {
      // Remove cookie from all possible paths
      Cookies.remove(cookieName);
      Cookies.remove(cookieName, { path: '/' });
      Cookies.remove(cookieName, { path: '/auth' });
      Cookies.remove(cookieName, { path: '/api' });
      
      // Remove cookie from all possible domains
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        Cookies.remove(cookieName, { domain: hostname });
        Cookies.remove(cookieName, { domain: `.${hostname}` });
      }
    });
    
    console.log('All cookies cleared successfully');
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
};

/**
 * Clear specific authentication cookies
 * @param cookieNames - Array of cookie names to clear
 */
export const clearAuthCookies = (cookieNames: string[] = []): void => {
  const defaultAuthCookies = [
    'authToken', 
    'token', 
    'jwt', 
    'session', 
    'userToken', 
    'accessToken',
    'refreshToken',
    'userSession'
  ];
  
  const cookiesToClear = [...defaultAuthCookies, ...cookieNames];
  
  cookiesToClear.forEach(cookieName => {
    try {
      Cookies.remove(cookieName);
      Cookies.remove(cookieName, { path: '/' });
      Cookies.remove(cookieName, { path: '/auth' });
      Cookies.remove(cookieName, { path: '/api' });
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        Cookies.remove(cookieName, { domain: hostname });
        Cookies.remove(cookieName, { domain: `.${hostname}` });
      }
    } catch (error) {
      console.error(`Error clearing cookie ${cookieName}:`, error);
    }
  });
  
  console.log('Authentication cookies cleared successfully');
};

/**
 * Set a cookie with proper configuration
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (expires, path, domain, secure, sameSite)
 */
export const setCookie = (
  name: string, 
  value: string, 
  options: {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void => {
  try {
    Cookies.set(name, value, options);
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error);
  }
};

/**
 * Get a cookie value
 * @param name - Cookie name
 * @returns Cookie value or undefined if not found
 */
export const getCookie = (name: string): string | undefined => {
  try {
    return Cookies.get(name);
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return undefined;
  }
};

/**
 * Check if a cookie exists
 * @param name - Cookie name
 * @returns True if cookie exists, false otherwise
 */
export const hasCookie = (name: string): boolean => {
  try {
    return Cookies.get(name) !== undefined;
  } catch (error) {
    console.error(`Error checking cookie ${name}:`, error);
    return false;
  }
};

/**
 * Remove a specific cookie
 * @param name - Cookie name
 * @param options - Cookie options for removal
 */
export const removeCookie = (
  name: string, 
  options: { path?: string; domain?: string } = {}
): void => {
  try {
    Cookies.remove(name, options);
  } catch (error) {
    console.error(`Error removing cookie ${name}:`, error);
  }
};
