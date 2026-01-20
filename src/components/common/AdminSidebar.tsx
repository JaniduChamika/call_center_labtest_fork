"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { logoutUser } from "@/lib/dataService"; 
import { 
  Home, 
  Users, 
  UserPlus, 
  ClipboardList,
  FlaskConical, 
  LogOut 
} from "lucide-react";

// Define the menu structure based on your admin paths
const menuItems = [
  {
    name: "Dashboard",
    path: "/pages/admin/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Manage Agents",
    path: "/pages/admin/agents",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Add New Agent",
    path: "/pages/admin/newagents",
    icon: <UserPlus className="w-5 h-5" />,
  },
  {
    name: "All Appointments",
    path: "/pages/admin/appointments",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    name: "Lab Requests",
    path: "/pages/admin/lab-booking",
    icon: <FlaskConical size={20} className="w-5 h-5" />,
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter(); 

  // Logout Handler Function
  const handleLogout = () => {
    logoutUser();
    router.push("/"); 
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 font-sans">
      {/* Logo Section */}
      <div className="flex items-center gap-2 p-6">
        <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-green-500 text-green-600 font-bold italic">
          e
        </div>
        <span className="text-blue-900 font-bold text-lg tracking-wide uppercase">
          CHANNELLING
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-[#111827] text-white shadow-md" // Dark background for active item
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-100 mb-4">
        <button 
          onClick={handleLogout}
          // 👇 FIX: Add this line to stop the console error
          suppressHydrationWarning={true}
          className="flex items-center gap-3 px-4 py-2 w-full text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;