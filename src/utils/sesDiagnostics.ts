import { EmailService } from './emailService';

/**
 * SES Configuration Diagnostics Utility
 * This utility helps diagnose and fix common SES configuration issues
 */
export class SESDiagnostics {
  /**
   * Run comprehensive SES diagnostics
   */
  static async runDiagnostics(): Promise<void> {
    console.log('🔍 Running SES Configuration Diagnostics...\n');
    
    // Check email configuration
    const config = EmailService.checkEmailConfiguration();
    
    console.log('📧 Email Configuration:');
    console.log(`   Sender Email: ${config.senderEmail}`);
    console.log(`   AWS Region: ${config.region}`);
    console.log(`   Configuration Valid: ${config.isValid ? '✅' : '❌'}`);
    
    if (config.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      config.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      console.log('\n🔧 How to Fix:');
      const instructions = EmailService.getSESSetupInstructions();
      instructions.forEach((instruction, index) => {
        console.log(`   ${instruction}`);
      });
    } else {
      console.log('\n✅ Configuration looks good!');
    }
    
    // Check environment variables
    console.log('\n🔑 Environment Variables:');
    const envVars = {
      'NEXT_PUBLIC_AWS_REGION': process.env.NEXT_PUBLIC_AWS_REGION,
      'NEXT_PUBLIC_AWS_ACCESS_KEY_ID': process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
      'NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY': process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
      'SES_FROM_EMAIL': process.env.SES_FROM_EMAIL || '❌ Not set'
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    // Test email sending capability
    console.log('\n🧪 Testing Email Sending Capability...');
    try {
      const testResult = await EmailService.sendOTPEmail(
        'test@example.com',
        '123456',
        'Test User'
      );
      
      if (testResult) {
        console.log('   ✅ Email service is working correctly');
      } else {
        console.log('   ❌ Email service failed (check logs above for details)');
      }
    } catch (error) {
      console.log('   ❌ Email service error:', error);
    }
    
    console.log('\n📚 Additional Resources:');
    console.log('   - AWS SES Console: https://console.aws.amazon.com/ses/');
    console.log('   - SES Getting Started: https://docs.aws.amazon.com/ses/latest/dg/getting-started.html');
    console.log('   - Email Verification: https://docs.aws.amazon.com/ses/latest/dg/verify-addresses-and-domains.html');
  }

  /**
   * Quick configuration check
   */
  static quickCheck(): boolean {
    const config = EmailService.checkEmailConfiguration();
    return config.isValid;
  }

  /**
   * Get configuration summary
   */
  static getConfigSummary(): {
    status: 'good' | 'warning' | 'error';
    message: string;
    details: string[];
  } {
    const config = EmailService.checkEmailConfiguration();
    
    if (config.isValid) {
      return {
        status: 'good',
        message: 'SES configuration is valid',
        details: [`Using verified email: ${config.senderEmail}`, `Region: ${config.region}`]
      };
    }
    
    if (config.issues.some(issue => issue.includes('not verified'))) {
      return {
        status: 'error',
        message: 'Email address not verified in SES',
        details: config.issues
      };
    }
    
    return {
      status: 'warning',
      message: 'SES configuration has issues',
      details: config.issues
    };
  }
}

// Export for use in other files
export default SESDiagnostics;
