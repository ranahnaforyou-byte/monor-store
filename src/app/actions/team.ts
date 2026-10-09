"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { publicEnv } from "@/lib/public-env";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { getTeamUser, isLead } from "@/lib/hanout/team-session";
import {
  STAFF,
  COURIERS,
  CHANNELS,
  advanceOrder,
  recordOutcome,
  resetHanoutDemo,
  type DemoRoleKey,
} from "@/server/services/hanout";
import type { ConfirmOutcome, OrderStatus } from "@/generated/prisma";

export type TeamResult = { ok: true } | { ok: false; error: string };

const STALE = "تم تحديث هذا الطلب من زميل قبل قليل";

/** One-tap demo login — only while NEXT_PUBLIC_DEMO_MODE=1. */
export async function demoLogin(role: DemoRoleKey) {
  if (!publicEnv.demoMode) redirect("/team?off=1");
  const seed = STAFF.find((s) => s.demoRole === role);
  if (!seed) redirect("/team");
  const user = await db.adminUser.findUnique({ where: { email: seed.email } });
  if (!user) redirect("/team?missing=1");
  await setSessionCookie({ sub: user.id, email: user.email, name: user.name, role: user.role });
  redirect(role === "owner" || role === "manager" ? "/team/dashboard" : "/team/orders");
}

export async function teamLogout() {
  await clearSessionCookie();
  redirect("/team");
}

async function actor() {
  const u = await getTeamUser();
  if (!u) throw new Error("auth");
  return u;
}

async function move(orderId: string, from: OrderStatus[], next: OrderStatus, courier?: string): Promise<TeamResult> {
  try {
    const u = await actor();
    const o = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!o || !from.includes(o.status)) return { ok: false, error: STALE };
    await advanceOrder(orderId, next, { id: u.id, name: u.name }, courier);
    refresh();
    return { ok: true };
  } catch (e) {
    if ((e as Error).message === "auth") return { ok: false, error: "انتهت الجلسة، ادخل من جديد" };
    console.error("team move failed", e);
    return { ok: false, error: STALE };
  }
}

export async function teamConfirm(orderId: string) {
  return move(orderId, ["PENDING"], "CONFIRMED");
}
export async function teamCancel(orderId: string) {
  return move(orderId, ["PENDING", "CONFIRMED"], "CANCELLED");
}
export async function teamPrepared(orderId: string) {
  return move(orderId, ["CONFIRMED"], "PREPARING");
}
export async function teamShip(orderId: string, courier: string) {
  const c = (COURIERS as readonly string[]).includes(courier) ? courier : COURIERS[0];
  return move(orderId, ["PREPARING"], "SHIPPED", c);
}
export async function teamDelivered(orderId: string) {
  return move(orderId, ["SHIPPED"], "DELIVERED");
}

export async function teamOutcome(orderId: string, outcome: ConfirmOutcome): Promise<TeamResult> {
  try {
    const u = await actor();
    const o = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!o || o.status !== "PENDING") return { ok: false, error: STALE };
    await recordOutcome(orderId, outcome, { id: u.id, name: u.name });
    refresh();
    return { ok: true };
  } catch (e) {
    console.error("team outcome failed", e);
    return { ok: false, error: STALE };
  }
}

export async function sendMessage(channel: string, body: string): Promise<TeamResult> {
  const text = body.trim().slice(0, 500);
  if (!text) return { ok: false, error: "اكتب رسالة أولًا" };
  if (!CHANNELS.some((c) => c.slug === channel)) return { ok: false, error: "قسم غير معروف" };
  const u = await getTeamUser();
  if (!u) return { ok: false, error: "انتهت الجلسة، ادخل من جديد" };
  const ch = await db.channel.findUnique({ where: { slug: channel }, select: { id: true } });
  if (!ch) return { ok: false, error: "قسم غير معروف" };
  await db.message.create({ data: { channelId: ch.id, authorId: u.id, kind: "TEXT", body: text } });
  refresh();
  return { ok: true };
}

export async function resetDemo(): Promise<TeamResult> {
  const u = await getTeamUser();
  if (!u || !isLead(u)) return { ok: false, error: "إعادة الضبط للمالك أو المدير فقط" };
  await resetHanoutDemo();
  refresh();
  return { ok: true };
}
