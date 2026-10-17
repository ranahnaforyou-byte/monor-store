import { NextResponse, type NextRequest } from "next/server";
import { decodeProfile, encodeProfile, type Profile } from "@/components/madrassa/world";
import { createRoom } from "@/lib/madrassa-room";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start a new demo session and return its 4-digit code. */
export async function POST(req: NextRequest) {
  // optional institution profile; re-validated through the same decoder as links
  let profile: Profile | undefined;
  try {
    const body = (await req.json()) as { profile?: Profile | null };
    if (body?.profile) profile = decodeProfile(encodeProfile(body.profile));
  } catch {}
  const code = await createRoom(profile);
  return NextResponse.json({ code }, { headers: { "Cache-Control": "no-store" } });
}
