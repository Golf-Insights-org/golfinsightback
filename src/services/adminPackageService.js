import { prisma } from "../prisma/client.js";

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
}) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

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
      exclusive: exclusive ?? false,
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
  if (data.exclusive !== undefined) updateData.exclusive = data.exclusive;

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
