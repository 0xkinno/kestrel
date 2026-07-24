import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SEED_LOCATIONS } from "../src/lib/locations";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Synthetic first/last name pools spanning the IGAD region - used only to generate
// a believable *aggregate* simulated-recipient pool, never tied to any real person.
const FIRST_NAMES = [
  "Amina", "Abdi", "Wanjiru", "Achieng", "Hassan", "Fatuma", "Kiptoo", "Nasra",
  "Mubarak", "Chebet", "Ismail", "Nyokabi", "Deng", "Nyandeng", "Tekle", "Saba",
  "Guled", "Halima", "Lomuria", "Ekaru", "Adan", "Zeinab", "Biruk", "Selam",
];
const LAST_NAMES = [
  "Mohamed", "Otieno", "Ali", "Kiprono", "Achol", "Yusuf", "Wekesa", "Farah",
  "Loyapan", "Gebre", "Osman", "Chol", "Nyerere", "Barre", "Kones", "Idris",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  console.log("Seeding locations...");
  const locations = [];
  for (const seed of SEED_LOCATIONS) {
    const location = await prisma.location.upsert({
      where: { name_ward: { name: seed.name, ward: seed.ward } },
      update: {},
      create: {
        name: seed.name,
        ward: seed.ward,
        country: seed.country,
        lat: seed.lat,
        lng: seed.lng,
      },
    });
    locations.push(location);
  }

  console.log("Seeding simulated recipient pool...");
  let created = 0;
  let seedCounter = 0;
  for (const location of locations) {
    const existing = await prisma.recipient.count({ where: { locationId: location.id } });
    if (existing > 0) continue;

    const recipientCount = 24 + (seedCounter % 12); // 24-35 per location
    for (let i = 0; i < recipientCount; i++) {
      seedCounter++;
      await prisma.recipient.create({
        data: {
          name: `${pick(FIRST_NAMES, seedCounter)} ${pick(LAST_NAMES, seedCounter + 7)}`,
          locationId: location.id,
          isSimulated: true,
          preferredChannel: seedCounter % 3 === 0 ? "SIMULATED_USSD" : "SIMULATED_SMS",
        },
      });
      created++;
    }
  }

  console.log(`Seeded ${locations.length} locations and ${created} simulated recipients.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
