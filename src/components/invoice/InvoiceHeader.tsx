import { FileText, Clock } from 'lucide-react';

interface Props {
  appointmentId: string;
  status: string;
}

export default function InvoiceHeader({ appointmentId, status }: Props) {
  // Simple status badge helper
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending_payment': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 sm:p-10 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <FileText size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">Invoice / Booking Receipt</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            #{appointmentId}
          </h1>
        </div>
        
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(status)} shadow-sm`}>
          {status.replace('_', ' ').toUpperCase()}
        </div>
      </div>
    </div>
  );
}