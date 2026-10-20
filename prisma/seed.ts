import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("mulchnow2024", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@mulchnow.com" },
    update: {},
    create: {
      email: "admin@mulchnow.com",
      password: hashedPassword,
      name: "DiCillo Services",
      role: "owner",
    },
  });

  const pricingRules = [
    { name: "Premium Hardwood Mulch", mulchType: "hardwood", pricePerYard: 65, market: "south-florida", sortOrder: 1 },
    { name: "Premium Hardwood Mulch", mulchType: "hardwood", pricePerYard: 55, market: "ohio", sortOrder: 2 },
    { name: "Pine Bark Mulch", mulchType: "pine-bark", pricePerYard: 58, market: "south-florida", sortOrder: 3 },
    { name: "Pine Bark Mulch", mulchType: "pine-bark", pricePerYard: 48, market: "ohio", sortOrder: 4 },
    { name: "Red-Dyed Mulch", mulchType: "red-dyed", pricePerYard: 60, market: "south-florida", sortOrder: 5 },
    { name: "Red-Dyed Mulch", mulchType: "red-dyed", pricePerYard: 50, market: "ohio", sortOrder: 6 },
    { name: "Black-Dyed Mulch", mulchType: "black-dyed", pricePerYard: 62, market: "south-florida", sortOrder: 7 },
    { name: "Black-Dyed Mulch", mulchType: "black-dyed", pricePerYard: 52, market: "ohio", sortOrder: 8 },
    { name: "Playground Mulch", mulchType: "playground", pricePerYard: 70, market: "south-florida", sortOrder: 9 },
    { name: "Playground Mulch", mulchType: "playground", pricePerYard: 60, market: "ohio", sortOrder: 10 },
    { name: "Premium Soil Blend", mulchType: "soil", pricePerYard: 55, market: "south-florida", sortOrder: 11 },
    { name: "Premium Soil Blend", mulchType: "soil", pricePerYard: 45, market: "ohio", sortOrder: 12 },
  ];

  const existingRules = await prisma.pricingRule.count();
  if (existingRules === 0) {
    for (const rule of pricingRules) {
      await prisma.pricingRule.create({ data: rule });
    }
  }

  const leads = [
    {
      firstName: "Sarah",
      lastName: "Mitchell",
      email: "sarah.m@example.com",
      phone: "(772) 555-0142",
      address: "1420 Royal Palm Blvd",
      city: "Vero Beach",
      state: "FL",
      zip: "32960",
      status: "quoted",
      source: "website",
    },
    {
      firstName: "James",
      lastName: "Rodriguez",
      email: "jrod@example.com",
      phone: "(561) 555-0198",
      address: "880 Ocean Drive",
      city: "Jupiter",
      state: "FL",
      zip: "33458",
      status: "scheduled",
      source: "website",
    },
    {
      firstName: "Linda",
      lastName: "Chen",
      email: "linda.chen@example.com",
      phone: "(772) 555-0267",
      address: "2250 Indian River Blvd",
      city: "Vero Beach",
      state: "FL",
      zip: "32963",
      status: "new",
      source: "website",
    },
    {
      firstName: "Robert",
      lastName: "Thompson",
      email: "rthompson@example.com",
      phone: "(216) 555-0334",
      address: "14500 Detroit Ave",
      city: "Lakewood",
      state: "OH",
      zip: "44107",
      status: "completed",
      source: "referral",
    },
    {
      firstName: "Maria",
      lastName: "Gonzalez",
      email: "mgonzalez@example.com",
      phone: "(954) 555-0411",
      address: "3300 SW 2nd Ave",
      city: "Fort Lauderdale",
      state: "FL",
      zip: "33315",
      status: "new",
      source: "website",
    },
  ];

  const existingLeads = await prisma.lead.count();
  if (existingLeads > 0) {
    console.log("Database already seeded, skipping leads.");
    return;
  }

  for (const lead of leads) {
    const createdLead = await prisma.lead.create({ data: lead });

    await prisma.quote.create({
      data: {
        leadId: createdLead.id,
        address: lead.address,
        totalSqFt: Math.floor(Math.random() * 3000) + 500,
        mulchType: "hardwood",
        depth: 3,
        yardsNeeded: Math.floor(Math.random() * 20) + 5,
        pricePerYard: 65,
        totalPriceLow: Math.floor(Math.random() * 500) + 400,
        totalPriceHigh: Math.floor(Math.random() * 500) + 700,
        status: lead.status === "new" ? "pending" : "accepted",
      },
    });
  }

  await prisma.truck.createMany({
    data: [
      { name: "Truck 1 — FL Primary", status: "active" },
      { name: "Truck 2 — FL Secondary", status: "active" },
      { name: "Truck 3 — OH Primary", status: "maintenance" },
    ],
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
