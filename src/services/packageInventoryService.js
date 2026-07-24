import { prisma } from "../prisma/client.js";

const HOLDING_STATUSES = ["PENDING", "PAID"];

function soldOutError() {
  const err = new Error("This package is sold out");
  err.statusCode = 409;
  err.code = "PACKAGE_SOLD_OUT";
  return err;
}

/**
 * Lock package row and ensure exclusive purchase inventory has room.
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {string} packageId
 * @param {{ excludeRegistrationId?: string }} [opts] — exclude a registration already holding a slot (checkout)
 */
export async function assertPackagePurchaseAvailable(tx, packageId, opts = {}) {
  const { excludeRegistrationId } = opts;

  await tx.$queryRaw`SELECT id FROM "Package" WHERE id = ${packageId} FOR UPDATE`;

  const pkg = await tx.package.findUnique({ where: { id: packageId } });
  if (!pkg) {
    const err = new Error("Package not found");
    err.statusCode = 404;
    throw err;
  }

  if (!pkg.exclusive || pkg.exclusiveLimit == null) {
    return pkg;
  }

  const heldCount = await tx.registration.count({
    where: {
      packageId,
      status: { in: HOLDING_STATUSES },
      ...(excludeRegistrationId ? { id: { not: excludeRegistrationId } } : {}),
    },
  });

  if (heldCount >= pkg.exclusiveLimit) {
    throw soldOutError();
  }

  return pkg;
}

export async function countHeldPurchases(packageId, client = prisma) {
  return client.registration.count({
    where: {
      packageId,
      status: { in: HOLDING_STATUSES },
    },
  });
}

export function enrichPackageWithInventory(pkg, purchasedCount) {
  if (!pkg.exclusive || pkg.exclusiveLimit == null) {
    return {
      ...pkg,
      purchasedCount: null,
      remainingPurchases: null,
      soldOut: false,
    };
  }

  const remainingPurchases = Math.max(0, pkg.exclusiveLimit - purchasedCount);
  return {
    ...pkg,
    purchasedCount,
    remainingPurchases,
    soldOut: remainingPurchases <= 0,
  };
}
