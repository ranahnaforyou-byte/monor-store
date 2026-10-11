import { NextResponse, type NextRequest } from "next/server";
import { applyAction, seed } from "@/components/madrassa/world";
import { readRoom, updateRoom } from "@/lib/madrassa-room";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const valid = (code: string) => /^\d{4}$/.test(code);

/** Current world of a session; 204 when the caller already has version `v`. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!valid(code)) return NextResponse.json({ error: "bad code" }, { status: 400 });
  const room = await readRoom(code);
  if (!room) return NextResponse.json({ error: "not found" }, { status: 404, headers: NO_STORE });
  const known = Number(req.nextUrl.searchParams.get("v") ?? 0);
  if (known >= room.v) return new NextResponse(null, { status: 204, headers: NO_STORE });
  return NextResponse.json(room, { headers: NO_STORE });
}

/** Apply one demo action ({ action, args }) to the session's world. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!valid(code)) return NextResponse.json({ error: "bad code" }, { status: 400 });
  const raw = await req.text();
  if (raw.length > 4000) return NextResponse.json({ error: "too large" }, { status: 413 });
  let body: { action?: unknown; args?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const { action, args } = body;
  if (typeof action !== "string" || !Array.isArray(args)) return NextResponse.json({ error: "bad action" }, { status: 400 });
  const res = await updateRoom(code, (w) => (action === "reset" ? seed() : applyAction(w, action, args)));
  if (res === null) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (res === "bad") return NextResponse.json({ error: "unknown action" }, { status: 400 });
  return NextResponse.json(res, { headers: NO_STORE });
}
