import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";
import { getPagination } from "../utils/pagination.js";

export async function adminLogin({ email, password }) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  const token = jwt.sign({ sub: admin.id, email: admin.email }, env.ADMIN_JWT_SECRET, {
    expiresIn: env.ADMIN_JWT_EXPIRES_IN,
  });
  return { token };
}

export async function listRegistrations({ query }) {
  const { skip, take, page, pageSize } = getPagination(query);
  const category = query.category;
  const status = query.status;
  const packageId = query.packageId;
  const eventId = query.eventId;

  const where = {
    ...(status ? { status } : {}),
    ...(eventId ? { eventId } : {}),
    ...(packageId ? { packageId } : {}),
    ...(category ? { package: { category } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: { package: true, event: true, golfers: true, payments: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.registration.count({ where }),
  ]);

  return { items, page, pageSize, total };
}

export async function listPayments({ query }) {
  const { skip, take, page, pageSize } = getPagination(query);
  const status = query.status;
  const provider = query.provider;

  const where = {
    ...(status ? { status } : {}),
    ...(provider ? { provider } : {}),
  };

  const [items, total, totals] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { registration: { include: { package: true, event: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  return { items, page, pageSize, total, paidTotals: { amount: totals._sum.amount || 0, count: totals._count._all } };
}

export async function listSponsors() {
  return prisma.registration.findMany({
    where: { package: { category: "SPONSORSHIP" } },
    include: { package: true, event: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listGolfers({ format }) {
  const golfers = await prisma.golfer.findMany({
    include: { registration: { include: { package: true, event: true } } },
    //orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const header = ["golferName", "golferEmail", "registrationName", "registrationEmail", "packageName", "eventName"].join(
      ",",
    );
    const rows = golfers.map((g) =>
      [
        g.name,
        g.email || "",
        g.registration.name,
        g.registration.email,
        g.registration.package.name,
        g.registration.event.name,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    return { contentType: "text/csv", body: [header, ...rows].join("\n") };
  }

  return { contentType: "application/json", body: golfers };
}

