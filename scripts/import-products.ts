/**
 * Batch product importer.
 *
 *   npm run import:products -- <folder>
 *
 * Default folder: the handoff package's initial-products/. Any file named
 * product-*.{png,jpg,jpeg,webp} that has not been imported yet becomes a
 * product with clearly-editable placeholder commercial data (name, price,
 * sizes, stock) — the owner sets the real values from the admin panel.
 *
 * Re-run it any time more images are added; already-imported files are skipped
 * (tracked by a deterministic slug derived from the filename). No code changes
 * are needed as the catalog grows.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma";
import { processProductImage } from "../src/lib/images/process";
import { getStorage } from "../src/lib/images/storage";

const db = new PrismaClient();

const DEFAULT_DIRS = [
  process.argv[2],
  "C:/Users/apma/AppData/Local/Temp/claude/C--Users-apma-Desktop-monor-store/24cf0a49-8a8c-43ea-a9a2-933de548559a/scratchpad/pkg/MONOR_STORE_PACKAGE/initial-products",
  path.join(process.cwd(), "initial-products"),
  path.join(process.cwd(), "..", "MONOR_STORE_PACKAGE", "initial-products"),
].filter(Boolean) as string[];

// Placeholder commercial data — EDIT FROM THE ADMIN PANEL.
const PLACEHOLDER_PRICE = 1290000; // 12 900 DZD (centimes)
const PLACEHOLDER_SIZES = ["39", "40", "41", "42", "43", "44", "45"];
const PLACEHOLDER_STOCK_PER_SIZE = 6;
const PLACEHOLDER_DESC =
  "⚠️ وصف مبدئي — يُرجى تعديله من لوحة التحكم.\nحذاء كرة قدم بنعل للأرضيات العشبية، خفيف ومريح، مناسب للمباريات والتدريب.";

// Visible brand from the supplied studio photos (describing, not inventing).
const BRAND_BY_INDEX: Record<number, string> = {
  1: "PUMA", 2: "PUMA", 3: "PUMA", 4: "PUMA", 5: "adidas", 6: "PUMA", 7: "PUMA",
};

async function main() {
  const dir = DEFAULT_DIRS.find((d) => existsSync(d));
  if (!dir) {
    console.error("No import folder found. Pass one: npm run import:products -- <folder>");
    console.error("Tried:\n" + DEFAULT_DIRS.map((d) => "  " + d).join("\n"));
    process.exit(1);
  }
  console.log(`Importing from: ${dir}`);

  const files = (await readdir(dir))
    .filter((f) => /^product-\d+\.(png|jpe?g|webp)$/i.test(f))
    .sort();

  const category = await db.category.findUnique({ where: { slug: "firm-ground" } });
  const storage = getStorage();

  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const num = Number(file.match(/(\d+)/)?.[1] ?? "0");
    const slug = `monor-boot-${String(num).padStart(2, "0")}`;

    if (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
      skipped++;
      continue;
    }

    const brand = BRAND_BY_INDEX[num] ?? "غير محدد";
    const product = await db.product.create({
      data: {
        slug,
        name: `حذاء كرة قدم ${String(num).padStart(2, "0")}`,
        nameFr: `Chaussure de football ${String(num).padStart(2, "0")}`,
        description: PLACEHOLDER_DESC,
        brand,
        sku: `MNR-${String(num).padStart(3, "0")}`,
        categoryId: category?.id ?? null,
        price: PLACEHOLDER_PRICE,
        compareAtPrice: null,
        sizes: PLACEHOLDER_SIZES,
        colors: [],
        stock: PLACEHOLDER_SIZES.length * PLACEHOLDER_STOCK_PER_SIZE,
        featured: num <= 3,
        newArrival: true,
        sale: false,
        status: "ACTIVE",
        sizeStock: {
          create: PLACEHOLDER_SIZES.map((size) => ({ size, quantity: PLACEHOLDER_STOCK_PER_SIZE })),
        },
      },
    });

    const buf = await readFile(path.join(dir, file));
    const processed = await processProductImage(buf);
    const key = `products/${product.id}/main.${processed.ext}`;
    const url = await storage.put(key, processed.buffer, processed.contentType);
    await db.productImage.create({
      data: {
        productId: product.id,
        url,
        storageKey: key,
        alt: product.name,
        position: 0,
        width: processed.width,
        height: processed.height,
        blurDataURL: processed.blurDataURL,
        isPrimary: true,
      },
    });

    created++;
    console.log(`  + ${slug}  (${brand})  ${processed.width}×${processed.height}`);
  }

  console.log(`\nDone. ${created} created, ${skipped} already present.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
