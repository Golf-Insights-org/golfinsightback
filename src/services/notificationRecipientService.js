import { prisma } from "../prisma/client.js";

const MAX_RECIPIENTS = 10;

export async function listNotificationRecipients() {
  return prisma.notificationRecipient.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createNotificationRecipient(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    const err = new Error("email is required");
    err.statusCode = 422;
    throw err;
  }

  const count = await prisma.notificationRecipient.count();
  if (count >= MAX_RECIPIENTS) {
    const err = new Error(`Maximum of ${MAX_RECIPIENTS} notification emails allowed`);
    err.statusCode = 422;
    throw err;
  }

  try {
    return await prisma.notificationRecipient.create({
      data: { email: normalized },
    });
  } catch (e) {
    if (e?.code === "P2002") {
      const err = new Error("That email is already on the notification list");
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

export async function deleteNotificationRecipient(id) {
  const existing = await prisma.notificationRecipient.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Notification recipient not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.notificationRecipient.delete({ where: { id } });
  return { deleted: true };
}
