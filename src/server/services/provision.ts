import "server-only";
import { randomBytes } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { WILAYAS } from "@/lib/algeria/wilayas";
import { buildCommuneSeed } from "@/lib/algeria/communes";
import { DEMO_IMAGES } from "@/lib/demo-manifest";
import type { Prisma } from "@/generated/prisma";

/**
 * One-shot provisioner for a fresh (cloud) database, callable from
 * `/api/setup` — used when the local machine can't reach Postgres on :5432.
 * Everything here is idempotent (upserts / skip-if-exists).
 */

const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 };
const CATEGORY_SLUGS = ["firm-ground", "artificial-grass", "turf", "indoor"] as const;

export async function provisionCoreData() {
  // --- Admin owner --------------------------------------------------------
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@monor.store").toLowerCase();
  const generated = !process.env.SEED_ADMIN_PASSWORD;
  const password =
    process.env.SEED_ADMIN_PASSWORD ?? `Monor-${randomBytes(9).toString("base64url")}`;
  const existingAdmin = await db.adminUser.findUnique({ where: { email }, select: { id: true } });
  if (!existingAdmin) {
    await db.adminUser.create({
      data: { email, name: "Owner", passwordHash: await hash(password, ARGON), role: "OWNER" },
    });
  }

  // --- Store settings ---------------------------------------------------
  await db.storeSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "MONOR STORE",
      announcementBar: "توصيل لكل الولايات · الدفع عند الاستلام",
      announcementActive: true,
      defaultHomeFee: 45000,
      defaultStopDeskFee: 30000,
      codEnabled: true,
      baridimobEnabled: false,
    },
  });

  // --- Categories -----------------------------------------------------
  const categories = [
    { slug: "firm-ground", name: "أحذية الملاعب العشبية", nameFr: "Terrain sec (FG)", position: 1 },
    { slug: "artificial-grass", name: "أحذية العشب الصناعي", nameFr: "Gazon synthétique (AG)", position: 2 },
    { slug: "turf", name: "أحذية النجيل الصناعي القصير", nameFr: "Turf", position: 3 },
    { slug: "indoor", name: "أحذية الصالات", nameFr: "Salle (IC)", position: 4 },
  ];
  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  // --- Wilayas + communes + shipping rates ---------------------------
  for (const w of WILAYAS) {
    await db.wilaya.upsert({
      where: { code: w.code },
      update: { name: w.name, nameAr: w.nameAr },
      create: { code: w.code, name: w.name, nameAr: w.nameAr },
    });
  }
  for (const c of buildCommuneSeed()) {
    await db.commune.upsert({
      where: { wilayaCode_name: { wilayaCode: c.wilayaCode, name: c.name } },
      update: { nameAr: c.nameAr, hasStopDesk: c.stopDesk },
      create: { wilayaCode: c.wilayaCode, name: c.name, nameAr: c.nameAr, hasStopDesk: c.stopDesk },
    });
  }
  const rates = [
    { wilayaCode: 16, toHome: 40000, toStopDesk: 25000 },
    { wilayaCode: 9, toHome: 45000, toStopDesk: 30000 },
    { wilayaCode: 31, toHome: 60000, toStopDesk: 35000 },
    { wilayaCode: 25, toHome: 60000, toStopDesk: 35000 },
    { wilayaCode: 6, toHome: 60000, toStopDesk: 35000 },
  ];
  for (const r of rates) {
    await db.shippingRate.upsert({
      where: { wilayaCode: r.wilayaCode },
      update: { toHome: r.toHome, toStopDesk: r.toStopDesk, active: true },
      create: { ...r, active: true },
    });
  }

  return {
    admin: email,
    adminCreated: !existingAdmin,
    adminPassword: !existingAdmin && generated ? password : undefined,
    wilayas: WILAYAS.length,
    categories: categories.length,
  };
}

// -- Demo catalog ---------------------------------------------------------

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const BRANDS = [
  { brand: "PUMA", models: ["Future Ultimate", "Future Match", "Future Play", "Ultra Pro"] },
  { brand: "adidas", models: ["X Speedportal", "X Crazyfast", "Predator Accuracy", "Copa Pure"] },
  { brand: "Nike", models: ["Mercurial Vapor", "Mercurial Superfly", "Zoom Vapor", "Phantom GX"] },
  { brand: "Mizuno", models: ["Morelia Neo III", "Morelia Neo IV", "Monarcida Neo"] },
];
const COLORWAYS_AR = [
  "أسود / أحمر", "أزرق ملكي", "أبيض متعدد الألوان", "أصفر فسفوري", "كحلي / وردي",
  "تركواز / ليموني", "رمادي / بنفسجي", "برتقالي / أسود", "أسود بالكامل", "فضي معدني",
];
const SIZES = ["39", "40", "41", "42", "43", "44", "45"];
const COUNT = 40;

export async function provisionDemoProducts(opts: { fresh?: boolean } = {}) {
  const categories = await db.category.findMany({ where: { slug: { in: [...CATEGORY_SLUGS] } } });
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  if (opts.fresh) {
    await db.product.deleteMany({
      where: {
        OR: [
          { sku: { startsWith: "DEMO-" } },
          { sku: { startsWith: "MNR-" } },
          { slug: { startsWith: "monor-boot-" } },
        ],
      },
    });
  }

  const pool = DEMO_IMAGES.map((im) => ({
    url: `/uploads/demo/${im.name}`,
    width: im.w,
    height: im.h,
    blurDataURL: im.blur,
  }));

  const rand = rng(20260901);
  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= COUNT; i++) {
    const slug = `demo-${String(i).padStart(2, "0")}`;
    if (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
      skipped++;
      // still advance the PRNG so unchanged rows keep identical values
      for (let k = 0; k < 8; k++) rand();
      continue;
    }

    const b = BRANDS[Math.floor(rand() * BRANDS.length)];
    const model = b.models[Math.floor(rand() * b.models.length)];
    const colorway = COLORWAYS_AR[Math.floor(rand() * COLORWAYS_AR.length)];
    const catSlug = CATEGORY_SLUGS[i % CATEGORY_SLUGS.length];

    const priceDzd = (45 + Math.floor(rand() * 136)) * 100;
    const price = priceDzd * 100;
    const onSale = rand() < 0.28;
    const compareAtPrice = onSale
      ? Math.round((price * (1.15 + rand() * 0.25)) / 10000) * 10000
      : null;

    const outIdx = Math.floor(rand() * SIZES.length);
    const sizeStock = SIZES.map((size, idx) => ({
      size,
      quantity: idx === outIdx ? 0 : 2 + Math.floor(rand() * 11),
    }));
    const stock = sizeStock.reduce((s, r) => s + r.quantity, 0);

    const imgCount = rand() < 0.45 ? 2 : 1;
    const imgs = Array.from({ length: imgCount }, (_, k) => pool[(i - 1 + k) % pool.length]);

    const data: Prisma.ProductCreateInput = {
      slug,
      name: `${b.brand} ${model} — ${colorway}`,
      nameFr: `${b.brand} ${model} — ${colorway}`,
      description:
        "منتج تجريبي لأغراض العرض والاختبار فقط. الوصف والسعر والمقاسات وهمية ويتم استبدالها بالبيانات الحقيقية من لوحة التحكم.\n\nحذاء كرة قدم خفيف بقبضة ممتازة على الأرضية.",
      descriptionFr: "Produit de démonstration — à remplacer depuis le panneau d'administration.",
      brand: b.brand,
      sku: `DEMO-${String(i).padStart(3, "0")}`,
      category: catBySlug.get(catSlug) ? { connect: { id: catBySlug.get(catSlug)! } } : undefined,
      price,
      compareAtPrice,
      sizes: SIZES,
      colors: colorway.split(" / "),
      stock,
      featured: i % 6 === 0,
      newArrival: rand() < 0.4,
      sale: onSale,
      status: "ACTIVE",
      seoTitle: `${b.brand} ${model} | MONOR STORE (تجريبي)`,
      sizeStock: { create: sizeStock },
      images: {
        create: imgs.map((im, idx) => ({
          url: im.url,
          storageKey: im.url.replace(/^\//, ""),
          alt: `${b.brand} ${model}`,
          position: idx,
          width: im.width,
          height: im.height,
          blurDataURL: im.blurDataURL,
          isPrimary: idx === 0,
        })),
      },
    };
    await db.product.create({ data });
    created++;
  }

  return { created, skipped, total: await db.product.count() };
}
