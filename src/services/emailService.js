import { Resend } from "resend";
import { env } from "../config/env.js";

function getFrontendUrl() {
  const base = env.FRONTEND_URL || env.APP_BASE_URL;
  return base.replace(/\/$/, "");
}

const resendClient =
  env.RESEND_API_KEY && env.EMAIL_FROM ? new Resend(env.RESEND_API_KEY) : null;

async function sendResendEmail({ to, subject, html }) {
  if (!resendClient || !env.EMAIL_FROM) {
    // Email is optional; log and exit gracefully.
    // eslint-disable-next-line no-console
    console.warn("Resend email skipped: RESEND_API_KEY or EMAIL_FROM not configured");
    return;
  }

  if (!to) {
    // eslint-disable-next-line no-console
    console.warn("Resend email skipped: missing recipient address");
    return;
  }

  try {
    const result = await resendClient.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (result.error) {
      // eslint-disable-next-line no-console
      console.error("Resend email failed", result.error);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Resend email error", err);
  }
}

export async function sendRegistrationConfirmationEmail({ registration, event }) {
  const baseUrl = getFrontendUrl();
  const registrationUrl = `${baseUrl}/registration/success?registrationId=${encodeURIComponent(
    registration.id,
  )}`;

  const subject = `Your registration for ${event?.name || "our golf event"}`;
  const html = `
    <p>Hi ${registration.name},</p>
    <p>Thank you for registering for <strong>${event?.name || "our golf event"}</strong>.</p>
    <p>
      Event details:<br />
      <strong>Date:</strong> ${event ? new Date(event.date).toLocaleString() : "TBA"}<br />
      <strong>Location:</strong> ${event?.location || "TBA"}
    </p>
    <p>
      You can view your registration details here:<br />
      <a href="${registrationUrl}">${registrationUrl}</a>
    </p>
    <p>We look forward to seeing you on the course.</p>
    <p>— Golf Insights Foundation</p>
  `;

  await sendResendEmail({
    to: registration.email,
    subject,
    html,
  });
}

export async function sendDonationConfirmationEmail({ donation }) {
  const baseUrl = getFrontendUrl();
  const foundationUrl = `${baseUrl}/foundation`;
  const amount = typeof donation.amount === "number" ? donation.amount : 0;
  const amountFormatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  const subject = "Thank you for your donation";
  const html = `
    <p>Hi ${donation.name},</p>
    <p>Thank you for your generous donation of <strong>${amountFormatted}</strong> to the Golf Insights Foundation.</p>
    <p>Your support helps us expand programs, reach more communities, and create lasting impact.</p>
    <p>
      Learn more about the Foundation here:<br />
      <a href="${foundationUrl}">${foundationUrl}</a>
    </p>
    <p>— Golf Insights Foundation</p>
  `;

  await sendResendEmail({
    to: donation.email,
    subject,
    html,
  });
}
