import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** On-demand cache invalidation. POST { tag } with Bearer CRON_SECRET. */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { tag } = (await request.json().catch(() => ({}))) as { tag?: string };
  if (!tag) return NextResponse.json({ ok: false, error: "tag required" }, { status: 400 });
  revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, revalidated: tag });
}
