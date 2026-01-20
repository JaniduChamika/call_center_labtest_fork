'use client';

import { CheckCircle } from 'lucide-react';
// Assuming TimeSlot interface has start_time and end_time now
// If not, update it in your types or define locally here for now
interface TimeSlot {
  slot?: string; // Keep optional for backward compatibility if needed
  start_time: string; // "14:00"
  end_time: string;   // "14:10"
  status: "Available" | "Reserved";
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime?: string;
  onSelect: (time: string) => void;
  isLoading?: boolean;
}

export default function TimeSlotGrid({ slots, selectedTime, onSelect, isLoading }: TimeSlotGridProps) {
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 w-20 bg-slate-200 rounded mb-3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-16 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p>No available slots for this date.</p>
      </div>
    );
  }

  // Helper to transform API slots to UI structure
  const transformSlotsToUI = (apiSlots: TimeSlot[]) => {
    return apiSlots.map((slot, index) => {
      // Use start_time directly. Ensure format is HH:mm
      const start = slot.start_time; 
      const end = slot.end_time;
      
      const hour = parseInt(start.split(':')[0]);
      
      let period = "Morning";
      if (hour >= 12) period = "Afternoon";
      if (hour >= 17) period = "Evening";

      return {
        id: index,
        time: start, // "14:00"
        end: end,
        period: period,
        status: slot.status === "Reserved" ? "booked" : "available"
      };
    });
  };

  const uiSlots = transformSlotsToUI(slots);
  const periods = ["Morning", "Afternoon", "Evening"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {periods.map((period) => {
        const periodSlots = uiSlots.filter((slot) => slot.period === period);
        
        if (periodSlots.length === 0) return null;

        return (
          <div key={period}>
            <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider pl-1">
              {period}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {periodSlots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={slot.status === "booked"}
                  onClick={() => onSelect(slot.time)} // Passing start time as ID
                  className={`
                    relative p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200
                    ${
                      selectedTime === slot.time && slot.status !== "booked"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200"
                        : ""
                    }
                    ${
                      slot.status === "booked"
                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : ""
                    }
                    ${
                      slot.status === "available" && selectedTime !== slot.time
                        ? "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600"
                        : ""
                    }
                  `}
                >
                  <span className="font-bold text-sm">{slot.time}</span>
                  
                  {slot.status === "booked" ? (
                    <span className="text-[10px] text-red-400 font-medium">Booked</span>
                  ) : (
                    <span className={`text-[10px] font-medium ${selectedTime === slot.time ? "text-blue-100" : "text-emerald-600"}`}>
                      Available
                    </span>
                  )}

                  {selectedTime === slot.time && (
                    <div className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full p-0.5 shadow-sm">
                      <CheckCircle size={16} fill="currentColor" className="text-white bg-blue-600 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}