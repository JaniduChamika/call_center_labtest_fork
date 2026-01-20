"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // 1. Import useSession
import { Bell, User, ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react"; // Optional: For logout capability

interface AdminHeaderProps {
  title?: string;
  // We keep these optional in case you want to override them manually, 
  // but they will default to session data now.
  userName?: string;
  userEmail?: string;
  notificationCount?: number;
}

const AdminHeader = ({
  title = "Admin Dashboard",
  userName, // specific prop overrides
  userEmail,
  notificationCount = 3,
}: AdminHeaderProps) => {
  const router = useRouter();
  const { data: session } = useSession(); // 2. Fetch Session Data

  // 3. Determine Display Values (Session > Prop > Default)
  const displayName = session?.user?.name || userName || "System Admin";
  const displayEmail = session?.user?.email || userEmail || "admin@channelling.com";

  // Optional: Get initials for avatar (e.g., "John Doe" -> "J")
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      
      {/* --- Left Section: Title --- */}
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
        <h1 className="text-xl font-bold text-blue-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* --- Right Section: Actions & Profile --- */}
      <div className="flex items-center gap-6">
        
        {/* Notification Bell */}
        <button 
        suppressHydrationWarning={true}
        className="relative p-2 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-blue-900" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Profile Trigger */}
        <div 
          onClick={() => router.push("/pages/admin/profile")}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors group"
        >
          
          {/* Dynamic Avatar */}
          <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white shadow-md ring-2 ring-blue-50 group-hover:ring-blue-100 transition-all font-bold">
            {/* Show Initial if name exists, otherwise icon */}
            {session?.user?.name ? initial : <User className="w-5 h-5" />}
          </div>

          {/* User Details (Connected to Session) */}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-bold text-slate-900 leading-none mb-1">
              {displayName}
            </span>
            <span className="text-xs text-slate-500 font-medium max-w-[150px] truncate">
              {displayEmail}
            </span>
          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
        
       
      </div>
    </header>
  );
};

export default AdminHeader;