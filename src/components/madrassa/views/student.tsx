"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CLASS, ME_CHILD, SCHOOL, act, ago, useWorld } from "../store";
import { Panel, Pill, RoleHead, card, focus, useDemo } from "../ui";
import { REPORT } from "./parent";

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export function StudentView() {
  const w = useWorld();
  const { now } = useDemo();
  const [day, setDay] = useState("الأحد");
  const math = w.exam.published ? w.exam.marks[ME_CHILD] : null;
  const notes = w.notes.filter((n) => n.to === "student");

  return (
    <div className="space-y-4">
      <div className={cn(card, "p-4 sm:p-5")}>
        <RoleHead name={ME_CHILD} line={`${CLASS} — ${SCHOOL.name}`} tone="bg-[#FEF3DC] text-[#8A5A0B]" />
      </div>
      {notes.length > 0 && (
        <ul className="space-y-2">
          {notes.slice(0, 3).map((n) => (
            <li key={n.id} className={cn("flex items-center justify-between gap-3 rounded-2xl p-3 text-sm font-semibold", typeof n.at === "number" && now - n.at < 120000 ? "anim-pop bg-[#FFF8E6] ring-1 ring-[#F5A524]/50" : "bg-white ring-1 ring-[#1F3C88]/10")}>
              {n.text}
              <span className="shrink-0 text-[11px] text-[#13294B]/50">{ago(n.at, now)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="استعمال الزمن">
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {DAYS.map((d) => (
              <button key={d} type="button" onClick={() => setDay(d)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-bold", focus, day === d ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>{d}</button>
            ))}
          </div>
          <ul className="mt-3 space-y-2">
            {w.sessions.filter((s) => s.day === day).map((s) => (
              <li key={s.id} className={cn("flex items-center gap-3 rounded-xl p-3 text-sm", s.change ? "bg-[#FEF3DC]" : "bg-[#F5F8FF]")}>
                <span className="num w-12 font-bold">{s.time}</span>
                <span className="flex-1">
                  <b>{s.subject}</b>
                  {s.change && <span className="block text-[12px] font-bold text-[#8A5A0B]">{s.change}</span>}
                </span>
                <span className="text-[12px] text-[#13294B]/60">{s.room}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="واجباتي">
          <ul className="space-y-2">
            {w.homework.map((h) => (
              <li key={h.id}>
                <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl p-3 text-sm", h.done ? "bg-[#E7F6EF]" : "bg-[#F5F8FF]")}>
                  <input type="checkbox" checked={!!h.done} onChange={() => act.toggleHomework(h.id)} className="mt-1 h-4 w-4 accent-[#0C8A64]" />
                  <span className="flex-1">
                    <b>{h.subject}</b> — {h.text}
                    <span className="block text-[12px] text-[#13294B]/55">قبل {h.due}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="نقاطي" aside={<Pill tone="gray">الفصل الأول</Pill>}>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {REPORT.map(([s, g]) => {
              const v = g ?? math;
              return (
                <li key={s} className="rounded-xl bg-[#F5F8FF] p-3">
                  <p className="text-[12px] text-[#13294B]/60">{s}</p>
                  <p className={cn("num font-display text-lg font-black", !v && "text-[#13294B]/35")}>{v ?? "—"}</p>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="الإعلانات">
          <ul className="space-y-2 text-sm">
            {w.announcements.map((a) => <li key={a.id} className="rounded-xl bg-[#E9EEFB] p-3"><b>{a.from}:</b> {a.text}</li>)}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
