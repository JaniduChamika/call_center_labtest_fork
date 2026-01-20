// "use client";

// import React from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation"; // 1. Import useRouter
// import { logoutUser } from "@/lib/dataService"; // 2. Import your data helper
// import { 
//   Calendar, 
//   Users, 
//   ClipboardList, 
//   Building2, 
//   FlaskConical,
//   LogOut 
// } from "lucide-react";

// // Define the menu structure based on your request
// const menuItems = [
//   {
//     name: "Appointment Booking",
//     path: "/pages/booking",
//     icon: <Calendar className="w-5 h-5" />,
//   },
//   {
//     name: "Bulk Booking",
//     path: "/pages/bulkbooking",
//     icon: <Users className="w-5 h-5" />,
//   },
//   // --- NEW ITEM ---
//   {
//     name: "Lab Booking",
//     path: "/pages/lab-booking", // Ensure this matches your folder structure (e.g. app/agent/lab-booking)
//     icon: <FlaskConical className="w-5 h-5" />,
//   },
//   {
//     name: "Appointments",
//     path: "/pages/appointments",
//     icon: <ClipboardList className="w-5 h-5" />,
//   },
//   {
//     name: "Lab History", // Views list (NEW)
//     path: "/pages/lab-requests",
//     icon: <ClipboardList className="w-5 h-5" />,
//   },
//   {
//     name: "Directory",
//     path: "/pages/directory",
//     icon: <Building2 className="w-5 h-5" />,
//   },
// ];

// const Sidebar = () => {
//   const pathname = usePathname();
//   const router = useRouter(); // 3. Initialize Router

//   // 4. Logout Handler Function
//   const handleLogout = () => {
//     // A. Clear user session from Local Storage
//     logoutUser();
    
//     // B. Redirect to Home (http://localhost:3000/)
//     router.push("/"); 
//   };

//   return (
//     <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
//       {/* Logo Section */}
//       <div className="flex items-center gap-2 p-6">
//         <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-green-500 text-green-600 font-bold italic">
//           e
//         </div>
//         <span className="text-blue-800 font-bold text-lg tracking-wide">
//           CHANNELLING
//         </span>
//       </div>

//       {/* Navigation Links */}
//       <nav className="flex-1 px-4 space-y-2 mt-4">
//         {menuItems.map((item) => {
//           const isActive = pathname === item.path;

//           return (
//             <Link
//               key={item.path}
//               href={item.path}
//               className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
//                 isActive
//                   ? "bg-blue-700 text-white shadow-md"
//                   : "text-blue-900 hover:bg-blue-50"
//               }`}
//             >
//               {item.icon}
//               <span className="font-medium text-sm">{item.name}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout Section */}
//       <div className="p-4 border-t border-gray-100 mb-4">
//         <button 
//           onClick={handleLogout} // 5. Attach the handler here
//           className="flex items-center gap-3 px-4 py-2 w-full text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//         >
//           <LogOut className="w-5 h-5" />
//           <span className="font-medium text-sm">Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/dataService";
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  Building2, 
  FlaskConical,
  LogOut 
} from "lucide-react";

// ... menuItems array (keep as is) ...
const menuItems = [
  {
    name: "Appointment Booking",
    path: "/pages/booking",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    name: "Bulk Booking",
    path: "/pages/bulkbooking",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Lab Booking",
    path: "/pages/lab-booking",
    icon: <FlaskConical className="w-5 h-5" />,
  },
  {
    name: "Appointments",
    path: "/pages/appointments",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    name: "Lab History",
    path: "/pages/lab-requests",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    name: "Directory",
    path: "/pages/directory",
    icon: <Building2 className="w-5 h-5" />,
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push("/"); 
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center gap-2 p-6">
        <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-green-500 text-green-600 font-bold italic">
          e
        </div>
        <span className="text-blue-800 font-bold text-lg tracking-wide">
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
                  ? "bg-blue-700 text-white shadow-md"
                  : "text-blue-900 hover:bg-blue-50"
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

export default Sidebar;