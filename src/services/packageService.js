import { prisma } from "../prisma/client.js";

export async function listPackages() {
  return prisma.package.findMany({ orderBy: [{ category: "asc" }, { price: "asc" }, { name: "asc" }] });
}

