import { NextRequest, NextResponse } from 'next/server';
import { SESDiagnostics } from '@/utils/sesDiagnostics';

export async function GET(request: NextRequest) {
  try {
    // Get configuration summary
    const configSummary = SESDiagnostics.getConfigSummary();
    
    // Check if configuration is valid
    const isValid = SESDiagnostics.quickCheck();
    
    return NextResponse.json({
      success: true,
      status: configSummary.status,
      message: configSummary.message,
      details: configSummary.details,
      isValid,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking SES status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check SES status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Run full diagnostics
    const diagnostics = await SESDiagnostics.runDiagnostics();
    
    return NextResponse.json({
      success: true,
      message: 'Diagnostics completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running SES diagnostics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run SES diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
