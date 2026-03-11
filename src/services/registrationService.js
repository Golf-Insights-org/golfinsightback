import { prisma } from "../prisma/client.js";

export async function createRegistration({ eventId, packageId, contact, donationAmount, golfers }) {
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) {
    const err = new Error("Package not found");
    err.statusCode = 404;
    throw err;
  }

  if (pkg.category === "DONATION") {
    if (!donationAmount || donationAmount < 1) {
      const err = new Error("donationAmount is required for donation packages");
      err.statusCode = 422;
      throw err;
    }
  }

  const wantsGolfers = pkg.category === "GOLF";
  const createGolfers = wantsGolfers && Array.isArray(golfers) ? golfers : [];

  return prisma.registration.create({
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

