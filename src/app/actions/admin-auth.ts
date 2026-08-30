"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
const WINDOW_MINUTES = 15;

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0"
  );
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });
  if (!parsed.success) return { error: "invalid" };
  const { email, password } = parsed.data;
  const ip = await clientIp();
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000);

  const recentFails = await db.loginAttempt.count({
    where: { OR: [{ ip }, { email }], success: false, createdAt: { gte: since } },
  });
  if (recentFails >= MAX_FAILS) {
    return { error: "locked" };
  }

  const user = await db.adminUser.findUnique({ where: { email } });
  const ok =
    user && !user.disabled && (await verifyPassword(user.passwordHash, password));

  await db.loginAttempt.create({ data: { email, ip, success: Boolean(ok) } });

  if (!ok || !user) {
    const fails = user ? user.failedLogins + 1 : 0;
    if (user) {
      await db.adminUser.update({
        where: { id: user.id },
        data: {
          failedLogins: fails,
          lockedUntil:
            fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
        },
      });
    }
    return { error: "invalid" };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "locked" };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await db.auditLog.create({
    data: { adminUserId: user.id, action: "login", entity: "AdminUser", entityId: user.id, ip },
  });

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const dest = parsed.data.next && parsed.data.next.startsWith("/admin") ? parsed.data.next : "/admin";
  redirect(dest);
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
