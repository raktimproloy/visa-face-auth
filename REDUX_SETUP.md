# Redux Setup for Face Visa Project

## Overview
This project now uses Redux Toolkit for state management, specifically for handling user registration data.

## What's Been Added

### 1. Redux Store Structure
- **Store**: `src/store/store.ts` - Main Redux store configuration
- **Auth Slice**: `src/store/slices/authSlice.ts` - Handles authentication state
- **Provider**: `src/store/provider.tsx` - Redux provider wrapper
- **Hooks**: `src/store/hooks.ts` - Typed Redux hooks

### 2. Registration Data Storage
The registration form now stores the following data in Redux when "Create Account" is clicked:
- First Name
- Last Name
- Email
- Password
- Photo (captured selfie)

### 3. How It Works

#### When "Create Account" is clicked:
1. Form validation checks if all fields are filled
2. Data is dispatched to Redux store using `setRegistrationData` action
3. User is redirected to `/auth/selfie-policy`
4. Registration data is now available throughout the app

#### Camera Flow:
1. User navigates to `/auth/selfie` page
2. Camera component activates front-facing camera with full-screen view
3. Green circle overlay guides user positioning
4. User clicks "Take Photo Now" to capture selfie
5. Photo is stored in Redux and user is redirected to `/auth/selfie-review`
6. User can review photo, retake if needed, or proceed to upload

#### Accessing the data in other components:
```tsx
import { useAppSelector } from '../../store/hooks';

function MyComponent() {
  const { registrationData, isRegistered } = useAppSelector((state) => state.auth);
  
  if (isRegistered && registrationData) {
    console.log('User registered:', registrationData.firstName);
  }
}
```

## Available Actions

### `setRegistrationData(payload)`
- Stores registration information
- Sets `isRegistered` to true

### `setPhoto(photoData)`
- Updates the photo in existing registration data
- Stores captured selfie as base64 string

### `clearRegistrationData()`
- Clears all registration data
- Sets `isRegistered` to false

## State Structure
```typescript
interface AuthState {
  registrationData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    photo?: string; // Base64 encoded selfie image
  } | null;
  isRegistered: boolean;
}
```

## Example Usage
See `src/components/registration-summary/index.tsx` for an example component that displays the stored registration data.

## Next Steps
You can now:
1. Access registration data in any component using `useAppSelector`
2. Add more actions to the auth slice as needed
3. Create additional slices for other app features
4. Persist data to localStorage if needed
5. Use the camera component for other photo capture needs
6. Extend the photo functionality with filters or editing features
