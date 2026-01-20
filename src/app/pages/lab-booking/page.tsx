'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { 
  Search, FlaskConical, Building2, MapPin, ArrowRight, 
  CheckCircle2, Clock, Calendar, User, Mail, Phone, ChevronLeft
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const CATEGORIES = [ "ALL", "HEMATOLOGY", "BIOCHEMISTRY", "MICROBIOLOGY", "CYTOLOGY" ];

export default function LabBookingPage() {
  const [step, setStep] = useState(1);
  const [tests, setTests] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);

  // Selections
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingRef, setBookingRef] = useState(""); // Store Ref ID for Step 5
  
  // Form
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', age: '', gender: 'Male', date: '', time: '' });

  // 1. Fetch Tests
  useEffect(() => {
    fetch(`/api/lab/tests?category=${selectedCategory}&search=${searchQuery}`)
      .then(res => res.json())
      .then(data => setTests(data));
  }, [selectedCategory, searchQuery]);

  // 2. Fetch Labs (Step 2)
  useEffect(() => {
    if (step === 2 && labs.length === 0) {
      fetch('/api/labs').then(res => res.json()).then(data => setLabs(data));
    }
  }, [step]);

  // 3. Submit Handler
  const handleSubmit = async () => {
    const toastId = toast.loading('Processing Booking...');
    try {
      const res = await fetch('/api/lab/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: formData,
          testId: selectedTest.id,
          labId: selectedLab.lab_id,
          date: formData.date,
          time: formData.time
        })
      });
      
      if(!res.ok) throw new Error("Failed");
      const data = await res.json();
      
      toast.success('Booking Successful!', { id: toastId });
      setBookingRef(data.public_id); // Save Ref ID
      setStep(5); // Go to Success Screen
      
    } catch (e) {
      toast.error('Booking Failed. Please try again.', { id: toastId });
    }
  };

  // Helper for Price Formatting
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Toaster position="top-center" />
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <Header title="New Lab Request" />
        
        {/* Progress Stepper */}
        {step < 5 && (
          <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="flex justify-center gap-2 md:gap-8 py-4 px-4 overflow-x-auto">
              {[
                { id: 1, label: "Select Test" },
                { id: 2, label: "Select Lab" },
                { id: 3, label: "Details" },
                { id: 4, label: "Confirm" }
              ].map((s) => (
                <div key={s.id} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                  ${step === s.id ? 'bg-blue-600 text-white shadow-md' : 
                    step > s.id ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs 
                    ${step === s.id ? 'bg-white text-blue-600' : 
                      step > s.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {step > s.id ? <CheckCircle2 size={12}/> : s.id}
                  </span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full p-6 md:p-8 pb-20">
          
          {/* STEP 1: Select Test */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                 <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center px-4 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search className="text-slate-400 mr-3" size={20}/>
                    <input className="w-full py-3 outline-none bg-transparent text-sm font-medium" 
                      placeholder="Search for a test (e.g., FBC, Lipid)..." 
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                 </div>
                 <select className="border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-400 transition-colors" 
                    onChange={e => setSelectedCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tests.map(test => (
                  <div key={test.id} onClick={() => { setSelectedTest(test); setStep(2); }} 
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-500 cursor-pointer transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FlaskConical size={24} />
                        </div>
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider">
                          {test.code}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">{test.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-4">{test.category.replace('_', ' ')}</p>
                      <div className="flex items-end justify-between border-t border-slate-50 pt-3">
                        <span className="text-xs text-slate-400 font-medium">Fee</span>
                        <span className="text-xl font-bold text-slate-800">{formatPrice(test.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Lab */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <button onClick={() => setStep(1)} className="mb-6 flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
                <ChevronLeft size={16} className="mr-1"/> Back to Tests
              </button>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Select a Laboratory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {labs.map(lab => (
                  <div key={lab.lab_id} onClick={() => { setSelectedLab(lab); setStep(3); }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Building2 size={26} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{lab.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin size={14} className="text-slate-400"/> {lab.city}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight size={18}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Patient Form */}
          {step === 3 && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
              <button onClick={() => setStep(2)} className="mb-6 flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
                <ChevronLeft size={16} className="mr-1"/> Back to Labs
              </button>

              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                      3
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-slate-800">Patient Details</h2>
                      <p className="text-slate-500 text-sm">Please fill in the information below.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1 group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block group-focus-within:text-blue-600">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-blue-500" size={18}/>
                      <input className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium" 
                        placeholder="e.g. Amantha Perera" onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1 group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block group-focus-within:text-blue-600">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-blue-500" size={18}/>
                      <input className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium" 
                        placeholder="077xxxxxxx" onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>

                  <div className="col-span-2 group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block group-focus-within:text-blue-600">Email Address (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-blue-500" size={18}/>
                      <input type="email" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium" 
                        placeholder="name@example.com" onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Date</label>
                     <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" 
                        onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Preferred Time</label>
                     <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" 
                        onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>

                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age</label>
                    <input type="number" placeholder="Years" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" 
                      onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>

                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" 
                      onChange={e => setFormData({...formData, gender: e.target.value})}>
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-10">
                  <button onClick={() => setStep(4)} className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2">
                    Review Details <ArrowRight size={20}/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm */}
          {step === 4 && (
            <div className="max-w-lg mx-auto animate-in zoom-in-95 duration-500">
               <button onClick={() => setStep(3)} className="mb-6 flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
                <ChevronLeft size={16} className="mr-1"/> Edit Details
              </button>

              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
                {/* Decorative Top */}
                <div className="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                
                <div className="p-8 text-center border-b border-dashed border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">Booking Summary</h2>
                  <p className="text-slate-500 text-sm">Please review before confirming.</p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Test Info */}
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <FlaskConical size={24}/>
                     </div>
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Test</p>
                        <h3 className="font-bold text-slate-800 text-lg">{selectedTest?.name}</h3>
                        <p className="text-blue-600 font-bold mt-1">{formatPrice(selectedTest?.price)}</p>
                     </div>
                  </div>

                  {/* Lab Info */}
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                        <Building2 size={24}/>
                     </div>
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Laboratory</p>
                        <h3 className="font-bold text-slate-800 text-lg">{selectedLab?.name}</h3>
                        <p className="text-slate-500 text-sm">{selectedLab?.city}</p>
                     </div>
                  </div>

                  {/* Date & Patient */}
                  <div className="bg-slate-50 p-5 rounded-2xl grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Date</p>
                        <p className="font-semibold text-slate-800 flex items-center gap-1"><Calendar size={14}/> {formData.date}</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Time</p>
                        <p className="font-semibold text-slate-800 flex items-center gap-1"><Clock size={14}/> {formData.time}</p>
                     </div>
                     <div className="col-span-2 border-t border-slate-200 pt-3 mt-1">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Patient</p>
                        <p className="font-bold text-slate-800 text-lg">{formData.name}</p>
                        <p className="text-sm text-slate-500">{formData.phone}</p>
                     </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <button onClick={handleSubmit} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black hover:shadow-xl transition-all flex justify-center items-center gap-2">
                    Confirm & Book Now <CheckCircle2 size={20}/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS (Reference ID Display) */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center pt-10 animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-emerald-100 shadow-xl">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={3} />
                </div>
                
                <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Booking Confirmed!</h1>
                <p className="text-slate-500 text-lg mb-10 max-w-md text-center">
                    Your appointment has been successfully scheduled. A confirmation email has been sent.
                </p>

                <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Reference ID</p>
                    <div className="bg-slate-50 rounded-xl py-4 border border-slate-200 border-dashed">
                        <p className="text-3xl font-mono font-bold text-blue-600 tracking-tighter select-all">
                            {bookingRef}
                        </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Please present this ID at the laboratory.</p>
                </div>

                <div className="mt-10 flex gap-4">
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
                        Book Another
                    </button>
                    <button onClick={() => window.print()} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all shadow-blue-200 shadow-lg">
                        Download Receipt
                    </button>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}