# Face Visa - Biometric Identity Verification System

A modern, secure biometric identity verification system built with Next.js, featuring real-time face detection, IDMission API integration, and comprehensive user authentication flow.

## 🚀 Features

### **Core Functionality**
- **Real-time Face Detection**: Advanced face detection with live camera feed
- **Biometric Verification**: Integration with IDMission API for professional-grade verification
- **Multi-step Authentication**: Complete user registration and verification flow
- **Email Verification**: Secure OTP-based email verification system
- **Photo Capture & Review**: Selfie capture with instant review capabilities

### **Security Features**
- **JWT Authentication**: Secure token-based authentication
- **AWS Integration**: S3 for photo storage, SES for email services
- **DynamoDB**: Scalable user data storage
- **Permission Management**: Camera and device permission handling

### **User Experience**
- **Responsive Design**: Mobile-first responsive interface
- **Real-time Feedback**: Live face detection indicators
- **Auto-capture**: Intelligent photo capture when face is detected
- **Progress Tracking**: Clear visual feedback throughout the process

## 🏗️ Architecture

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication APIs
│   │   ├── enroll-*/      # Enrollment APIs
│   │   └── idmission-*    # IDMission integration
│   ├── auth/              # Authentication pages
│   │   ├── login/         # User login
│   │   ├── register/      # User registration
│   │   ├── live/          # Live face detection
│   │   └── verify-otp/    # OTP verification
│   └── components/        # Reusable components
├── components/             # Global components
├── hooks/                  # Custom React hooks
├── store/                  # Redux state management
├── utils/                  # Utility functions
└── public/                 # Static assets
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: Redux Toolkit
- **Authentication**: JWT, HTTP-only cookies
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Email**: AWS SES
- **Biometrics**: IDMission API
- **Face Detection**: Browser Face Detection API + fallback algorithms

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Account (for S3, SES, DynamoDB)
- IDMission API credentials

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd face-visa-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp env.example.local .env.local
   ```
   
   Fill in your environment variables:
   ```bash
   # AWS Configuration
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_aws_access_key
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_AWS_S3_BUCKET_NAME=your_s3_bucket
   
   # IDMission API Credentials
   IDMISSION_USERNAME=your_idmission_username
   IDMISSION_PASSWORD=your_idmission_password
   IDMISSION_CLIENT_ID=your_client_id
   IDMISSION_CLIENT_SECRET=your_client_secret
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   
   # AWS SES Configuration
   SES_FROM_EMAIL=your_verified_email@example.com
   
   # DynamoDB Table
   NEXT_PUBLIC_DYNAMODB_TABLE_NAME=face-visa-users
   ```

4. **Database Setup**
   ```bash
   npm run dev
   # Visit /api/create-table to create DynamoDB table
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🔧 Configuration

### **AWS Services Setup**

#### **S3 Bucket**
- Create an S3 bucket for photo storage
- Configure CORS for web access
- Set appropriate permissions

#### **SES Email Service**
- Verify your email address in AWS SES
- Configure SMTP settings if needed
- Update `SES_FROM_EMAIL` in environment

#### **DynamoDB Table**
- Table will be created automatically via API
- Ensure proper IAM permissions for your AWS credentials

### **IDMission API**
- Obtain API credentials from IDMission
- Configure the live-check endpoint
- Test authentication flow

## 🚀 Usage

### **User Registration Flow**
1. User visits `/auth/register`
2. Fills in personal information
3. Receives OTP via email
4. Verifies OTP
5. Proceeds to face verification

### **Face Verification Process**
1. User navigates to `/auth/live`
2. Camera activates with face detection
3. Real-time face detection feedback
4. Auto-capture when face is properly positioned
5. Instant IDMission verification
6. Photo review and confirmation

### **API Endpoints**

#### **Authentication**
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/verify-otp` - OTP verification
- `POST /api/check-auth` - Authentication status

#### **Biometric Verification**
- `POST /api/idmission-live-check` - Live face verification
- `POST /api/enroll-biometrics` - Biometric enrollment
- `POST /api/update-photo` - Photo updates

#### **User Management**
- `POST /api/update-jwt` - JWT token updates
- `POST /api/logout` - User logout

## 🔒 Security Features

- **JWT Tokens**: Secure authentication with HTTP-only cookies
- **Input Validation**: Comprehensive input sanitization
- **Permission Handling**: Secure camera and device access
- **API Security**: Rate limiting and error handling
- **Data Encryption**: Secure storage and transmission

## 📱 Mobile Optimization

- **Responsive Design**: Mobile-first approach
- **Touch Gestures**: Optimized for mobile devices
- **Camera Integration**: Native camera API support
- **Progressive Web App**: PWA capabilities

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build the project
npm run build

# Start production server
npm start
```

## 📊 Performance

- **Image Optimization**: Efficient photo processing
- **Lazy Loading**: Optimized component loading
- **Caching**: Strategic caching strategies
- **Bundle Optimization**: Tree shaking and code splitting

## 🚨 Troubleshooting

### **Common Issues**

1. **Camera Not Working**
   - Check browser permissions
   - Ensure HTTPS connection
   - Verify camera hardware

2. **IDMission API Errors**
   - Verify API credentials
   - Check network connectivity
   - Review API response logs

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify environment variables

### **Debug Mode**
- Check browser console for detailed logs
- Review server logs for API calls
- Use browser dev tools for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support:
- Check the troubleshooting section
- Review browser console logs
- Verify environment configuration
- Test with minimal setup first

## 🔮 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Additional biometric methods
- [ ] Enhanced security features
- [ ] Performance optimizations

---

**Built with ❤️ using Next.js and modern web technologies**
