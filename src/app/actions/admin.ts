"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";
import { parseDZDToCentimes } from "@/lib/money";
import { revalidate, revalidateMany, tags } from "@/lib/cache";
import {
  changeOrderStatus,
  setPaymentStatus,
  addOrderNote,
} from "@/server/services/admin-orders";
import { yalidine, YalidineNotConfiguredError } from "@/lib/yalidine/client";
import type { OrderStatus } from "@/generated/prisma";

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

const statusValues = [
  "PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED",
] as const;

export async function orderStatusAction(fd: FormData): Promise<void> {
  const admin = await requireRole("STAFF");
  const orderId = String(fd.get("orderId") ?? "");
  const next = String(fd.get("status") ?? "");
  if (!orderId || !statusValues.includes(next as OrderStatus)) return;
  await changeOrderStatus(orderId, next as OrderStatus, admin.sub);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function orderPaymentAction(fd: FormData): Promise<void> {
  const admin = await requireRole("MANAGER");
  const orderId = String(fd.get("orderId") ?? "");
  const status = z
    .enum(["UNPAID", "PENDING", "PAID", "REFUNDED", "FAILED"])
    .safeParse(fd.get("paymentStatus"));
  if (!orderId || !status.success) return;
  await setPaymentStatus(orderId, status.data, admin.sub);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function orderNoteAction(fd: FormData): Promise<void> {
  const admin = await requireRole("STAFF");
  const orderId = String(fd.get("orderId") ?? "");
  const message = String(fd.get("message") ?? "").trim().slice(0, 1000);
  if (!orderId || !message) return;
  await addOrderNote(orderId, message, admin.sub);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function createYalidineParcelAction(fd: FormData): Promise<void> {
  const admin = await requireRole("MANAGER");
  const orderId = String(fd.get("orderId") ?? "");
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.yalidineParcelId) return;

  try {
    const [firstname, ...rest] = order.customerName.split(" ");
    const result = await yalidine.createParcel({
      orderId: order.reference,
      firstname: firstname || order.customerName,
      familyname: rest.join(" ") || "-",
      contactPhone: order.customerPhone,
      address: order.addressLine,
      toWilayaName: order.wilayaName,
      toCommuneName: order.communeName,
      isStopdesk: order.deliveryMode === "STOP_DESK",
      productList: order.items.map((i) => `${i.nameSnapshot} x${i.quantity}`).join(", ").slice(0, 250),
      price: order.paymentStatus === "PAID" ? 0 : Math.round(order.total / 100),
    });
    await db.order.update({
      where: { id: orderId },
      data: {
        yalidineParcelId: result.tracking,
        yalidineTracking: result.tracking,
        yalidineLabelUrl: result.labelUrl ?? null,
        yalidineStatus: "created",
        events: { create: { type: "SHIPPING", message: `Yalidine parcel ${result.tracking}`, createdBy: admin.sub } },
      },
    });
    revalidatePath(`/admin/orders/${orderId}`);
  } catch (err) {
    const msg =
      err instanceof YalidineNotConfiguredError
        ? "Yalidine غير مُهيّأ — أضف المفاتيح في متغيرات البيئة"
        : `Yalidine error: ${(err as Error).message}`.slice(0, 400);
    console.error("yalidine parcel failed", err);
    await db.orderEvent.create({
      data: { orderId, type: "SHIPPING", message: msg, createdBy: admin.sub },
    });
    revalidatePath(`/admin/orders/${orderId}`);
  }
}

export async function refreshYalidineStatusAction(fd: FormData): Promise<void> {
  const admin = await requireRole("STAFF");
  const orderId = String(fd.get("orderId") ?? "");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order?.yalidineTracking) return;
  try {
    const data = (await yalidine.getParcel(order.yalidineTracking)) as { last_status?: string };
    await db.order.update({
      where: { id: orderId },
      data: { yalidineStatus: data.last_status ?? order.yalidineStatus },
    });
  } catch (err) {
    await db.orderEvent.create({
      data: {
        orderId,
        type: "SHIPPING",
        message: `Yalidine refresh failed: ${(err as Error).message}`.slice(0, 300),
        createdBy: admin.sub,
      },
    });
  }
  revalidatePath(`/admin/orders/${orderId}`);
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export async function saveCategoryAction(fd: FormData): Promise<void> {
  const admin = await requireRole("MANAGER");
  const id = String(fd.get("id") ?? "").trim();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  const data = {
    name,
    nameFr: String(fd.get("nameFr") ?? "").trim() || null,
    description: String(fd.get("description") ?? "").trim() || null,
    image: String(fd.get("image") ?? "").trim() || null,
    position: Number(fd.get("position") ?? 0) || 0,
    seoTitle: String(fd.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(fd.get("seoDescription") ?? "").trim() || null,
  };
  if (id) {
    await db.category.update({ where: { id }, data });
  } else {
    let slug = slugify(String(fd.get("slug") ?? "") || name) || "category";
    while (await db.category.findUnique({ where: { slug }, select: { id: true } })) slug += "-2";
    await db.category.create({ data: { ...data, slug } });
  }
  await db.auditLog.create({
    data: { adminUserId: admin.sub, action: id ? "category.update" : "category.create", entity: "Category", entityId: id || slugify(name) },
  });
  revalidateMany(tags.categories, tags.products, tags.homepage);
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireRole("MANAGER");
  await db.category.delete({ where: { id } });
  revalidate(tags.categories);
  revalidatePath("/admin/categories");
}

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

export async function adjustStockAction(fd: FormData): Promise<void> {
  const admin = await requireRole("STAFF");
  const productId = String(fd.get("productId") ?? "");
  const size = String(fd.get("size") ?? "");
  const delta = Math.trunc(Number(fd.get("delta") ?? 0));
  const reasonRaw = String(fd.get("reason") ?? "MANUAL_ADJUSTMENT");
  const reason =
    reasonRaw === "RESTOCK" || reasonRaw === "RETURN" || reasonRaw === "SALE"
      ? reasonRaw
      : "MANUAL_ADJUSTMENT";
  if (!productId || !size || !delta) return;

  await db.$transaction(async (tx) => {
    const row = await tx.sizeStock.findUnique({
      where: { productId_size: { productId, size } },
    });
    const nextQty = Math.max(0, (row?.quantity ?? 0) + delta);
    await tx.sizeStock.upsert({
      where: { productId_size: { productId, size } },
      create: { productId, size, quantity: nextQty },
      update: { quantity: nextQty },
    });
    await tx.inventoryMovement.create({
      data: {
        productId,
        size,
        delta,
        reason,
        note: String(fd.get("note") ?? "").slice(0, 200) || null,
        createdBy: admin.sub,
      },
    });
    const agg = await tx.sizeStock.aggregate({ where: { productId }, _sum: { quantity: true } });
    await tx.product.update({ where: { id: productId }, data: { stock: agg._sum.quantity ?? 0 } });
  });

  revalidateMany(tags.products);
  revalidatePath("/admin/inventory");
}

/* -------------------------------------------------------------------------- */
/* Payments (BaridiMob manual verification)                                   */
/* -------------------------------------------------------------------------- */

export async function reviewPaymentAction(fd: FormData): Promise<void> {
  const admin = await requireRole("MANAGER");
  const attemptId = String(fd.get("attemptId") ?? "");
  const decision = String(fd.get("decision") ?? "");
  const attempt = await db.paymentAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) return;

  if (decision === "approve") {
    await db.$transaction([
      db.paymentAttempt.update({
        where: { id: attemptId },
        data: { status: "PAID", reviewedBy: admin.sub, reviewedAt: new Date() },
      }),
      db.order.update({
        where: { id: attempt.orderId },
        data: {
          paymentStatus: "PAID",
          events: { create: { type: "PAYMENT", message: "BaridiMob payment approved", createdBy: admin.sub } },
        },
      }),
    ]);
  } else if (decision === "reject") {
    await db.$transaction([
      db.paymentAttempt.update({
        where: { id: attemptId },
        data: { status: "FAILED", reviewedBy: admin.sub, reviewedAt: new Date() },
      }),
      db.order.update({
        where: { id: attempt.orderId },
        data: {
          paymentStatus: "FAILED",
          events: { create: { type: "PAYMENT", message: "BaridiMob payment rejected", createdBy: admin.sub } },
        },
      }),
    ]);
  }
  revalidatePath("/admin/payments");
}

/* -------------------------------------------------------------------------- */
/* Customers                                                                  */
/* -------------------------------------------------------------------------- */

export async function toggleCustomerBlockAction(id: string): Promise<void> {
  await requireRole("MANAGER");
  const c = await db.customer.findUnique({ where: { id }, select: { blocked: true } });
  if (!c) return;
  await db.customer.update({ where: { id }, data: { blocked: !c.blocked } });
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
}

/* -------------------------------------------------------------------------- */
/* Shipping rates                                                             */
/* -------------------------------------------------------------------------- */

export async function saveShippingRateAction(fd: FormData): Promise<void> {
  await requireRole("MANAGER");
  const wilayaCode = Number(fd.get("wilayaCode"));
  const toHome = parseDZDToCentimes(String(fd.get("toHome") ?? "")) ?? 0;
  const toStopDesk = parseDZDToCentimes(String(fd.get("toStopDesk") ?? "")) ?? 0;
  const active = fd.get("active") === "on";
  if (!wilayaCode) return;
  await db.shippingRate.upsert({
    where: { wilayaCode },
    create: { wilayaCode, toHome, toStopDesk, active },
    update: { toHome, toStopDesk, active },
  });
  revalidatePath("/admin/shipping");
}

/* -------------------------------------------------------------------------- */
/* Store settings                                                             */
/* -------------------------------------------------------------------------- */

export async function saveSettingsAction(fd: FormData): Promise<void> {
  const admin = await requireRole("OWNER");
  const num = (k: string) => parseDZDToCentimes(String(fd.get(k) ?? "")) ?? undefined;
  const threshold = String(fd.get("freeShippingThreshold") ?? "").trim();

  await db.storeSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {
      storeName: String(fd.get("storeName") ?? "MONOR STORE").trim(),
      contactPhone: String(fd.get("contactPhone") ?? "").trim(),
      contactEmail: String(fd.get("contactEmail") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      instagramUrl: String(fd.get("instagramUrl") ?? "").trim(),
      facebookUrl: String(fd.get("facebookUrl") ?? "").trim(),
      tiktokUrl: String(fd.get("tiktokUrl") ?? "").trim(),
      announcementBar: String(fd.get("announcementBar") ?? "").trim(),
      announcementActive: fd.get("announcementActive") === "on",
      freeShippingThreshold: threshold ? (parseDZDToCentimes(threshold) ?? null) : null,
      defaultHomeFee: num("defaultHomeFee") ?? 40000,
      defaultStopDeskFee: num("defaultStopDeskFee") ?? 25000,
      codEnabled: fd.get("codEnabled") === "on",
      baridimobEnabled: fd.get("baridimobEnabled") === "on",
      baridimobInfo: String(fd.get("baridimobInfo") ?? "").trim(),
      maintenanceMode: fd.get("maintenanceMode") === "on",
    },
  });
  await db.auditLog.create({
    data: { adminUserId: admin.sub, action: "settings.update", entity: "StoreSetting", entityId: "singleton" },
  });
  revalidateMany(tags.settings, tags.homepage);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
