import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Define "Today" for Appointment Counts
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Run Database Queries in Parallel (Faster)
    const [
      totalAgents,
      activeAgents,
      suspendedAgents,
      appointmentsToday,
      cancelledAppointments
    ] = await prisma.$transaction([
      // A. Total Agents
      prisma.call_center_user.count({ 
        where: { role: 'CALL_AGENT' } 
      }),
      
      // B. Active Agents
      prisma.call_center_user.count({ 
        where: { role: 'CALL_AGENT', status: 'active' } 
      }),

      // C. Suspended Agents
      prisma.call_center_user.count({ 
        where: { role: 'CALL_AGENT', status: 'suspended' } 
      }),

      // D. Appointments Today
      prisma.appointments.count({
        where: {
          start_time: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),

      // E. Cancelled (Used as Proxy for "Refund Requests")
      prisma.appointments.count({
        where: { status: 'cancelled' }
      })
    ]);

    // 4. Return Data
    return NextResponse.json({
      stats: {
        totalAgents,
        activeAgents,
        suspendedAgents,
        totalAppointmentsToday: appointmentsToday,
        refundRequests: cancelledAppointments,
        systemActivity: "Normal" // You can add logic for this later
      }
    });

  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}