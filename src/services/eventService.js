import { prisma } from "../prisma/client.js";

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { date: "asc" },
  });
}

export async function getEventWithPackagesById(id) {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  const packages = await prisma.package.findMany({
    orderBy: [{ category: "asc" }, { price: "asc" }, { name: "asc" }],
  });

  return { ...event, packages };
}

