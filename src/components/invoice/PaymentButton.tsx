'use client';

import { useState } from 'react';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { PaymentResponse } from '@/types/payment';
import PayHereFormSubmitter from '@/components/payment/PayHereFormSubmitter';
import { toast } from 'react-hot-toast';

interface Props {
  amount: number;
  appointmentId: string;
}

export default function PaymentButton({ amount, appointmentId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Initiating payment...');

    try {
      // Prepare payment data
      const paymentData = {
        bookingId: appointmentId,
        userId: 'guest-user', // Replace with actual user ID when available
        amount: amount,
        currency: 'LKR',
        paymentMethod: 'card',
        psp: 'payhere',
        metadata: {
          appointmentDate: new Date().toISOString().split('T')[0],
          patientName: 'Patient', // This would come from appointment data
        },
      };

      // Create payment through backend
      const response = await paymentService.createPayment(paymentData);
      
      toast.success('Redirecting to payment gateway...', { id: toastId });
      
      // Set payment response to trigger PayHere form submission
      setPaymentResponse(response);

    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error(error.message || 'Failed to initiate payment', { id: toastId });
      setIsLoading(false);
    }
  };

  // If payment response is available, show PayHere form submitter
  if (paymentResponse) {
    return <PayHereFormSubmitter paymentResponse={paymentResponse} />;
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {isLoading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <Lock size={20} className="opacity-80" />
          <span>Pay LKR {amount.toFixed(2)} Now</span>
          <CreditCard size={20} className="opacity-80" />
        </>
      )}
    </button>
  );
}
