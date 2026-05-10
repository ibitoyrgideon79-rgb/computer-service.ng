import { prisma } from "../src/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";

async function seed() {
  console.log("Seeding delivery options...");

  const deliveryOptions = [
    {
      name: "Express Delivery",
      description: "Priority rapid-response delivery ⚡",
      price: new Decimal("3000"),
      minTime: "30 minutes",
      maxTime: "2 hours",
      stops: 1,
    },
    {
      name: "Standard Delivery",
      description: "Affordable same-day delivery 🚚",
      price: new Decimal("2000"),
      minTime: "2 hours",
      maxTime: "12 hours",
      stops: 1,
    },
    {
      name: "Economy Delivery",
      description: "Available for selected services and locations within the 24-hour delivery window 🚚",
      price: new Decimal("1000"),
      minTime: "Within 24 hours",
      maxTime: "24 hours",
      stops: 1,
    },
    {
      name: "Schedule Delivery",
      description: "Custom delivery based on your preferred time, multiple stops, or business needs",
      price: new Decimal("5000"),
      minTime: "Custom",
      maxTime: "Custom",
      stops: 2,
    },
    {
      name: "Special Submission",
      description: "Need your document submitted to a Government or Private organization? Follow-up, representation, retrieval, and acknowledgement collection are also available. Powered by Submitar",
      price: new Decimal("0"),
      minTime: "Custom",
      maxTime: "Custom",
      stops: 1,
    },
  ];

  for (const option of deliveryOptions) {
    const existing = await prisma.deliveryOption.findUnique({
      where: { name: option.name },
    });

    if (!existing) {
      await prisma.deliveryOption.create({
        data: option,
      });
      console.log(`✓ Created ${option.name}`);
    } else {
      console.log(`- ${option.name} already exists`);
    }
  }

  console.log("Seeding complete!");
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
