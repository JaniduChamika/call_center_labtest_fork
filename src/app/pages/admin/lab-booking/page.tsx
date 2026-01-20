"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/common/AdminSidebar";
import AdminHeader from "@/components/common/AdminHeader";
import { 
  Search, FlaskConical, Calendar, Clock, Loader2, MoreHorizontal, 
  X, CheckCircle2, User, Phone, MapPin, Filter, Building2, AlertCircle 
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// --- Professional Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  const s = status || "PENDING";
  
  const config: any = {
    CONFIRMED:        { style: "bg-blue-50 text-blue-700 border-blue-200", icon: null },
    SAMPLE_COLLECTED: { style: "bg-purple-50 text-purple-700 border-purple-200", icon: null },
    COMPLETED:        { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={12} className="mr-1"/> },
    CANCELLED:        { style: "bg-red-50 text-red-700 border-red-200", icon: null },
    PENDING:          { style: "bg-amber-50 text-amber-700 border-amber-200", icon: null },
  };

  const { style, icon } = config[s] || config.PENDING;

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center w-fit ${style}`}>
      {icon} {s.replace('_', ' ')}
    </span>
  );
};

export default function AdminLabBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Fetch Data
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lab/bookings');
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);
// 2. Update Status Handler
  const handleUpdateStatus = async (newStatus: string) => {
    if(!selectedBooking) return;
    setIsUpdating(true);
    const toastId = toast.loading("Updating status...");

    try {
      // 1. Send Update to Backend
      const res = await fetch('/api/lab/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedBooking.id, 
          status: newStatus 
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      // 2. Update Local State (Optimistic UI)
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id ? { ...b, status: newStatus } : b
      ));
      
      setSelectedBooking(null);
      toast.success("Status updated successfully!", { id: toastId });
      
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Filters
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.public_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Toaster position="top-right" />
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader title="Lab Management" userName="Admin" />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Page Title */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Lab Requests</h1>
              <p className="text-sm text-slate-500 mt-1">Manage daily sample collections and test results.</p>
            </div>
            <button onClick={fetchBookings} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2">
               <Loader2 size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center transition-all focus-within:ring-2 focus-within:ring-blue-100">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium transition-colors" 
                placeholder="Search by Patient Name or Reference ID..." 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
               <Filter size={18} className="text-slate-400"/>
               <select 
                 className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-500 transition-colors w-full md:w-48"
                 value={statusFilter}
                 onChange={e => setStatusFilter(e.target.value)}
               >
                 <option value="ALL">All Statuses</option>
                 <option value="PENDING">Pending</option>
                 <option value="SAMPLE_COLLECTED">Sample Collected</option>
                 <option value="COMPLETED">Completed</option>
                 <option value="CANCELLED">Cancelled</option>
               </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-5">Reference</th>
                  <th className="px-6 py-5">Patient Details</th>
                  <th className="px-6 py-5">Test Information</th>
                  <th className="px-6 py-5">Schedule</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading records...</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2"><div className="p-4 bg-slate-50 rounded-full"><FlaskConical className="opacity-20" size={32}/></div>No bookings found matching your filters.</td></tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          {b.public_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {b.patient_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{b.patient_name}</p>
                            <p className="text-xs text-slate-500">{b.patient_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{b.lab_test?.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Building2 size={10} /> {b.laboratory?.name || "Main Lab"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <Calendar size={12} className="text-blue-500"/> {new Date(b.booking_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={12}/> {b.booking_time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedBooking(b)} 
                          className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <MoreHorizontal size={20}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
        
        {/* Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Booking Details</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedBooking.public_id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20}/>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto bg-slate-50/50 space-y-6">
                 
                 {/* Status Section */}
                 <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-bold text-slate-500">Current Status</span>
                    <StatusBadge status={selectedBooking.status} />
                 </div>

                 {/* Info Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    {/* Patient Card */}
                    <div className="col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><User size={14}/> Patient</h4>
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-800 text-lg">{selectedBooking.patient_name}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1"><Phone size={12}/> {selectedBooking.patient_phone}</p>
                          </div>
                          <div className="text-right">
                             <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{selectedBooking.patient_gender}, {selectedBooking.patient_age}y</span>
                          </div>
                       </div>
                    </div>

                    {/* Test Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><FlaskConical size={14}/> Test</h4>
                       <p className="font-bold text-slate-800">{selectedBooking.lab_test?.name}</p>
                       <p className="text-blue-600 font-bold text-sm mt-1">LKR {selectedBooking.lab_test?.price}</p>
                    </div>

                    {/* Lab Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Building2 size={14}/> Location</h4>
                       <p className="font-bold text-slate-800">{selectedBooking.laboratory?.name}</p>
                       <p className="text-slate-500 text-xs mt-1">{selectedBooking.laboratory?.city}</p>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Status</p>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => handleUpdateStatus('SAMPLE_COLLECTED')} className="py-3 px-4 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-sm font-bold hover:bg-purple-100 hover:shadow-sm transition-all">
                          Sample Collected
                       </button>
                       <button onClick={() => handleUpdateStatus('COMPLETED')} className="py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 hover:shadow-sm transition-all">
                          Mark Completed
                       </button>
                       <button onClick={() => handleUpdateStatus('CANCELLED')} className="py-3 px-4 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all col-span-2">
                          Cancel Booking
                       </button>
                    </div>
                 </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}