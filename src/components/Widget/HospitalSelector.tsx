'use client';

import {  } from '@/types';
import { Hospital } from '@/types';
import { Building2, CheckCircle2 } from 'lucide-react';

// Define the shape of a hospital object (adjust based on your API response)


interface HospitalSelectorProps {
  hospitals: Hospital[];
  selectedHospitalId?: string;
  onSelect: (hospital: Hospital) => void;
}

export default function HospitalSelector({ 
  hospitals, 
  selectedHospitalId, 
  onSelect 
}: HospitalSelectorProps) {
  return (
    <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider pl-1">
        Select Hospital
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hospitals.map((hospital) => {
          const isSelected = selectedHospitalId === hospital.hospital_id;
          
          return (
            <button
              key={hospital.hospital_id}
              onClick={() => onSelect(hospital)}
              className={`
                relative p-4 rounded-xl border text-left transition-all duration-200 group
                ${isSelected 
                  ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm" 
                  : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500"}
                `}>
                  <Building2 size={20} />
                </div>
                
                <div>
                  <h4 className={`font-semibold ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                    {hospital.name}
                  </h4>
                  <p className={`text-sm ${isSelected ? "text-blue-600" : "text-slate-500"}`}>
                    {hospital.city}
                  </p>
                </div>
              </div>

              {/* Selection Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 text-blue-600">
                  <CheckCircle2 size={18}  className="text-white bg-blue-600 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}