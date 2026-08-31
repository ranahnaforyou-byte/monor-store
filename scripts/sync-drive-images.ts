/**
 * Batch image ingestion from Google Drive.
 *
 *   npm run sync:drive
 *
 * Reads every file in  <MONOR STORE root>/incoming/ , matches each to a product,
 * runs it through the image pipeline, uploads the web version to the CDN, then
 * moves the original into  originals/products/<productId>/ .
 *
 * Filename → product matching (case-insensitive, extension ignored):
 *   monor-boot-07.jpg          -> product slug "monor-boot-07"
 *   monor-boot-07__2.jpg       -> product slug "monor-boot-07", extra gallery image
 *   MNR-007.jpg                -> product with sku "MNR-007"
 *   MNR-007__3.jpg             -> same, extra image
 * Unmatched files are listed and left in incoming/ untouched — no products are
 * invented. Requires GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 + GOOGLE_DRIVE_ROOT_FOLDER_ID.
 */
import { PrismaClient } from "../src/generated/prisma";
import { drive } from "../src/lib/drive/client";
import { rootSubfolder } from "../src/lib/drive/archive";
import { processProductImage } from "../src/lib/images/process";
import { getStorage } from "../src/lib/images/storage";

const db = new PrismaClient();

function parseName(fileName: string): { base: string; index: number } {
  const noExt = fileName.replace(/\.[^.]+$/, "");
  const m = noExt.match(/^(.*?)(?:__(\d+))?$/);
  return { base: (m?.[1] ?? noExt).trim(), index: m?.[2] ? Number(m[2]) : 1 };
}

async function findProduct(base: string) {
  return db.product.findFirst({
    where: {
      OR: [
        { slug: base.toLowerCase() },
        { sku: { equals: base, mode: "insensitive" } },
      ],
    },
    select: { id: true, slug: true, name: true, _count: { select: { images: true } } },
  });
}

async function main() {
  if (!drive.isConfigured()) {
    console.error("Google Drive is not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 and GOOGLE_DRIVE_ROOT_FOLDER_ID.");
    process.exit(1);
  }

  const incomingId = await rootSubfolder("incoming");
  const originalsId = await rootSubfolder("originals");
  if (!incomingId || !originalsId) throw new Error("could not resolve Drive folders");
  const productsRoot = await drive.ensureFolder("products", originalsId);

  const files = await drive.listFolder(incomingId);
  console.log(`${files.length} file(s) in incoming/`);

  const storage = getStorage();
  const unmatched: string[] = [];
  let imported = 0;

  for (const f of files) {
    if (!/\.(png|jpe?g|webp)$/i.test(f.name)) continue;
    const { base, index } = parseName(f.name);
    const product = await findProduct(base);
    if (!product) {
      unmatched.push(f.name);
      continue;
    }

    const original = await drive.downloadFile(f.id);
    const processed = await processProductImage(original);
    const key = `products/${product.id}/${Date.now()}-${index}.${processed.ext}`;
    const url = await storage.put(key, processed.buffer, processed.contentType);

    const folder = await drive.ensureFolder(product.id, productsRoot);
    await drive.moveFile(f.id, folder, incomingId);

    const position = product._count.images;
    await db.productImage.create({
      data: {
        productId: product.id,
        url,
        storageKey: key,
        driveFileId: f.id,
        alt: product.name,
        position,
        width: processed.width,
        height: processed.height,
        blurDataURL: processed.blurDataURL,
        isPrimary: position === 0,
      },
    });
    imported++;
    console.log(`  + ${product.slug}  <- ${f.name}`);
  }

  console.log(`\nDone. ${imported} image(s) imported.`);
  if (unmatched.length) {
    console.log(`\n${unmatched.length} unmatched file(s) left in incoming/ — rename to <slug> or <sku>:`);
    unmatched.forEach((n) => console.log("  " + n));
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
