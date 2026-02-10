import { apiClient } from './apiClient';
import { PaymentRequest, PaymentResponse } from '@/types/payment';

const PAYMENT_API_BASE = 'https://dpdlab1.slt.lk:8645/payment/api/v1';

export const paymentService = {
  /**
   * Create a new payment with PayHere
   * @param paymentData Payment request data
   * @returns Payment response with PayHere form data
   */
  createPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await fetch(`${PAYMENT_API_BASE}/payments`, {
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
      const response = await fetch(`${PAYMENT_API_BASE}/payments/${paymentId}`);
      
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
