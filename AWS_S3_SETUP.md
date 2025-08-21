# AWS S3 Setup Guide for Photo Upload

This guide will help you set up AWS S3 bucket and configure your application for photo uploads.

## 🚀 **Step 1: Create AWS Account**

1. Go to [AWS Console](https://aws.amazon.com/)
2. Sign up for a new account or sign in to existing account
3. Complete the registration process

## 🪣 **Step 2: Create S3 Bucket**

1. **Navigate to S3 Service**
   - Go to AWS Console
   - Search for "S3" and click on it

2. **Create Bucket**
   - Click "Create bucket"
   - Enter a unique bucket name (e.g., `your-app-photos-2024`)
   - Select your preferred region (e.g., `us-east-1`)
   - Keep default settings for now

3. **Configure Public Access**
   - **IMPORTANT**: Uncheck "Block all public access"
   - This allows public read access to uploaded photos
   - Acknowledge the warning

4. **Create Bucket**
   - Click "Create bucket"

## 🔐 **Step 3: Create IAM User & Access Keys**

1. **Navigate to IAM Service**
   - Go to AWS Console
   - Search for "IAM" and click on it

2. **Create User**
   - Click "Users" → "Create user"
   - Enter username: `photo-upload-user`
   - Select "Programmatic access"

3. **Attach Policy**
   - Click "Attach existing policies directly"
   - Search for "AmazonS3FullAccess"
   - Select it and click "Next"

4. **Create User & Get Keys**
   - Click "Create user"
   - **IMPORTANT**: Copy the Access Key ID and Secret Access Key
   - You won't be able to see the secret key again!

## 📝 **Step 4: Configure Environment Variables**

1. **Create `.env.local` file** in your project root:
```bash
# AWS S3 Configuration
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key_here
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=us-east-1
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=your_bucket_name_here
```

2. **Replace the values** with your actual AWS credentials:
   - `NEXT_PUBLIC_AWS_ACCESS_KEY_ID`: Your IAM user access key
   - `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY`: Your IAM user secret key
   - `NEXT_PUBLIC_AWS_S3_BUCKET_NAME`: Your S3 bucket region
   - `NEXT_PUBLIC_AWS_S3_BUCKET_NAME`: Your S3 bucket name

## 🔒 **Step 5: Configure S3 Bucket Policy**

1. **Go to your S3 bucket**
2. **Click on "Permissions" tab**
3. **Click "Bucket policy"**
4. **Add this policy** (replace `your-bucket-name` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

5. **Click "Save changes"**

## 🧪 **Step 6: Test the Setup**

1. **Start your development server**:
```bash
npm run dev
```

2. **Navigate to** `/auth/selfie`
3. **Take a photo** using the camera
4. **Click "Upload"** on the review page
5. **Check the browser console** for upload status
6. **Verify** the photo appears in your S3 bucket

## 📁 **File Structure Created**

```
src/
├── app/
│   ├── api/
│   │   └── upload-photo/
│   │       └── route.ts          # S3 upload API endpoint
│   └── auth/
│       └── selfie-review/
│           └── page.tsx          # Updated with upload functionality
├── store/
│   └── slices/
│       └── authSlice.ts          # Updated with upload actions
└── utils/
    └── s3Upload.ts               # S3 upload utility functions
```

## 🔧 **How It Works**

1. **Photo Capture**: User takes photo with camera
2. **Photo Storage**: Photo is saved to Redux store (base64)
3. **Upload Trigger**: User clicks "Upload" button
4. **API Call**: Frontend calls `/api/upload-photo` endpoint
5. **S3 Upload**: API converts base64 to buffer and uploads to S3
6. **URL Update**: S3 public URL is saved back to Redux
7. **Success**: User is redirected to success page

## 🚨 **Security Notes**

- **Never commit** `.env.local` to version control
- **Use IAM roles** instead of access keys in production
- **Consider using** pre-signed URLs for more secure uploads
- **Implement file size limits** and file type validation
- **Add rate limiting** to prevent abuse

## 🐛 **Troubleshooting**

### **Upload Fails**
- Check AWS credentials in `.env.local`
- Verify S3 bucket name and region
- Check browser console for error messages
- Ensure bucket policy allows public read access

### **Photo Not Displaying**
- Verify S3 bucket policy allows public access
- Check if photo URL is correctly generated
- Ensure photo was uploaded to correct folder

### **Permission Denied**
- Verify IAM user has S3 full access
- Check bucket permissions
- Ensure bucket policy is correctly configured

## 📚 **Additional Resources**

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🎯 **Next Steps**

After successful setup:
1. **Test photo uploads** thoroughly
2. **Implement file validation** (size, type, etc.)
3. **Add error handling** for network issues
4. **Consider implementing** image compression
5. **Add upload progress** indicators
6. **Implement retry logic** for failed uploads
