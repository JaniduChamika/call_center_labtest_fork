// app/api/send-appointment-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mail/transporter";
import { humanizeStatus } from "@/lib/utils";


export async function sendAppointmentEmail(appointment_id: string) {
      try {

            if (!appointment_id) {
                  return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 });
            }

            // 1️⃣ Fetch appointment details
            const appointment = await prisma.appointments.findUnique({
                  where: { public_id: appointment_id },
                  include: {
                        patients: true,
                        doctors: true,
                        hospitals: true,
                  },
            });

            if (!appointment) {
                  return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
            }

            // 2️⃣ Ensure patient email exists
            const patientEmail = appointment.patients.email;
            if (!patientEmail) {
                  return NextResponse.json({ error: "Patient email not available" }, { status: 400 });
            }

            // 3️⃣ Compose HTML email content (beautiful version)
            const emailHTML = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="text-align: center; color: #4CAF50;">Appointment Confirmation</h2>
    <p>Dear <strong>${appointment.patients.name}</strong>,</p>
    <p>We are pleased to confirm your upcoming appointment. Here are the details:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="background-color: #f1f1f1;">
        <td style="padding: 10px; font-weight: bold;">Date</td>
        <td style="padding: 10px;">${appointment.start_time.toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Time</td>
        <td style="padding: 10px;">${appointment.start_time.toLocaleTimeString()} - ${appointment.end_time.toLocaleTimeString()}</td>
      </tr>
      <tr style="background-color: #f1f1f1;">
        <td style="padding: 10px; font-weight: bold;">Hospital</td>
        <td style="padding: 10px;">${appointment.hospitals.name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Doctor</td>
        <td style="padding: 10px;">Dr. ${appointment.doctors.name}</td>
      </tr>
      <tr style="background-color: #f1f1f1;">
        <td style="padding: 10px; font-weight: bold;">Status</td>
        <td style="padding: 10px;">${humanizeStatus(appointment.status)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Payment</td>
        <td style="padding: 10px;">
          <a href="${appointment.payment_link}" style="background-color: #4CAF50; color: white; padding: 8px 12px; text-decoration: none; border-radius: 5px;">Pay Now</a>
        </td>
      </tr>
    </table>

    <p style="margin-top: 20px;">Thank you for choosing our service. We look forward to seeing you!</p>

    <p style="font-size: 12px; color: #777; margin-top: 30px; text-align: center;">
      &copy; ${new Date().getFullYear()} Your Healthcare Company. All rights reserved.
    </p>
  </div>
`;



            // 5️⃣ Send the email
            await transporter.sendMail({
                  from: process.env.EMAIL_USER!,
                  to: patientEmail,
                  subject: "Appointment Details",
                  html: emailHTML, // Using HTML for nicer formatting
            });

            return NextResponse.json({ success: true, message: "Email sent successfully" });

      } catch (error: any) {
            console.error("SEND_APPOINTMENT_EMAIL_ERROR:", error);
            return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
      }
}