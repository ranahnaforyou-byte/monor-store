"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ROLES, createRoom, joinRoom, leaveRoom, useSync, type Role } from "./store";
import { Btn, focus, input, useDemo } from "./ui";

/** «عرض على جهازين»: start or join a shared session, and hand a role to another phone by QR. */
export function SessionBar({ view }: { view: Role }) {
  const sync = useSync();
  const { flash } = useDemo();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [other, setOther] = useState<Role>(view === "parent" ? "teacher" : "parent");
  const [qr, setQr] = useState<string | null>(null);

  const link = sync.room && typeof window !== "undefined" ? `${window.location.origin}/madrassa/demo?room=${sync.room}&view=${other}` : null;

  useEffect(() => {
    if (!link || !open) return;
    let alive = true;
    QRCode.toDataURL(link, { margin: 1, width: 360, color: { dark: "#13294B", light: "#FFFFFF" } }).then((d) => alive && setQr(d));
    return () => {
      alive = false;
    };
  }, [link, open]);

  if (!sync.room) {
    return (
      <div className="mb-4 rounded-2xl border border-dashed border-[#1F3C88]/25 bg-white p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 text-sm">
            <b>عرض على جهازين:</b> اربط هاتفًا آخر، وما يفعله أحد الطرفين يظهر عند الآخر.
          </p>
          {!open ? (
            <Btn size="sm" tone="ghost" onClick={() => setOpen(true)}>ابدأ أو انضم</Btn>
          ) : (
            <button type="button" onClick={() => setOpen(false)} className={cn("text-[13px] font-bold text-[#1F3C88]", focus)}>إغلاق</button>
          )}
        </div>
        {open && (
          <div className="anim-pop mt-3 grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <Btn
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const c = await createRoom();
                setBusy(false);
                if (c) flash(`بدأت الجلسة ${c} — امسح الرمز بالهاتف الآخر`);
                else flash("تعذّر بدء الجلسة — تحقّق من الاتصال بالإنترنت");
              }}
            >
              {busy ? "جارٍ البدء…" : "ابدأ جلسة جديدة"}
            </Btn>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (/^\d{4}$/.test(code)) void joinRoom(code);
              }}
            >
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="رمز من 4 أرقام" aria-label="رمز الجلسة" className={cn(input, "num min-w-0 flex-1 text-center tracking-[0.3em]")} />
              <Btn type="submit" tone="ghost" disabled={code.length !== 4}>انضم</Btn>
            </form>
          </div>
        )}
      </div>
    );
  }

  const tone = sync.status === "live" ? "bg-[#0A7554]" : sync.status === "connecting" ? "bg-[#F5A524]" : "bg-[#D63C37]";
  const label = sync.status === "live" ? "متصلة" : sync.status === "connecting" ? "جارٍ الاتصال" : sync.status === "missing" ? "الجلسة غير موجودة" : "انقطع الاتصال، نعيد المحاولة";

  return (
    <div className="mb-4 rounded-2xl bg-white p-3 ring-1 ring-[#1F3C88]/15 sm:p-3.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className={cn("h-2.5 w-2.5 rounded-full", tone, sync.status === "live" && "animate-pulse")} aria-hidden />
          جلسة <span className="num rounded-lg bg-[#E9EEFB] px-2 py-0.5 tracking-[0.2em] text-[#1F3C88]">{sync.room}</span>
          <span className="font-semibold text-[#13294B]/70">{label}</span>
        </span>
        <span className="ms-auto flex gap-2">
          <Btn size="sm" tone={open ? "blue" : "ghost"} onClick={() => setOpen((o) => !o)}>{open ? "إخفاء الرمز" : "هاتف آخر"}</Btn>
          <Btn size="sm" tone="ghost" onClick={() => { leaveRoom(); setOpen(false); }}>خروج</Btn>
        </span>
      </div>
      {open && link && (
        <div className="anim-pop mt-3 grid items-center gap-4 sm:grid-cols-[180px_1fr]">
          <div className="mx-auto w-[180px] rounded-2xl bg-white p-2 ring-1 ring-[#1F3C88]/15">
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
            {qr ? <img src={qr} alt={`رمز QR لفتح دور ${ROLES.find((r) => r.key === other)!.label} في الجلسة ${sync.room}`} className="h-auto w-full" /> : <div className="aspect-square w-full animate-pulse rounded-xl bg-[#EEF2FC]" />}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">الهاتف الآخر يفتح دور:</p>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.filter((r) => r.key !== "directory").map((r) => (
                <button key={r.key} type="button" onClick={() => setOther(r.key)} className={cn("h-9 rounded-full px-3 text-[13px] font-bold", focus, other === r.key ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-[13px] text-[#13294B]/70">امسح الرمز بكاميرا الهاتف، أو افتح الرابط واكتب الرمز <b className="num">{sync.room}</b>.</p>
            <Btn
              size="sm"
              tone="ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  flash("نُسخ الرابط");
                } catch {
                  flash(link);
                }
              }}
            >
              انسخ الرابط
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
