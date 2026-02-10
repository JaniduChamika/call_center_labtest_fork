import { PaymentRequest, PaymentResponse } from '@/types/payment';

export const paymentService = {
  /**
   * Create a new payment with PayHere
   * @param paymentData Payment request data
   * @returns Payment response with PayHere form data
   */
  createPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      // Call the Next.js API route instead of external API directly (to avoid CORS)
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Payment Service Error:', error);
      throw new Error(error.message || 'Payment creation failed');
    }
  },

  /**
   * Get payment status by payment ID
   * @param paymentId Payment ID
   * @returns Payment response
   */
  getPaymentStatus: async (paymentId: string): Promise<PaymentResponse> => {
    try {
      const response = await fetch(`/api/payment?paymentId=${paymentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Payment Status Error:', error);
      throw new Error(error.message || 'Failed to get payment status');
    }
  },
};
