import { prisma } from "../prisma/client.js";
import { uploadImageFromBuffer } from "../utils/cloudinary.js";

const ALLOWED_CATEGORIES = ["SPONSORSHIP", "SIGNAGE"];

export async function uploadSponsorLogo({ registrationId, fileBuffer }) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { package: true },
  });

  if (!registration) {
    const err = new Error("Registration not found");
    err.statusCode = 404;
    throw err;
  }

  if (!ALLOWED_CATEGORIES.includes(registration.package.category)) {
    const err = new Error("Logo upload is only available for sponsorship and signage packages");
    err.statusCode = 422;
    throw err;
  }

  const { url } = await uploadImageFromBuffer(fileBuffer, "sponsor-logos");

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: { sponsorLogoUrl: url },
    include: { package: true, event: true },
  });

  return updated;
}
