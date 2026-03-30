import { prisma } from "../prisma/client.js";

export async function createDonation({ name, email, amount }) {
  if (!name || !email) {
    const err = new Error("Missing required fields");
    err.statusCode = 422;
    throw err;
  }
  if (!amount || amount < 50) {
    const err = new Error("Amount must be at least 50 cents");
    err.statusCode = 422;
    throw err;
  }

  return prisma.donation.create({
    data: {
      name,
      email,
      amount,
      status: "PENDING",
    },
  });
}

