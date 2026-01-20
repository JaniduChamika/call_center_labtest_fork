'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
// 1. Import Toast components
import { toast, Toaster } from 'react-hot-toast';
import { 
  Search, Calendar, Clock, FileText, X, 
  Loader2, ChevronLeft, ChevronRight, AlertCircle, Filter
} from 'lucide-react';
import { useSession } from 'next-auth/react'; 

// --- Types (Matched to your Prisma Include) ---
interface Appointment {
  public_id: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_link: string;
  patients: {
    name: string;
    nic: string;
    phone_number: string;
    email: string | null;
  };
  doctors: {
    name: string;
    consultant_fee?: number; 
  };
  hospitals: {
    name: string;
  };
}

// --- Status Badge Helper ---
const StatusBadge = ({ status }: { status: string }) => {
  const normalized = (status || "").toLowerCase();
  let styles = "bg-slate-100 text-slate-600 border-slate-200";
  
  if (normalized.includes("confirmed") || normalized === 'paid') styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
  else if (normalized.includes("pending")) styles = "bg-amber-100 text-amber-700 border-amber-200";
  else if (normalized.includes("cancelled")) styles = "bg-red-100 text-red-700 border-red-200";

  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Unknown";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {label}
    </span>
  );
};

export default function AppointmentsPage() {
  // Session check (optional, but good for UI state)
  const { data: session } = useSession();

  // --- State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'all' | 'current' | 'previous'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal Actions
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // --- 1. Fetch Appointments Function ---
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build Query Params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        'view-mode': viewMode, // Connects to backend viewMode logic
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await fetch(`/api/appointments?${params.toString()}`);
      
      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 403) throw new Error("Access Denied. You do not have permission.");
        if (res.status === 401) throw new Error("Session Expired. Please log in.");
        throw new Error(errText || "Failed to fetch appointments");
      }
      
      const data = await res.json();
      setAppointments(data.appointments || []);
      setTotalPages(data.pagination?.totalPages || 1);

    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || 'Failed to load appointments.');
      // Toast: Data Load Error
      toast.error("Could not load appointments. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, viewMode]);

  // --- 2. Effects ---
  
  // Debounce Search & Fetch on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery, page, viewMode, fetchAppointments]);

  // --- 3. Handle Cancellation ---
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    if (!confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) return;

    setIsCancelling(true);
    // Toast: Start Loading
    const toastId = toast.loading("Processing cancellation...");

    try {
      // Call the PATCH route
      const res = await fetch(`/api/appointments/${selectedAppointment.public_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Cancellation failed");

      // Toast: Success (replaces loading toast)
      toast.success("Appointment cancelled successfully.", { id: toastId });
      
      setSelectedAppointment(null);
      fetchAppointments(); // Refresh the list to show updated status

    } catch (err: any) {
      // Toast: Error (replaces loading toast)
      toast.error(err.message || "Failed to cancel appointment", { id: toastId });
    } finally {
      setIsCancelling(false);
    }
  };

  // --- 4. Formatters ---
  const formatDate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A";
  const formatTime = (iso: string) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Toast Configuration */}
      <Toaster position="top-right" />

      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative">
        <Header title="Appointment Management" />
        
        <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">
          
          {/* Top Section: Title & Filters */}
          <div className="mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">All Appointments</h1>
              <p className="text-slate-500 text-sm">Manage patient bookings and schedules.</p>
            </div>

            {/* View Mode Tabs */}
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex text-sm">
                <button 
                  onClick={() => { setViewMode('all'); setPage(1); }}
                  className={`px-4 py-1.5 rounded-md transition-all ${viewMode === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setViewMode('current'); setPage(1); }}
                  className={`px-4 py-1.5 rounded-md transition-all ${viewMode === 'current' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Upcoming
                </button>
                <button 
                  onClick={() => { setViewMode('previous'); setPage(1); }}
                  className={`px-4 py-1.5 rounded-md transition-all ${viewMode === 'previous' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  History
                </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 shrink-0">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 max-w-2xl transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
              <Search className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by Patient Name, NIC, or Phone..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 bg-slate-50">Reference ID</th>
                    <th className="px-6 py-4 bg-slate-50">Patient</th>
                    <th className="px-6 py-4 bg-slate-50">Doctor & Hospital</th>
                    <th className="px-6 py-4 bg-slate-50">Schedule</th>
                    <th className="px-6 py-4 bg-slate-50">Status</th>
                    <th className="px-6 py-4 bg-slate-50 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2 text-blue-600"/> Loading appointments...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-red-500"><AlertCircle className="inline mr-2"/> {error}</td></tr>
                  ) : appointments.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <Filter className="opacity-20" size={40} />
                        No appointments found matching your filters.
                    </td></tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.public_id} onClick={() => setSelectedAppointment(apt)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-blue-600">
                          #{apt.public_id.substring(0, 8).toUpperCase()}...
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">{apt.patients?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">{apt.patients?.phone_number}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-800 font-medium">Dr. {apt.doctors?.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <span className="truncate max-w-[150px]">{apt.hospitals?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700 font-medium"><Calendar size={14} className="text-blue-500" /> {formatDate(apt.start_time)}</div>
                          <div className="flex items-center gap-2 text-slate-500 text-xs mt-1"><Clock size={14} /> {formatTime(apt.start_time)}</div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                            <FileText size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">Page <strong>{page}</strong> of {totalPages || 1}</span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  className="p-1.5 border border-slate-300 rounded hover:bg-white hover:border-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => p + 1)} 
                  className="p-1.5 border border-slate-300 rounded hover:bg-white hover:border-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Modal */}
          {selectedAppointment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Appointment Details</h2>
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedAppointment.public_id}</p>
                  </div>
                  <button onClick={() => setSelectedAppointment(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Status Banner */}
                   <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Current Status</span>
                      <StatusBadge status={selectedAppointment.status} />
                   </div>

                   {/* Grid Info */}
                   <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Patient</p>
                        <p className="font-bold text-slate-800">{selectedAppointment.patients?.name}</p>
                        <p className="text-sm text-slate-500">{selectedAppointment.patients?.nic}</p>
                        <p className="text-sm text-slate-500">{selectedAppointment.patients?.phone_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Doctor</p>
                        <p className="font-bold text-slate-800">Dr. {selectedAppointment.doctors?.name}</p>
                        <p className="text-sm text-slate-500">{selectedAppointment.hospitals?.name}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Date & Time</p>
                        <p className="font-medium text-slate-800">{formatDate(selectedAppointment.start_time)}</p>
                        <p className="text-sm text-slate-500">{formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}</p>
                      </div>

                      <div>
                          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Consultant Fee</p>
                          <p className="font-bold text-blue-600 text-lg">
                           LKR {selectedAppointment.doctors?.consultant_fee ? selectedAppointment.doctors.consultant_fee.toLocaleString() : "0.00"}
                          </p>
                      </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100 shrink-0">
                  {selectedAppointment.status !== 'cancelled' ? (
                    <button 
                      onClick={handleCancelAppointment} 
                      disabled={isCancelling} 
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isCancelling && <Loader2 size={14} className="animate-spin" />}
                      {isCancelling ? "Processing..." : "Cancel Booking"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">This appointment is cancelled.</span>
                  )}
                  
                  <button onClick={() => setSelectedAppointment(null)} className="px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}