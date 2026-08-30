import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDZD } from "@/lib/money";
import { allowedTransitions } from "@/server/services/admin-orders";
import {
  orderStatusAction,
  orderPaymentAction,
  orderNoteAction,
  createYalidineParcelAction,
  refreshYalidineStatusAction,
} from "@/app/actions/admin";
import { PageHeader, Panel, StatusPill, TableWrap, Th, Td } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: "desc" } }, paymentAttempts: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const nextStatuses = allowedTransitions(order.status);

  return (
    <>
      <PageHeader
        title={`طلب ${order.reference}`}
        description={order.createdAt.toISOString().replace("T", " ").slice(0, 16)}
        action={<StatusPill value={order.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Panel title="المنتجات">
            <TableWrap>
              <thead>
                <tr><Th>المنتج</Th><Th>المقاس</Th><Th>الكمية</Th><Th>السعر</Th><Th>المجموع</Th></tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <Td>{it.nameSnapshot}{it.color ? ` · ${it.color}` : ""}</Td>
                    <Td className="num">{it.size}</Td>
                    <Td className="num">{it.quantity}</Td>
                    <Td className="num">{formatDZD(it.unitPrice)}</Td>
                    <Td className="num">{formatDZD(it.lineTotal)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <dl className="mt-3 space-y-1 text-sm">
              <Row k="المجموع الفرعي" v={formatDZD(order.subtotal)} />
              <Row k="الشحن" v={order.shippingFee === 0 ? "مجاني" : formatDZD(order.shippingFee)} />
              <Row k="الخصم" v={formatDZD(order.discountTotal)} />
              <Row k="الإجمالي" v={formatDZD(order.total)} bold />
            </dl>
          </Panel>

          <Panel title="السجل">
            <ul className="space-y-2 text-sm">
              {order.events.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <span>
                    <span className="text-xs text-muted">[{e.type}]</span> {e.message}
                  </span>
                  <span className="num shrink-0 text-xs text-muted">
                    {e.createdAt.toISOString().slice(5, 16).replace("T", " ")}
                  </span>
                </li>
              ))}
            </ul>
            <form action={orderNoteAction} className="mt-3 flex gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <Input name="message" placeholder="أضف ملاحظة داخلية…" className="h-9" />
              <Button type="submit" size="sm">إضافة</Button>
            </form>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="العميل والعنوان">
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="num text-muted">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-muted">{order.customerEmail}</p>}
              <p className="pt-2">{order.addressLine}</p>
              <p className="text-muted">{order.communeName} — {order.wilayaName} ({order.wilayaCode})</p>
              <p className="text-xs text-muted">
                {order.deliveryMode === "STOP_DESK" ? "استلام من المكتب" : "توصيل للمنزل"}
              </p>
              {order.notes && <p className="mt-2 rounded bg-surface p-2 text-xs">{order.notes}</p>}
            </div>
          </Panel>

          <Panel title="الحالة">
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-muted">لا توجد انتقالات متاحة.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((s) => (
                  <form key={s} action={orderStatusAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="status" value={s} />
                    <Button type="submit" size="sm" variant={s === "CANCELLED" ? "danger" : "primary"}>
                      {s}
                    </Button>
                  </form>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="الدفع">
            <p className="mb-2 text-sm">
              <StatusPill value={order.paymentStatus} /> <span className="text-xs text-muted">{order.paymentMethod}</span>
            </p>
            {order.paymentAttempts.length > 0 && (
              <ul className="mb-2 space-y-1 text-xs text-muted">
                {order.paymentAttempts.map((a) => (
                  <li key={a.id}>
                    {a.status} · <span className="num">{a.providerRef}</span>
                  </li>
                ))}
              </ul>
            )}
            <form action={orderPaymentAction} className="flex gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <Select name="paymentStatus" defaultValue={order.paymentStatus} className="h-9">
                {["UNPAID", "PENDING", "PAID", "REFUNDED", "FAILED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              <Button type="submit" size="sm" variant="outline">تحديث</Button>
            </form>
          </Panel>

          <Panel title="الشحن (Yalidine)">
            <div className="space-y-2 text-sm">
              {order.yalidineTracking ? (
                <>
                  <p className="num">{order.yalidineTracking}</p>
                  <p className="text-xs text-muted">الحالة: {order.yalidineStatus ?? "—"}</p>
                  {order.yalidineLabelUrl && (
                    <a href={order.yalidineLabelUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand underline">
                      فتح الملصق
                    </a>
                  )}
                  <form action={refreshYalidineStatusAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <Button type="submit" size="sm" variant="outline">تحديث الحالة</Button>
                  </form>
                </>
              ) : (
                <form action={createYalidineParcelAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <Button type="submit" size="sm">إنشاء طرد</Button>
                  <p className="mt-1 text-xs text-muted">يتطلب إعداد مفاتيح Yalidine.</p>
                </form>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-line pt-1 text-base font-bold" : ""}`}>
      <dt className="text-ink-soft">{k}</dt>
      <dd className="num">{v}</dd>
    </div>
  );
}
