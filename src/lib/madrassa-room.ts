import "server-only";
import { db } from "@/lib/db";
import { seed, type World } from "@/components/madrassa/world";

/**
 * MA DRASSA demo sessions («جلسة عرض»): one shared demo world per 4-digit code,
 * so several devices can play different roles together.
 *
 * Stored in the existing WebhookEvent table (source = MADRASSA_DEMO,
 * externalId = code, payload = world, status = version) — no schema change,
 * so this branch never migrates any database. Demo data only.
 */
export const ROOM_SOURCE = "MADRASSA_DEMO";
export type Room = { v: number; world: World };

export async function readRoom(code: string): Promise<Room | null> {
  const row = await db.webhookEvent.findUnique({ where: { source_externalId: { source: ROOM_SOURCE, externalId: code } } });
  if (!row) return null;
  return { v: Number(row.status) || 0, world: row.payload as unknown as World };
}

export async function createRoom(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = String(1000 + Math.floor(Math.random() * 9000));
    try {
      await db.webhookEvent.create({ data: { source: ROOM_SOURCE, externalId: code, payload: seed() as object, status: "1" } });
      return code;
    } catch {
      // code taken — try another
    }
  }
  throw new Error("no free room code");
}

/** Optimistic concurrency: retry if another device wrote in between. */
export async function updateRoom(code: string, fn: (w: World) => World | null): Promise<Room | null | "bad"> {
  for (let i = 0; i < 6; i++) {
    const cur = await readRoom(code);
    if (!cur) return null;
    let next: World | null;
    try {
      next = fn(cur.world);
    } catch {
      return "bad";
    }
    if (!next) return "bad";
    const v = cur.v + 1;
    const res = await db.webhookEvent.updateMany({
      where: { source: ROOM_SOURCE, externalId: code, status: String(cur.v) },
      data: { payload: next as object, status: String(v), processedAt: new Date() },
    });
    if (res.count === 1) return { v, world: next };
  }
  throw new Error("room busy");
}
