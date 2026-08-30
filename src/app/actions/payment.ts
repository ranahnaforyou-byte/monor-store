"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import type { Result } from "@/lib/utils";

const schema = z.object({
  reference: z.string().trim().min(3).max(40),
  providerRef: z.string().trim().min(3).max(80),
});

/** Customer submits their BaridiMob transaction reference for manual review. */
export async function submitBaridimobReference(input: unknown): Promise<Result<null>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };

  const order = await db.order.findUnique({
    where: { reference: parsed.data.reference },
    select: { id: true, total: true, paymentMethod: true, paymentStatus: true },
  });
  if (!order || order.paymentMethod !== "BARIDIMOB") {
    return { ok: false, error: "notFound" };
  }
  if (order.paymentStatus === "PAID") {
    return { ok: false, error: "alreadyPaid" };
  }

  await db.$transaction([
    db.paymentAttempt.create({
      data: {
        orderId: order.id,
        provider: "BARIDIMOB",
        amount: order.total,
        providerRef: parsed.data.providerRef,
        status: "PENDING",
      },
    }),
    db.order.update({
      where: { id: order.id },
      data: {
        baridimobRef: parsed.data.providerRef,
        paymentStatus: "PENDING",
        events: {
          create: {
            type: "PAYMENT",
            message: `Customer submitted BaridiMob ref ${parsed.data.providerRef}`,
            createdBy: "customer",
          },
        },
      },
    }),
  ]);

  revalidatePath(`/order/${parsed.data.reference}`);
  return { ok: true, data: null };
}
