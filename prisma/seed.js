import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";

  const adminHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password: adminHash },
    create: { email: adminEmail, password: adminHash },
  });

  const event = await prisma.event.upsert({
    where: { id: "default-event" },
    update: {},
    create: {
      id: "default-event",
      name: "Charity Golf Outing 2026",
      date: new Date("2026-06-15T14:00:00.000Z"),
      location: "Local Country Club",
    },
  });

  const packages = [
    {
      name: "Event Sponsor",
      description: "Premier event-level sponsorship.",
      category: "SPONSORSHIP",
      price: 1000000,
      maxSlots: 1,
    },
    {
      name: "Dinner Sponsor",
      description: "Sponsor dinner for attendees.",
      category: "SPONSORSHIP",
      price: 750000,
      maxSlots: 2,
    },
    {
      name: "Cocktail Reception Sponsor",
      description: "Sponsor the cocktail reception.",
      category: "SPONSORSHIP",
      price: 500000,
      maxSlots: 2,
    },
    {
      name: "Foursome Early Bird",
      description: "Early bird foursome registration.",
      category: "GOLF",
      price: 120000,
      maxSlots: null,
    },
    {
      name: "Foursome Standard",
      description: "Standard foursome registration.",
      category: "GOLF",
      price: 140000,
      maxSlots: null,
    },
    {
      name: "Individual Golfer Early",
      description: "Early bird individual golfer registration.",
      category: "GOLF",
      price: 32500,
      maxSlots: null,
    },
    {
      name: "Individual Golfer Standard",
      description: "Standard individual golfer registration.",
      category: "GOLF",
      price: 37500,
      maxSlots: null,
    },
    {
      name: "Dinner Only",
      description: "Dinner ticket only.",
      category: "DINNER",
      price: 22500,
      maxSlots: null,
    },
    {
      name: "Donation",
      description: "Make a custom donation amount.",
      category: "DONATION",
      price: 0,
      maxSlots: null,
    },
  ];

  for (const p of packages) {
      // Clear and reseed packages
  await prisma.package.deleteMany();

  await prisma.package.createMany({
    data: packages,
  });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded admin (${adminEmail}), event (${event.name}), and ${packages.length} packages.`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

