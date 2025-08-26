import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize AWS SES client
const sesClient = new SESClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export class EmailService {
  // Use a verified email address or fallback to a default verified one
  private static readonly FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@example.com';
  private static readonly FROM_NAME = 'VisaFace';
  
  // Fallback verified email addresses for different regions
  private static readonly FALLBACK_EMAILS = {
    'us-east-1': 'noreply@example.com', // Replace with your verified email
    'us-west-2': 'noreply@example.com', // Replace with your verified email
    'eu-west-1': 'noreply@example.com', // Replace with your verified email
  };

  /**
   * Get a verified email address for the current region
   */
  private static getVerifiedEmail(): string {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    
    // First try the configured email
    if (this.FROM_EMAIL && this.FROM_EMAIL !== 'noreply@visaface.online') {
      return this.FROM_EMAIL;
    }
    
    // Fallback to region-specific verified emails
    return this.FALLBACK_EMAILS[region as keyof typeof this.FALLBACK_EMAILS] || 'noreply@example.com';
  }

  /**
   * Generate OTP verification email template
   */
  static generateOTPEmailTemplate(otp: string, userName: string): EmailTemplate {
    const subject = 'Verify Your Email - VisaFace';
    
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 30px; 
            text-align: center; 
          }
          .logo { 
            width: 80px; 
            height: 80px; 
            background-color: #ffffff; 
            border-radius: 50%; 
            margin: 0 auto 20px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 24px; 
            font-weight: bold; 
            color: #667eea; 
          }
          .title { 
            color: #ffffff; 
            font-size: 28px; 
            font-weight: 600; 
            margin: 0; 
          }
          .subtitle { 
            color: #e0e0e0; 
            font-size: 16px; 
            margin: 10px 0 0 0; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting { 
            font-size: 18px; 
            color: #333333; 
            margin-bottom: 20px; 
          }
          .otp-container { 
            background-color: #f8f9fa; 
            border: 2px dashed #667eea; 
            border-radius: 10px; 
            padding: 30px; 
            text-align: center; 
            margin: 30px 0; 
          }
          .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            color: #667eea; 
            letter-spacing: 8px; 
            font-family: 'Courier New', monospace; 
          }
          .otp-label { 
            color: #666666; 
            font-size: 14px; 
            margin-top: 15px; 
          }
          .info { 
            background-color: #e3f2fd; 
            border-left: 4px solid #2196f3; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
          .info-title { 
            color: #1976d2; 
            font-weight: 600; 
            margin-bottom: 5px; 
          }
          .info-text { 
            color: #424242; 
            font-size: 14px; 
            margin: 0; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #e9ecef; 
          }
          .footer-text { 
            color: #666666; 
            font-size: 12px; 
            margin: 0; 
          }
          .expiry-warning { 
            background-color: #fff3e0; 
            border-left: 4px solid #ff9800; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
          .expiry-title { 
            color: #f57c00; 
            font-weight: 600; 
            margin-bottom: 5px; 
          }
          .expiry-text { 
            color: #424242; 
            font-size: 14px; 
            margin: 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://face-visa-selfies.s3.us-east-1.amazonaws.com/Images/logo.svg" alt="VisaFace Logo" class="logo">
            <h1 class="title">VisaFace</h1>
            <p class="subtitle">Effortless Access. Every Time.</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hello ${userName},</p>
            
            <p>Thank you for registering with VisaFace! To complete your registration and ensure the security of your account, please verify your email address using the verification code below.</p>
            
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
              <div class="otp-label">Your Verification Code</div>
            </div>
            
            <div class="info">
              <div class="info-title">📧 How to verify:</div>
              <div class="info-text">Enter this 6-digit code on the verification page to complete your registration.</div>
            </div>
            
            <div class="expiry-warning">
              <div class="expiry-title">⏰ Important:</div>
              <div class="expiry-text">This verification code will expire in 10 minutes for security reasons.</div>
            </div>
            
            <p>If you didn't request this verification code, please ignore this email or contact our support team.</p>
            
            <p>Best regards,<br>The VisaFace Team</p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              This is an automated message. Please do not reply to this email.<br>
              © 2024 VisaFace. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
      Hello ${userName},

      Thank you for registering with VisaFace! To complete your registration and ensure the security of your account, please verify your email address using the verification code below.

      Your Verification Code: ${otp}

      How to verify: Enter this 6-digit code on the verification page to complete your registration.

      Important: This verification code will expire in 10 minutes for security reasons.

      If you didn't request this verification code, please ignore this email or contact our support team.

      Best regards,
      The VisaFace Team

      This is an automated message. Please do not reply to this email.
      © 2024 VisaFace. All rights reserved.
    `;

    return { subject, htmlBody, textBody };
  }

  /**
   * Send email using AWS SES
   */
  static async sendEmail(toEmail: string, template: EmailTemplate): Promise<boolean> {
    try {
      const verifiedEmail = this.getVerifiedEmail();
      console.log(`Attempting to send email from: ${verifiedEmail} to: ${toEmail}`);
      
      const command = new SendEmailCommand({
        Source: `${this.FROM_NAME} <${verifiedEmail}>`,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: template.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: template.htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: template.textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const result = await sesClient.send(command);
      console.log('Email sent successfully:', result.MessageId);
      return true;
    } catch (error: any) {
      // Enhanced error logging
      if (error.name === 'MessageRejected') {
        console.error('SES Message Rejected:', {
          error: error.message,
          code: error.$metadata?.httpStatusCode,
          requestId: error.$metadata?.requestId,
          region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
        });
        
        // Check if it's an email verification issue
        if (error.message.includes('Email address is not verified')) {
          console.error('Email verification issue detected. Please verify the sender email in AWS SES.');
          console.error('Current sender email:', this.getVerifiedEmail());
        }
      } else {
        console.error('SES Error:', {
          name: error.name,
          message: error.message,
          code: error.$metadata?.httpStatusCode,
          requestId: error.$metadata?.requestId
        });
      }
      
      return false;
    }
  }

  /**
   * Send OTP verification email
   */
  static async sendOTPEmail(toEmail: string, otp: string, userName: string): Promise<boolean> {
    const template = this.generateOTPEmailTemplate(otp, userName);
    return this.sendEmail(toEmail, template);
  }

  /**
   * Check if the current email configuration is valid
   */
  static checkEmailConfiguration(): {
    isValid: boolean;
    senderEmail: string;
    region: string;
    issues: string[];
  } {
    const issues: string[] = [];
    const senderEmail = this.getVerifiedEmail();
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    
    // Check if using default unverified email
    if (senderEmail === 'noreply@example.com') {
      issues.push('Using default unverified email address. Please set SES_FROM_EMAIL environment variable to a verified email.');
    }
    
    // Check if using the problematic email
    if (senderEmail === 'noreply@visaface.online') {
      issues.push('Email address noreply@visaface.online is not verified in AWS SES. Please verify it or use a different verified email.');
    }
    
    // Check if AWS credentials are configured
    if (!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY) {
      issues.push('AWS credentials are not configured. Please set NEXT_PUBLIC_AWS_ACCESS_KEY_ID and NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY.');
    }
    
    return {
      isValid: issues.length === 0,
      senderEmail,
      region,
      issues
    };
  }

  /**
   * Get SES setup instructions
   */
  static getSESSetupInstructions(): string[] {
    return [
      '1. Go to AWS SES Console in your region',
      '2. Navigate to "Verified identities"',
      '3. Click "Create identity"',
      '4. Choose "Email address" and enter your sender email',
      '5. Check your email and click the verification link',
      '6. Set the SES_FROM_EMAIL environment variable to your verified email',
      '7. Ensure your AWS account is out of SES sandbox mode (if needed)'
    ];
  }
}
