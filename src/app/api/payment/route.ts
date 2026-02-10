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
