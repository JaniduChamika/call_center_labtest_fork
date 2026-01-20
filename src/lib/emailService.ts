import nodemailer from 'nodemailer';

// Configure your email provider (Gmail example)
// Make sure to add EMAIL_USER and EMAIL_PASS to your .env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

export const sendLabBookingEmail = async (to: string | null, bookingDetails: any) => {
  if (!to) return; // Skip if no email provided

  const mailOptions = {
    from: `"eChanneling Lab" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `Lab Booking Confirmed - Ref: ${bookingDetails.public_id}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Booking Confirmation</h2>
        <p>Dear <strong>${bookingDetails.patient_name}</strong>,</p>
        <p>Your lab test request has been successfully received.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Reference ID</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 1.1em;">${bookingDetails.public_id}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Test Type</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${bookingDetails.testName}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Laboratory</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${bookingDetails.labName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Date & Time</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${new Date(bookingDetails.booking_date).toLocaleDateString()} @ ${bookingDetails.booking_time}</td>
          </tr>
        </table>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; font-size: 0.9em; color: #1e40af;">
          <strong>Note:</strong> Please arrive 10 minutes early. Bring your NIC and this reference number.
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #64748b;">
          Thank you for using eChanneling services.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};