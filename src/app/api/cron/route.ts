import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { yalidine, YalidineNotConfiguredError } from "@/lib/yalidine/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled jobs. Trigger with:
 *   GET /api/cron?job=yalidine-sync   Authorization: Bearer <CRON_SECRET>
 * Configure a scheduler (Vercel Cron / system cron) to hit this hourly.
 */
async function run(job: string) {
  switch (job) {
    case "yalidine-sync": {
      if (!yalidine.isConfigured()) return { skipped: "yalidine not configured" };
      const open = await db.order.findMany({
        where: {
          yalidineTracking: { not: null },
          status: { in: ["PREPARING", "SHIPPED"] },
        },
        take: 100,
      });
      let updated = 0;
      for (const o of open) {
        try {
          const data = (await yalidine.getParcel(o.yalidineTracking!)) as { last_status?: string };
          if (data.last_status && data.last_status !== o.yalidineStatus) {
            await db.order.update({
              where: { id: o.id },
              data: { yalidineStatus: data.last_status },
            });
            updated++;
          }
        } catch (err) {
          if (err instanceof YalidineNotConfiguredError) break;
        }
      }
      return { checked: open.length, updated };
    }
    default:
      return { error: "unknown job" };
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const job = new URL(request.url).searchParams.get("job") ?? "";
  const result = await run(job);
  return NextResponse.json({ ok: true, job, result });
}
