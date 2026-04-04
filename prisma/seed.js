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

  const eventDescription =
    "This isn’t just a golf outing, it’s a movement. The 2026 Golf Insight Foundation Outing will set a new standard for what it means to play with purpose. With electrifying entertainment, vibrant culture, and a powerful mission at the core, this event fuses golf, community, and philanthropy like never before. Proceeds will help fund golf programming for underserved youth and individuals with disabilities.";

  const event = await prisma.event.upsert({
    where: { id: "default-event" },
    update: { description: eventDescription },
    create: {
      id: "default-event",
      name: "Golf Insights Foundation 2026 Golf Outing",
      description: eventDescription,
      date: new Date("2026-10-01T12:00:00.000Z"),
      location: "Inwood Country Club",
    },
  });

  const earlyBirdDeadline = new Date("2026-06-30T23:59:59.000Z");

  const packages = [
    // --- SPONSORSHIP (Golf Opportunities) ---
    { name: "Event Sponsor", description: "Three (3) Foursomes, Lead logo placement on all event signage and PR materials, Four (4) Tee Signs, Logo featured on Major Sponsor Board.", category: "SPONSORSHIP", price: 1000000, maxSlots: 1, exclusive: true },
    { name: "Dinner Sponsor", description: "One (1) Foursome, Four (4) Additional Dinner Guests, Prominent signage at the Dinner Station, Two (2) Tee Signs, Logo featured on Major Sponsor Board.", category: "SPONSORSHIP", price: 750000, maxSlots: null, exclusive: false },
    { name: "Cocktail Reception Sponsor", description: "One (1) Foursome, Signage at Cocktail Reception tables, One (1) Tee Sign, Logo featured on Major Sponsor Board.", category: "SPONSORSHIP", price: 500000, maxSlots: null, exclusive: false },
    { name: "Caddie Sponsor", description: "One (1) Foursome, Logo featured on all Caddie Bibs, Logo featured on Major Sponsor Board.", category: "SPONSORSHIP", price: 450000, maxSlots: 2, exclusive: false },
    { name: "Barbecue Sponsor", description: "One (1) Foursome, Signage at the Barbecue Station, Logo featured on Major Sponsor Board.", category: "SPONSORSHIP", price: 400000, maxSlots: null, exclusive: false },
    { name: "Refreshment Sponsor", description: "One (1) Foursome, Signage at the Refreshment Station, Logo featured on Major Sponsor Board.", category: "SPONSORSHIP", price: 350000, maxSlots: null, exclusive: false },
    { name: "Brunch Sponsor", description: "One (1) Foursome, Signage at the Brunch Station, Logo featured on Major Sponsor Board.", category: "SPONSORSHIP", price: 350000, maxSlots: null, exclusive: false },

    // --- SIGNAGE (Signage Opportunities) ---
    { name: "Golf Cart Sponsor", description: "Logo on golf carts.", category: "SIGNAGE", price: 300000, maxSlots: null, exclusive: false },
    { name: "Tee Marker Sponsor", description: "Logo on tee markers.", category: "SIGNAGE", price: 250000, maxSlots: 4, exclusive: false },
    { name: "Pin Flag Sponsor", description: "Logo on pin flags.", category: "SIGNAGE", price: 250000, maxSlots: 1, exclusive: true },
    { name: "Hole-in-One Sponsor", description: "Signage at the Hole-in-One hole.", category: "SIGNAGE", price: 200000, maxSlots: null, exclusive: false },
    { name: "Raffle Prize Sponsor", description: "Sponsor the raffle prize.", category: "SIGNAGE", price: 150000, maxSlots: null, exclusive: false },
    { name: "DJ Sponsor", description: "Sponsor the DJ.", category: "SIGNAGE", price: 125000, maxSlots: null, exclusive: false },
    { name: "Awards Sponsor", description: "Sponsor the awards ceremony.", category: "SIGNAGE", price: 100000, maxSlots: null, exclusive: false },
    { name: "Cheer Leader Sponsor", description: "Sponsor the cheer leaders.", category: "SIGNAGE", price: 100000, maxSlots: null, exclusive: false },
    { name: "Closest to the Line", description: "Signage at closest to the line hole.", category: "SIGNAGE", price: 75000, maxSlots: null, exclusive: false },
    { name: "Closest to the Pin", description: "Signage at closest to the pin hole.", category: "SIGNAGE", price: 75000, maxSlots: null, exclusive: false },
    { name: "Longest Drive", description: "Signage at longest drive hole.", category: "SIGNAGE", price: 75000, maxSlots: null, exclusive: false },
    { name: "Driving Range", description: "Signage at the driving range.", category: "SIGNAGE", price: 50000, maxSlots: null, exclusive: false },
    { name: "Putting Green", description: "Signage at the putting green.", category: "SIGNAGE", price: 50000, maxSlots: null, exclusive: false },
    { name: "Tee Sign", description: "Tee sign placement.", category: "SIGNAGE", price: 25000, maxSlots: null, exclusive: false },

    // --- GOLF (Registration) ---
    { name: "Individual Golfer", description: "Individual golfer registration.", category: "GOLF", price: 37500, earlyBirdPrice: 32500, earlyBirdDeadline, maxSlots: null, exclusive: false },
    { name: "Foursome", description: "Foursome golf registration.", category: "GOLF", price: 140000, earlyBirdPrice: 120000, earlyBirdDeadline, maxSlots: null, exclusive: false },

    // --- DINNER ---
    { name: "Dinner Only", description: "Dinner ticket only.", category: "DINNER", price: 22500, maxSlots: null, exclusive: false },

    // --- DONATION ---
    { name: "Donation", description: "Make a custom donation amount.", category: "DONATION", price: 0, maxSlots: null, exclusive: false },
  ];

  await prisma.package.deleteMany({ where: { eventId: event.id } });

  await prisma.package.createMany({
    data: packages.map((p) => ({
      ...p,
      eventId: event.id,
      earlyBirdPrice: p.earlyBirdPrice ?? null,
      earlyBirdDeadline: p.earlyBirdDeadline ?? null,
    })),
  });

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
