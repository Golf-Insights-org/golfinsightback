import { asyncHandler } from "../utils/asyncHandler.js";
import { createCheckoutSession, handleStripeWebhook } from "../services/paymentService.js";

export const postCreatePayment = asyncHandler(async (req, res) => {
  const { registrationId } = req.body;
  const session = await createCheckoutSession({ registrationId });
  res.json(session);
});

export const postWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) return res.status(400).json({ error: "Missing stripe-signature header" });

  const result = await handleStripeWebhook({ rawBody: req.rawBody, signature });
  res.json(result);
});

