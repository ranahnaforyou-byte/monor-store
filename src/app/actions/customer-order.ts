"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { advanceOrder, postSystemMessage, shortRef } from "@/server/services/hanout";

export type CustomerResult = { ok: true } | { ok: false; error: string };

/** Customer self-service from the confirmation link (/order/[reference]). */
async function pending(reference: string) {
  const o = await db.order.findUnique({ where: { reference }, select: { id: true, status: true } });
  if (!o) return null;
  return o;
}

export async function customerConfirm(reference: string): Promise<CustomerResult> {
  const o = await pending(reference);
  if (!o) return { ok: false, error: "notFound" };
  if (o.status !== "PENDING") return { ok: true }; // already confirmed by the team — nothing to do
  try {
    await advanceOrder(o.id, "CONFIRMED", "customer");
  } catch {
    // Raced with a confirmer — the order is confirmed either way.
  }
  refresh();
  return { ok: true };
}

export async function customerCancel(reference: string): Promise<CustomerResult> {
  const o = await pending(reference);
  if (!o) return { ok: false, error: "notFound" };
  if (o.status !== "PENDING") return { ok: false, error: "locked" };
  try {
    await advanceOrder(o.id, "CANCELLED", "customer");
  } catch {
    return { ok: false, error: "locked" };
  }
  refresh();
  return { ok: true };
}

export async function customerUpdateAddress(reference: string, address: string): Promise<CustomerResult> {
  const line = address.trim().slice(0, 200);
  if (line.length < 4) return { ok: false, error: "short" };
  const o = await db.order.findUnique({ where: { reference }, select: { id: true, status: true } });
  if (!o) return { ok: false, error: "notFound" };
  if (!["PENDING", "CONFIRMED"].includes(o.status)) return { ok: false, error: "locked" };
  await db.order.update({ where: { id: o.id }, data: { addressLine: line } });
  await db.orderEvent.create({ data: { orderId: o.id, type: "NOTE", message: `address → ${line}`, createdBy: "customer" } });
  await postSystemMessage("confirm", `الزبون عدّل عنوان التوصيل للطلب ${shortRef(reference)}: ${line}`, {
    orderRef: reference,
    tone: "warning",
  });
  refresh();
  return { ok: true };
}
