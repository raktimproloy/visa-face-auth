export interface IDMissionLiveCheckResponse {
  success: boolean;
  data: any;
  message: string;
}

export interface IDMissionLiveCheckRequest {
  selfieImage: string;
}

export class IDMissionAPI {
  private static async getAccessToken(): Promise<string> {
    const response = await fetch('https://auth.idmission.com/auth/realms/identity/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.IDMISSION_CLIENT_ID || '',
        client_secret: process.env.IDMISSION_CLIENT_SECRET || '',
        username: process.env.IDMISSION_USERNAME || '',
        password: process.env.IDMISSION_PASSWORD || '',
        scope: 'email profile api_access'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get IDMission access token: ${errorText}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  }

  static async performLiveCheck(selfieImage: string): Promise<IDMissionLiveCheckResponse> {
    try {
      // Get access token
      const accessToken = await this.getAccessToken();

      // Perform live-check
      const response = await fetch('https://api.idmission.com/v4/customer/live-check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerData: {
            signatureData: {
              signatureImage: ""
            },
            policyAcceptanceData: {
              BiometricTimestamp: new Date().toISOString(),
              BiometricURL: "",
              PrivacyPolicyTimestamp: new Date().toISOString(),
              PrivacypolicyURL: "",
              TermTimestamp: new Date().toISOString(),
              TermsofserviceURL: ""
            },
            biometricData: {
              selfie: selfieImage,
              fingerPrintData: {
                fingerPrints: [],
                metadata: {
                  format: "JPEG",
                  model: "web-camera",
                  serialNumber: "web",
                  backgroundColor: "white"
                }
              }
            }
          },
          additionalData: {
            uniqueRequestId: Date.now().toString(),
            clientRequestID: Date.now().toString(),
            stripSpecialCharacters: "Y",
            estimateAge: "N",
            predictGender: "N",
            gpsCoordinates: "",
            detectLabel: "Y",
            detectClosedEyes: "Y",
            sendDocumentIdInResponse: "N"
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Live-check verification failed: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
        message: 'Live-check verification completed successfully'
      };

    } catch (error) {
      console.error('IDMission live-check error:', error);
      throw error;
    }
  }
}
