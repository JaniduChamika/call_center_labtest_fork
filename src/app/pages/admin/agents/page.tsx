"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/common/AdminSidebar";
import AdminHeader from "@/components/common/AdminHeader";
// 1. Import Toast
import { toast, Toaster } from "react-hot-toast";
import { 
  Search, 
  Plus, 
  Filter, 
  Shield, 
  Ban, 
  Edit, 
  Unlock, 
  Loader2 
} from "lucide-react";

export default function ManageAgentsPage() {
  const router = useRouter();
  
  // State initialization
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // --- 1. Fetch Data from API ---
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (res.ok) {
        // 🟢 FIX 1: Safety check. Ensure we set an array.
        setAgents(Array.isArray(data.users) ? data.users : []);
      } else {
        if (res.status === 403) {
          console.error("⛔ ACCESS DENIED:", data.message);
          // Toast: Permission Error
          toast.error("Access Denied: You do not have permission.");
        } else if (res.status === 401) {
          router.push('/pages/login');
          toast.error("Session expired. Please log in.");
        } else {
          // Toast: Generic Error
          toast.error("Failed to load user directory.");
        }
        setAgents([]); // Fallback to empty array on error
      }
    } catch (error) {
      console.error("Network Error:", error);
      // Toast: Network Error
      toast.error("Network error. Please check your connection.");
      setAgents([]); // Fallback to empty array on crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // --- 2. Action: Toggle Status ---
  const handleToggleStatus = async (e: React.MouseEvent, id: number, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus.toLowerCase() === "suspended" ? "active" : "suspended";
    
    // Optimistic Update
    setAgents(prev => prev.map(a => a.user_id === id ? { ...a, status: newStatus } : a));

    // Toast: Start Loading
    const toastId = toast.loading(`Updating status to ${newStatus}...`);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }
      
      // Toast: Success
      toast.success(`User ${newStatus === 'active' ? 'Activated' : 'Suspended'} successfully`, { id: toastId });

    } catch (error) {
      fetchAgents(); // Revert on error
      // Toast: Error
      toast.error("Failed to update status. Reverting...", { id: toastId });
    }
  };

  // --- 3. Action: Edit ---
  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    router.push(`/pages/admin/newagents?id=${id}`);
  };

  // --- 4. Filter Logic (THE FIX) ---
  // 🟢 FIX 2: Added (agents || []) to prevent "filter of undefined" crash
  const filteredAgents = (agents || []).filter((agent) => {
    if (!agent) return false;

    const name = agent.name?.toLowerCase() || "";
    const email = agent.email?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    
    const agentStatus = (agent.status || "").toLowerCase();
    const filter = filterStatus.toLowerCase();
    const matchesStatus = filter === "all" || agentStatus === filter;

    return matchesSearch && matchesStatus;
  });

  // Helper for UI Badge Colors
  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "suspended": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Toast Configuration */}
      <Toaster position="top-right" />

      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader title="Manage Agents" userName="Admin" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agent Directory</h1>
              <p className="text-slate-500 text-sm">View and manage system access for all users.</p>
            </div>
            <button 
              onClick={() => router.push('/pages/admin/newagents')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <Plus size={20} /> Add New User
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 min-w-[150px]">
                <Filter size={16} />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent outline-none w-full cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading user directory...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User Profile</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAgents.length > 0 ? (
                    filteredAgents.map((agent) => (
                      <tr key={agent.user_id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                              {agent.name ? agent.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{agent.name || "Unknown"}</p>
                              <p className="text-xs text-slate-500">{agent.email || "No Email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Shield size={14} className="text-blue-500"/>
                            {agent.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={(e) => handleEdit(e, agent.user_id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={(e) => handleToggleStatus(e, agent.user_id, agent.status)}
                              className={`p-2 rounded-lg ${
                                (agent.status || "").toLowerCase() === 'suspended' 
                                  ? "text-emerald-500 hover:bg-emerald-50" 
                                  : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                              }`}
                            >
                              {(agent.status || "").toLowerCase() === 'suspended' ? <Unlock size={16} /> : <Ban size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}