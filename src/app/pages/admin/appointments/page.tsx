"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/common/AdminSidebar";
import AdminHeader from "@/components/common/AdminHeader";
import { 
  Search, Calendar, Clock, FileText, X, MapPin, 
  Filter, ChevronDown, CheckCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";

// --- Types (Matched to your Backend Response) ---
interface Appointment {
  public_id: string; 
  start_time: string;
  end_time: string;
  status: string;
  payment_link: string;
  // Relations based on your Prisma 'include'
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

export default function AllAppointmentsPage() {
  // --- State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // 'view-mode' maps directly to your backend API logic
  const [viewMode, setViewMode] = useState<'all' | 'current' | 'previous'>('all');
  
  // Status filtering (Client-side since backend doesn't filter status yet)
  const [statusFilter, setStatusFilter] = useState("All"); 

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // --- 1. Fetch Data Function ---
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Construct URL Params based on Backend API
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        'view-mode': viewMode, // Sends 'all', 'current', or 'previous' to backend
      });

      // 'search' param triggers the Patient Name/NIC/Phone search in backend
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await fetch(`/api/appointments?${params.toString()}`);
      
      if (!res.ok) {
        if(res.status === 401) throw new Error("Session expired. Please login.");
        throw new Error("Failed to load appointments.");
      }

      const data = await res.json();
      
      // --- Client Side Status Filtering ---
      // (Filters the results returned by the backend)
      let results = data.appointments || [];
      if (statusFilter !== 'All') {
         results = results.filter((appt: Appointment) => 
            appt.status.toLowerCase().includes(statusFilter.toLowerCase())
         );
      }

      setAppointments(results);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);

    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, viewMode, statusFilter]);

  // --- 2. Debounce Search Effect ---
  // Waits 500ms after typing stops before calling the API
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 500); 
    return () => clearTimeout(timer);
  }, [fetchAppointments]);


  // --- 3. Formatters ---
  const formatDate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A";
  const formatTime = (iso: string) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A";

  const StatusBadge = ({ status }: { status: string }) => {
    const normalized = (status || "").toLowerCase();
    let styles = "bg-slate-100 text-slate-600 border-slate-200";
    let icon = null;

    if (normalized.includes("confirmed") || normalized === 'paid') {
        styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
        icon = <CheckCircle size={12} className="mr-1" />;
    } else if (normalized.includes("pending")) {
        styles = "bg-amber-100 text-amber-700 border-amber-200";
        icon = <AlertCircle size={12} className="mr-1" />;
    } else if (normalized.includes("cancelled")) {
        styles = "bg-red-100 text-red-700 border-red-200";
    }

    const label = status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Unknown";

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader title="All Appointments" userName="Admin" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* Title & View Mode Toggle */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
              <p className="text-slate-500 text-sm">View and manage all patient appointments.</p>
            </div>
             
             {/* Backend 'view-mode' switcher */}
             <div className="bg-white p-1 border border-slate-200 rounded-lg flex text-xs font-medium shadow-sm">
                <button 
                  onClick={() => { setViewMode('all'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setViewMode('current'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'current' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Upcoming
                </button>
                <button 
                  onClick={() => { setViewMode('previous'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'previous' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  History
                </button>
             </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search Patient Name, NIC, or Phone..." 
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1); 
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                }}
                className="appearance-none pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <Filter size={14} />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Patient Details</th>
                  <th className="px-6 py-4">Doctor & Hospital</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Loader2 className="animate-spin text-blue-600" size={30} />
                                <p>Loading records...</p>
                            </div>
                        </td>
                    </tr>
                ) : error ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-red-500">
                            <AlertCircle className="inline mr-2" /> {error}
                        </td>
                    </tr>
                ) : appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <tr 
                      key={apt.public_id} 
                      onClick={() => setSelectedAppointment(apt)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-medium group-hover:underline">
                        #{apt.public_id.substring(0, 8).toUpperCase()}...
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{apt.patients?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 font-mono">{apt.patients?.nic}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">Dr. {apt.doctors?.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin size={10} /> <span className="truncate max-w-[150px]">{apt.hospitals?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar size={14} className="text-slate-400" /> {formatDate(apt.start_time)}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                          <Clock size={14} className="text-slate-400" /> {formatTime(apt.start_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter size={32} className="opacity-20" />
                        <p>No appointments found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500 bg-slate-50">
                <p>Page <span className="font-bold text-slate-800">{page}</span> of {totalPages}</p>
                <div className="flex gap-2">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
                <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages || loading}
                    className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronRight size={16} />
                </button>
                </div>
            </div>
          </div>

        </main>

        {/* --- Detail Modal --- */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900">Appointment Details</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedAppointment.public_id}</p>
                </div>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Current Status</span>
                  <StatusBadge status={selectedAppointment.status} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-medium text-slate-800">{selectedAppointment.patients?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">NIC</p>
                      <p className="font-medium text-slate-800 font-mono">{selectedAppointment.patients?.nic}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium text-slate-800">{selectedAppointment.patients?.phone_number}</p>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Booking Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Doctor</span>
                        <span className="text-sm font-medium text-slate-900">Dr. {selectedAppointment.doctors?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Hospital</span>
                        <span className="text-sm font-medium text-slate-900">{selectedAppointment.hospitals?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Time</span>
                        <span className="text-sm font-medium text-slate-900">
                          {formatDate(selectedAppointment.start_time)} at {formatTime(selectedAppointment.start_time)}
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                    <span className="text-sm text-blue-800 font-medium">Consultant Fee</span>
                    <span className="text-lg font-bold text-blue-900">
                        Rs. {selectedAppointment.doctors?.consultant_fee ? selectedAppointment.doctors.consultant_fee.toLocaleString() : "0.00"}
                    </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button onClick={() => setSelectedAppointment(null)} className="px-4 py-2 text-sm text-slate-700 font-medium hover:bg-white border border-transparent hover:border-slate-300 rounded-lg transition-all">
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}