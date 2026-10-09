import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cheap change signal for live pages (Hanout demo): one round-trip, two
 * aggregate reads. Clients poll this and only re-render the whole route when
 * the stamp changes — keeps database usage low during a full expo day.
 */
export async function GET() {
  const [orders, messages] = await Promise.all([
    db.order.aggregate({ _max: { updatedAt: true }, _count: { _all: true } }),
    db.message.aggregate({ _max: { createdAt: true }, _count: { _all: true } }),
  ]);
  const stamp = [
    orders._count._all,
    orders._max.updatedAt?.getTime() ?? 0,
    messages._count._all,
    messages._max.createdAt?.getTime() ?? 0,
  ].join(".");
  return NextResponse.json({ stamp }, { headers: { "Cache-Control": "no-store" } });
}
