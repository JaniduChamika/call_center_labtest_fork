"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, isValid } from "date-fns";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  onDateChange?: (date: string) => void;
  availableDates?: Date[];
}

export default function DatePicker({
  onDateChange,
  availableDates = [],
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Mount & Initial Setup
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Handle 'availableDates' updates
  useEffect(() => {
    if (!isMounted) return;

    // If we have available dates...
    if (availableDates.length > 0) {
      // Check if the currently selected date is still valid (is it in the new list?)
      const isCurrentSelectionValid =
        selectedDate && availableDates.some((d) => isSameDay(d, selectedDate));

      // If no date selected OR current selection is invalid -> Auto-select the first available date
      if (!selectedDate || !isCurrentSelectionValid) {
        const firstAvailable = availableDates[0];
        setSelectedDate(firstAvailable);
        if (onDateChange) onDateChange(format(firstAvailable, "yyyy-MM-dd"));
      }
    }
    // If NO available dates (e.g. user deselected hospital), maybe clear selection?
    else {
      // Optional: setSelectedDate(undefined);
    }
  }, [availableDates, isMounted]); // Dependency on availableDates is key

  // 3. Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    if (onDateChange) onDateChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  if (!isMounted)
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse h-[88px]" />
    );

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <CalendarIcon size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Date</p>
            <p className="font-semibold text-slate-800">
              {selectedDate && isValid(selectedDate)
                ? format(selectedDate, "EEEE, dd MMM yyyy")
                : "Select Date"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          // Disable button if no dates available? Optional UX choice.
          // disabled={availableDates.length === 0}
          className={`text-sm border px-4 py-2 rounded-lg transition ${
            isOpen
              ? "bg-blue-50 border-blue-300 text-blue-600"
              : "border-slate-300 hover:bg-slate-50"
          }`}
        >
          {isOpen ? "Close" : "Change Date"}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            // Show the month of the first available date (User doesn't have to scroll)
            defaultMonth={availableDates[0] || new Date()}
            showOutsideDays
            disabled={(date) => {
              if (availableDates.length === 0) return true; // Disable all if none available
              return !availableDates.some((availableDate) =>
                isSameDay(date, availableDate)
              );
            }}
            modifiers={{
              available: availableDates,
            }}
            modifiersClassNames={{
              today: "text-blue-600 bg-blue-100 font-bold rounded-full",
              available:
                "bg-green-200 text-black font-medium hover:bg-green-500 rounded-full",
              selected: "bg-green-600 text-white hover:bg-blue-600",
            }}
            styles={{
              caption: { color: "#1e293b" },
              head_cell: { color: "#64748b" },
            }}
          />
        </div>
      )}
    </div>
  );
}
