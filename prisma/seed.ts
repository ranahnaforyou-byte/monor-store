/**
 * Seed: admin owner, store settings, catalog categories, and the 58 wilayas +
 * starter communes + shipping rates. Safe to re-run (idempotent upserts).
 */
import { PrismaClient } from "../src/generated/prisma";
import { hash } from "@node-rs/argon2";
import { WILAYAS } from "../src/lib/algeria/wilayas";
import { buildCommuneSeed } from "../src/lib/algeria/communes";

const db = new PrismaClient();

const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

async function main() {
  // --- Admin owner ---------------------------------------------------------
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@monor.store").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "MonorAdmin!2026";
  const passwordHash = await hash(password, ARGON);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: "Owner", passwordHash, role: "OWNER" },
  });
  console.log(`✓ admin: ${email}  (password: ${password})  — change it after first login`);

  // --- Store settings -----------------------------------------------------
  await db.storeSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "MONOR STORE",
      contactPhone: "",
      announcementBar: "توصيل لكل الولايات · الدفع عند الاستلام",
      announcementActive: true,
      defaultHomeFee: 45000,
      defaultStopDeskFee: 30000,
      codEnabled: true,
      baridimobEnabled: false,
    },
  });
  console.log("✓ store settings");

  // --- Categories -------------------------------------------------------
  const categories = [
    { slug: "firm-ground", name: "أحذية الملاعب العشبية", nameFr: "Terrain sec (FG)", position: 1 },
    { slug: "artificial-grass", name: "أحذية العشب الصناعي", nameFr: "Gazon synthétique (AG)", position: 2 },
    { slug: "turf", name: "أحذية النجيل الصناعي القصير", nameFr: "Turf", position: 3 },
    { slug: "indoor", name: "أحذية الصالات", nameFr: "Salle (IC)", position: 4 },
  ];
  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log(`✓ ${categories.length} categories`);

  // --- Wilayas + communes + shipping rates -----------------------------
  for (const w of WILAYAS) {
    await db.wilaya.upsert({
      where: { code: w.code },
      update: { name: w.name, nameAr: w.nameAr },
      create: { code: w.code, name: w.name, nameAr: w.nameAr },
    });
  }
  const communes = buildCommuneSeed();
  for (const c of communes) {
    await db.commune.upsert({
      where: { wilayaCode_name: { wilayaCode: c.wilayaCode, name: c.name } },
      update: { nameAr: c.nameAr, hasStopDesk: c.stopDesk },
      create: { wilayaCode: c.wilayaCode, name: c.name, nameAr: c.nameAr, hasStopDesk: c.stopDesk },
    });
  }
  console.log(`✓ ${WILAYAS.length} wilayas, ${communes.length} communes`);

  // A few representative custom rates; the rest fall back to store defaults.
  const rates = [
    { wilayaCode: 16, toHome: 40000, toStopDesk: 25000 }, // Alger
    { wilayaCode: 9, toHome: 45000, toStopDesk: 30000 }, // Blida
    { wilayaCode: 31, toHome: 60000, toStopDesk: 35000 }, // Oran
    { wilayaCode: 25, toHome: 60000, toStopDesk: 35000 }, // Constantine
    { wilayaCode: 6, toHome: 60000, toStopDesk: 35000 }, // Béjaïa
  ];
  for (const r of rates) {
    await db.shippingRate.upsert({
      where: { wilayaCode: r.wilayaCode },
      update: { toHome: r.toHome, toStopDesk: r.toStopDesk, active: true },
      create: { ...r, active: true },
    });
  }
  console.log(`✓ ${rates.length} custom shipping rates`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
