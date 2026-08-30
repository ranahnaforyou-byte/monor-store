import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { CENTIMES_PER_DZD, formatDZD } from "@/lib/money";
import { yalidine } from "@/lib/yalidine/client";
import { saveShippingRateAction } from "@/app/actions/admin";
import { PageHeader, Panel, TableWrap, Th, Td } from "@/components/admin/ui";
import { Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requireRole("MANAGER");
  const [wilayas, rates, parcels, settings] = await Promise.all([
    db.wilaya.findMany({ orderBy: { code: "asc" } }),
    db.shippingRate.findMany(),
    db.order.findMany({
      where: { yalidineTracking: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, reference: true, yalidineTracking: true, yalidineStatus: true, status: true },
    }),
    db.storeSetting.findUnique({ where: { id: "singleton" } }),
  ]);
  const rateByCode = new Map(rates.map((r) => [r.wilayaCode, r]));

  return (
    <>
      <PageHeader
        title="الشحن"
        description={yalidine.isConfigured() ? "Yalidine متصل" : "Yalidine غير مُهيّأ — أضف المفاتيح في متغيرات البيئة"}
      />

      <Panel title="الطرود الأخيرة" className="mb-4">
        {parcels.length === 0 ? (
          <p className="text-sm text-muted">لا توجد طرود بعد.</p>
        ) : (
          <TableWrap>
            <thead><tr><Th>الطلب</Th><Th>رقم التتبع</Th><Th>حالة Yalidine</Th><Th>حالة الطلب</Th></tr></thead>
            <tbody>
              {parcels.map((p) => (
                <tr key={p.id}>
                  <Td><Link href={`/admin/orders/${p.id}`} className="num text-brand hover:underline">{p.reference}</Link></Td>
                  <Td className="num">{p.yalidineTracking}</Td>
                  <Td>{p.yalidineStatus ?? "—"}</Td>
                  <Td>{p.status}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>

      <Panel title="أسعار الشحن حسب الولاية">
        <p className="mb-3 text-xs text-muted">
          الافتراضي: للمنزل {formatDZD(settings?.defaultHomeFee ?? 40000)} · للمكتب {formatDZD(settings?.defaultStopDeskFee ?? 25000)}
        </p>
        <div className="max-h-[540px] overflow-y-auto">
          <TableWrap>
            <thead>
              <tr><Th>الولاية</Th><Th>للمنزل (دج)</Th><Th>للمكتب (دج)</Th><Th>مفعّل</Th><Th></Th></tr>
            </thead>
            <tbody>
              {wilayas.map((w) => {
                const r = rateByCode.get(w.code);
                return (
                  <tr key={w.code}>
                    <Td>{w.code} — {w.nameAr}</Td>
                    <Td colSpan={4}>
                      <form action={saveShippingRateAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="wilayaCode" value={w.code} />
                        <Input
                          name="toHome"
                          defaultValue={r ? String(r.toHome / CENTIMES_PER_DZD) : ""}
                          placeholder="افتراضي"
                          className="h-9 w-24"
                          dir="ltr"
                        />
                        <Input
                          name="toStopDesk"
                          defaultValue={r ? String(r.toStopDesk / CENTIMES_PER_DZD) : ""}
                          placeholder="افتراضي"
                          className="h-9 w-24"
                          dir="ltr"
                        />
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" name="active" defaultChecked={r?.active ?? true} className="size-4 accent-[var(--brand)]" />
                          مفعّل
                        </label>
                        <Button type="submit" size="sm" variant="outline">حفظ</Button>
                      </form>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </div>
      </Panel>
    </>
  );
}
