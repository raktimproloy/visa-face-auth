import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { customerData, additionalData, companyData } = await request.json();

    // Validate required data
    if (!customerData || !customerData.customerData || !customerData.biometricData?.selfie) {
      return NextResponse.json(
        { error: 'Missing required customer data or selfie' },
        { status: 400 }
      );
    }

    console.log('Starting IDMission biometric enrollment...');

    // Step 1: Generate IDMission token
    console.log('Generating IDMission token...');
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      throw new Error(`Failed to generate token: ${tokenError.error}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('IDMission token generated successfully');

    // Step 2: Enroll biometrics with IDMission
    console.log('Enrolling biometrics with IDMission...');
    
    const enrollmentPayload = {
      customerData: {
        customerId: customerData.customerData.customerId,
        personalData: {
          uniqueNumber: customerData.customerData.personalData.uniqueNumber || customerData.customerData.customerId,
          name: customerData.customerData.personalData.name,
          phone: customerData.customerData.personalData.phone || "",
          phoneCountryCode: customerData.customerData.personalData.phoneCountryCode || "",
          email: customerData.customerData.personalData.email,
          dob: customerData.customerData.personalData.dob || "",
          gender: customerData.customerData.personalData.gender || "",
          addressLine1: customerData.customerData.personalData.addressLine1 || "",
          addressLine2: customerData.customerData.personalData.addressLine2 || "",
          city: customerData.customerData.personalData.city || "",
          district: customerData.customerData.personalData.district || "",
          postalCode: customerData.customerData.personalData.postalCode || "",
          country: customerData.customerData.personalData.country || ""
        },
        biometricData: {
          selfie: customerData.biometricData.selfie
        }
      },
      additionalData: {
        uniqueRequestId: additionalData?.uniqueRequestId || Date.now().toString(),
        clientRequestID: additionalData?.clientRequestID || Date.now().toString()
      },
      companyData: {
        companyId: companyData?.companyId || 12345
      }
    };

    console.log('Enrollment payload prepared:', {
      customerId: enrollmentPayload.customerData.customerId,
      name: enrollmentPayload.customerData.personalData.name,
      email: enrollmentPayload.customerData.personalData.email,
      selfieSize: enrollmentPayload.customerData.biometricData.selfie.length
    });

    const enrollmentResponse = await fetch('https://api.idmission.com/v4/customer/enroll-biometrics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrollmentPayload),
    });

    if (!enrollmentResponse.ok) {
      const errorText = await enrollmentResponse.text();
      console.error('IDMission enrollment error:', enrollmentResponse.status, errorText);
      throw new Error(`IDMission enrollment failed: ${enrollmentResponse.status} ${errorText}`);
    }

    const enrollmentResult = await enrollmentResponse.json();
    
    console.log('IDMission enrollment response:', enrollmentResult);

    return NextResponse.json({
      success: true,
      message: 'Biometric enrollment completed successfully',
      idmissionResponse: enrollmentResult,
      customerId: customerData.customerData.customerId
    });

  } catch (error) {
    console.error('Error in IDMission enrollment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete IDMission enrollment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
