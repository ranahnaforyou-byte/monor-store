import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { provisionCoreData, provisionDemoProducts } from "@/server/services/provision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-time database provisioner for the hosted (Vercel) deployment, used when
 * the developer machine cannot reach Postgres on :5432.
 *
 *   GET /api/setup?key=<CRON_SECRET>            -> core data + 40 demo products
 *   GET /api/setup?key=<CRON_SECRET>&fresh=1    -> also wipe existing demo/placeholder products first
 *   GET /api/setup?key=<CRON_SECRET>&demo=0     -> core data only (no demo products)
 *
 * Idempotent — safe to call again. Delete or ignore once the store has real data.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const core = await provisionCoreData();
    const withDemo = url.searchParams.get("demo") !== "0";
    const demo = withDemo
      ? await provisionDemoProducts({ fresh: url.searchParams.get("fresh") === "1" })
      : { skipped: true };

    return NextResponse.json({ ok: true, core, demo });
  } catch (err) {
    console.error("setup failed", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
