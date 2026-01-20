import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: NextRequest) {
      try {
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }

            const body = await request.json();
            const { newPassword } = body; // For first time login, we just need new password

            if (!newPassword || newPassword.length < 6) {
                  return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
            }

            const userId = parseInt(session.user.id);

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 1. Fetch current user to check their status
            const currentUser = await prisma.call_center_user.findUnique({
                  where: { user_id: userId },
            });

            if (!currentUser) {
                  return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            const updateData: any = {
                  password: hashedPassword,
                  last_login_at: new Date(),
            };
            if (currentUser.status === "pending") {
                  updateData.status = "active";
            }

            // Update the user
            await prisma.call_center_user.update({
                  where: { user_id: userId },
                  data: updateData,
            });

            return NextResponse.json({ message: "Password updated successfully", action: "logout" }, { status: 200 });

      } catch (error) {
            console.error("CHANGE_PASSWORD_ERROR:", error);
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
      }
}