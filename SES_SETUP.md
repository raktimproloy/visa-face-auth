# AWS SES Setup Guide

## Problem
The application is currently failing to send emails because the email address `noreply@visaface.online` is not verified in AWS SES (Simple Email Service).

## Error Details
```
MessageRejected: Email address is not verified. The following identities failed the check in region US-EAST-1: VisaFace <noreply@visaface.online>
```

## Solution Steps

### 1. Verify Email Address in AWS SES

1. **Go to AWS SES Console**
   - Navigate to: https://console.aws.amazon.com/ses/
   - Make sure you're in the correct region (US-EAST-1)

2. **Create Verified Identity**
   - Click "Verified identities" in the left sidebar
   - Click "Create identity"
   - Choose "Email address"
   - Enter: `noreply@visaface.online`
   - Click "Create identity"

3. **Verify Email**
   - Check your email inbox for `noreply@visaface.online`
   - Click the verification link in the email
   - The email address will now show as "Verified" in the SES console

### 2. Alternative: Use a Different Verified Email

If you can't verify `noreply@visaface.online`, use a different email:

1. **Verify a different email** (e.g., `admin@yourdomain.com`)
2. **Update environment variable**:
   ```bash
   SES_FROM_EMAIL=admin@yourdomain.com
   ```

### 3. Check SES Sandbox Mode

1. **Check Account Status**
   - In SES Console, look for "Account dashboard"
   - Check if your account is in "Sandbox mode"

2. **Request Production Access** (if needed)
   - Click "Request production access"
   - Fill out the form explaining your use case
   - Wait for AWS approval (usually 24-48 hours)

### 4. Update Environment Variables

Create or update your `.env.local` file:

```bash
# AWS SES Configuration
SES_FROM_EMAIL=your_verified_email@example.com
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 5. Test Configuration

1. **Check SES Status**:
   ```bash
   GET /api/ses-status
   ```

2. **Run Diagnostics**:
   ```bash
   POST /api/ses-status
   ```

3. **Test Registration**:
   - Try registering a new user
   - Check if OTP email is sent successfully

## Common Issues & Solutions

### Issue: "Email address is not verified"
**Solution**: Verify the email address in SES Console

### Issue: "Account is in sandbox mode"
**Solution**: Request production access from AWS

### Issue: "Access denied"
**Solution**: Check IAM permissions for SES

### Issue: "Region mismatch"
**Solution**: Ensure SES region matches your AWS region

## IAM Permissions Required

Your AWS user/role needs these SES permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## Testing

After setup, test the email functionality:

1. **Register a new user**
2. **Check console logs** for email status
3. **Verify OTP email** is received
4. **Check SES metrics** in AWS Console

## Monitoring

Monitor email sending in AWS SES Console:
- **Sending statistics**
- **Bounce and complaint rates**
- **Reputation metrics**

## Support

If issues persist:
1. Check AWS SES Console for detailed error messages
2. Verify IAM permissions
3. Check CloudWatch logs
4. Contact AWS Support if needed

## Quick Fix Commands

```bash
# Check current SES status
curl http://localhost:3000/api/ses-status

# Run full diagnostics
curl -X POST http://localhost:3000/api/ses-status
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `SES_FROM_EMAIL` | Verified sender email | ✅ |
| `NEXT_PUBLIC_AWS_REGION` | AWS region | ✅ |
| `NEXT_PUBLIC_AWS_ACCESS_KEY_ID` | AWS access key | ✅ |
| `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY` | AWS secret key | ✅ |
