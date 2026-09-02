/**
 * DEMO / CLIENT-REVIEW seed — 40 test products with fake DZD prices.
 *
 *   npm run seed:demo            # add/refresh 40 demo products (idempotent)
 *   npm run seed:demo -- --fresh # delete old demo/placeholder products first
 *
 * Every product it creates has sku "DEMO-XXX" and slug "demo-XX" so the whole
 * set can be removed in one command later:  npm run clear:demo
 * Prices are RANDOM TEST DATA in Algerian dinars — not real. The storefront
 * shows a "وضع عرض تجريبي" banner while NEXT_PUBLIC_DEMO_MODE=1.
 *
 * Images come from ./demo-assets (gitignored). Replace that folder + re-run,
 * or just edit each product from the admin panel, to move to real data.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma";
import { processProductImage } from "../src/lib/images/process";
import { getStorage } from "../src/lib/images/storage";

const db = new PrismaClient();

const COUNT = 40;
const ASSET_DIR = path.join(process.cwd(), "demo-assets");

// Deterministic PRNG so re-runs produce identical data.
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
const CATEGORY_SLUGS = ["firm-ground", "artificial-grass", "turf", "indoor"];
const SIZES = ["39", "40", "41", "42", "43", "44", "45"];

async function processedPool() {
  if (!existsSync(ASSET_DIR)) {
    console.error(`Missing ${ASSET_DIR}. Put boot images there (png/jpg) and re-run.`);
    process.exit(1);
  }
  const files = (await readdir(ASSET_DIR)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
  if (files.length === 0) {
    console.error(`No images in ${ASSET_DIR}.`);
    process.exit(1);
  }
  const storage = getStorage();
  const pool: { url: string; blurDataURL: string; width: number; height: number; key: string }[] = [];
  for (const f of files) {
    const buf = await readFile(path.join(ASSET_DIR, f));
    const p = await processProductImage(buf);
    const key = `demo/${path.parse(f).name}.${p.ext}`;
    const url = await storage.put(key, p.buffer, p.contentType);
    pool.push({ url, blurDataURL: p.blurDataURL, width: p.width, height: p.height, key });
    process.stdout.write(".");
  }
  process.stdout.write("\n");
  return pool;
}

async function main() {
  const fresh = process.argv.includes("--fresh");

  const pool = await processedPool();
  console.log(`${pool.length} images processed → ${pool[0].url.startsWith("/uploads") ? "local disk" : "R2"}`);

  const categories = await db.category.findMany({ where: { slug: { in: CATEGORY_SLUGS } } });
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  if (fresh) {
    const del = await db.product.deleteMany({
      where: { OR: [{ sku: { startsWith: "DEMO-" } }, { sku: { startsWith: "MNR-" } }, { slug: { startsWith: "monor-boot-" } }] },
    });
    console.log(`--fresh: removed ${del.count} old demo/placeholder products`);
  }

  const rand = rng(20260901);
  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= COUNT; i++) {
    const slug = `demo-${String(i).padStart(2, "0")}`;
    if (!fresh && (await db.product.findUnique({ where: { slug }, select: { id: true } }))) {
      skipped++;
      continue;
    }

    const b = BRANDS[Math.floor(rand() * BRANDS.length)];
    const model = b.models[Math.floor(rand() * b.models.length)];
    const colorway = COLORWAYS_AR[Math.floor(rand() * COLORWAYS_AR.length)];
    const catSlug = CATEGORY_SLUGS[i % CATEGORY_SLUGS.length];

    // Fake DZD price: 4 500 – 18 000, rounded to 100 DZD, in centimes.
    const priceDzd = (45 + Math.floor(rand() * 136)) * 100;
    const price = priceDzd * 100;
    const onSale = rand() < 0.28;
    // compareAtPrice also rounded to a whole 100-DZD amount (no ugly decimals).
    const compareAtPrice = onSale
      ? Math.round((price * (1.15 + rand() * 0.25)) / 10000) * 10000
      : null;

    // Per-size stock; leave ~1 size out of stock to show that UI state.
    const outIdx = Math.floor(rand() * SIZES.length);
    const sizeStock = SIZES.map((size, idx) => ({
      size,
      quantity: idx === outIdx ? 0 : 2 + Math.floor(rand() * 11),
    }));
    const stock = sizeStock.reduce((s, r) => s + r.quantity, 0);

    // 1–2 images, cycling the pool.
    const imgCount = rand() < 0.45 ? 2 : 1;
    const imgs = Array.from({ length: imgCount }, (_, k) => pool[(i - 1 + k) % pool.length]);

    await db.product.create({
      data: {
        slug,
        name: `${b.brand} ${model} — ${colorway}`,
        nameFr: `${b.brand} ${model} — ${colorway}`,
        description:
          "منتج تجريبي لأغراض العرض والاختبار فقط. الوصف والسعر والمقاسات وهمية ويتم استبدالها بالبيانات الحقيقية من لوحة التحكم.\n\nحذاء كرة قدم خفيف بقبضة ممتازة على الأرضية، نعل مصمم للثبات والانطلاق السريع.",
        descriptionFr:
          "Produit de démonstration — description, prix et pointures fictifs, à remplacer depuis le panneau d'administration.",
        brand: b.brand,
        sku: `DEMO-${String(i).padStart(3, "0")}`,
        categoryId: catBySlug.get(catSlug) ?? null,
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
            storageKey: im.key,
            alt: `${b.brand} ${model}`,
            position: idx,
            width: im.width,
            height: im.height,
            blurDataURL: im.blurDataURL,
            isPrimary: idx === 0,
          })),
        },
      },
    });
    created++;
  }

  const total = await db.product.count();
  console.log(`\nDone. created ${created}, skipped ${skipped}. Products in DB: ${total}.`);
  console.log("Remove all demo data later with:  npm run clear:demo");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
