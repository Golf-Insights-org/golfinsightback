import { asyncHandler } from "../utils/asyncHandler.js";
import { createDonation } from "../services/donationService.js";
import { createDonationCheckoutSession } from "../services/paymentService.js";

export const postCreateDonation = asyncHandler(async (req, res) => {
  const { name, email, amount } = req.body;

  const donation = await createDonation({
    name,
    email,
    amount: parseInt(amount, 10),
  });

  const session = await createDonationCheckoutSession({ donationId: donation.id });
  res.json({ donationId: donation.id, ...session });
});

