'use client';

import { CreditCard, Lock } from 'lucide-react';

interface Props {
  amount: number;
  appointmentId: string;
}

export default function PaymentButton({ amount, appointmentId }: Props) {
  const handlePayment = () => {
    // In production, integrate with PayHere/Stripe/etc.
    // For now, simple alert or redirect
    alert(`Redirecting to payment gateway for Order #${appointmentId} with amount LKR ${amount}`);
    // window.location.href = `https://pay.example.com?order=${appointmentId}`;
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
    >
      <Lock size={20} className="opacity-80" />
      <span>Pay LKR {amount.toFixed(2)} Now</span>
      <CreditCard size={20} className="opacity-80" />
    </button>
  );
}