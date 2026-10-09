import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth/session";

/** The signed-in team member (any Hanout staff or admin), or null. */
export async function getTeamUser() {
  const session = await readSession();
  if (!session) return null;
  const user = await db.adminUser.findUnique({
    where: { id: session.sub },
    include: { department: true },
  });
  if (!user || user.disabled) return null;
  return user;
}

export async function requireTeamUser() {
  const user = await getTeamUser();
  if (!user) redirect("/team");
  return user;
}

export type TeamUser = NonNullable<Awaited<ReturnType<typeof getTeamUser>>>;

export const isLead = (u: { role: string }) => u.role === "OWNER" || u.role === "MANAGER";
