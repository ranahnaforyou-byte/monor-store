import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDZD } from "@/lib/money";
import { reviewPaymentAction } from "@/app/actions/admin";
import { PageHeader, Panel, TableWrap, Th, Td, StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireRole("MANAGER");

  const [pending, codOutstanding] = await Promise.all([
    db.paymentAttempt.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { order: { select: { id: true, reference: true, customerName: true, customerPhone: true } } },
    }),
    db.order.findMany({
      where: { paymentMethod: "COD", paymentStatus: { in: ["UNPAID", "PENDING"] }, status: { in: ["SHIPPED", "DELIVERED"] } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, reference: true, total: true, status: true, paymentStatus: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="المدفوعات" description="مراجعة تحويلات BaridiMob وتسوية الدفع عند الاستلام" />

      <Panel title={`طلبات BaridiMob بانتظار المراجعة (${pending.length})`} className="mb-4">
        {pending.length === 0 ? (
          <p className="text-sm text-muted">لا توجد مدفوعات بانتظار المراجعة.</p>
        ) : (
          <TableWrap>
            <thead>
              <tr><Th>الطلب</Th><Th>العميل</Th><Th>المبلغ</Th><Th>رقم العملية</Th><Th>إجراء</Th></tr>
            </thead>
            <tbody>
              {pending.map((a) => (
                <tr key={a.id}>
                  <Td><Link href={`/admin/orders/${a.order.id}`} className="num text-brand hover:underline">{a.order.reference}</Link></Td>
                  <Td>{a.order.customerName}<p className="num text-xs text-muted">{a.order.customerPhone}</p></Td>
                  <Td className="num">{formatDZD(a.amount)}</Td>
                  <Td className="num">{a.providerRef}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <form action={reviewPaymentAction}>
                        <input type="hidden" name="attemptId" value={a.id} />
                        <input type="hidden" name="decision" value="approve" />
                        <Button type="submit" size="sm">تأكيد الدفع</Button>
                      </form>
                      <form action={reviewPaymentAction}>
                        <input type="hidden" name="attemptId" value={a.id} />
                        <input type="hidden" name="decision" value="reject" />
                        <Button type="submit" size="sm" variant="danger">رفض</Button>
                      </form>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>

      <Panel title="تسوية الدفع عند الاستلام">
        {codOutstanding.length === 0 ? (
          <p className="text-sm text-muted">لا توجد طلبات دفع عند الاستلام قيد التحصيل.</p>
        ) : (
          <TableWrap>
            <thead><tr><Th>الطلب</Th><Th>المبلغ</Th><Th>حالة الطلب</Th><Th>حالة الدفع</Th></tr></thead>
            <tbody>
              {codOutstanding.map((o) => (
                <tr key={o.id}>
                  <Td><Link href={`/admin/orders/${o.id}`} className="num text-brand hover:underline">{o.reference}</Link></Td>
                  <Td className="num">{formatDZD(o.total)}</Td>
                  <Td><StatusPill value={o.status} /></Td>
                  <Td><StatusPill value={o.paymentStatus} /></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </>
  );
}
