/**
 * Remove ALL demo / placeholder catalog data in one command.
 *
 *   npm run clear:demo
 *
 * Deletes every product whose sku starts with "DEMO-" or "MNR-", or whose slug
 * starts with "demo-" / "monor-boot-", plus their images and size-stock rows
 * (cascade). Orders, customers, settings, wilayas and admin users are left
 * untouched. Run this before loading real products.
 */
import { PrismaClient, type Prisma } from "../src/generated/prisma";
import { getStorage } from "../src/lib/images/storage";

const db = new PrismaClient();

async function main() {
  const where: Prisma.ProductWhereInput = {
    OR: [
      { sku: { startsWith: "DEMO-" } },
      { sku: { startsWith: "MNR-" } },
      { slug: { startsWith: "demo-" } },
      { slug: { startsWith: "monor-boot-" } },
    ],
  };

  const images = await db.productImage.findMany({
    where: { product: where },
    select: { storageKey: true },
  });
  const storage = getStorage();
  for (const img of images) {
    if (img.storageKey) await storage.delete(img.storageKey);
  }

  const del = await db.product.deleteMany({ where });
  console.log(`Removed ${del.count} demo/placeholder products and ${images.length} image files.`);
  console.log(`Products remaining: ${await db.product.count()}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
