"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // <--- 1. Import Session Hook
import AdminSidebar from "@/components/common/AdminSidebar";
import AdminHeader from "@/components/common/AdminHeader";
import { 
  User, Mail, Phone, Shield, Lock, Camera, Save, Activity, List, 
  CheckCircle, AlertTriangle, Clock, Loader2
} from "lucide-react";

export default function AdminProfilePage() {
  const { data: session, status } = useSession(); // <--- 2. Get Session Data
  const [activeTab, setActiveTab] = useState<"Overview" | "Settings" | "Security" | "Activity">("Overview");
  
  // State for extended data that isn't in the session (fetched from DB)
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    phone: "",
    bio: "",
    location: "Headquarters, Colombo",
    joinDate: "",
    lastLogin: new Date().toLocaleTimeString(),
    permissions: ["User Management", "System Config"], // Default permissions
    logs: [] as any[]
  });

  // --- 3. Fetch Extended Data from API ---
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (session?.user?.email) {
        try {
          // We pass the email to identify the user
          const res = await fetch(`/api/profile?email=${session.user.email}`);
          const data = await res.json();
          
          if (res.ok) {
            setProfileData(prev => ({
              ...prev,
              phone: data.phone || "Not set",
              bio: data.bio || "No bio available.",
              joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A",
              // If your backend sends logs, map them here
            }));
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchProfileDetails();
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading Profile...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Pass real name from Session */}
        <AdminHeader title="My Profile" userName={session?.user?.name || "Admin"} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* --- Profile Header Card --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-900"></div>
              
              <div className="px-8 pb-6 flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                
                <div className="relative group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-slate-800 text-white flex items-center justify-center shadow-md">
                     <Shield size={48} />
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-slate-700 text-white rounded-full hover:bg-slate-600 transition shadow-sm border-2 border-white">
                    <Camera size={16} />
                  </button>
                </div>

                <div className="flex-1 mb-2">
                  {/* REAL DATA: Name & Role */}
                  <h1 className="text-2xl font-bold text-slate-900">{session?.user?.name}</h1>
                  <p className="text-slate-500 font-medium flex items-center gap-2 capitalize">
                    {/* Access role from session */}
                    {(session?.user as any)?.role} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                  </p>
                </div>

                <div className="hidden md:block text-right mb-3">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Joined Date</p>
                   <p className="text-sm font-bold text-slate-800">{profileData.joinDate}</p>
                </div>
              </div>
            </div>

            {/* --- Tabs & Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-col gap-1">
                  {["Overview", "Settings", "Security", "Activity"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${
                        activeTab === tab 
                          ? "bg-slate-100 text-slate-900 font-bold" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      {tab === "Overview" && <User size={18} />}
                      {tab === "Settings" && <Activity size={18} />}
                      {tab === "Security" && <Lock size={18} />}
                      {tab === "Activity" && <List size={18} />}
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <h3 className="font-bold text-slate-900 mb-4">Contact Details</h3>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Email</p>
                          <p className="text-slate-700">{session?.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Phone</p>
                          <p className="text-slate-700">{profileData.phone}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-8">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === "Overview" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-2">Role Description</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{profileData.bio}</p>
                     </div>

                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Access Permissions</h3>
                        <div className="flex flex-wrap gap-2">
                           {profileData.permissions.map((perm) => (
                             <span key={perm} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                               <CheckCircle size={12} /> {perm}
                             </span>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {/* 2. SETTINGS TAB */}
                {activeTab === "Settings" && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-slate-900 mb-6">Edit Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Display Name</label>
                        <input type="text" defaultValue={session?.user?.name || ""} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Role</label>
                        <input type="text" defaultValue={(session?.user as any)?.role} disabled className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-sm" />
                      </div>
                       <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Phone</label>
                        <input type="text" defaultValue={profileData.phone} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Bio</label>
                         <textarea defaultValue={profileData.bio} rows={4} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2">
                        <Save size={18} /> Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. SECURITY & 4. ACTIVITY (Kept visual for now, connect similar to above) */}
                {/* ... (Keep your existing Security and Activity tab code here) ... */}
                {activeTab === "Activity" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <p className="text-slate-500 text-center italic">Activity logs coming soon from backend...</p>
                    </div>
                )}
                
                 {activeTab === "Security" && (
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-2">
                      <h3 className="font-bold text-slate-900 mb-6">Security Settings</h3>
                      <div className="space-y-6">
                         <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-start gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600"><Lock size={20} /></div>
                            <div className="flex-1">
                               <h4 className="text-sm font-bold text-slate-800">Change Password</h4>
                               <p className="text-xs text-slate-500 mb-3">Ensure your account is using a long, random password to stay secure.</p>
                               <button className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded hover:bg-slate-700">Update Password</button>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}