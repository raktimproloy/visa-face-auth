# Updated Authentication Flow with Email Verification

## Overview
The `useAuthProtection` hook has been updated to include email verification checking as a primary gate before allowing access to protected routes. Users must verify their email before they can access any protected pages.

## Updated Flow

### 1. Primary Authentication Check
```
User visits protected page → useAuthProtection hook → Check JWT token → Verify token validity
```

### 2. Email Verification Check (NEW PRIMARY GATE)
```
JWT valid → Check emailVerified field → If false → Redirect to /auth/verify-otp
```

### 3. Biometric Status Check (Secondary Gate)
```
Email verified → Check biometricStatus → Route based on completion status
```

## Protected Routes

### Routes that require email verification:
- `/auth/selfie-policy`
- `/auth/selfie`
- `/auth/selfie-review`
- `/auth/final`
- `/auth/success`

### Routes that don't require email verification:
- `/auth/register`
- `/auth/login`
- `/auth/verify-otp`

## Implementation Details

### Updated useAuthProtection Hook

```typescript
// Check email verification first - this is the primary gate
const isEmailVerified = decodedUser.emailVerified === true;
const currentPath = window.location.pathname;

console.log('Checking email verification status:', {
  emailVerified: decodedUser.emailVerified,
  isEmailVerified,
  currentPath
});

if (!isEmailVerified) {
  // User email is not verified - redirect to OTP verification
  // But don't redirect if they're already on the OTP verification page
  if (currentPath !== '/auth/verify-otp') {
    console.log('User email not verified, redirecting to OTP verification');
    router.push('/auth/verify-otp');
    return;
  } else {
    // User is on OTP verification page, allow access
    console.log('User email not verified but on OTP verification page, allowing access');
    setIsLoading(false);
    return;
  }
}

// Email is verified, now check biometric status and handle routing
const isBiometricCompleted = decodedUser.biometricStatus === 'completed';
```

### JWT Token Structure

The JWT token must include the `emailVerified` field:

```typescript
const token = jwt.sign(
  {
    customerId: user.customerId,
    enrollmentId: user.enrollmentId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email.toLowerCase(),
    enrollmentStatus: user.enrollmentStatus,
    biometricStatus: user.biometricStatus,
    idmissionValid: user.idmissionValid,
    photoUrl: user.photoUrl || '',
    emailVerified: user.emailVerified  // This field is required
  },
  jwtSecret,
  { expiresIn: '24h' }
);
```

## User Experience Flow

### Scenario 1: Unverified User
1. User tries to access `/auth/selfie-policy`
2. `useAuthProtection` detects `emailVerified: false`
3. User is redirected to `/auth/verify-otp`
4. User verifies email with OTP
5. After verification, user can access protected routes

### Scenario 2: Verified User
1. User tries to access `/auth/selfie-policy`
2. `useAuthProtection` detects `emailVerified: true`
3. User is allowed to proceed
4. Biometric status is checked for further routing

### Scenario 3: User on OTP Verification Page
1. User is on `/auth/verify-otp`
2. `useAuthProtection` detects `emailVerified: false`
3. Since user is already on verification page, access is allowed
4. No redirect loop occurs

## Security Features

### Email Verification as Primary Gate
- Users cannot access any protected routes without email verification
- Prevents unauthorized access to biometric enrollment pages
- Ensures proper user identity verification

### No Redirect Loops
- Users already on OTP verification page are not redirected
- Prevents infinite redirect scenarios
- Maintains user experience

### Comprehensive Logging
- All verification checks are logged
- Easy debugging of authentication issues
- Clear audit trail of user access attempts

## Testing Scenarios

### Test 1: Unverified User Access
```typescript
// User with emailVerified: false tries to access /auth/selfie-policy
// Expected: Redirect to /auth/verify-otp
```

### Test 2: Verified User Access
```typescript
// User with emailVerified: true tries to access /auth/selfie-policy
// Expected: Access granted, biometric status checked
```

### Test 3: User on OTP Page
```typescript
// User with emailVerified: false on /auth/verify-otp
// Expected: Access granted, no redirect
```

### Test 4: Invalid Token
```typescript
// User with invalid/expired JWT token
// Expected: Redirect to /auth/register
```

## Error Handling

### Missing emailVerified Field
- If JWT token doesn't contain `emailVerified` field, it's treated as `false`
- User will be redirected to OTP verification

### Undefined emailVerified Field
- Explicit check for `=== true` ensures only verified users pass
- `null`, `undefined`, or `false` values all result in redirect

### Network Errors
- If auth check fails, user is redirected to registration
- Graceful fallback for system issues

## Monitoring and Debugging

### Key Log Points
- JWT token verification
- Email verification status check
- Biometric status check
- Route access decisions
- Redirect actions

### Debug Information
```typescript
console.log('Checking email verification status:', {
  emailVerified: decodedUser.emailVerified,
  isEmailVerified,
  currentPath
});

console.log('Email verification passed, checking biometric status:', {
  biometricStatus: decodedUser.biometricStatus,
  isBiometricCompleted,
  currentPath
});
```

## Future Enhancements

### 1. Email Verification Reminders
- Periodic checks for unverified users
- Automatic redirect to verification page

### 2. Enhanced Security
- Device fingerprinting
- Location-based verification
- Multi-factor authentication

### 3. User Experience
- Clear messaging about verification requirements
- Progress indicators for verification steps
- Helpful error messages

## Troubleshooting

### Common Issues

#### Issue: User stuck in verification loop
**Solution**: Check if `emailVerified` field is properly set to `true` in JWT token

#### Issue: User redirected when already verified
**Solution**: Verify JWT token contains correct `emailVerified: true` value

#### Issue: Access denied to verified users
**Solution**: Check JWT token structure and `emailVerified` field

#### Issue: Redirect not working
**Solution**: Check browser console for authentication logs and errors

### Debug Commands
```bash
# Check JWT token content
# Use browser dev tools to inspect JWT token

# Check authentication logs
# Monitor browser console for useAuthProtection logs

# Verify user data in DynamoDB
# Check emailVerified field status
```

## Summary

The updated authentication flow ensures that:

1. **Email verification is the primary gate** - Users must verify email before accessing any protected routes
2. **No redirect loops** - Users on verification page are not redirected
3. **Comprehensive logging** - All authentication decisions are logged for debugging
4. **Maintains existing flow** - Biometric status checking remains unchanged
5. **Enhanced security** - Unverified users cannot access sensitive pages

This implementation provides a robust, secure, and user-friendly authentication system that ensures proper email verification before allowing access to protected functionality.
