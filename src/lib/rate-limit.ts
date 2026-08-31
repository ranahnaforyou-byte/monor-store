import "server-only";
import { db } from "@/lib/db";

/**
 * Simple DB-backed fixed-window rate limiter. Good enough for a single-region
 * COD store; swap for Upstash/edge KV if traffic grows. Reuses the
 * `LoginAttempt` table as a generic hit log keyed by `email` = "<scope>:<key>".
 */
export async function rateLimit(
  scope: string,
  key: string,
  opts: { limit: number; windowSeconds: number },
): Promise<{ ok: boolean; remaining: number }> {
  const identifier = `${scope}:${key}`.slice(0, 180);
  const since = new Date(Date.now() - opts.windowSeconds * 1000);

  const used = await db.loginAttempt.count({
    where: { email: identifier, createdAt: { gte: since } },
  });
  if (used >= opts.limit) return { ok: false, remaining: 0 };

  await db.loginAttempt.create({ data: { email: identifier, ip: scope, success: true } });
  return { ok: true, remaining: opts.limit - used - 1 };
}

/** Best-effort client IP from request headers. */
export function ipFromHeaders(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0"
  );
}
