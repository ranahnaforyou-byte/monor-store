import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { provisionCoreData, provisionDemoProducts } from "@/server/services/provision";
import { provisionHanout, resetHanoutDemo } from "@/server/services/hanout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-time database provisioner for the hosted (Vercel) deployment, used when
 * the developer machine cannot reach Postgres on :5432.
 *
 *   GET /api/setup?key=<CRON_SECRET>            -> core data + Hanout expo demo (staff, 12 products, history)
 *   GET /api/setup?key=<CRON_SECRET>&reset=1    -> also wipe demo orders + chat and reseed (leads kept)
 *   GET /api/setup?key=<CRON_SECRET>&monor=1    -> also add MONOR's 40 football demo products
 *
 * Idempotent — safe to call again.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const core = await provisionCoreData();
    const monor = url.searchParams.get("monor") === "1" ? await provisionDemoProducts() : { skipped: true };
    const hanout = await provisionHanout();
    if (url.searchParams.get("reset") === "1") await resetHanoutDemo();

    return NextResponse.json({ ok: true, core, monor, hanout });
  } catch (err) {
    console.error("setup failed", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
