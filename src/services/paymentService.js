import { prisma } from "../prisma/client.js";
import { stripe } from "../utils/stripe.js";
import { env } from "../config/env.js";
import { sendRegistrationConfirmationEmail } from "./emailService.js";

function computeAmountCents(registration) {
  const pkgPrice = registration.package.price;
  if (registration.package.category === "DONATION") {
    return registration.donationAmount || 0;
  }
  return pkgPrice;
}

function getFrontendBaseUrl() {
  const base = env.FRONTEND_URL || env.APP_BASE_URL;
  return base.replace(/\/$/, "");
}

export async function createCheckoutSession({ registrationId }) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { package: true, event: true },
  });
  if (!registration) {
    const err = new Error("Registration not found");
    err.statusCode = 404;
    throw err;
  }
  if (registration.status !== "PENDING") {
    const err = new Error("Registration is not pending");
    err.statusCode = 409;
    throw err;
  }

  const amount = computeAmountCents(registration);
  if (!amount || amount < 50) {
    const err = new Error("Amount must be at least 50 cents");
    err.statusCode = 422;
    throw err;
  }

  const frontendBase = getFrontendBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${frontendBase}/registration/success?registrationId=${registration.id}`,
    cancel_url: `${frontendBase}/registration/cancel?registrationId=${registration.id}`,
    customer_email: registration.email,
    metadata: {
      registrationId: registration.id,
      eventId: registration.eventId,
      packageId: registration.packageId,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: registration.package.name,
            description: registration.package.description,
          },
        },
      },
    ],
  });

  await prisma.payment.create({
    data: {
      registrationId: registration.id,
      amount,
      provider: "stripe",
      providerRef: session.id,
      status: "PENDING",
    },
  });

  return { id: session.id, url: session.url };
}

export async function handleStripeWebhook({ rawBody, signature }) {
  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const registrationId = session.metadata?.registrationId;
    if (!registrationId) return { received: true };

    const paymentRef = session.id;
    const amountTotal = session.amount_total ?? undefined;

    const registration = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { provider: "stripe", providerRef: paymentRef },
      });

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", amount: amountTotal ?? payment.amount },
        });
      } else {
        await tx.payment.create({
          data: {
            registrationId,
            amount: amountTotal || 0,
            provider: "stripe",
            providerRef: paymentRef,
            status: "PAID",
          },
        });
      }

      await tx.registration.update({
        where: { id: registrationId },
        data: { status: "PAID" },
      });
      return tx.registration.findUnique({
        where: { id: registrationId },
        include: { event: true },
      });
    });

    // Fire-and-forget email; errors are logged but don't break the webhook.
    if (registration) {
      await sendRegistrationConfirmationEmail({
        registration,
        event: registration.event,
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const paymentRef = session.id;
    await prisma.payment.updateMany({
      where: { provider: "stripe", providerRef: paymentRef, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }

  return { received: true };
}

