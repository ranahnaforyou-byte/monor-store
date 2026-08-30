import { requireRole } from "@/lib/auth/guards";
import { ensureStoreSettings } from "@/server/services/settings";
import { saveSettingsAction } from "@/app/actions/admin";
import { CENTIMES_PER_DZD } from "@/lib/money";
import { features } from "@/lib/env";
import { PageHeader, Panel, Field } from "@/components/admin/ui";
import { Input, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const dzd = (c: number | null | undefined) => (c == null ? "" : String(c / CENTIMES_PER_DZD));

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("OWNER");
  const sp = await searchParams;
  const s = await ensureStoreSettings();

  return (
    <>
      <PageHeader title="إعدادات المتجر" />
      {sp.saved && (
        <p className="mb-4 rounded-[var(--radius)] bg-brand-soft px-3 py-2 text-sm text-brand">تم الحفظ.</p>
      )}

      <form action={saveSettingsAction} className="grid gap-4 lg:grid-cols-2">
        <Panel title="الهوية">
          <div className="space-y-3">
            <Field label="اسم المتجر"><Input name="storeName" defaultValue={s.storeName} /></Field>
            <Field label="هاتف التواصل"><Input name="contactPhone" defaultValue={s.contactPhone} dir="ltr" /></Field>
            <Field label="بريد التواصل"><Input name="contactEmail" defaultValue={s.contactEmail} dir="ltr" /></Field>
            <Field label="العنوان"><Input name="address" defaultValue={s.address} /></Field>
          </div>
        </Panel>

        <Panel title="الروابط الاجتماعية">
          <div className="space-y-3">
            <Field label="Instagram"><Input name="instagramUrl" defaultValue={s.instagramUrl} dir="ltr" /></Field>
            <Field label="Facebook"><Input name="facebookUrl" defaultValue={s.facebookUrl} dir="ltr" /></Field>
            <Field label="TikTok"><Input name="tiktokUrl" defaultValue={s.tiktokUrl} dir="ltr" /></Field>
          </div>
        </Panel>

        <Panel title="الشريط الإعلاني">
          <div className="space-y-3">
            <Field label="النص"><Textarea name="announcementBar" defaultValue={s.announcementBar} rows={2} /></Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="announcementActive" defaultChecked={s.announcementActive} className="size-4 accent-[var(--brand)]" />
              تفعيل الشريط
            </label>
          </div>
        </Panel>

        <Panel title="الشحن والدفع">
          <div className="space-y-3">
            <Field label="عتبة الشحن المجاني (دج)" hint="اتركه فارغاً للتعطيل">
              <Input name="freeShippingThreshold" defaultValue={dzd(s.freeShippingThreshold)} dir="ltr" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="سعر التوصيل للمنزل (دج)"><Input name="defaultHomeFee" defaultValue={dzd(s.defaultHomeFee)} dir="ltr" /></Field>
              <Field label="سعر التوصيل للمكتب (دج)"><Input name="defaultStopDeskFee" defaultValue={dzd(s.defaultStopDeskFee)} dir="ltr" /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="codEnabled" defaultChecked={s.codEnabled} className="size-4 accent-[var(--brand)]" />
              تفعيل الدفع عند الاستلام
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="baridimobEnabled" defaultChecked={s.baridimobEnabled} className="size-4 accent-[var(--brand)]" />
              تفعيل BaridiMob
            </label>
            <Field label="تعليمات الدفع عبر BaridiMob"><Textarea name="baridimobInfo" defaultValue={s.baridimobInfo} rows={3} /></Field>
          </div>
        </Panel>

        <Panel title="حالة التكاملات">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>تخزين الصور (R2)</span><span className={features.r2 ? "text-brand" : "text-muted"}>{features.r2 ? "متصل" : "قرص محلي (افتراضي)"}</span></li>
            <li className="flex justify-between"><span>Google Drive</span><span className={features.drive ? "text-brand" : "text-muted"}>{features.drive ? "متصل" : "غير مُهيّأ"}</span></li>
            <li className="flex justify-between"><span>Yalidine</span><span className={features.yalidine ? "text-brand" : "text-muted"}>{features.yalidine ? "متصل" : "غير مُهيّأ"}</span></li>
          </ul>
          <p className="mt-3 text-xs text-muted">تُضبط المفاتيح في متغيرات البيئة على الخادم.</p>
        </Panel>

        <Panel title="الصيانة">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="maintenanceMode" defaultChecked={s.maintenanceMode} className="size-4 accent-[var(--brand)]" />
            وضع الصيانة (إخفاء المتجر عن الزوار)
          </label>
        </Panel>

        <div className="lg:col-span-2">
          <Button type="submit" size="lg">حفظ الإعدادات</Button>
        </div>
      </form>
    </>
  );
}
