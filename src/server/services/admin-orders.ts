import "server-only";
import { db } from "@/lib/db";
import { revalidateMany, tags } from "@/lib/cache";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

export function allowedTransitions(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status];
}

export async function changeOrderStatus(
  orderId: string,
  next: OrderStatus,
  adminId: string,
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("not found");
  if (!TRANSITIONS[order.status].includes(next)) {
    throw new Error(`illegal transition ${order.status} -> ${next}`);
  }

  const now = new Date();
  const data: Record<string, unknown> = { status: next };
  if (next === "CONFIRMED") data.confirmedAt = now;
  if (next === "SHIPPED") data.shippedAt = now;
  if (next === "DELIVERED") {
    data.deliveredAt = now;
    if (order.paymentMethod === "COD" && order.paymentStatus !== "PAID") {
      data.paymentStatus = "PAID";
    }
  }
  if (next === "CANCELLED" || next === "RETURNED") {
    data.cancelledAt = now;
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data });

    // Return stock to inventory when an order is cancelled or returned.
    if (next === "CANCELLED" || next === "RETURNED") {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.sizeStock.updateMany({
          where: { productId: item.productId, size: item.size },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            size: item.size,
            delta: item.quantity,
            reason: "RETURN",
            orderId,
            createdBy: adminId,
          },
        });
      }
      const pids = [...new Set(order.items.map((i) => i.productId).filter(Boolean))] as string[];
      for (const pid of pids) {
        const agg = await tx.sizeStock.aggregate({ where: { productId: pid }, _sum: { quantity: true } });
        await tx.product.update({ where: { id: pid }, data: { stock: agg._sum.quantity ?? 0 } });
      }
    }

    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        message: `${order.status} → ${next}`,
        createdBy: adminId,
      },
    });
    await tx.auditLog.create({
      data: { adminUserId: adminId, action: "order.status", entity: "Order", entityId: orderId, diff: { from: order.status, to: next } },
    });
  });

  if (next === "CANCELLED" || next === "RETURNED") revalidateMany(tags.products);
}

export async function setPaymentStatus(
  orderId: string,
  status: PaymentStatus,
  adminId: string,
) {
  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { paymentStatus: status } }),
    db.orderEvent.create({
      data: { orderId, type: "PAYMENT", message: `payment → ${status}`, createdBy: adminId },
    }),
    db.auditLog.create({
      data: { adminUserId: adminId, action: "order.payment", entity: "Order", entityId: orderId, diff: { to: status } },
    }),
  ]);
}

export async function addOrderNote(orderId: string, message: string, adminId: string) {
  await db.orderEvent.create({
    data: { orderId, type: "NOTE", message, createdBy: adminId },
  });
}
