"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export type LeadState = { ok?: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .refine((v) => /^(0[5-7]\d{8}|\+?213[5-7]\d{8})$/.test(v), "phone"),
  activity: z.string().trim().min(2).max(40),
  monthlyOrders: z.string().trim().max(40).optional(),
  note: z.string().trim().max(300).optional(),
});

export async function createLead(_prev: LeadState, fd: FormData): Promise<LeadState> {
  const parsed = schema.safeParse({
    name: fd.get("name"),
    phone: fd.get("phone"),
    activity: fd.get("activity"),
    monthlyOrders: fd.get("monthlyOrders") || undefined,
    note: fd.get("note") || undefined,
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { error: field === "phone" ? "رقم الهاتف غير صحيح (مثال: 0661234567)" : "أكمل الاسم ونوع النشاط" };
  }
  await db.lead.create({ data: { ...parsed.data, source: "expo" } });
  return { ok: true };
}
