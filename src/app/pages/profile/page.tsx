"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 1. Import Session Hook
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Shield, Star, Clock, CheckCircle, Save, Loader2
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession(); // 2. Get Session
  const [activeTab, setActiveTab] = useState<"Overview" | "Settings" | "Security">("Overview");
  
  const [loading, setLoading] = useState(true);
  // 3. State to hold real DB data
  const [profileData, setProfileData] = useState({
    phone: "",
    bio: "",
    location: "Colombo, Sri Lanka",
    joinDate: "",
    role: "Channeling Agent"
  });

  // 4. Fetch Extended Data
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (session?.user?.email) {
        try {
          // Re-using the same API endpoint we made for Admin
          const res = await fetch(`/api/profile?email=${session.user.email}`);
          const data = await res.json();
          
          if (res.ok) {
            setProfileData(prev => ({
              ...prev,
              phone: data.phone || "Not set",
              bio: data.bio || "No bio available.",
              role: data.role || "Channeling Agent",
              joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A",
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
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading Profile...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header (Auto-fills from Session) */}
        <Header title="Agent Profile" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* --- Profile Header Card --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-900"></div>
              
              <div className="px-8 pb-6 flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                
                <div className="relative group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-blue-50 text-blue-600 flex items-center justify-center shadow-md">
                     <User size={48} />
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm border-2 border-white">
                    <Camera size={16} />
                  </button>
                </div>

                <div className="flex-1 mb-2">
                  {/* Real Session Name */}
                  <h1 className="text-2xl font-bold text-slate-900">{session?.user?.name}</h1>
                  <p className="text-slate-500 font-medium capitalize">{profileData.role}</p>
                </div>

                {/* Static Stats (Can be connected to API later) */}
                <div className="hidden md:flex gap-6 mb-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">4.8</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1 justify-center">
                      <Star size={12} className="text-yellow-500 fill-yellow-500"/> Rating
                    </p>
                  </div>
                  <div className="text-center">
                      <p className="text-xl font-bold text-slate-900">1240</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Calls</p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Tabs & Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Info & Tabs */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-col gap-1">
                  {["Overview", "Settings", "Security"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${
                        activeTab === tab 
                          ? "bg-blue-50 text-blue-700 font-bold" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tab === "Overview" && <User size={18} />}
                      {tab === "Settings" && <Edit3 size={18} />}
                      {tab === "Security" && <Shield size={18} />}
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Email Address</p>
                          <p className="text-slate-700 break-all">{session?.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                          <p className="text-slate-700">{profileData.phone}</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Location</p>
                          <p className="text-slate-700">{profileData.location}</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Joined Date</p>
                          <p className="text-slate-700">{profileData.joinDate}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Column: Dynamic Content */}
              <div className="lg:col-span-8">
                
                {activeTab === "Overview" && (
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-2">About</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{profileData.bio}</p>
                     </div>

                     <h3 className="font-bold text-slate-900">Performance Metrics</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                           <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={24} /></div>
                           <div><p className="text-2xl font-bold text-slate-800">98%</p><p className="text-xs text-slate-500">Resolution Rate</p></div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                           <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Clock size={24} /></div>
                           <div><p className="text-2xl font-bold text-slate-800">4m 30s</p><p className="text-xs text-slate-500">Avg. Call Time</p></div>
                        </div>
                         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                           <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Star size={24} /></div>
                           <div><p className="text-2xl font-bold text-slate-800">120</p><p className="text-xs text-slate-500">5-Star Reviews</p></div>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === "Settings" && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-slate-900 mb-6">Edit Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <input type="text" defaultValue={session?.user?.name || ""} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Role</label>
                        <input type="text" defaultValue={profileData.role} disabled className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-sm" />
                      </div>
                       <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Phone</label>
                        <input type="text" defaultValue={profileData.phone} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                       <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Location</label>
                        <input type="text" defaultValue={profileData.location} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Bio</label>
                         <textarea defaultValue={profileData.bio} rows={4} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2">
                        <Save size={18} /> Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "Security" && (
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-2">
                      <h3 className="font-bold text-slate-900 mb-4">Security Settings</h3>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                            <div><p className="font-medium text-slate-800">Password</p><p className="text-xs text-slate-500">Manage your login credentials</p></div>
                            <button className="text-blue-600 text-sm font-semibold hover:underline">Change Password</button>
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