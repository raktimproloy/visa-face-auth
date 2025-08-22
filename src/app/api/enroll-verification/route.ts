import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    console.log('Proxying enrollment verification request for customerId:', customerId);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const enrollmentResponse = await fetch('https://exsfb7ym8h.execute-api.us-east-1.amazonaws.com/dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ customerId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!enrollmentResponse.ok) {
        throw new Error(`External API failed with status: ${enrollmentResponse.status}`);
      }

      const enrollmentResult = await enrollmentResponse.json();
      console.log('External enrollment API response:', enrollmentResult);

      // Return the response as-is to maintain the same structure
      return NextResponse.json(enrollmentResult);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.error('Enrollment API request timed out after 30 seconds');
        return NextResponse.json(
          { error: 'Enrollment verification timed out. Please try again.' },
          { status: 408 }
        );
      } else if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
        console.error('Network error or CORS issue:', fetchError);
        return NextResponse.json(
          { error: 'Network error. Please check your connection and try again.' },
          { status: 503 }
        );
      } else {
        console.error('Fetch error:', fetchError);
        return NextResponse.json(
          { error: 'Failed to communicate with enrollment service. Please try again.' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Enrollment verification proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process enrollment verification request' },
      { status: 500 }
    );
  }
}
