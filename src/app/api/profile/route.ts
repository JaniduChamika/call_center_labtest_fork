import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const user = await prisma.call_center_user.findUnique({
      where: { email: email },
      select: {
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true, // Assuming you have this column
        // Add other fields if they exist in your DB, e.g. phone_number
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the data
    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      // If your DB doesn't have phone/bio yet, send mocks or empty strings
      phone: "077 123 4567", // Placeholder until you add phone column
      bio: `Administrator account for ${user.name}`,
      createdAt: user.created_at,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}