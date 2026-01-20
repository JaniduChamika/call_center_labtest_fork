"use client";

import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
// 1. Import Toast components
import { toast, Toaster } from "react-hot-toast";
import {
  Search,
  User,
  Clock,
  Calendar,
  CheckCircle,
  MapPin,
  ArrowRight,
  Filter,
  Stethoscope,
  Building2,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
} from "lucide-react";
import { Doctor, Specialization, Hospital } from "@/types";
import { specializationService } from "@/services/specializationService";
import { hospitalService } from "@/services/hospitalService";
import { doctorService } from "@/services/doctorService";
import DatePicker from "@/components/Widget/DatePicker";
import {
  createDateTime,
  getAvailableHospitals,
  getFutureDates,
} from "@/lib/utils";
import HospitalSelector from "@/components/Widget/HospitalSelector";
import { format } from "date-fns";
import TimeSlotGrid from "@/components/Widget/TimeSlotGrid";
import {
  appointmentService,
  CreateAppointmentPayload,
} from "@/services/appointmentService";

export default function BulkBookingPage() {
  // --- 1. Data State ---
  const [specialization, setSpecialization] = useState<Specialization[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState("");

  // --- 2. UI State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 3. Selection State ---
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // Multi-select state
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]); 
  
  const [selectedAppointmentHospital, setSelectedAppointmentHospital] = useState<Hospital | null>(null);

  // Appointment Object (Base details only)
  const [baseAppointment, setBaseAppointment] = useState({
    doctor_id: "",
    hospital_id: "",
  });

  // --- 4. Filter State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("-1");
  const [selectedHospital, setSelectedHospital] = useState("-1");

  // --- 5. Patient Form State (CLEANED) ---
  const [patientDetails, setPatientDetails] = useState({
    name: "", 
    nic: "",
    phone_number: "",
    email: "",
    refundProtection: false,
  });

  // --- 6. Initial Data Fetching ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [specData, hospData, docData] = await Promise.all([
          specializationService.getAll(),
          hospitalService.getAll(),
          doctorService.getAll(),
        ]);

        setSpecialization(specData.specializations);
        setHospitals(hospData.hospitals);
        setDoctors(docData.doctors);
      } catch (err: any) {
        setError(err.message);
        console.error("Initialization Error:", err);
        // Toast: System Data Error
        toast.error("Failed to load system data. Please refresh.");
      }
    };

    loadData();
  }, []);

  // --- 7. Filtering Logic ---
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "-1" || doc.specializations?.specialization_id === selectedSpecialty;
      const matchesHospital = selectedHospital === "-1" || doc.doctor_schedules?.some((schedule) => schedule.hospitals?.hospital_id === selectedHospital);
      return matchesSearch && matchesSpecialty && matchesHospital;
    });
  }, [doctors, searchQuery, selectedSpecialty, selectedHospital]);

  // --- 8. Schedule Logic ---
  const [allowedDays, setAllowedDays] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAppointmentHospital && selectedDoctor?.doctor_schedules) {
      const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const hospitalSchedules = selectedDoctor.doctor_schedules.filter(
        (schedule) => schedule.hospitals?.hospital_id === selectedAppointmentHospital.hospital_id
      );
      const days = hospitalSchedules.map((schedule) => daysMap[schedule.day_of_week]);
      setAllowedDays([...new Set(days)]);
    } else {
      setAllowedDays([]);
    }
  }, [selectedAppointmentHospital, selectedDoctor]);

  // --- 9. Availability Slot Fetching ---
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const fetchSlots = async () => {
    if (!selectedDate || !selectedAppointmentHospital || !selectedDoctor) {
      setTimeSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    try {
      const dateStr = typeof selectedDate === "string" ? selectedDate : format(selectedDate, "yyyy-MM-dd");
      const response = await doctorService.getAvailability(
        selectedDoctor.public_id,
        selectedAppointmentHospital.public_id,
        dateStr
      );
      setTimeSlots(response.slots || []);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setTimeSlots([]);
      // Toast: Slot Fetch Error
      toast.error("Could not retrieve available time slots.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate, selectedAppointmentHospital]);

  // --- Toggle Logic for Multi-Select ---
  const toggleTimeSlot = (time: string) => {
    setSelectedTimes((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time); // Remove if exists
      } else {
        return [...prev, time]; // Add if new
      }
    });
  };

  // --- 10. Booking Submission (Fixed for Bulk Logic) ---
  const handleConfirmBooking = async () => {
    // Validation
    if (!patientDetails.name || !patientDetails.phone_number || !patientDetails.nic) {
      // Toast: Form Validation
      toast.error("Please fill in Name, NIC, and Phone Number.");
      return;
    }
    if (!baseAppointment.doctor_id || !baseAppointment.hospital_id || selectedTimes.length === 0) {
      // Toast: Selection Validation
      toast.error("Booking incomplete. Please select a doctor and at least one time slot.");
      return;
    }

    setIsSubmitting(true);
    // Toast: Loading Start
    const toastId = toast.loading(`Processing ${selectedTimes.length} appointments...`);

    try {
      // 1. Separate the first slot from the others
      const [firstSlot, ...remainingSlots] = selectedTimes;

      // 2. Create the FIRST appointment (This creates the patient in the DB)
      const firstPayload: CreateAppointmentPayload = {
        patient_id: null, // Null tells backend to create a NEW patient
        patient_details: patientDetails,
        appointment: {
          doctor_id: baseAppointment.doctor_id,
          hospital_id: baseAppointment.hospital_id,
          start_time: createDateTime(selectedDate, firstSlot),
        },
      };

      const firstResponse = await appointmentService.create(firstPayload);
      const tickets = [firstResponse.appointment.public_id];
      
      const newPatientId = firstResponse.patient?.patient_id || firstResponse.appointment?.patient_id;

      if (!newPatientId && remainingSlots.length > 0) {
        throw new Error("Could not retrieve Patient ID after first booking. Cannot complete bulk booking.");
      }

      // 3. Create REMAINING appointments using the EXISTING patient ID
      if (remainingSlots.length > 0) {
        const remainingPromises = remainingSlots.map((time) => {
          const payload: CreateAppointmentPayload = {
            patient_id: newPatientId, 
            patient_details: patientDetails, 
            appointment: {
              doctor_id: baseAppointment.doctor_id,
              hospital_id: baseAppointment.hospital_id,
              start_time: createDateTime(selectedDate, time),
            },
          };
          return appointmentService.create(payload);
        });

        const remainingResponses = await Promise.all(remainingPromises);
        remainingResponses.forEach(r => tickets.push(r.appointment.public_id));
      }
      
      // Toast: Success (Updates the loading toast)
      toast.success(
        `Success! ${tickets.length} appointments booked.`, 
        { id: toastId, duration: 4000 }
      );
      
      // Delay reload slightly to let user read the toast
      setTimeout(() => {
        window.location.reload(); 
      }, 2000);

    } catch (error: any) {
      console.error("Booking Error:", error);
      // Toast: Error (Updates the loading toast)
      toast.error(
        error.message || "Failed to complete bulk booking.", 
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
        
      {/* Toast Container Configured here */}
      <Toaster position="top-right" reverseOrder={false} />

      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <Header title="Bulk Booking Dashboard" userName="Agent Smith" notificationCount={3} />

        {/* Progress Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -z-10 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>

              {[
                { id: 1, label: "Doctor", icon: <User size={16} /> },
                { id: 2, label: "Multi-Slot", icon: <Layers size={16} /> },
                { id: 3, label: "Patient", icon: <User size={16} /> },
                { id: 4, label: "Confirm", icon: <CheckCircle size={16} /> },
              ].map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center bg-white px-2">
                    <div
                      className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                          ${isActive ? "border-indigo-600 bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200" : ""}
                          ${isCompleted ? "border-indigo-600 bg-white text-indigo-600" : ""}
                          ${!isActive && !isCompleted ? "border-slate-200 bg-white text-slate-300" : ""}
                        `}
                    >
                      {isCompleted ? <CheckCircle size={20} fill="currentColor" className="text-white bg-indigo-600 rounded-full" /> : step.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase mt-2 transition-colors ${isActive ? "text-indigo-900" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 pb-20">
          
          {/* --- Step 1: Find Doctor --- */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Bulk Appointment Booking</h2>
                <p className="text-slate-500">Find a doctor to schedule multiple sessions.</p>
              </div>

              {/* Filters Section */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-slate-400 group-focus-within:text-blue-600" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search doctor by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  
                   <div className="md:col-span-3 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope size={18} className="text-slate-400" />
                    </div>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 appearance-none"
                    >
                      <option value="-1">All Specialties</option>
                      {specialization.map((spec) => (
                        <option key={spec.specialization_id} value={spec.specialization_id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                   <div className="md:col-span-3 relative">
                      <select
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      className="w-full pl-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 appearance-none"
                    >
                      <option value="-1">All Hospitals</option>
                      {hospitals.map((host) => (
                        <option key={host.hospital_id} value={host.hospital_id}>{host.name}</option>
                      ))}
                    </select>
                   </div>
                   <div className="md:col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg w-full justify-center">
                      <Filter size={16} />
                      <span>{filteredDoctors.length} Found</span>
                    </div>
                  </div>
                 </div>
              </div>

              {/* Doctor List */}
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.doctor_id} className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200">
                        {doctor.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{doctor.name}</h4>
                        <p className="text-indigo-600 text-sm font-medium mb-1">{doctor.specializations?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Fee per slot</p>
                          <p className="text-xl font-bold text-slate-800">Rs. {doctor.consultant_fee}</p>
                        </div>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setBaseAppointment((prev) => ({ ...prev, doctor_id: doctor.doctor_id }));
                          setSelectedDate("");
                          setSelectedTimes([]);
                          setSelectedAppointmentHospital(null);
                          setCurrentStep(2);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-transform active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-200"
                      >
                        Select <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Step 2: Choose Multiple Times --- */}
          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Select Time Slots</h2>
                <p className="text-slate-500">You can select multiple time slots for this date.</p>
              </div>

              {/* Doctor Summary Header */}
               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl flex items-center gap-4 mb-8 border border-indigo-100">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {selectedDoctor?.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                <div>
                  <h4 className="font-bold text-slate-800">{selectedDoctor?.name}</h4>
                  <p className="text-sm text-slate-600">{selectedDoctor?.specializations?.name}</p>
                </div>
                <div className="ml-auto text-right">
                    <span className="block text-xs text-slate-500">Selected Slots</span>
                    <span className="text-2xl font-bold text-indigo-700">{selectedTimes.length}</span>
                </div>
              </div>

              <HospitalSelector
                hospitals={getAvailableHospitals(selectedDoctor)}
                selectedHospitalId={selectedAppointmentHospital?.hospital_id}
                onSelect={(hospital) => {
                  setSelectedAppointmentHospital(hospital);
                  setBaseAppointment((prev) => ({ ...prev, hospital_id: hospital.hospital_id }));
                  setSelectedDate("");
                  setSelectedTimes([]);
                  setTimeSlots([]);
                }}
              />

              <div className={!selectedAppointmentHospital ? "opacity-50 pointer-events-none mt-6" : "mt-6"}>
                <DatePicker
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    setSelectedTimes([]);
                  }}
                  availableDates={getFutureDates(allowedDays, 14)}
                />
              </div>

              {selectedDate && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700">Available Slots</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Multi-Select Enabled</span>
                  </div>
                  
                  <TimeSlotGrid
                    slots={timeSlots}
                    isLoading={isLoadingSlots}
                    selectedTime={""} 
                    onSelect={(time) => toggleTimeSlot(time)}
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                      {selectedTimes.length > 0 ? selectedTimes.map(time => (
                          <div key={time} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-in zoom-in">
                              {time} 
                              <X size={14} className="cursor-pointer hover:text-red-200" onClick={() => toggleTimeSlot(time)} />
                          </div>
                      )) : (
                          <p className="text-sm text-slate-400 italic">No slots selected yet.</p>
                      )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-10 pt-6 border-t border-slate-100">
                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition">
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={selectedTimes.length === 0 || !selectedDate || !selectedAppointmentHospital}
                  className="flex-1 bg-indigo-900 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition"
                >
                  Continue ({selectedTimes.length} slots) <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* --- Step 3: Patient Info --- */}
          {currentStep === 3 && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Patient Details</h2>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100">
                {/* Cost Summary */}
                <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200">
                   <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Billing Summary</h4>
                   
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Fee per Slot</span>
                    <span className="font-semibold text-slate-700">Rs. {selectedDoctor?.consultant_fee}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Slots Selected</span>
                    <span className="font-semibold text-slate-700">x {selectedTimes.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2 font-medium text-slate-600">
                    <span>Subtotal</span>
                    <span>Rs. {(selectedDoctor?.consultant_fee || 0) * selectedTimes.length}</span>
                  </div>

                  {patientDetails.refundProtection && (
                    <div className="flex justify-between items-center mb-2 text-emerald-600">
                      <span className="text-sm flex items-center gap-1"><CheckCircle size={12} /> Refund Protection (x{selectedTimes.length})</span>
                      <span className="font-semibold">Rs. {250 * selectedTimes.length}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total Payable</span>
                    <span className="font-bold text-xl text-indigo-700">
                      Rs. {((selectedDoctor?.consultant_fee || 0) * selectedTimes.length) + (patientDetails.refundProtection ? (250 * selectedTimes.length) : 0)}
                    </span>
                  </div>
                </div>

                {/* Form Fields (UPDATED WITH PLACEHOLDERS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Patient Name </label>
                    <input 
                      type="text" 
                      placeholder="Name"
                      value={patientDetails.name} 
                      onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })} 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">NIC Number </label>
                    <input 
                      type="text" 
                      placeholder=" 200012345678"
                      value={patientDetails.nic} 
                      onChange={(e) => setPatientDetails({ ...patientDetails, nic: e.target.value })} 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300" 
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number </label>
                    <input 
                      type="tel" 
                      placeholder=" 0771234567"
                      value={patientDetails.phone_number} 
                      onChange={(e) => setPatientDetails({ ...patientDetails, phone_number: e.target.value })} 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300" 
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder=" user@example.com"
                      value={patientDetails.email} 
                      onChange={(e) => setPatientDetails({ ...patientDetails, email: e.target.value })} 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300" 
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button onClick={() => setCurrentStep(2)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition">Back</button>
                  <button onClick={() => setCurrentStep(4)} className="flex-1 bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    Review {selectedTimes.length} Bookings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Step 4: Confirm --- */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-indigo-900 p-8 text-center text-white">
                  <h2 className="text-2xl font-bold">Confirm Bulk Booking</h2>
                  <p className="text-indigo-200 text-sm mt-1">You are about to book {selectedTimes.length} appointments</p>
                </div>

                <div className="p-8">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4 pb-6 border-b border-dashed border-slate-200">
                    <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {selectedDoctor?.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Doctor</p>
                        <h3 className="text-lg font-bold text-slate-800">{selectedDoctor?.name}</h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                          <MapPin size={12} /> {selectedAppointmentHospital?.name}
                        </p>
                    </div>
                  </div>

                  {/* Selected Slots List */}
                  <div className="py-6 border-b border-dashed border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date</p>
                         <p className="font-bold text-slate-700">{typeof selectedDate === 'string' ? selectedDate : format(selectedDate, "MMM dd, yyyy")}</p>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Selected Times</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedTimes.sort().map(time => (
                            <span key={time} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-md text-sm font-mono font-medium">
                                {time}
                            </span>
                        ))}
                    </div>
                  </div>

                   {/* Patient Summary */}
                  <div className="py-6 border-b border-dashed border-slate-200 space-y-3">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Patient Information</p>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Name</span><span className="font-medium text-slate-800">{patientDetails.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">NIC</span><span className="font-medium text-slate-800">{patientDetails.nic}</span></div>
                  </div>

                  {/* Final Total */}
                  <div className="pt-6">
                    <div className="flex justify-between items-center mt-4 bg-slate-50 p-4 rounded-xl">
                      <span className="font-bold text-slate-700">Total Amount ({selectedTimes.length} slots)</span>
                      <span className="font-bold text-xl text-indigo-700">
                          Rs. {((selectedDoctor?.consultant_fee || 0) * selectedTimes.length) + (patientDetails.refundProtection ? (250 * selectedTimes.length) : 0)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button onClick={() => setCurrentStep(3)} className="py-3.5 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Edit Details</button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Processing..." : <>Confirm All <CheckCircle2 size={18} /></>}
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