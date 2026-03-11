import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function getTransport() {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export async function sendRegistrationConfirmationEmail({ to, subject, html }) {
  const transport = getTransport();
  if (!transport || !env.SMTP_FROM) return;
  await transport.sendMail({ from: env.SMTP_FROM, to, subject, html });
}

