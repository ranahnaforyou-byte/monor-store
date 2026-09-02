import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { getShippingFee, applyFreeShipping } from "./shipping";
import { getStoreSettings } from "./settings";
import { resolveLines } from "@/lib/cart/service";
import { readCartCookie } from "@/lib/cart/store";
import { randomDigits } from "@/lib/utils";
import type { CartLine } from "@/lib/cart/types";
import type { Prisma } from "@/generated/prisma";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z
    .string()
    .trim()
    .regex(/^0[5-7]\d{8}$/, "phone"),
  customerEmail: z.string().trim().email().optional().or(z.literal("")).transform((v) => v || undefined),
  wilayaCode: z.coerce.number().int().min(1).max(58),
  communeName: z.string().trim().min(1).max(120),
  addressLine: z.string().trim().min(5).max(240),
  deliveryMode: z.enum(["HOME", "STOP_DESK"]),
  paymentMethod: z.enum(["COD", "BARIDIMOB"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CreateOrderResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; field?: string };

function makeReference(): string {
  const yy = new Date().getFullYear().toString().slice(-2);
  return `MNR-${yy}-${randomDigits(6)}`;
}

/**
 * @param rawInput   checkout form fields (validated with `checkoutSchema`)
 * @param cartLines  optional pre-resolved cart lines. When omitted the lines are
 *                   read from the `monor_cart` cookie (the storefront path).
 *                   Passing them explicitly is the seam for a future API / mobile
 *                   client and for integration tests.
 */
export async function createOrder(
  rawInput: unknown,
  cartLines?: CartLine[],
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: "invalidInput", field: first?.path.join(".") };
  }
  const input = parsed.data;

  const settings = await getStoreSettings();
  if (input.paymentMethod === "COD" && !settings.codEnabled) {
    return { ok: false, error: "paymentUnavailable", field: "paymentMethod" };
  }
  if (input.paymentMethod === "BARIDIMOB" && !settings.baridimobEnabled) {
    return { ok: false, error: "paymentUnavailable", field: "paymentMethod" };
  }

  // Re-resolve the cart from scratch: live prices, live stock. Never trust client.
  const lines = cartLines ?? (await readCartCookie());
  const cart = await resolveLines(lines);
  const purchasable = cart.items.filter((i) => !i.unavailable && i.quantity > 0);
  if (purchasable.length === 0) {
    return { ok: false, error: "emptyCart" };
  }
  if (cart.items.some((i) => i.unavailable || i.adjusted)) {
    return { ok: false, error: "cartChanged" };
  }

  const wilaya = await db.wilaya.findUnique({ where: { code: input.wilayaCode } });
  if (!wilaya) return { ok: false, error: "invalidInput", field: "wilayaCode" };

  const subtotal = purchasable.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const baseShipping = await getShippingFee(input.wilayaCode, input.deliveryMode);
  const shippingFee = await applyFreeShipping(subtotal, baseShipping);
  const discountTotal = 0;
  const total = subtotal + shippingFee - discountTotal;

  try {
    const reference = await db.$transaction(async (tx) => {
      // Guarded per-size decrement: updateMany with a quantity predicate so two
      // concurrent checkouts cannot oversell. If the row count is 0, stock moved.
      for (const item of purchasable) {
        const res = await tx.sizeStock.updateMany({
          where: {
            productId: item.productId,
            size: item.size,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
        if (res.count === 0) {
          throw new OrderConflict(`stock:${item.productId}:${item.size}`);
        }
      }

      // Refresh cached product.stock totals.
      const productIds = [...new Set(purchasable.map((i) => i.productId))];
      for (const pid of productIds) {
        const agg = await tx.sizeStock.aggregate({
          where: { productId: pid },
          _sum: { quantity: true },
        });
        await tx.product.update({
          where: { id: pid },
          data: { stock: agg._sum.quantity ?? 0 },
        });
      }

      let ref = makeReference();
      // Extremely unlikely collision guard.
      for (let i = 0; i < 5; i++) {
        const exists = await tx.order.findUnique({ where: { reference: ref }, select: { id: true } });
        if (!exists) break;
        ref = makeReference();
      }

      const customer = await tx.customer.upsert({
        where: { phone: input.customerPhone },
        create: {
          phone: input.customerPhone,
          name: input.customerName,
          email: input.customerEmail,
          wilayaCode: input.wilayaCode,
          wilayaName: wilaya.name,
          communeName: input.communeName,
          addressLine: input.addressLine,
          ordersCount: 1,
          totalSpent: total,
        },
        update: {
          name: input.customerName,
          email: input.customerEmail ?? undefined,
          wilayaCode: input.wilayaCode,
          wilayaName: wilaya.name,
          communeName: input.communeName,
          addressLine: input.addressLine,
          ordersCount: { increment: 1 },
          totalSpent: { increment: total },
        },
      });

      if (customer.blocked) {
        throw new OrderConflict("customerBlocked");
      }

      const orderItems: Prisma.OrderItemCreateManyOrderInput[] = purchasable.map((i) => ({
        productId: i.productId,
        nameSnapshot: i.name,
        slugSnapshot: i.slug,
        imageSnapshot: i.image,
        unitPrice: i.unitPrice,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        lineTotal: i.unitPrice * i.quantity,
      }));

      const order = await tx.order.create({
        data: {
          reference: ref,
          status: "PENDING",
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === "BARIDIMOB" ? "PENDING" : "UNPAID",
          subtotal,
          shippingFee,
          discountTotal,
          total,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          wilayaCode: input.wilayaCode,
          wilayaName: wilaya.name,
          communeName: input.communeName,
          addressLine: input.addressLine,
          deliveryMode: input.deliveryMode,
          notes: input.notes,
          customerId: customer.id,
          items: { createMany: { data: orderItems } },
          events: {
            create: {
              type: "STATUS_CHANGE",
              message: `Order placed (${input.paymentMethod})`,
              createdBy: "system",
            },
          },
        },
      });

      await tx.inventoryMovement.createMany({
        data: purchasable.map((i) => ({
          productId: i.productId,
          size: i.size,
          delta: -i.quantity,
          reason: "SALE" as const,
          orderId: order.id,
          createdBy: "system",
        })),
      });

      return ref;
    });

    return { ok: true, reference };
  } catch (err) {
    if (err instanceof OrderConflict) {
      if (err.message === "customerBlocked") return { ok: false, error: "customerBlocked" };
      return { ok: false, error: "cartChanged" };
    }
    console.error("createOrder failed", err);
    return { ok: false, error: "generic" };
  }
}

class OrderConflict extends Error {}
