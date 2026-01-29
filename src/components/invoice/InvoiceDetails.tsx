import { User, Calendar, MapPin, Stethoscope } from 'lucide-react';

interface Props {
  data: {
    patientName: string;
    patientPhone: string;
    doctorName: string;
    specialization: string;
    hospitalName: string;
    hospitalAddress: string;
    date: string;
    time: string;
  };
}

export default function InvoiceDetails({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Patient Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Details</h3>
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
            <User size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{data.patientName}</p>
            <p className="text-sm text-slate-500">{data.patientPhone}</p>
          </div>
        </div>
      </div>

      {/* Appointment Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Appointment Details</h3>
        
        {/* Doctor */}
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
            <Stethoscope size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{data.doctorName}</p>
            <p className="text-sm text-slate-500">{data.specialization}</p>
          </div>
        </div>

        {/* Hospital */}
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
            <MapPin size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{data.hospitalName}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{data.hospitalAddress}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
            <Calendar size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{data.date}</p>
            <p className="text-sm text-slate-500">{data.time} (Estimated)</p>
          </div>
        </div>
      </div>
    </div>
  );
}