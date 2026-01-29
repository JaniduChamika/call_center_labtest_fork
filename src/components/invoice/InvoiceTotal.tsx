interface Props {
  consultantFee: number;
  hospitalFee: number;
  total: number;
}

export default function InvoiceTotal({ consultantFee, hospitalFee, total }: Props) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Doctor / Consultant Fee</span>
          <span className="font-medium">LKR {consultantFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Hospital / Booking Fee</span>
          <span className="font-medium">LKR {hospitalFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Service Charges & Tax</span>
          <span className="font-medium">LKR 0.00</span>
        </div>
      </div>
      
      <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
        <span className="font-bold text-lg text-slate-800">Total Payable</span>
        <span className="font-bold text-2xl text-blue-700">LKR {total.toFixed(2)}</span>
      </div>
    </div>
  );
}