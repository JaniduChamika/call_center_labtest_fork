// "use client";

// import { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import InvoiceHeader from "@/components/invoice/InvoiceHeader";
// import InvoiceDetails from "@/components/invoice/InvoiceDetails";
// import InvoiceTotal from "@/components/invoice/InvoiceTotal";
// import PaymentButton from "@/components/invoice/PaymentButton";


// // Mock data type (keep same)
// interface InvoiceData {
//   // ... (keep your existing interface)
//   appointmentId: string;
//   date: string;
//   time: string;
//   doctorName: string;
//   specialization: string;
//   hospitalName: string;
//   hospitalAddress: string;
//   patientName: string;
//   patientPhone: string;
//   consultantFee: number;
//   hospitalFee: number;
//   totalAmount: number;
//   status: string;
// }

// // 1. Create a separate component for the content that uses searchParams
// function InvoiceContent() {
//   const searchParams = useSearchParams();
//   const appointmentId = searchParams.get('id');
//   const [data, setData] = useState<InvoiceData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulate API fetch (Keep your existing logic)
//     if (appointmentId) {
//       setTimeout(() => {
//         setData({
//           appointmentId: appointmentId,
//           date: '2025-12-24',
//           time: '10:00 AM',
//           doctorName: 'Dr. Anura Silva',
//           specialization: 'Cardiology',
//           hospitalName: 'Nawaloka Hospital',
//           hospitalAddress: '23, Deshamanya H K Dharmadasa Mw, Colombo',
//           patientName: 'Janidu Chamika',
//           patientPhone: '0772119238',
//           consultantFee: 2500.00,
//           hospitalFee: 200.00,
//           totalAmount: 2700.00,
//           status: 'pending_payment'
//         });
//         setLoading(false);
//       }, 1000);
//     } else {
//         setLoading(false);
//     }
//   }, [appointmentId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-600">
//         <p>Invoice not found or invalid link.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
//         <InvoiceHeader appointmentId={data.appointmentId} status={data.status} />
        
//         <div className="p-6 sm:p-10 space-y-8">
//           <InvoiceDetails data={data} />
          
//           <div className="border-t border-gray-100 pt-8">
//             <InvoiceTotal 
//               consultantFee={data.consultantFee} 
//               hospitalFee={data.hospitalFee} 
//               total={data.totalAmount} 
//             />
//           </div>

//           <div className="pt-6">
//             <PaymentButton amount={data.totalAmount} appointmentId={data.appointmentId} />
//             <p className="text-center text-xs text-slate-400 mt-4">
//               Secure payment processed by PayHere. By paying, you agree to our Terms of Service.
//             </p>
//           </div>
//         </div>
        
//         <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
//           <p className="text-xs text-slate-500">
//             Questions? Contact support at <a href="mailto:support@echannel.com" className="text-blue-600 hover:underline">support@echannel.com</a> or call 1990.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // 2. Export the main page component wrapped in Suspense
// export default function InvoicePage() {
//   return (
//     <Suspense fallback={<div>Loading invoice...</div>}>
//       <InvoiceContent />
//     </Suspense>
//   );
// }




"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import InvoiceDetails from "@/components/invoice/InvoiceDetails";
import InvoiceTotal from "@/components/invoice/InvoiceTotal";
import PaymentButton from "@/components/invoice/PaymentButton";
import { toast } from "react-hot-toast";

// 1. Updated Interface to include email for the payment gateway
interface InvoiceData {
  appointmentId: string;
  date: string;
  time: string;
  doctorName: string;
  specialization: string;
  hospitalName: string;
  hospitalAddress: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null; // Added
  consultantFee: number;
  hospitalFee: number;
  totalAmount: number;
  status: string;
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchInvoice() {
    if (!appointmentId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/appointments/${appointmentId}`);
const json = await response.json();
const apt = json.appointment;

setData({
  appointmentId: apt.public_id,
  date: new Date(apt.start_time).toLocaleDateString('en-GB'),
  time: new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  doctorName: `Dr. ${apt.doctors.name}`,
  specialization: apt.doctors.specializations?.name || "Consultant",
  hospitalName: apt.hospitals.name,
  hospitalAddress: apt.hospitals.address || "Sri Lanka",
  
  // FIXED: Mapping actual patient data from Saumi Amaya's record
  patientName: apt.patients.name, 
  patientPhone: apt.patients.phone_number,
  patientEmail: apt.patients.email,
  
  consultantFee: Number(apt.doctors.consultant_fee) || 0,
  hospitalFee: 200.00, 
  totalAmount: (Number(apt.doctors.consultant_fee) || 0) + 200.00,
  status: apt.status
});
    } catch (err) {
      toast.error("Error loading patient details");
    } finally {
      setLoading(false);
    }
  }
  fetchInvoice();
}, [appointmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-600 font-medium">
        <div className="text-center">
          <p className="text-xl">Invoice not found.</p>
          <p className="text-sm opacity-60">Please check your link or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <InvoiceHeader appointmentId={data.appointmentId} status={data.status} />
        
        <div className="p-6 sm:p-10 space-y-8">
          <InvoiceDetails data={data} />
          
          <div className="border-t border-gray-100 pt-8">
            <InvoiceTotal 
              consultantFee={data.consultantFee} 
              hospitalFee={data.hospitalFee} 
              total={data.totalAmount} 
            />
          </div>

          <div className="pt-6">
            {/* 3. Pass real patient details to the PaymentButton */}
            {data.status === 'pending_payment' ? (
              <PaymentButton 
                amount={data.totalAmount} 
                appointmentId={data.appointmentId} 
                patientName={data.patientName}
                patientPhone={data.patientPhone}
                patientEmail={data.patientEmail}
              />
            ) : (
              <div className={`p-4 rounded-xl text-center font-bold border uppercase tracking-widest ${
                data.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                Payment {data.status.replace('_', ' ')}
              </div>
            )}
            <p className="text-center text-xs text-slate-400 mt-4">
              Secure payment processed by PayHere. By paying, you agree to our Terms of Service.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-slate-500">
            Questions? Contact support at <a href="mailto:support@echannel.com" className="text-blue-600 hover:underline">support@echannel.com</a> or call 1990.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading invoice...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}