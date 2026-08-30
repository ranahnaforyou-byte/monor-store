import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Placeholder for a future official BaridiMob / e-paiement gateway. Launch uses
 * manual verification, so this endpoint only records events until a real gateway
 * contract exists. It verifies a shared secret and is idempotent.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!env.BARIDIMOB_WEBHOOK_SECRET || secret !== env.BARIDIMOB_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const body = payload as { transaction_id?: string; order_reference?: string; status?: string; amount?: number };
  const externalId = body.transaction_id ?? `${body.order_reference}:${Date.now()}`;

  const existing = await db.webhookEvent.findUnique({
    where: { source_externalId: { source: "BARIDIMOB", externalId } },
  });
  if (existing) return NextResponse.json({ ok: true, deduped: true });

  await db.webhookEvent.create({
    data: { source: "BARIDIMOB", externalId, payload: body as object, status: "received" },
  });

  return NextResponse.json({ ok: true, note: "recorded — manual verification flow in use" });
}
