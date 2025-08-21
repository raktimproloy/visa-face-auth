// IDMission Biometric Enrollment Lambda Function (CommonJS Version)
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// IDMission API Configuration
const IDMISSION_CONFIG = {
  baseUrl: 'https://api.idmission.com', // Replace with actual IDMission API URL
  username: process.env.IDMISSION_USERNAME,
  password: process.env.IDMISSION_PASSWORD,
  clientId: process.env.IDMISSION_CLIENT_ID,
  clientSecret: process.env.IDMISSION_CLIENT_SECRET,
  apiKey: process.env.IDMISSION_API_KEY,
  apiSecret: process.env.IDMISSION_API_SECRET
};

exports.handler = async (event) => {
  try {
    console.log('IDMission enrollment event:', JSON.stringify(event, null, 2));
    
    const { customerId, enrollmentId, photoData, metadata } = event;
    
    if (!customerId || !enrollmentId || !photoData) {
      throw new Error('Missing required parameters: customerId, enrollmentId, or photoData');
    }
    
    // Step 1: Authenticate with IDMission
    const authToken = await authenticateWithIDMission();
    console.log('Authentication successful');
    
    // Step 2: Call IDMission API for biometric enrollment
    console.log('Calling IDMission API for biometric enrollment...');
    
    const idmissionResponse = await enrollBiometricsWithIDMission({
      authToken,
      customerId,
      enrollmentId,
      photoData,
      metadata
    });
    
    console.log('IDMission API response:', idmissionResponse);
    
    // Step 3: Process the response
    if (idmissionResponse.success) {
      return {
        success: true,
        enrollmentId,
        customerId,
        biometricStatus: 'enrolled',
        idmissionData: idmissionResponse,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: idmissionResponse.error || 'Unknown IDMission error',
        enrollmentId,
        customerId,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('Error in IDMission enrollment:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Authenticate with IDMission API
async function authenticateWithIDMission() {
  try {
    const authResponse = await fetch(`${IDMISSION_CONFIG.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': IDMISSION_CONFIG.apiKey,
        'X-API-Secret': IDMISSION_CONFIG.apiSecret
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: IDMISSION_CONFIG.username,
        password: IDMISSION_CONFIG.password,
        client_id: IDMISSION_CONFIG.clientId,
        client_secret: IDMISSION_CONFIG.clientSecret
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status} ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    return authData.access_token;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error(`Failed to authenticate with IDMission: ${error.message}`);
  }
}

// Enroll biometrics with IDMission
async function enrollBiometricsWithIDMission({ authToken, customerId, enrollmentId, photoData, metadata }) {
  try {
    // Convert base64 photo data to buffer
    const photoBuffer = Buffer.from(photoData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('customerId', customerId);
    formData.append('enrollmentId', enrollmentId);
    formData.append('photo', photoBuffer, 'selfie.jpg');
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const enrollmentResponse = await fetch(`${IDMISSION_CONFIG.baseUrl}/v1/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-API-Key': IDMISSION_CONFIG.apiKey,
        'X-API-Secret': IDMISSION_CONFIG.apiSecret
      },
      body: formData
    });

    if (!enrollmentResponse.ok) {
      const errorText = await enrollmentResponse.text();
      throw new Error(`Enrollment failed: ${enrollmentResponse.status} ${enrollmentResponse.statusText} - ${errorText}`);
    }

    const enrollmentData = await enrollmentResponse.json();
    
    return {
      success: true,
      enrollmentId: enrollmentData.enrollmentId || enrollmentId,
      customerId: enrollmentData.customerId || customerId,
      biometricScore: enrollmentData.biometricScore,
      qualityScore: enrollmentData.qualityScore,
      livenessScore: enrollmentData.livenessScore,
      message: enrollmentData.message || 'Biometric enrollment successful'
    };
    
  } catch (error) {
    console.error('Enrollment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
