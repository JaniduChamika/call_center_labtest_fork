'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { PaymentResponse } from '@/types/payment';

interface Props {
  paymentResponse: PaymentResponse;
}

export default function PayHereFormSubmitter({ paymentResponse }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Auto-submit the form after component mounts
    if (formRef.current) {
      formRef.current.submit();
    }
  }, []);

  const { payhereForm } = paymentResponse;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md p-8">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Redirecting to PayHere...
        </h2>
        
        <p className="text-slate-600 mb-2">
          Please wait while we securely redirect you to the payment gateway.
        </p>
        
        <p className="text-sm text-slate-400 font-mono bg-slate-100 rounded-lg px-4 py-2 inline-block">
          Payment ID: {paymentResponse.id}
        </p>

        <div className="mt-6 text-xs text-slate-400">
          <p>Do not close this window or press the back button.</p>
        </div>
      </div>

      {/* Hidden form that auto-submits to PayHere */}
      <form
        ref={formRef}
        method="POST"
        action="https://sandbox.payhere.lk/pay/checkout"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="merchant_id" value={payhereForm.merchant_id} />
        <input type="hidden" name="return_url" value={payhereForm.return_url} />
        <input type="hidden" name="cancel_url" value={payhereForm.cancel_url} />
        <input type="hidden" name="notify_url" value={payhereForm.notify_url} />
        <input type="hidden" name="order_id" value={payhereForm.order_id} />
        <input type="hidden" name="items" value={payhereForm.items} />
        <input type="hidden" name="currency" value={payhereForm.currency} />
        <input type="hidden" name="amount" value={payhereForm.amount} />
        <input type="hidden" name="first_name" value={payhereForm.first_name} />
        <input type="hidden" name="last_name" value={payhereForm.last_name} />
        <input type="hidden" name="email" value={payhereForm.email} />
        <input type="hidden" name="phone" value={payhereForm.phone} />
        <input type="hidden" name="address" value={payhereForm.address} />
        <input type="hidden" name="city" value={payhereForm.city} />
        <input type="hidden" name="country" value={payhereForm.country} />
        <input type="hidden" name="hash" value={payhereForm.hash} />
        <input type="hidden" name="sandbox" value={payhereForm.sandbox} />
      </form>
    </div>
  );
}
