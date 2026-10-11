import { NextResponse } from "next/server";
import { createRoom } from "@/lib/madrassa-room";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start a new demo session and return its 4-digit code. */
export async function POST() {
  const code = await createRoom();
  return NextResponse.json({ code }, { headers: { "Cache-Control": "no-store" } });
}
