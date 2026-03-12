import { NextRequest, NextResponse } from 'next/server';

const PAYMENT_API_BASE = 'https://dpdlab1.slt.lk:8645/payment/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to the payment API
    const response = await fetch(`${PAYMENT_API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Payment creation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Payment API Proxy Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}











// import { NextRequest, NextResponse } from 'next/server';

// const PAYMENT_API_BASE = 'https://dpdlab1.slt.lk:8645/payment/api/v1';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { bookingId } = body;

//     // 1. Attempt to create the payment
//     const response = await fetch(`${PAYMENT_API_BASE}/payments`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body),
//     });

//     const responseData = await response.json();

//     // 2. If it succeeds, return the data
//     if (response.ok) {
//       return NextResponse.json(responseData);
//     }

//     // 3. Handle the 409 Conflict specifically
//     if (response.status === 409 || responseData.message?.includes('Unique constraint')) {
//       console.log(`Conflict detected for booking: ${bookingId}. Handling existing record...`);

//       // Try to find the existing payment status to resume or show status
//       // Note: If /payments/booking/${bookingId} doesn't work, we must rely on the 409 error data
//       // or redirect the user to a "check status" flow.
//       const lookup = await fetch(`${PAYMENT_API_BASE}/payments/booking/${bookingId}`);
      
//       if (lookup.ok) {
//         const existingData = await lookup.json();
//         return NextResponse.json(existingData);
//       }

//       // If lookup fails, we return a cleaner message to the user
//       return NextResponse.json(
//         { 
//           message: 'A payment session for this booking already exists. Please check your email or payment status.',
//           isExisting: true 
//         },
//         { status: 409 }
//       );
//     }

//     // 4. Handle other errors
//     return NextResponse.json(
//       { message: responseData.message || 'Payment processing failed' },
//       { status: response.status }
//     );

//   } catch (error: any) {
//     console.error('Payment API Proxy Error:', error);
//     return NextResponse.json(
//       { message: 'Connection to payment gateway failed.' },
//       { status: 500 }
//     );
//   }
// }


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { message: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${PAYMENT_API_BASE}/payments/${paymentId}`);

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch payment status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Payment Status Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
