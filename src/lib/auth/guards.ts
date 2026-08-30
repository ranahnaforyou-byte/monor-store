import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { readSession, type SessionPayload } from "./session";
import type { AdminRole } from "@/generated/prisma";

const ROLE_RANK: Record<AdminRole, number> = {
  STAFF: 1,
  MANAGER: 2,
  OWNER: 3,
};

/** Current admin session + fresh DB check that the account still exists and is
 *  enabled. Cached per request. Returns null when not authenticated. */
export const getAdmin = cache(async (): Promise<SessionPayload | null> => {
  const session = await readSession();
  if (!session) return null;
  const user = await db.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, disabled: true, role: true, email: true, name: true },
  });
  if (!user || user.disabled) return null;
  // Trust the DB role over the token in case it changed.
  return { sub: user.id, email: user.email, name: user.name, role: user.role };
});

/** Use at the top of every admin page / layout / server action. */
export async function requireAdmin(): Promise<SessionPayload> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireRole(min: AdminRole): Promise<SessionPayload> {
  const admin = await requireAdmin();
  if (ROLE_RANK[admin.role] < ROLE_RANK[min]) {
    redirect("/admin?denied=1");
  }
  return admin;
}

export function hasRole(role: AdminRole, min: AdminRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
