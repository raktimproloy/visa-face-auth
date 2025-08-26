# Email Verification Flow After Login

## Overview
This document describes the enhanced login flow that now includes email verification checking. Users who haven't verified their email will be redirected to the OTP verification page, while verified users continue with the normal biometric enrollment flow.

## Flow Diagram

```
User Login → Authentication → Check Email Verification
                                    ↓
                            ┌─────────────────┐
                            │ Email Verified? │
                            └─────────────────┘
                                    ↓
                            ┌─────────────────┐     ┌─────────────────┐
                            │      YES        │     │       NO        │
                            └─────────────────┘     └─────────────────┘
                                    ↓                       ↓
                            ┌─────────────────┐     ┌─────────────────┐
                            │ Continue Normal │     │ Generate New    │
                            │     Flow        │     │     OTP         │
                            └─────────────────┘     └─────────────────┘
                                    ↓                       ↓
                            ┌─────────────────┐     ┌─────────────────┐
                            │ Check Biometric │     │ Send OTP Email  │
                            │    Status       │     │                 │
                            └─────────────────┘     └─────────────────┘
                                    ↓                       ↓
                            ┌─────────────────┐     ┌─────────────────┐
                            │ Redirect Based  │     │ Redirect to     │
                            │ on Biometric    │     │ OTP Verification│
                            └─────────────────┘     └─────────────────┘
```

## Implementation Details

### 1. Login API Changes (`src/app/api/login/route.ts`)

#### Email Verification Check
- After successful password authentication, check `user.emailVerified` field
- If `false`, generate new OTP and update user record
- Send new OTP email to user
- Return response with `requiresEmailVerification: true`

#### New OTP Generation
```typescript
// Generate new OTP data
const { createOTPData } = await import('../../../utils/otpUtils');
const otpData = createOTPData();

// Update user with new OTP
const updateCommand = new UpdateItemCommand({
  TableName: tableName,
  Key: marshall({ customerId: user.customerId }),
  UpdateExpression: 'SET otpCode = :otpCode, otpExpiresAt = :otpExpiresAt, otpAttempts = :otpAttempts, otpVerified = :otpVerified, updatedAt = :updatedAt',
  ExpressionAttributeValues: marshall({
    ':otpCode': otpData.code,
    ':otpExpiresAt': otpData.expiresAt,
    ':otpAttempts': 0,
    ':otpVerified': false,
    ':updatedAt': new Date().toISOString()
  })
});
```

#### Response Structure
```typescript
{
  success: true,
  message: 'Login successful but email verification required',
  user: { /* user data */ },
  requiresEmailVerification: true,
  emailSent: boolean
}
```

### 2. Login Page Changes (`src/app/auth/login/page.tsx`)

#### Email Verification Redirect
```typescript
// Check if email verification is required
if (result.requiresEmailVerification) {
  console.log('Email verification required, redirecting to OTP verification');
  router.push('/auth/verify-otp');
  return;
}

// Redirect based on biometric status (only for verified users)
if (result.user.biometricStatus === 'completed') {
  router.push('/auth/final');
} else {
  router.push('/auth/selfie-policy');
}
```

### 3. Verify OTP Page Changes (`src/app/auth/verify-otp/page.tsx`)

#### Dual Data Source Support
- **URL Parameters**: For users coming from registration flow
- **Redux Store**: For users coming from login flow

```typescript
const { registrationData } = useAppSelector((state) => state.auth);

// Get data from URL params (for registration flow) or Redux (for login flow)
const customerId = searchParams.get('customerId') || registrationData?.customerId;
const email = searchParams.get('email') || registrationData?.email;
const firstName = searchParams.get('firstName') || registrationData?.firstName;
```

#### Smart Redirect Logic
```typescript
// Redirect if no customerId or email (either from URL params or Redux)
useEffect(() => {
  if (!customerId || !email) {
    // If we have some data in Redux but missing customerId, user might be coming from login
    if (registrationData && !customerId) {
      router.push('/auth/login');
      return;
    }
    
    // If no data at all, redirect to register
    router.push('/auth/register');
  }
}, [customerId, email, router, registrationData]);
```

#### Dynamic UI Messages
```typescript
{/* Show different message based on flow */}
{!searchParams.get('customerId') && registrationData ? (
  <div className="mb-4">
    <h1 className="text-2xl font-bold text-white mb-2">Email Verification Required</h1>
    <p className="text-sm text-gray-300">
      Please verify your email to continue with your account access.
    </p>
  </div>
) : (
  <div className="mb-4">
    <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
    <p className="text-sm text-gray-300">
      We've sent a verification code to {email}
    </p>
  </div>
)}
```

### 4. JWT Token Updates

#### Include Email Verification Status
```typescript
const token = jwt.sign(
  {
    customerId: user.customerId,
    // ... other fields
    emailVerified: user.emailVerified
  },
  jwtSecret,
  { expiresIn: '24h' }
);
```

## User Experience Flow

### Scenario 1: New User Registration
1. User registers → OTP sent → Verify OTP → Continue to biometric enrollment
2. **Flow**: Register → Verify OTP → Selfie Policy → Biometric Enrollment

### Scenario 2: Existing User with Unverified Email
1. User logs in → System detects unverified email → New OTP generated and sent
2. **Flow**: Login → Verify OTP → Selfie Policy → Biometric Enrollment

### Scenario 3: Existing User with Verified Email
1. User logs in → System detects verified email → Continue normal flow
2. **Flow**: Login → Selfie Policy → Biometric Enrollment

## Security Features

### OTP Regeneration
- New OTP generated for each login attempt if email unverified
- Previous OTP invalidated
- Rate limiting on OTP generation

### Session Management
- JWT token includes email verification status
- Unverified users cannot proceed to protected routes
- Automatic redirect to verification page

## Error Handling

### Email Service Failures
- User registration/login succeeds even if email fails
- Clear error messages for email issues
- Fallback to manual OTP entry

### Invalid OTP Attempts
- Maximum 3 attempts before OTP expires
- Automatic lockout after failed attempts
- Clear feedback on remaining attempts

## Testing Scenarios

### 1. Test Unverified User Login
```bash
# Login with unverified email
POST /api/login
{
  "email": "unverified@example.com",
  "password": "password123"
}

# Expected: requiresEmailVerification: true
# Redirect to /auth/verify-otp
```

### 2. Test Verified User Login
```bash
# Login with verified email
POST /api/login
{
  "email": "verified@example.com",
  "password": "password123"
}

# Expected: normal flow continues
# Redirect based on biometric status
```

### 3. Test OTP Verification
```bash
# Verify OTP
POST /api/verify-otp
{
  "customerId": "CUST-123",
  "otp": "123456"
}

# Expected: emailVerified: true
# JWT token updated
# Redirect to appropriate page
```

## Monitoring and Logging

### Key Log Points
- Email verification check during login
- OTP generation and email sending
- User redirects and flow decisions
- OTP verification success/failure

### Metrics to Track
- Email verification completion rate
- OTP email delivery success rate
- User flow completion rates
- Error rates by flow stage

## Future Enhancements

### 1. Email Verification Reminders
- Periodic reminders for unverified users
- Multiple email templates for different scenarios

### 2. Alternative Verification Methods
- SMS OTP as backup
- Email link verification
- Social login integration

### 3. Enhanced Security
- Device fingerprinting
- Location-based verification
- Multi-factor authentication

## Troubleshooting

### Common Issues

#### Issue: User stuck in verification loop
**Solution**: Check if `emailVerified` field is properly updated in DynamoDB

#### Issue: OTP emails not sending
**Solution**: Verify AWS SES configuration and email verification status

#### Issue: Redirect not working
**Solution**: Check Redux store state and URL parameters

#### Issue: JWT token not updating
**Solution**: Verify JWT_SECRET environment variable and token generation logic

### Debug Commands
```bash
# Check SES status
curl http://localhost:3000/api/ses-status

# Check user data in DynamoDB
# Verify emailVerified field status

# Check Redux store state
# Use browser dev tools to inspect Redux state
```
