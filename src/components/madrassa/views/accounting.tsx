"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SCHOOL, act, fmt, useWorld, type Fee } from "../store";
import { Avatar, Btn, Panel, Pill, RoleHead, Stat, Tabs, card, useDemo } from "../ui";

const LABEL: Record<Fee["status"], [string, "green" | "amber" | "red" | "gray"]> = {
  confirmed: ["مؤكدة", "green"],
  receipt: ["وصل للتأكيد", "amber"],
  due: ["مستحقة", "gray"],
  late: ["متأخرة", "red"],
};

export function AccountingView() {
  const w = useWorld();
  const { flash } = useDemo();
  const [tab, setTab] = useState<"receipts" | "late" | "all">("receipts");
  const receipts = w.fees.filter((f) => f.status === "receipt");
  const late = w.fees.filter((f) => f.status === "late" || (f.status === "due" && f.month !== "أكتوبر"));
  const dueNow = w.fees.filter((f) => f.status === "due");
  const sum = (xs: Fee[]) => xs.reduce((a, b) => a + b.amount, 0);

  const row = (f: Fee, actions: ReactNode) => (
    <li key={f.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#F5F8FF] p-3">
      <Avatar name={f.pupil} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{f.pupil}</p>
        <p className="num text-[12px] text-[#13294B]/70">{f.month} — {fmt(f.amount)}{f.method ? ` — ${f.method}` : ""}</p>
      </div>
      {actions}
    </li>
  );

  return (
    <div className="space-y-4">
      <div className={cn(card, "p-4 sm:p-5")}>
        <RoleHead name="نسيم بوزيد" line={`المحاسبة — ${SCHOOL.name}`} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="money" label="محصّل (القائمة)" value={fmt(sum(w.fees.filter((f) => f.status === "confirmed")))} tone="green" />
        <Stat icon="doc" label="وصولات للتأكيد" value={receipts.length} tone="amber" />
        <Stat icon="clock" label="مستحقة هذا الشهر" value={dueNow.length} />
        <Stat icon="alert" label="متأخرون" value={late.length} sub={fmt(sum(late))} tone="red" />
      </div>
      <Tabs value={tab} onChange={setTab} items={[["receipts", "الوصولات", receipts.length], ["late", "المتأخرون", late.length], ["all", "كل المستحقات"]]} />

      {tab === "receipts" && (
        <Panel title="وصولات بريدي موب / CCP بانتظار التأكيد">
          {receipts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#1F3C88]/15 p-4 text-center text-sm text-[#13294B]/70">لا وصولات. عندما يرفع وليّ وصله يظهر هنا فورًا.</p>
          ) : (
            <ul className="space-y-2">
              {receipts.map((f) =>
                row(
                  f,
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Btn size="sm" tone="red" className="flex-1" onClick={() => { act.rejectFee(f.id); flash("أُعيد الوصل للولي"); }}>غير واضح</Btn>
                    <Btn size="sm" tone="green" className="flex-1" onClick={() => { act.confirmFee(f.id); flash(`أُكّد الاستلام — ${f.pupil}`); }}>أكّد الاستلام</Btn>
                  </div>,
                ),
              )}
            </ul>
          )}
        </Panel>
      )}

      {tab === "late" && (
        <Panel title="المتأخرون" aside={<Btn size="sm" tone="amber" disabled={!late.some((f) => !f.reminded)} onClick={() => { act.remind(late.map((f) => f.id)); flash(`أُرسل تذكير لـ${late.length} أولياء`); }}>ذكّر الجميع</Btn>}>
          <ul className="space-y-2">
            {late.map((f) =>
              row(
                f,
                <div className="flex w-full gap-2 sm:w-auto">
                  <Btn size="sm" tone="ghost" className="flex-1" onClick={() => { act.askDiscount(f.pupil); flash("أُرسل طلب التخفيض للمدير"); }}>اطلب تخفيضًا</Btn>
                  {f.reminded ? <Pill tone="gray">ذُكّر</Pill> : <Btn size="sm" className="flex-1" onClick={() => { act.remind([f.id]); flash("أُرسل التذكير للولي"); }}>ذكّر</Btn>}
                </div>,
              ),
            )}
          </ul>
          <p className="mt-3 text-[12px] text-[#13294B]/70">لتجربة الرابط مع الولي: في «كل المستحقات» ذكّر وليّ آدم.</p>
        </Panel>
      )}

      {tab === "all" && (
        <Panel title="مستحقات القسم">
          <ul className="space-y-2">
            {w.fees.map((f) =>
              row(
                f,
                <span className="flex items-center gap-2">
                  <Pill tone={LABEL[f.status][1]}>{LABEL[f.status][0]}</Pill>
                  {f.status === "due" && (f.reminded ? <Pill tone="gray">ذُكّر</Pill> : <Btn size="sm" tone="ghost" onClick={() => { act.remind([f.id]); flash("أُرسل التذكير"); }}>ذكّر</Btn>)}
                </span>,
              ),
            )}
          </ul>
        </Panel>
      )}
    </div>
  );
}
