// "use client";

// import React, { useState, useEffect } from "react";
// import Sidebar from "@/components/common/Sidebar";
// import Header from "@/components/common/Header";
// import { 
//   Search, FlaskConical, Calendar, Clock, Filter, Eye, X, 
//   Loader2, FileText, Building2, User, Phone, CheckCircle2, MapPin
// } from "lucide-react";
// import { toast, Toaster } from "react-hot-toast";

// // Reusing the professional badge component
// const StatusBadge = ({ status }: { status: string }) => {
//   const s = status || "PENDING";
  
//   const config: any = {
//     CONFIRMED:        { style: "bg-blue-50 text-blue-700 border-blue-200", icon: null },
//     SAMPLE_COLLECTED: { style: "bg-purple-50 text-purple-700 border-purple-200", icon: null },
//     COMPLETED:        { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={12} className="mr-1"/> },
//     CANCELLED:        { style: "bg-red-50 text-red-700 border-red-200", icon: null },
//     PENDING:          { style: "bg-amber-50 text-amber-700 border-amber-200", icon: null },
//   };

//   const { style, icon } = config[s] || config.PENDING;

//   return (
//     <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center w-fit ${style}`}>
//       {icon} {s.replace('_', ' ')}
//     </span>
//   );
// };

// export default function AgentLabRequestsPage() {
//   const [bookings, setBookings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [selectedBooking, setSelectedBooking] = useState<any>(null);

//   // Fetch Data
//   const fetchBookings = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('/api/lab/bookings');
//       if (!res.ok) throw new Error("Failed to fetch");
//       const data = await res.json();
//       setBookings(data);
//     } catch (error) {
//       toast.error("Could not load history");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   // Filter Logic
//   const filteredBookings = bookings.filter(b => {
//     const matchesSearch = 
//       b.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       b.public_id.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
//       <Toaster position="top-right" />
//       <Sidebar />

//       <div className="flex-1 flex flex-col h-full overflow-hidden">
//         <Header title="Lab Requests" />

//         <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
//           {/* Header Section */}
//           <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">Request History</h1>
//               <p className="text-sm text-slate-500 mt-1">Track status of raised lab requests.</p>
//             </div>
//             <button onClick={fetchBookings} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2">
//                <Loader2 size={16} className={loading ? "animate-spin" : ""} /> Refresh List
//             </button>
//           </div>

//           {/* Filters */}
//           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center transition-all focus-within:ring-2 focus-within:ring-blue-100">
//             <div className="relative flex-1 w-full">
//               <Search className="absolute left-3 top-3 text-slate-400" size={18} />
//               <input 
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium transition-colors"
//                 placeholder="Search by Patient Name or Reference ID..." 
//                 onChange={e => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <div className="flex items-center gap-2 w-full md:w-auto">
//                <Filter size={18} className="text-slate-400"/>
//                <select 
//                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-500 transition-colors w-full md:w-48"
//                  value={statusFilter}
//                  onChange={(e) => setStatusFilter(e.target.value)}
//                >
//                  <option value="ALL">All Statuses</option>
//                  <option value="PENDING">Pending</option>
//                  <option value="SAMPLE_COLLECTED">Sample Collected</option>
//                  <option value="COMPLETED">Completed</option>
//                  <option value="CANCELLED">Cancelled</option>
//                </select>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//             <table className="w-full text-left border-collapse">
//               <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-extrabold text-slate-400 tracking-wider">
//                 <tr>
//                   <th className="px-6 py-5">Reference</th>
//                   <th className="px-6 py-5">Patient Details</th>
//                   <th className="px-6 py-5">Test & Lab</th>
//                   <th className="px-6 py-5">Schedule</th>
//                   <th className="px-6 py-5">Status</th>
//                   <th className="px-6 py-5 text-right">View</th>
//                 </tr>
//               </thead>
//               <tbody className="text-sm divide-y divide-slate-50">
//                 {loading ? (
//                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading records...</td></tr>
//                 ) : filteredBookings.length === 0 ? (
//                    <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2"><div className="p-4 bg-slate-50 rounded-full"><FlaskConical className="opacity-20" size={32}/></div>No requests found.</td></tr>
//                 ) : (
//                   filteredBookings.map((booking) => (
//                     <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors group cursor-default">
//                       <td className="px-6 py-4">
//                         <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
//                           {booking.public_id}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
//                             {booking.patient_name.charAt(0)}
//                           </div>
//                           <div>
//                             <p className="font-bold text-slate-800">{booking.patient_name}</p>
//                             <p className="text-xs text-slate-500">{booking.patient_phone}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="font-medium text-slate-800">{booking.lab_test?.name}</p>
//                         <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
//                           <Building2 size={10} /> {booking.laboratory?.name || "Main Lab"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-slate-600">
//                         <div className="flex flex-col gap-1">
//                           <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
//                             <Calendar size={12} className="text-blue-500"/> {new Date(booking.booking_date).toLocaleDateString()}
//                           </span>
//                           <span className="flex items-center gap-2 text-xs text-slate-400">
//                             <Clock size={12}/> {booking.booking_time}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <StatusBadge status={booking.status} />
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <button 
//                           onClick={() => setSelectedBooking(booking)}
//                           className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//                         >
//                           <Eye size={20} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//         </main>

//         {/* View Details Modal */}
//         {selectedBooking && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
//             <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
//               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
//                 <div>
//                   <h3 className="font-bold text-lg text-slate-800">Request Details</h3>
//                   <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedBooking.public_id}</p>
//                 </div>
//                 <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
//                   <X size={20}/>
//                 </button>
//               </div>
              
//               <div className="p-6 space-y-6 bg-slate-50/50 overflow-y-auto">
                
//                 {/* Status Banner */}
//                 <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
//                    <span className="text-sm font-bold text-slate-500">Current Status</span>
//                    <StatusBadge status={selectedBooking.status} />
//                 </div>

//                 {/* Patient Info */}
//                 <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
//                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
//                       <User size={14}/> Patient Information
//                    </h4>
//                    <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-xs text-slate-400 font-medium uppercase mb-1">Name</p>
//                         <p className="font-bold text-slate-800">{selectedBooking.patient_name}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-400 font-medium uppercase mb-1">Phone</p>
//                         <p className="font-bold text-slate-800">{selectedBooking.patient_phone}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-400 font-medium uppercase mb-1">Age</p>
//                         <p className="font-bold text-slate-800">{selectedBooking.patient_age} Years</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-400 font-medium uppercase mb-1">Gender</p>
//                         <p className="font-bold text-slate-800">{selectedBooking.patient_gender}</p>
//                       </div>
//                    </div>
//                 </div>

//                 {/* Test Info */}
//                 <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
//                    <div>
//                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
//                          <FlaskConical size={14}/> Test Details
//                       </h4>
//                       <div className="flex justify-between items-center">
//                          <p className="font-bold text-slate-800 text-lg">{selectedBooking.lab_test?.name}</p>
//                          <p className="font-bold text-blue-600">LKR {selectedBooking.lab_test?.price?.toLocaleString()}</p>
//                       </div>
//                       <p className="text-xs text-slate-500 mt-1">{selectedBooking.lab_test?.category}</p>
//                    </div>
                   
//                    <div className="border-t border-slate-100 pt-4">
//                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
//                          <Building2 size={14}/> Laboratory
//                       </h4>
//                       <p className="font-bold text-slate-800">{selectedBooking.laboratory?.name}</p>
//                       <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
//                          <MapPin size={12}/> {selectedBooking.laboratory?.city}
//                       </p>
//                    </div>
//                 </div>

//                 {/* Footer Buttons */}
//                 <div className="flex gap-3 pt-2">
//                   <button className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-center gap-2">
//                     <FileText size={16}/> Print Receipt
//                   </button>
//                   <button onClick={() => setSelectedBooking(null)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">
//                     Close
//                   </button>
//                 </div>

//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { 
  Search, FlaskConical, Calendar, Clock, Filter, Eye, X, 
  Loader2, FileText, Building2, User, Phone, MapPin, CheckCircle2 
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Professional Status Badge
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

export default function AgentLabRequestsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Fetch Data
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lab/bookings');
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      toast.error("Could not load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter Logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.public_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Toaster position="top-right" />
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header title="Lab Requests" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Request History</h1>
              <p className="text-sm text-slate-500 mt-1">Track status of raised lab requests.</p>
            </div>
            <button 
              onClick={fetchBookings} 
              // 👇 FIX: Suppress extension warnings on this button
              suppressHydrationWarning={true}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2"
            >
               <Loader2 size={16} className={loading ? "animate-spin" : ""} /> Refresh List
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center transition-all focus-within:ring-2 focus-within:ring-blue-100">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                // 👇 FIX: Suppress extension warnings on input
                suppressHydrationWarning={true}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium transition-colors"
                placeholder="Search by Patient Name or Reference ID..." 
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
               <Filter size={18} className="text-slate-400"/>
               <select 
                 // 👇 FIX: Suppress extension warnings on select
                 suppressHydrationWarning={true}
                 className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-500 transition-colors w-full md:w-48"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
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
                  <th className="px-6 py-5">Test & Lab</th>
                  <th className="px-6 py-5">Schedule</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading records...</td></tr>
                ) : filteredBookings.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2"><div className="p-4 bg-slate-50 rounded-full"><FlaskConical className="opacity-20" size={32}/></div>No requests found.</td></tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          {booking.public_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {booking.patient_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{booking.patient_name}</p>
                            <p className="text-xs text-slate-500">{booking.patient_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{booking.lab_test?.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Building2 size={10} /> {booking.laboratory?.name || "Main Lab"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <Calendar size={12} className="text-blue-500"/> {new Date(booking.booking_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={12}/> {booking.booking_time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>

        {/* View Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Request Details</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedBooking.public_id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-slate-50/50 space-y-6">
                
                {/* Status Banner */}
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                   <span className="text-sm font-bold text-slate-500">Current Status</span>
                   <StatusBadge status={selectedBooking.status} />
                </div>

                {/* Patient Info Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User size={14}/> Patient Information
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase mb-1">Name</p>
                        <p className="font-bold text-slate-800">{selectedBooking.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase mb-1">Phone</p>
                        <p className="font-bold text-slate-800">{selectedBooking.patient_phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase mb-1">Age</p>
                        <p className="font-bold text-slate-800">{selectedBooking.patient_age} Years</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase mb-1">Gender</p>
                        <p className="font-bold text-slate-800">{selectedBooking.patient_gender}</p>
                      </div>
                   </div>
                </div>

                {/* Test & Lab Info Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                   <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                         <FlaskConical size={14}/> Test Details
                      </h4>
                      <div className="flex justify-between items-center">
                         <p className="font-bold text-slate-800 text-lg">{selectedBooking.lab_test?.name}</p>
                         <p className="font-bold text-blue-600">LKR {selectedBooking.lab_test?.price?.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{selectedBooking.lab_test?.category}</p>
                   </div>
                   
                   <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                         <Building2 size={14}/> Laboratory
                      </h4>
                      <p className="font-bold text-slate-800">{selectedBooking.laboratory?.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                         <MapPin size={12}/> {selectedBooking.laboratory?.city}
                      </p>
                   </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-center gap-2">
                    <FileText size={16}/> Print Receipt
                  </button>
                  <button onClick={() => setSelectedBooking(null)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">
                    Close Details
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}