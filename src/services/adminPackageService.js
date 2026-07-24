import { prisma } from "../prisma/client.js";

function normalizeExclusiveFields({ exclusive, exclusiveLimit }) {
  const isExclusive = exclusive ?? false;
  if (!isExclusive) {
    return { exclusive: false, exclusiveLimit: null };
  }
  if (exclusiveLimit == null || exclusiveLimit < 1) {
    const err = new Error("exclusiveLimit is required (min 1) when exclusive is true");
    err.statusCode = 422;
    throw err;
  }
  return { exclusive: true, exclusiveLimit };
}

export async function createPackage({
  eventId,
  name,
  description,
  category,
  price,
  earlyBirdPrice,
  earlyBirdDeadline,
  maxSlots,
  exclusive,
  exclusiveLimit,
}) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  const exclusiveFields = normalizeExclusiveFields({
    exclusive: exclusive ?? false,
    exclusiveLimit,
  });

  return prisma.package.create({
    data: {
      eventId,
      name,
      description,
      category,
      price,
      earlyBirdPrice: earlyBirdPrice ?? null,
      earlyBirdDeadline: earlyBirdDeadline ? new Date(earlyBirdDeadline) : null,
      maxSlots: maxSlots ?? null,
      ...exclusiveFields,
    },
  });
}

export async function updatePackage(id, data) {
  const existing = await prisma.package.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Package not found");
    err.statusCode = 404;
    throw err;
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.earlyBirdPrice !== undefined) updateData.earlyBirdPrice = data.earlyBirdPrice;
  if (data.earlyBirdDeadline !== undefined)
    updateData.earlyBirdDeadline = data.earlyBirdDeadline ? new Date(data.earlyBirdDeadline) : null;
  if (data.maxSlots !== undefined) updateData.maxSlots = data.maxSlots;

  if (data.exclusive !== undefined || data.exclusiveLimit !== undefined) {
    const exclusive = data.exclusive !== undefined ? data.exclusive : existing.exclusive;
    const exclusiveLimit =
      data.exclusiveLimit !== undefined ? data.exclusiveLimit : existing.exclusiveLimit;
    Object.assign(updateData, normalizeExclusiveFields({ exclusive, exclusiveLimit }));
  }

  return prisma.package.update({ where: { id }, data: updateData });
}

export async function deletePackage(id) {
  const regCount = await prisma.registration.count({ where: { packageId: id } });
  if (regCount > 0) {
    const err = new Error("Cannot delete package with existing registrations");
    err.statusCode = 409;
    throw err;
  }

  await prisma.package.delete({ where: { id } });
  return { deleted: true };
}
