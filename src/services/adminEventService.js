import { prisma } from "../prisma/client.js";

export async function listAdminEvents() {
  return prisma.event.findMany({
    include: {
      _count: { select: { packages: true, registrations: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getAdminEvent(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      packages: { orderBy: [{ category: "asc" }, { price: "desc" }] },
      _count: { select: { registrations: true } },
    },
  });
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  return event;
}

export async function createEvent({ name, description, date, location }) {
  return prisma.event.create({
    data: { name, description: description ?? null, date: new Date(date), location },
  });
}

export async function updateEvent(id, { name, description, date, location }) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  return prisma.event.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(location !== undefined && { location }),
    },
  });
}

export async function deleteEvent(id) {
  const regCount = await prisma.registration.count({ where: { eventId: id } });
  if (regCount > 0) {
    const err = new Error("Cannot delete event with existing registrations");
    err.statusCode = 409;
    throw err;
  }

  await prisma.event.delete({ where: { id } });
  return { deleted: true };
}
