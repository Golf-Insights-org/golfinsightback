import { prisma } from "../prisma/client.js";

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { date: "asc" },
  });
}

/** Public home page: single featured event (admin toggles showOnIndex). */
export async function getIndexFeaturedEvent() {
  return prisma.event.findFirst({
    where: { showOnIndex: true },
    orderBy: { date: "asc" },
  });
}

export async function getEventWithPackagesById(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      packages: {
        orderBy: [{ category: "asc" }, { price: "desc" }, { name: "asc" }],
      },
    },
  });

  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  return event;
}

