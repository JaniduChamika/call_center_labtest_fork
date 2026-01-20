'use client';

import React, { useState, useMemo, useEffect } from "react";
// 1. UI Components
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { toast, Toaster } from "react-hot-toast";
import {
  Search, User, Clock, Calendar, CheckCircle, MapPin,
  ArrowRight, Filter, Stethoscope, Building2, AlertCircle, CheckCircle2
} from "lucide-react";

// 2. Types & Services (Ensure these paths match your project)
import { Doctor, Specialization, Hospital } from "@/types";
import { specializationService } from "@/services/specializationService";
import { hospitalService } from "@/services/hospitalService";
import { doctorService } from "@/services/doctorService";
import { appointmentService } from "@/services/appointmentService";

// 3. Utilities & Widgets
import DatePicker from "@/components/Widget/DatePicker";
import HospitalSelector from "@/components/Widget/HospitalSelector";
import TimeSlotGrid from "@/components/Widget/TimeSlotGrid";
import { createDateTime, getAvailableHospitals, getFutureDates } from "@/lib/utils";
import { format } from "date-fns";

export default function BookingPage() {
  // --- 1. Data State ---
  const [specialization, setSpecialization] = useState<Specialization[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // --- 2. UI State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 3. Selection State ---
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAppointmentHospital, setSelectedAppointmentHospital] = useState<Hospital | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // --- 4. Form Data (Payload Preparation) ---
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    nic: "",
    phone_number: "",
    email: "",
    refundProtection: false, // UI logic only
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("-1");
  const [selectedHospital, setSelectedHospital] = useState("-1");

  // --- 5. Initial Data Load ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [specData, hospData, docData] = await Promise.all([
          specializationService.getAll(),
          hospitalService.getAll(),
          doctorService.getAll(),
        ]);
        setSpecialization(specData.specializations || []);
        setHospitals(hospData.hospitals || []);
        setDoctors(docData.doctors || []);
      } catch (err: any) {
        console.error("Initialization Error:", err);
        toast.error("Failed to load system data. Please refresh.");
      }
    };
    loadData();
  }, []);

  // --- 6. Filtering Logic ---
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "-1" || String(doc.specialization_id) === selectedSpecialty;
      
      // Check if doctor works at the filtered hospital
      const matchesHospital = selectedHospital === "-1" || 
        doc.doctor_schedules?.some(s => String(s.hospital_id) === selectedHospital);

      return matchesSearch && matchesSpecialty && matchesHospital;
    });
  }, [doctors, searchQuery, selectedSpecialty, selectedHospital]);

  // --- 7. Schedule & Slots Logic ---
  const [allowedDays, setAllowedDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Determine allowed days based on Doctor + Hospital selection
  useEffect(() => {
    if (selectedAppointmentHospital && selectedDoctor?.doctor_schedules) {
      const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const hospitalSchedules = selectedDoctor.doctor_schedules.filter(
        (s) => s.hospital_id === selectedAppointmentHospital.hospital_id
      );
      setAllowedDays([...new Set(hospitalSchedules.map(s => daysMap[s.day_of_week]))]);
    } else {
      setAllowedDays([]);
    }
  }, [selectedAppointmentHospital, selectedDoctor]);

  // Fetch Slots when Date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedAppointmentHospital || !selectedDoctor) {
        setTimeSlots([]);
        return;
      }
      setIsLoadingSlots(true);
      try {
        const dateStr = typeof selectedDate === 'string' ? selectedDate : format(selectedDate, "yyyy-MM-dd");
        const response = await doctorService.getAvailability(
          selectedDoctor.public_id!,
          selectedAppointmentHospital.public_id!,
          dateStr
        );
        setTimeSlots(response.slots || []);
      } catch (error) {
        console.error("Slot Fetch Error:", error);
        toast.error("Could not retrieve time slots.");
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, selectedAppointmentHospital, selectedDoctor]);

  // --- 8. Final Submission ---
  const handleConfirmBooking = async () => {
    // 1. Validation
    if (!patientDetails.name || !patientDetails.phone_number || !patientDetails.nic) {
      toast.error("Please fill in Name, NIC, and Phone Number.");
      return;
    }
    if (!selectedDoctor || !selectedAppointmentHospital || !selectedDate || !selectedTime) {
      toast.error("Missing appointment details. Please restart.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing booking...");

    try {
      // 2. Construct Payload
      const startDateTime = createDateTime(selectedDate, selectedTime); // Ensure this returns ISO string or Date object
      
      const payload = {
        patient_id: null, // Logic: Let backend decide to create new or link existing
        patient_details: {
          name: patientDetails.name,
          nic: patientDetails.nic,
          phone_number: patientDetails.phone_number,
          email: patientDetails.email
        },
        appointment: {
          doctor_id: selectedDoctor.doctor_id,
          hospital_id: selectedAppointmentHospital.hospital_id,
          start_time: startDateTime
        }
      };

      // 3. API Call
      const response = await appointmentService.create(payload);

      // 4. Success
      toast.success(`Appointment Confirmed! Ref: ${response.appointment.public_id}`, { id: toastId, duration: 5000 });
      
      // Optional: Delay reload to show success message
      setTimeout(() => window.location.reload(), 2500);

    } catch (error: any) {
      console.error("Booking Error:", error);
      toast.error(error.message || "Booking failed.", { id: toastId });
      setIsSubmitting(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <Header title="New Appointment" />

        {/* Progress Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
            {[
              { id: 1, label: "Doctor", icon: <User size={16} /> },
              { id: 2, label: "Time", icon: <Clock size={16} /> },
              { id: 3, label: "Patient", icon: <User size={16} /> },
              { id: 4, label: "Confirm", icon: <CheckCircle size={16} /> },
            ].map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 
                    ${isActive ? "border-blue-600 bg-blue-600 text-white scale-110 shadow-lg" : ""}
                    ${isCompleted ? "border-blue-600 bg-white text-blue-600" : ""}
                    ${!isActive && !isCompleted ? "border-slate-200 bg-white text-slate-300" : ""}
                  `}>
                    {isCompleted ? <CheckCircle size={20} fill="currentColor" className="text-white bg-blue-600 rounded-full"/> : step.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase mt-2 ${isActive ? "text-blue-900" : "text-slate-400"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-8 pb-20 max-w-5xl mx-auto w-full">
          
          {/* STEP 1: SELECT DOCTOR */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input type="text" placeholder="Search doctor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                  </div>
                  <div className="md:col-span-3">
                    <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                      <option value="-1">All Specialties</option>
                      {specialization.map(s => <option key={Number(s.specialization_id)} value={String(s.specialization_id)}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <select value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                      <option value="-1">All Hospitals</option>
                      {hospitals.map(h => <option key={Number(h.hospital_id)} value={String(h.hospital_id)}>{h.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center bg-blue-50 rounded-lg text-blue-600 text-xs font-bold">
                    {filteredDoctors.length} Found
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
                  <div key={Number(doc.doctor_id)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
                        {doc.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{doc.name}</h4>
                        <p className="text-blue-600 text-sm">{doc.specializations?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Fee</p>
                        <p className="font-bold text-slate-800">LKR {doc.consultant_fee}</p>
                      </div>
                      <button onClick={() => {
                        setSelectedDoctor(doc);
                        // Reset subsequent steps
                        setSelectedAppointmentHospital(null);
                        setSelectedDate("");
                        setSelectedTime("");
                        setCurrentStep(2);
                      }} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                        Select <ArrowRight size={16}/>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-slate-400"><AlertCircle className="mx-auto mb-2"/>No doctors found.</div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT TIME */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {/* Summary Header */}
              <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {selectedDoctor?.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{selectedDoctor?.name}</h4>
                    <p className="text-xs text-blue-600">{selectedDoctor?.specializations?.name}</p>
                  </div>
                </div>
                <button onClick={() => setCurrentStep(1)} className="text-xs text-blue-600 underline">Change Doctor</button>
              </div>

              {/* Hospital Selector */}
              <HospitalSelector 
                hospitals={getAvailableHospitals(selectedDoctor)}
                selectedHospitalId={selectedAppointmentHospital?.hospital_id}
                onSelect={(h) => {
                  setSelectedAppointmentHospital(h);
                  setSelectedDate("");
                  setSelectedTime("");
                  setTimeSlots([]);
                }}
              />

              {/* Date & Time */}
              <div className={`transition-opacity duration-300 ${!selectedAppointmentHospital ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <DatePicker 
                  availableDates={getFutureDates(allowedDays, 14)} 
                  onDateChange={(d) => { setSelectedDate(d); setSelectedTime(""); }}
                />
                {selectedDate && (
                  <TimeSlotGrid 
                    slots={timeSlots} 
                    isLoading={isLoadingSlots} 
                    selectedTime={selectedTime} 
                    onSelect={setSelectedTime} 
                  />
                )}
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-200">
                 <button onClick={() => setCurrentStep(1)} className="text-slate-500 font-medium">Back</button>
                 <button 
                  onClick={() => setCurrentStep(3)} 
                  disabled={!selectedTime}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                 >
                   Continue Details
                 </button>
              </div>
            </div>
          )}

          {/* STEP 3: PATIENT INFO */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                 <h2 className="text-xl font-bold text-slate-800 mb-6">Patient Information</h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Patient Name</label>
                     <input type="text" value={patientDetails.name} onChange={e => setPatientDetails({...patientDetails, name: e.target.value})}
                       className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">NIC (Required)</label>
                     <input type="text" value={patientDetails.nic} onChange={e => setPatientDetails({...patientDetails, nic: e.target.value})}
                       className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                     <input type="tel" value={patientDetails.phone_number} onChange={e => setPatientDetails({...patientDetails, phone_number: e.target.value})}
                       className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Email (Optional)</label>
                     <input type="email" value={patientDetails.email} onChange={e => setPatientDetails({...patientDetails, email: e.target.value})}
                       className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                   </div>
                 </div>

                 {/* Refund Toggle */}
                 <div onClick={() => setPatientDetails({ ...patientDetails, refundProtection: !patientDetails.refundProtection })}
                   className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl flex gap-3 cursor-pointer hover:bg-blue-50 transition-colors mb-8">
                   <input type="checkbox" checked={patientDetails.refundProtection} readOnly className="mt-1"/>
                   <div>
                     <p className="text-sm font-bold text-slate-800">Refund Protection (+ LKR 250)</p>
                     <p className="text-xs text-slate-500">Full refund if cancelled 24h before.</p>
                   </div>
                 </div>

                 <div className="flex justify-between">
                   <button onClick={() => setCurrentStep(2)} className="text-slate-500 font-medium px-4">Back</button>
                   <button onClick={() => setCurrentStep(4)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700">Review & Confirm</button>
                 </div>
               </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {currentStep === 4 && (
            <div className="animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-900 p-6 text-center">
                   <h2 className="text-xl font-bold text-white">Confirm Booking</h2>
                   <p className="text-slate-400 text-sm">Review final details before processing</p>
                </div>
                <div className="p-8 space-y-6">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-dashed border-slate-200">
                     <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                       {selectedDoctor?.name.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-xs text-slate-400 font-bold uppercase">Doctor</p>
                       <h3 className="text-lg font-bold text-slate-800">{selectedDoctor?.name}</h3>
                       <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={12}/> {selectedAppointmentHospital?.name}</p>
                     </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-dashed border-slate-200">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Date</p>
                      <p className="font-semibold text-slate-800 mt-1">{typeof selectedDate === 'string' ? selectedDate : format(selectedDate, "MMM dd, yyyy")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase">Time</p>
                      <p className="font-semibold text-slate-800 mt-1">{selectedTime}</p>
                    </div>
                  </div>

                  {/* Patient Summary */}
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                     <div className="flex justify-between text-sm"><span className="text-slate-500">Patient</span><span className="font-medium">{patientDetails.name}</span></div>
                     <div className="flex justify-between text-sm"><span className="text-slate-500">NIC</span><span className="font-medium">{patientDetails.nic}</span></div>
                  </div>

                  {/* Pricing */}
                  <div className="flex justify-between items-center py-4">
                     <span className="font-bold text-slate-600">Total Payable</span>
                     <span className="text-2xl font-bold text-blue-600">
                       LKR {(selectedDoctor?.consultant_fee || 0) + (patientDetails.refundProtection ? 250 : 0)}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={() => setCurrentStep(3)} className="py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Edit</button>
                    <button onClick={handleConfirmBooking} disabled={isSubmitting} className="bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
                       {isSubmitting ? "Processing..." : <>Confirm <CheckCircle2 size={18}/></>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}