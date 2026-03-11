import { asyncHandler } from "../utils/asyncHandler.js";
import { createRegistration, getRegistrationById } from "../services/registrationService.js";
import { prisma } from "../prisma/client.js";

async function getDefaultEventId() {
  const event = await prisma.event.findFirst({ orderBy: { date: "desc" } });
  if (!event) {
    const err = new Error("No event configured");
    err.statusCode = 500;
    throw err;
  }
  return event.id;
}

export const postRegistration = asyncHandler(async (req, res) => {
  const eventId = req.body.eventId || (await getDefaultEventId());
  const registration = await createRegistration({
    eventId,
    packageId: req.body.packageId,
    contact: {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    },
    donationAmount: req.body.donationAmount ? parseInt(req.body.donationAmount, 10) : undefined,
    golfers: req.body.golfers || [],
  });

  res.status(201).json(registration);
});

export const getRegistration = asyncHandler(async (req, res) => {
  const registration = await getRegistrationById(req.params.id);
  res.json(registration);
});

