import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, "SHIPPED" | "DELIVERED" | "RETURNED"> = {
  "Expédié": "SHIPPED",
  "En livraison": "SHIPPED",
  "Livré": "DELIVERED",
  "Retourné": "RETURNED",
  "Retour vers vendeur": "RETURNED",
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!env.YALIDINE_WEBHOOK_SECRET || secret !== env.YALIDINE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const body = payload as { event_id?: string; tracking?: string; status?: string };
  const externalId = body.event_id ?? `${body.tracking}:${body.status}:${Date.now()}`;

  const existing = await db.webhookEvent.findUnique({
    where: { source_externalId: { source: "YALIDINE", externalId } },
  });
  if (existing) return NextResponse.json({ ok: true, deduped: true });

  const evt = await db.webhookEvent.create({
    data: { source: "YALIDINE", externalId, payload: body as object },
  });

  try {
    if (body.tracking) {
      const order = await db.order.findFirst({ where: { yalidineTracking: body.tracking } });
      if (order) {
        const mapped = body.status ? STATUS_MAP[body.status] : undefined;
        await db.order.update({
          where: { id: order.id },
          data: {
            yalidineStatus: body.status ?? order.yalidineStatus,
            ...(mapped ? { status: mapped } : {}),
            ...(mapped === "DELIVERED" && order.paymentMethod === "COD"
              ? { paymentStatus: "PAID", deliveredAt: new Date() }
              : {}),
            events: {
              create: { type: "SHIPPING", message: `Yalidine webhook: ${body.status ?? "?"}`, createdBy: "system" },
            },
          },
        });
      }
    }
    await db.webhookEvent.update({
      where: { id: evt.id },
      data: { status: "processed", processedAt: new Date() },
    });
  } catch (err) {
    await db.webhookEvent.update({
      where: { id: evt.id },
      data: { status: "error", error: (err as Error).message.slice(0, 400) },
    });
  }

  return NextResponse.json({ ok: true });
}
