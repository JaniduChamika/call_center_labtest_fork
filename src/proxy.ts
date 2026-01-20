// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const token = req.nextauth.token;
    
//     // Ensure role is a string for comparison
//     const userRole = token?.role ? String(token.role) : "";
//     const userStatus = token?.status;
//     const path = req.nextUrl.pathname;

//     // 🔴 LOGIC 1: Handle "Pending Verification" Users (Strict Quarantine)
//     if (token && userStatus === "pending") {
//       const allowedPaths = [
//         "/change-password",
//         "/api/auth/change-password",
//         "/api/auth/signout",
//         "/api/auth/session"
//       ];

//       const isAllowed = allowedPaths.some(p => path.startsWith(p));
//       if (isAllowed) return NextResponse.next();

//       if (path.startsWith("/api/")) {
//         return NextResponse.json({ message: "Account pending activation." }, { status: 403 });
//       }

//       return NextResponse.redirect(new URL("/change-password", req.url));
//     }

//     // 🔴 LOGIC 2: Protect Appointment APIs
//     if (path.startsWith("/api/appointments")) {
//       // ✅ FIX: Allow Agents, Admins, AND Super Admins
//       const allowedRoles = ["CALL_AGENT", "ADMIN", "SUPER_ADMIN"];
      
//       // Convert role to uppercase to prevent case-sensitivity bugs
//       if (!allowedRoles.includes(userRole.toUpperCase())) {
//         return NextResponse.json(
//           { message: "Access Denied: You are not authorized to manage appointments." },
//           { status: 403 }
//         );
//       }
//     }

//     // 🔴 LOGIC 3: Protect Admin Routes (Pages & API)
//     if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
//       const allowedAdminRoles = ["ADMIN", "SUPER_ADMIN"];

//       if (!allowedAdminRoles.includes(userRole.toUpperCase())) {
//          return NextResponse.json(
//           { message: "Access Denied: You are not authorized to admin pages." },
//           { status: 403 }
//         );
//       }
//     }
//   },
//   {
//     callbacks: {
//       authorized: ({ req, token }) => {
//         // Allow login page access without token
//         if (req.nextUrl.pathname === "/admin/login") return true;
//         return !!token;
//       },
//     },
//   }
// );

// export const config = {
//   matcher: [
//     "/api/doctors/:path*",       
//     "/api/appointments/:path*",   
//     "/api/patients/:path*",       
//     "/api/hospitals/:path*",      
//     "/api/specializations/:path*",
//     "/api/illnesses/:path*",      
//     "/api/admin/:path*",
//     "/api/auth/change-password",
//     // Also protect frontend admin pages if needed
//     "/admin/:path*" 
//   ],
// };


import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    // Safety check: ensure role is a string and handle missing roles
    const userRole = token?.role ? String(token.role).toUpperCase() : "";
    const userStatus = token?.status;
    const path = req.nextUrl.pathname;

    console.log(`[Middleware] Role: ${userRole} | Path: ${path}`); // Debugging

    // 🔴 LOGIC 1: Handle "Pending" Users (Strict Quarantine)
    if (token && userStatus === "pending") {
      const allowedPaths = [
        "/change-password",
        "/api/auth/change-password",
        "/api/auth/signout",
        "/api/auth/session"
      ];

      if (allowedPaths.some(p => path.startsWith(p))) return NextResponse.next();

      if (path.startsWith("/api/")) {
        return NextResponse.json({ message: "Account pending activation." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/change-password", req.url));
    }

    // 🔴 LOGIC 2: Protect Appointment APIs (Agents + Admins)
    if (path.startsWith("/api/appointments")) {
      const allowedRoles = ["CALL_AGENT", "ADMIN", "SUPER_ADMIN"];
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { message: "Access Denied: Appointment management is restricted." },
          { status: 403 }
        );
      }
    }

    // 🔴 LOGIC 3: Protect Admin Routes (Pages & APIs)
    // Checks for "/admin" (Frontend) AND "/api/admin" (Backend)
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      const allowedAdminRoles = ["ADMIN", "SUPER_ADMIN"];

      if (!allowedAdminRoles.includes(userRole)) {
         // If it's an API call, return JSON
         if (path.startsWith("/api/")) {
            return NextResponse.json(
              { message: "Access Denied: Admin privileges required." },
              { status: 403 }
            );
         }
         // If it's a Frontend Page load, REDIRECT to login
         return NextResponse.redirect(new URL("/api/auth/signin", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Always allow access to the login page
        if (req.nextUrl.pathname.startsWith("/admin/login")) return true;
        // Otherwise, require a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect API Routes
    "/api/doctors/:path*",       
    "/api/appointments/:path*",   
    "/api/patients/:path*",       
    "/api/hospitals/:path*",      
    "/api/specializations/:path*",
    "/api/illnesses/:path*",      
    "/api/admin/:path*",
    "/api/auth/change-password",
    
    // Protect Frontend Admin Pages
    "/admin/:path*" 
  ],
};