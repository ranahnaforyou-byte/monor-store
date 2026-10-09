import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getOrderTimeline, shortRef, ONE_SIZE } from "@/server/services/hanout";
import { getStoreSettings } from "@/server/services/settings";
import { formatDZD } from "@/lib/money";
import { clock } from "@/lib/hanout/format";
import { HANOUT_CONTACT } from "@/config/hanout";
import { LiveRefresh } from "@/components/hanout/live-refresh";
import { OrderConfirmView, type TimelineStep } from "@/components/hanout/order-confirm-view";
import { BaridimobForm } from "@/components/store/baridimob-form";

export const metadata: Metadata = { title: "أكّد طلبك", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await getOrderTimeline(reference);
  if (!order) notFound();
  const settings = await getStoreSettings();

  const evAt = (msg: string) => order.events.find((e) => e.message === msg)?.createdAt ?? null;
  const confirmEvent = order.events.find((e) => e.message === "PENDING → CONFIRMED");
  let confirmedBy: string | null = null;
  if (order.customerConfirmedAt) confirmedBy = "__you__";
  else if (confirmEvent?.createdBy && !["system", "customer"].includes(confirmEvent.createdBy)) {
    const u = await db.adminUser.findUnique({ where: { id: confirmEvent.createdBy }, select: { name: true } });
    confirmedBy = u?.name.split(" ")[0] ?? null;
  }

  const fmt = (d: Date | null) => (d ? clock(d) : null);
  const steps: TimelineStep[] = [
    { key: "placed", at: fmt(order.createdAt) },
    { key: "confirmed", at: fmt(order.confirmedAt), who: confirmedBy },
    { key: "prepared", at: fmt(evAt("CONFIRMED → PREPARING")) },
    { key: "shipped", at: fmt(order.shippedAt) },
    { key: "delivered", at: fmt(order.deliveredAt) },
  ];

  return (
    <>
      <LiveRefresh />
      <OrderConfirmView
        reference={order.reference}
        shortRef={shortRef(order.reference)}
        status={order.status}
        store={settings.storeName}
        items={order.items.map((i) => ({
          name: i.nameSnapshot,
          qty: i.quantity,
          image: i.imageSnapshot,
          size: i.size === ONE_SIZE ? null : i.size,
        }))}
        address={order.addressLine}
        place={`${order.wilayaName} · ${order.communeName}`}
        total={formatDZD(order.total)}
        totalFr={formatDZD(order.total, { locale: "fr" })}
        courier={order.courier}
        steps={steps}
        selfConfirmed={Boolean(order.customerConfirmedAt)}
        contact={{ whatsapp: HANOUT_CONTACT.whatsapp, telegram: HANOUT_CONTACT.telegram }}
      />
      {order.paymentMethod === "BARIDIMOB" && order.paymentStatus !== "PAID" && (
        <div className="mx-auto mb-10 max-w-[520px] px-4">
          <div className="hn-card p-5">
            <p className="whitespace-pre-line text-sm text-ink-soft">{settings.baridimobInfo || "—"}</p>
            <BaridimobForm
              reference={order.reference}
              labels={{ refLabel: "رقم عملية بريدي موب", submit: "إرسال", done: "تم الإرسال", error: "حدث خطأ، أعد المحاولة" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
