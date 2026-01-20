import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// --- 1. GET: Fetch All Users (Missing in your code) ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requesterRole = (session.user as any).role?.toString().toUpperCase();

    // Allow Admin & Super Admin to view users
    if (requesterRole !== "SUPER_ADMIN" && requesterRole !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.call_center_user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error("GET_USERS_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// --- 2. POST: Create New User (Your existing code) ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requesterRole = (session.user as any).role?.toString().toUpperCase();
    const body = await request.json();
    const { name, email, password, role, status } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Authorization Logic
    if (requesterRole === "SUPER_ADMIN") {
      if (role !== "ADMIN" && role !== "CALL_AGENT") {
        return NextResponse.json({ message: "Super Admin can only create Admins or Agents" }, { status: 403 });
      }
    } 
    else if (requesterRole === "ADMIN") {
      if (role !== "CALL_AGENT") {
        return NextResponse.json({ message: "Admins can only create Call Agents" }, { status: 403 });
      }
    } 
    else {
      return NextResponse.json({ message: "Forbidden: You do not have permission to create users" }, { status: 403 });
    }

    const existingUser = await prisma.call_center_user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.call_center_user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        status: status || "active",
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error) {
    console.error("CREATE_USER_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}