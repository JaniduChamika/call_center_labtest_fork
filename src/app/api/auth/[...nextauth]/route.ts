// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import from your new lib file

const handler = NextAuth(authOptions);

// Next.js App Router only allows HTTP method exports (GET, POST, etc.)
export { handler as GET, handler as POST };