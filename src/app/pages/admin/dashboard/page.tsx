"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/common/AdminSidebar";
import AdminHeader from "@/components/common/AdminHeader";
import { 
  Users, UserCheck, UserX, Calendar, AlertCircle, Activity, ArrowUpRight 
} from "lucide-react";
import { useSession } from "next-auth/react";

// --- Data Types ---
interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  suspendedAgents: number;
  totalAppointmentsToday: number;
  refundRequests: number;
  systemActivity: string;
}

// --- Mock Activity (Keep this static until you have an Activity Logs table) ---
const RECENT_ACTIVITY = [
  { agent: "Agent John", action: "Booked appointment for Sarah Wilson", time: "10 mins ago" },
  { agent: "Agent Mary", action: "Cancelled appointment for Mike Brown", time: "25 mins ago" },
  { agent: "Agent David", action: "Booked appointment for Lisa Chen", time: "1 hour ago" },
  { agent: "Agent John", action: "Booked appointment for Mark Doe", time: "2 hours ago" },
  { agent: "Agent Sarah", action: "Processed refund for Ticket #9921", time: "3 hours ago" },
];

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  
  // State for Real Data
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    suspendedAgents: 0,
    totalAppointmentsToday: 0,
    refundRequests: 0,
    systemActivity: "Checking..."
  });

  // --- Fetch Data on Load ---
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        } else {
          console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Map Real Data to UI Cards
  const STATS_CARDS = [
    { 
      label: "Total Agents Registered", 
      value: stats.totalAgents, 
      icon: <Users size={24} />, 
      bg: "bg-blue-100", 
      text: "text-blue-600" 
    },
    { 
      label: "Active Agents", 
      value: stats.activeAgents, 
      icon: <UserCheck size={24} />, 
      bg: "bg-emerald-100", 
      text: "text-emerald-600" 
    },
    { 
      label: "Suspended Agents", 
      value: stats.suspendedAgents, 
      icon: <UserX size={24} />, 
      bg: "bg-amber-100", 
      text: "text-amber-600" 
    },
    { 
      label: "Total Appointments Today", 
      value: stats.totalAppointmentsToday, 
      icon: <Calendar size={24} />, 
      bg: "bg-purple-100", 
      text: "text-purple-600" 
    },
    { 
      label: "Refund Requests", 
      value: stats.refundRequests, 
      icon: <AlertCircle size={24} />, 
      bg: "bg-red-100", 
      text: "text-red-600" 
    },
    { 
      label: "System Activity", 
      value: stats.systemActivity, 
      icon: <Activity size={24} />, 
      bg: "bg-indigo-100", 
      text: "text-indigo-600" 
    },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      
      {/* 1. Sidebar */}
      <AdminSidebar />

      {/* 2. Main Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <AdminHeader 
          title="Call Center Dashboard" 
          userName={session?.user?.name || "Admin"} 
          notificationCount={2} 
        />

        {/* 3. Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? (
               // Loading Skeleton
               [...Array(6)].map((_, i) => (
                 <div key={i} className="bg-slate-50 h-32 rounded-2xl border border-slate-200 animate-pulse"></div>
               ))
            ) : (
               STATS_CARDS.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md transition-shadow cursor-default"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Agent Activity</h2>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View All <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {RECENT_ACTIVITY.map((activity, index) => (
                <div key={index} className="px-8 py-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{activity.agent}</p>
                    <p className="text-slate-500 text-sm">{activity.action}</p>
                  </div>
                  <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
            
          </div>

        </main>
      </div>
    </div>
  );
}