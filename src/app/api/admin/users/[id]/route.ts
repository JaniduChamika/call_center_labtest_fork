import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Define params type for dynamic route
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// --- 1. GET: Fetch Single User (For Edit Form) ---
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check Auth
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Resolve Params (Next.js 15+ requires await)
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }

    const user = await prisma.call_center_user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        // Exclude password
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("GET_USER_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// --- 2. PATCH: Update User (Status/Role) ---
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // A. Authenticate
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requesterRole = (session.user as any).role?.toString().toUpperCase();
    const resolvedParams = await params;
    const targetUserId = parseInt(resolvedParams.id);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }

    // B. Get Data
    const body = await request.json();
    const { name, email, role, status } = body;

    // C. Find Target User
    const targetUser = await prisma.call_center_user.findUnique({
      where: { user_id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // D. 🛡️ AUTHORIZATION HIERARCHY
    // 1. Call Agents cannot update anyone
    if (requesterRole !== "SUPER_ADMIN" && requesterRole !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2. Admins cannot update Super Admins or other Admins
    if (requesterRole === "ADMIN") {
      if (targetUser.role === "SUPER_ADMIN" || targetUser.role === "ADMIN") {
        return NextResponse.json({ message: "Admins cannot modify this user." }, { status: 403 });
      }
      // Admins cannot promote anyone to ADMIN
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return NextResponse.json({ message: "Admins cannot promote users to Admin level." }, { status: 403 });
      }
    }

    // E. Execute Update
    // Build update object dynamically to allow partial updates
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role) dataToUpdate.role = role;
    if (status) dataToUpdate.status = status;

    const updatedUser = await prisma.call_center_user.update({
      where: { user_id: targetUserId },
      data: dataToUpdate,
    });

    // Remove sensitive data
    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({ 
        message: "User updated successfully", 
        user: safeUser 
    }, { status: 200 });

  } catch (error) {
    console.error("UPDATE_USER_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}