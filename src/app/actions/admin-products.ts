"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { parseDZDToCentimes } from "@/lib/money";
import {
  createProduct,
  updateProduct,
  setProductStatus,
  duplicateProduct,
  addProductImage,
  deleteProductImage,
  reorderProductImage,
  setPrimaryImage,
  type AdminProductInput,
} from "@/server/services/admin-products";
import type { Result } from "@/lib/utils";

const list = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/[,،\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

const money = (v: FormDataEntryValue | null): number | null => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return parseDZDToCentimes(s);
};

function readForm(fd: FormData): AdminProductInput | { error: string } {
  const name = String(fd.get("name") ?? "").trim();
  const brand = String(fd.get("brand") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();
  const price = money(fd.get("price"));
  if (!name || !brand || !description) return { error: "missingFields" };
  if (price == null || price < 0) return { error: "invalidPrice" };

  const sizes = list(fd.get("sizes"));
  const sizeStock = sizes.map((size) => ({
    size,
    quantity: Math.max(0, Number(fd.get(`stock_${size}`) ?? 0) || 0),
  }));

  const statusRaw = String(fd.get("status") ?? "DRAFT");
  const status =
    statusRaw === "ACTIVE" || statusRaw === "ARCHIVED" ? statusRaw : "DRAFT";

  return {
    name,
    nameFr: String(fd.get("nameFr") ?? "").trim() || undefined,
    slug: String(fd.get("slug") ?? "").trim() || undefined,
    description,
    descriptionFr: String(fd.get("descriptionFr") ?? "").trim() || undefined,
    brand,
    sku: String(fd.get("sku") ?? "").trim() || undefined,
    categoryId: String(fd.get("categoryId") ?? "").trim() || null,
    price,
    compareAtPrice: money(fd.get("compareAtPrice")),
    sizes,
    colors: list(fd.get("colors")),
    sizeStock,
    featured: fd.get("featured") === "on",
    newArrival: fd.get("newArrival") === "on",
    sale: fd.get("sale") === "on",
    status,
    seoTitle: String(fd.get("seoTitle") ?? "").trim() || undefined,
    seoDescription: String(fd.get("seoDescription") ?? "").trim() || undefined,
    lowStockThreshold: Number(fd.get("lowStockThreshold") ?? 3) || 3,
  };
}

export async function saveProduct(fd: FormData): Promise<Result<{ id: string }>> {
  const admin = await requireRole("MANAGER");
  const id = String(fd.get("id") ?? "").trim();
  const parsed = readForm(fd);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const saved = id
    ? await updateProduct(id, parsed, admin.sub)
    : await createProduct(parsed, admin.sub);

  revalidatePath("/admin/products");
  if (saved) revalidatePath(`/admin/products/${saved.id}`);
  return { ok: true, data: { id: saved!.id } };
}

export async function saveProductAndExit(fd: FormData): Promise<void> {
  const res = await saveProduct(fd);
  if (res.ok) redirect("/admin/products");
}

const idSchema = z.string().min(1);

export async function archiveProduct(id: string) {
  const admin = await requireRole("MANAGER");
  await setProductStatus(idSchema.parse(id), "ARCHIVED", admin.sub);
  revalidatePath("/admin/products");
}

export async function activateProduct(id: string) {
  const admin = await requireRole("MANAGER");
  await setProductStatus(idSchema.parse(id), "ACTIVE", admin.sub);
  revalidatePath("/admin/products");
}

export async function duplicateProductAction(id: string) {
  const admin = await requireRole("MANAGER");
  const copy = await duplicateProduct(idSchema.parse(id), admin.sub);
  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}`);
}

export async function uploadProductImage(fd: FormData): Promise<Result<null>> {
  const admin = await requireRole("MANAGER");
  const productId = String(fd.get("productId") ?? "");
  const file = fd.get("file");
  if (!productId || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "noFile" };
  }
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "tooLarge" };
  if (!/^image\/(png|jpe?g|webp|avif)$/.test(file.type)) {
    return { ok: false, error: "badType" };
  }
  await addProductImage(productId, file, admin.sub);
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, data: null };
}

export async function removeProductImage(imageId: string, productId: string) {
  const admin = await requireRole("MANAGER");
  await deleteProductImage(imageId, admin.sub);
  revalidatePath(`/admin/products/${productId}`);
}

export async function moveProductImage(
  imageId: string,
  productId: string,
  direction: "up" | "down",
) {
  const admin = await requireRole("MANAGER");
  await reorderProductImage(imageId, direction, admin.sub);
  revalidatePath(`/admin/products/${productId}`);
}

export async function makePrimaryImage(imageId: string, productId: string) {
  const admin = await requireRole("MANAGER");
  await setPrimaryImage(imageId, admin.sub);
  revalidatePath(`/admin/products/${productId}`);
}
