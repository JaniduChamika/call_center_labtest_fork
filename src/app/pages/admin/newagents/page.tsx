"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/common/AdminSidebar";
import AdminHeader from "@/components/common/AdminHeader";
// 1. Import Toast components
import { toast, Toaster } from "react-hot-toast";
import { User, Mail, Shield, Lock, Save, X, ChevronLeft, Loader2 } from "lucide-react";

function AgentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id'); // Get ID from URL
  const isEditMode = !!editId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CALL_AGENT", // Default matches Backend Enum
    status: "active"
  });

  // 1. Fetch Existing Data if Editing
  useEffect(() => {
    if (isEditMode) {
      const fetchUser = async () => {
        try {
          const res = await fetch(`/api/admin/users/${editId}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              name: data.name || "",
              email: data.email || "",
              password: "", // Don't fill password on edit
              role: data.role || "CALL_AGENT",
              status: data.status || "active"
            });
          } else {
            // Toast: Data Load Error
            toast.error("User not found or access denied.");
            router.push('/pages/admin/agents');
          }
        } catch (err) {
          console.error(err);
          // Toast: Network Error
          toast.error("Failed to load user details. Check connection.");
        } finally {
          setIsFetching(false);
        }
      };
      fetchUser();
    }
  }, [editId, isEditMode, router]);

  // 2. Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Toast: Start Loading
    const toastId = toast.loading(isEditMode ? "Updating user profile..." : "Creating new user...");

    try {
      const url = isEditMode 
        ? `/api/admin/users/${editId}` 
        : `/api/admin/users`;
      
      const method = isEditMode ? 'PATCH' : 'POST';
      
      // On edit, remove password if it's empty (so we don't overwrite with blank)
      const payload: any = { ...formData };
      if (isEditMode && !payload.password) delete payload.password;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      // Toast: Success (Updates the loading toast)
      toast.success(
        isEditMode ? "User updated successfully!" : "User created successfully!", 
        { id: toastId }
      );
      
      // Slight delay before redirect to let user see success message
      setTimeout(() => {
        router.push('/pages/admin/agents'); 
      }, 1000);

    } catch (error: any) {
      // Toast: Error (Updates the loading toast)
      toast.error(error.message || "Operation failed", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin"/></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header & Back Button */}
      <div className="flex items-center gap-2 mb-6 text-slate-500 text-sm">
        <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-blue-600">
          <ChevronLeft size={16} /> Back to Directory
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
        <p className="text-slate-500 text-sm">{isEditMode ? 'Update account details and permissions.' : 'Fill in the details to register a new system user.'}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* Personal Details */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User size={20} className="text-blue-600" /> Account Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail size={16} /></div>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" /> Access Control
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="CALL_AGENT">Call Agent</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                {isEditMode ? "New Password (Leave blank to keep current)" : "Password"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock size={16} /></div>
                <input 
                  type="password" 
                  required={!isEditMode} // Required only on create
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
            <X size={18} /> Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            {isLoading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddAgentPage() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Toast Configuration */}
      <Toaster position="top-center" />

      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader title="User Management" userName="Admin" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Suspense fallback={<div>Loading form...</div>}>
            <AgentForm />
          </Suspense>
        </main>
      </div>
    </div>
  );
}