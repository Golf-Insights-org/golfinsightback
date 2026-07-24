import { prisma } from "../prisma/client.js";
import { assertPackagePurchaseAvailable } from "./packageInventoryService.js";

export async function createRegistration({ eventId, packageId, contact, donationAmount, golfers }) {
  return prisma.$transaction(async (tx) => {
    const pkg = await assertPackagePurchaseAvailable(tx, packageId);

    if (pkg.category === "DONATION") {
      if (!donationAmount || donationAmount < 1) {
        const err = new Error("donationAmount is required for donation packages");
        err.statusCode = 422;
        throw err;
      }
    }

    const wantsGolfers = pkg.category === "GOLF";
    const createGolfers = wantsGolfers && Array.isArray(golfers) ? golfers : [];

    if (wantsGolfers && pkg.maxSlots != null && createGolfers.length > pkg.maxSlots) {
      const err = new Error(`This package allows at most ${pkg.maxSlots} golfers`);
      err.statusCode = 422;
      throw err;
    }

    return tx.registration.create({
      data: {
        eventId,
        packageId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zip: contact.zip,
        donationAmount: pkg.category === "DONATION" ? donationAmount : null,
        status: "PENDING",
        golfers: createGolfers.length
          ? {
              create: createGolfers.map((g) => ({
                name: g.name,
                email: g.email || null,
              })),
            }
          : undefined,
      },
      include: { package: true, golfers: true, event: true },
    });
  });
}

export async function getRegistrationById(id) {
  const reg = await prisma.registration.findUnique({
    where: { id },
    include: { package: true, golfers: true, payments: { orderBy: { createdAt: "desc" } }, event: true },
  });
  if (!reg) {
    const err = new Error("Registration not found");
    err.statusCode = 404;
    throw err;
  }
  return reg;
}
