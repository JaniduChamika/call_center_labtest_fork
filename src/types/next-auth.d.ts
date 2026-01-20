import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // Using a Union type is safer than just 'string'
      role: "SUPER_ADMIN" | "ADMIN" | "CALL_AGENT" | "DOCTOR";
      status: "active" | "inactive" | "suspended" | "pending";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    status: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
  }
}