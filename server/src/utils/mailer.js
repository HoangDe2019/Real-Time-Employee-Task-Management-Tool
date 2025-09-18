import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

function resolveBool(value, defaultValue = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  return defaultValue;
}

const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpSecure = resolveBool(process.env.SMTP_SECURE, smtpPort === 465);
const mailFrom = process.env.MAIL_FROM || smtpUser || 'no-reply@example.com';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
});

export async function sendMail({ to, subject, text, html, from }) {
  const mailOptions = {
    from: from || mailFrom,
    to,
    subject,
    text,
    html
  };
  const info = await transporter.sendMail(mailOptions);
  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response };
}


