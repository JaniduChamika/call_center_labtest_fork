"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // 1. Import Session & SignOut
import { Bell, User, ChevronDown, LogOut } from "lucide-react";

interface HeaderProps {
  title?: string;
  // Optional overrides, but defaults will come from Session now
  userName?: string; 
  userEmail?: string;
  notificationCount?: number;
}

const Header = ({
  title = "Call Center Dashboard",
  notificationCount = 1,
}: HeaderProps) => {
  const router = useRouter();
  const { data: session } = useSession(); // 2. Get Real Data

  // 3. Fallback logic: Session -> Defaults
  const displayName = session?.user?.name || "Agent";
  const displayEmail = session?.user?.email || "agent@channelling.com";
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
        <button className="relative p-2 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-blue-900" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown Trigger */}
        <div 
          onClick={() => router.push("/pages/profile")}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors group"
        >
          
          {/* Avatar Circle */}
          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white shadow-md ring-2 ring-blue-50 group-hover:ring-blue-100 transition-all font-bold">
             {/* Show Initial if name exists, otherwise icon */}
             {session?.user?.name ? initial : <User className="w-5 h-5" />}
          </div>

          {/* User Details */}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-bold text-slate-900 leading-none mb-1">
              {displayName}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {displayEmail}
            </span>
          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>

        {/* Sign Out Button
        <button 
            onClick={(e) => {
                e.stopPropagation(); 
                if(confirm("Are you sure you want to log out?")) signOut({ callbackUrl: "/pages/login" });
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Sign Out"
        >
            <LogOut size={18} />
        </button> */}

      </div>
    </header>
  );
};

export default Header;