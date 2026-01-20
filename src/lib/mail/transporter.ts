import nodemailer from "nodemailer";
// 4️⃣ Setup nodemailer transporter
export const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
            user: process.env.EMAIL_USER!,  // '!' ensures TS knows this is defined
            pass: process.env.EMAIL_PASS!,
      },
});