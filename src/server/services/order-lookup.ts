import "server-only";
import { db } from "@/lib/db";

export async function getOrderByReference(reference: string) {
  return db.order.findUnique({
    where: { reference },
    include: {
      items: true,
      paymentAttempts: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type PublicOrder = NonNullable<Awaited<ReturnType<typeof getOrderByReference>>>;
