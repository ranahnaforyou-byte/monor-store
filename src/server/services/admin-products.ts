import "server-only";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { revalidateMany, tags } from "@/lib/cache";
import { processProductImage } from "@/lib/images/process";
import { getStorage } from "@/lib/images/storage";
import { archiveOriginalImage } from "@/lib/drive/archive";
import type { Prisma, ProductStatus } from "@/generated/prisma";

export type AdminProductInput = {
  name: string;
  nameFr?: string;
  slug?: string;
  description: string;
  descriptionFr?: string;
  brand: string;
  sku?: string;
  categoryId?: string | null;
  price: number; // centimes
  compareAtPrice?: number | null;
  sizes: string[];
  colors: string[];
  sizeStock: { size: string; quantity: number }[];
  featured: boolean;
  newArrival: boolean;
  sale: boolean;
  status: ProductStatus;
  seoTitle?: string;
  seoDescription?: string;
  lowStockThreshold?: number;
};

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "product";
  let candidate = root;
  let n = 2;
  while (
    await db.product.findFirst({
      where: { slug: candidate, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}

function syncStockData(input: AdminProductInput) {
  const map = new Map(input.sizeStock.map((s) => [s.size, Math.max(0, Math.trunc(s.quantity))]));
  const sizes = input.sizes.length ? input.sizes : [...map.keys()];
  const rows = sizes.map((size) => ({ size, quantity: map.get(size) ?? 0 }));
  const total = rows.reduce((s, r) => s + r.quantity, 0);
  return { rows, total, sizes };
}

export async function createProduct(input: AdminProductInput, adminId: string) {
  const slug = await uniqueSlug(input.slug || input.name);
  const { rows, total, sizes } = syncStockData(input);

  const product = await db.product.create({
    data: {
      slug,
      name: input.name,
      nameFr: input.nameFr || null,
      description: input.description,
      descriptionFr: input.descriptionFr || null,
      brand: input.brand,
      sku: input.sku || null,
      categoryId: input.categoryId || null,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      sizes,
      colors: input.colors,
      stock: total,
      lowStockThreshold: input.lowStockThreshold ?? 3,
      featured: input.featured,
      newArrival: input.newArrival,
      sale: input.sale,
      status: input.status,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      sizeStock: { create: rows },
    },
  });

  await audit(adminId, "product.create", "Product", product.id);
  bust(slug);
  return product;
}

export async function updateProduct(id: string, input: AdminProductInput, adminId: string) {
  const existing = await db.product.findUnique({ where: { id }, include: { sizeStock: true } });
  if (!existing) throw new Error("not found");

  const slug =
    input.slug && input.slug !== existing.slug
      ? await uniqueSlug(input.slug, id)
      : existing.slug;
  const { rows, total, sizes } = syncStockData(input);

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        slug,
        name: input.name,
        nameFr: input.nameFr || null,
        description: input.description,
        descriptionFr: input.descriptionFr || null,
        brand: input.brand,
        sku: input.sku || null,
        categoryId: input.categoryId || null,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        sizes,
        colors: input.colors,
        stock: total,
        lowStockThreshold: input.lowStockThreshold ?? existing.lowStockThreshold,
        featured: input.featured,
        newArrival: input.newArrival,
        sale: input.sale,
        status: input.status,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
      },
    });

    // Reconcile size stock rows + log movements for manual adjustments.
    const prev = new Map(existing.sizeStock.map((s) => [s.size, s.quantity]));
    await tx.sizeStock.deleteMany({
      where: { productId: id, size: { notIn: rows.map((r) => r.size) } },
    });
    for (const row of rows) {
      await tx.sizeStock.upsert({
        where: { productId_size: { productId: id, size: row.size } },
        create: { productId: id, size: row.size, quantity: row.quantity },
        update: { quantity: row.quantity },
      });
      const before = prev.get(row.size) ?? 0;
      if (before !== row.quantity) {
        await tx.inventoryMovement.create({
          data: {
            productId: id,
            size: row.size,
            delta: row.quantity - before,
            reason: "MANUAL_ADJUSTMENT",
            createdBy: adminId,
            note: "product editor",
          },
        });
      }
    }
  });

  await audit(adminId, "product.update", "Product", id);
  bust(slug);
  if (slug !== existing.slug) bust(existing.slug);
  return db.product.findUnique({ where: { id } });
}

export async function setProductStatus(id: string, status: ProductStatus, adminId: string) {
  const p = await db.product.update({ where: { id }, data: { status } });
  await audit(adminId, `product.${status.toLowerCase()}`, "Product", id);
  bust(p.slug);
  return p;
}

export async function duplicateProduct(id: string, adminId: string) {
  const src = await db.product.findUnique({
    where: { id },
    include: { images: true, sizeStock: true },
  });
  if (!src) throw new Error("not found");
  const slug = await uniqueSlug(`${src.slug}-copy`);

  const copy = await db.product.create({
    data: {
      slug,
      name: `${src.name} (نسخة)`,
      nameFr: src.nameFr,
      description: src.description,
      descriptionFr: src.descriptionFr,
      brand: src.brand,
      sku: null,
      categoryId: src.categoryId,
      price: src.price,
      compareAtPrice: src.compareAtPrice,
      sizes: src.sizes,
      colors: src.colors,
      stock: 0,
      lowStockThreshold: src.lowStockThreshold,
      featured: false,
      newArrival: false,
      sale: src.sale,
      status: "DRAFT",
      seoTitle: src.seoTitle,
      seoDescription: src.seoDescription,
      // Copy image references (same stored files), reset stock to zero.
      sizeStock: { create: src.sizeStock.map((s) => ({ size: s.size, quantity: 0 })) },
      images: {
        create: src.images.map((img) => ({
          url: img.url,
          storageKey: img.storageKey,
          driveFileId: img.driveFileId,
          alt: img.alt,
          position: img.position,
          width: img.width,
          height: img.height,
          blurDataURL: img.blurDataURL,
          isPrimary: img.isPrimary,
        })),
      },
    },
  });
  await audit(adminId, "product.duplicate", "Product", copy.id);
  bust(slug);
  return copy;
}

export async function addProductImage(productId: string, file: File, adminId: string) {
  const buf = Buffer.from(await file.arrayBuffer());
  const processed = await processProductImage(buf);
  const storage = getStorage();
  const key = `products/${productId}/${crypto.randomUUID()}.${processed.ext}`;
  const url = await storage.put(key, processed.buffer, processed.contentType);

  // Archive the untouched original to Google Drive (no-op if Drive unconfigured).
  const driveFileId = await archiveOriginalImage(
    productId,
    file.name || `${key.split("/").pop()}`,
    buf,
    file.type || "application/octet-stream",
  );

  const count = await db.productImage.count({ where: { productId } });
  const image = await db.productImage.create({
    data: {
      productId,
      url,
      storageKey: key,
      driveFileId,
      alt: "",
      position: count,
      width: processed.width,
      height: processed.height,
      blurDataURL: processed.blurDataURL,
      isPrimary: count === 0,
    },
  });
  await touchProduct(productId);
  await audit(adminId, "product.image.add", "ProductImage", image.id);
  return image;
}

export async function deleteProductImage(imageId: string, adminId: string) {
  const img = await db.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  if (img.storageKey) await getStorage().delete(img.storageKey);
  await db.productImage.delete({ where: { id: imageId } });
  if (img.isPrimary) {
    const next = await db.productImage.findFirst({
      where: { productId: img.productId },
      orderBy: { position: "asc" },
    });
    if (next) await db.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
  }
  await touchProduct(img.productId);
  await audit(adminId, "product.image.delete", "ProductImage", imageId);
}

export async function reorderProductImage(imageId: string, direction: "up" | "down", adminId: string) {
  const img = await db.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  const siblings = await db.productImage.findMany({
    where: { productId: img.productId },
    orderBy: { position: "asc" },
  });
  const idx = siblings.findIndex((s) => s.id === imageId);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;
  await db.$transaction([
    db.productImage.update({ where: { id: siblings[idx].id }, data: { position: swapWith } }),
    db.productImage.update({ where: { id: siblings[swapWith].id }, data: { position: idx } }),
  ]);
  await touchProduct(img.productId);
  await audit(adminId, "product.image.reorder", "ProductImage", imageId);
}

export async function setPrimaryImage(imageId: string, adminId: string) {
  const img = await db.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  await db.$transaction([
    db.productImage.updateMany({ where: { productId: img.productId }, data: { isPrimary: false } }),
    db.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
  await touchProduct(img.productId);
  await audit(adminId, "product.image.primary", "ProductImage", imageId);
}

async function touchProduct(productId: string) {
  const p = await db.product.update({
    where: { id: productId },
    data: { updatedAt: new Date() },
    select: { slug: true },
  });
  bust(p.slug);
}

function bust(slug: string) {
  revalidateMany(tags.products, tags.product(slug), tags.homepage, tags.categories);
}

async function audit(
  adminUserId: string,
  action: string,
  entity: string,
  entityId: string,
  diff?: Prisma.InputJsonValue,
) {
  await db.auditLog.create({ data: { adminUserId, action, entity, entityId, diff } });
}
