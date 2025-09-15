// backend/services/email.service.js
const nodemailer = require("nodemailer");

const FROM = process.env.EMAIL_FROM || "no-reply@gfam.org";

// reusable transporter instance
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT || 587,
  secure: false, // use true if port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// build confirmation email
function buildConfirmationEmail(att, code) {
  return {
    subject: "Registration Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; color:#222">
        <h2>Registration Confirmed</h2>
        <p>Hi ${att.firstName},</p>
        <p>Thanks for registering for the event. Your confirmation code is:</p>
        <div style="padding:12px;border:1px dashed #1976d2;background:#f5f9ff">
          <strong>${code}</strong>
        </div>
        <p>Prayer slot: ${att.prayerTime ? new Date(att.prayerTime).toLocaleString() : "TBD"}</p>
        <p>Rope Color: ${att.ropeColor}</p>
        <p>Coordinator: ${att.coordinator?.name} (${att.coordinator?.phone})</p>
        <p>See you soon — GFAM Team</p>
      </div>
    `,
  };
}

// send email
async function sendConfirmationEmail(att, code) {
  const { subject, html } = buildConfirmationEmail(att, code);

  await transporter.sendMail({
    from: FROM,
    to: att.email,
    subject,
    html,
  });
}

module.exports = { sendConfirmationEmail };
