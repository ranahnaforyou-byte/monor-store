"use client";

import { useState, useTransition } from "react";
import { resetDemo } from "@/app/actions/team";

export function ResetDemoButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("إعادة ضبط العرض؟ تُحذف طلبات العرض والمحادثات وتعود البيانات التجريبية. أرقام المهتمين تبقى محفوظة.")) return;
          start(async () => {
            const res = await resetDemo();
            setMsg(res.ok ? "تمت إعادة الضبط. جاهز للزائر التالي." : res.error);
            try {
              Object.keys(sessionStorage).filter((k) => k.startsWith("hn-seen")).forEach((k) => sessionStorage.removeItem(k));
            } catch {
              /* ignore */
            }
          });
        }}
        className="h-11 w-full rounded-[var(--radius)] border border-line-strong bg-paper text-sm font-bold text-ink-soft disabled:opacity-50"
      >
        {pending ? "جارٍ إعادة الضبط…" : "إعادة ضبط العرض للزائر التالي"}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-brand">{msg}</p>}
    </div>
  );
}
