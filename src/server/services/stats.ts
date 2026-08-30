import "server-only";
import { db } from "@/lib/db";
import type { OrderStatus } from "@/generated/prisma";

const REVENUE_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

function since(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

export async function getDashboardStats() {
  const [
    revToday,
    rev7,
    rev30,
    ordersByStatus,
    codOutstanding,
    lowStock,
    latestOrders,
    topProducts,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: since(1) } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: since(7) } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: since(30) } },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { paymentMethod: "COD", paymentStatus: { in: ["UNPAID", "PENDING"] }, status: { notIn: ["CANCELLED", "RETURNED"] } },
    }),
    db.product.count({ where: { status: "ACTIVE", stock: { lte: 3 } } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, reference: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    db.orderItem.groupBy({
      by: ["nameSnapshot"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of ordersByStatus) statusMap[row.status] = row._count._all;

  return {
    revenueToday: revToday._sum.total ?? 0,
    revenue7: rev7._sum.total ?? 0,
    revenue30: rev30._sum.total ?? 0,
    ordersTotal: Object.values(statusMap).reduce((a, b) => a + b, 0),
    pending: statusMap.PENDING ?? 0,
    confirmed: statusMap.CONFIRMED ?? 0,
    cancelled: statusMap.CANCELLED ?? 0,
    codOutstanding: codOutstanding._sum.total ?? 0,
    lowStock,
    latestOrders,
    topProducts: topProducts.map((p) => ({ name: p.nameSnapshot, qty: p._sum.quantity ?? 0 })),
  };
}

export async function getSalesSeries(days: number) {
  const from = since(days);
  const orders = await db.order.findMany({
    where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: from } },
    select: { total: true, createdAt: true, wilayaName: true, paymentMethod: true },
  });

  const byDay = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    byDay.set(d, 0);
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + o.total);
  }

  const byWilaya = new Map<string, number>();
  const byPayment = new Map<string, number>();
  for (const o of orders) {
    byWilaya.set(o.wilayaName, (byWilaya.get(o.wilayaName) ?? 0) + o.total);
    byPayment.set(o.paymentMethod, (byPayment.get(o.paymentMethod) ?? 0) + o.total);
  }

  const total = orders.reduce((s, o) => s + o.total, 0);
  return {
    series: [...byDay.entries()].map(([date, value]) => ({ date, value })),
    orderCount: orders.length,
    revenue: total,
    aov: orders.length ? Math.round(total / orders.length) : 0,
    byWilaya: [...byWilaya.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
    byPayment: [...byPayment.entries()].map(([name, value]) => ({ name, value })),
  };
}
