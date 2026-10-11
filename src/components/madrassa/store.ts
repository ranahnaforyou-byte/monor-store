"use client";

import { useSyncExternalStore } from "react";

/**
 * MA DRASSA demo world — one shared, client-only store.
 * Every role reads the same world; every action writes it and notifies the
 * role(s) concerned. Persisted to localStorage and synced across tabs, so two
 * roles can be opened side by side (two tabs / two windows) and react live.
 * Fictional people and institutions (demo data).
 */

export type Role = "director" | "supervisor" | "reception" | "accounting" | "teacher" | "parent" | "student" | "directory";

export const ROLES: { key: Role; label: string; who: string }[] = [
  { key: "director", label: "المدير", who: "نادية حمدي" },
  { key: "supervisor", label: "المستشار التربوي", who: "رشيد بلقاسم" },
  { key: "reception", label: "الاستقبال", who: "أمال سعدي" },
  { key: "accounting", label: "المحاسبة", who: "نسيم بوزيد" },
  { key: "teacher", label: "الأستاذة", who: "سميرة مداني" },
  { key: "parent", label: "الولي", who: "كريم بوعلام" },
  { key: "student", label: "التلميذ", who: "آدم بوعلام" },
  { key: "directory", label: "الدليل العام", who: "للجميع" },
];
export const ROLE_KEYS = ROLES.map((r) => r.key);
export const roleLabel = (r: Role) => ROLES.find((x) => x.key === r)!.label;

export const SCHOOL = { name: "مدرسة الأفق", area: "حيدرة، الجزائر العاصمة" };
export const CLASS = "4 متوسط — أ";
export const PUPILS = ["آدم بوعلام", "إيناس شريف", "يونس قادري", "مريم عيساوي", "رامي حداد", "لينا مزيان", "سارة بن يوسف", "أنيس طالبي"];
export const ME_CHILD = "آدم بوعلام";
export const PARENT = "كريم بوعلام";

export type Stamp = number | string; // number = epoch ms (live), string = seed label

export type Note = { id: number; to: Role; text: string; at: Stamp; read: boolean; tone: Tone };
export type Tone = "absence" | "grade" | "fee" | "announce" | "homework" | "request" | "message" | "discipline" | "approval" | "schedule";

export type Absence = { id: number; pupil: string; date: string; session: string; status: "open" | "sent" | "justified" | "rejected"; note?: string };
export type Fee = { id: number; pupil: string; month: string; amount: number; status: "due" | "receipt" | "confirmed" | "late"; method?: string; reminded?: boolean };
export type Req = { id: number; child: string; parent: string; level: string; school: string; stage: number; files: Record<string, boolean>; mine?: boolean; waiting?: boolean; slot?: string };
export type Appt = { id: number; who: string; when: string; why: string };
export type Incident = { id: number; pupil: string; text: string; at: Stamp };
export type Convocation = { id: number; pupil: string; when: string; reason: string; status: "sent" | "confirmed" | "done" };
export type Approval = { id: number; from: Role; title: string; detail: string; status: "pending" | "approved" | "refused"; reqId?: number };
export type Thread = { id: number; with: "teacher" | "admin"; title: string; msgs: { by: "parent" | "teacher" | "admin"; text: string; at: Stamp }[] };
export type Homework = { id: number; subject: string; text: string; due: string; done?: boolean };
export type Announcement = { id: number; from: string; text: string; at: Stamp };
export type Exam = { id: number; title: string; published: boolean; marks: Record<string, string> };
export type Session = { id: number; day: string; time: string; subject: string; room: string; change?: string };
export type Review = { id: number; school: string; by: string; stars: number; text: string; reply?: string; at: Stamp };
export type Staff = { id: number; name: string; job: string; perms: Record<string, boolean> };

export const REQ_STAGES = ["جديد", "اتصال", "اختبار المستوى", "مقبول", "مسجّل"];
export const FILES = ["شهادة الميلاد", "كشف نقاط السنة الماضية", "صور شمسية", "شهادة التأمين"];
export const PERMS = ["التسجيلات", "المستحقات", "الغيابات", "النقاط", "الرسائل"];

export type World = {
  v: number;
  notes: Note[];
  absences: Absence[];
  fees: Fee[];
  reqs: Req[];
  appts: Appt[];
  incidents: Incident[];
  convocations: Convocation[];
  approvals: Approval[];
  threads: Thread[];
  homework: Homework[];
  announcements: Announcement[];
  exam: Exam;
  sessions: Session[];
  reviews: Review[];
  staff: Staff[];
  attendanceSent: boolean;
};

const VERSION = 4;
const KEY = "madrassa-demo";

function seed(): World {
  const all = (on: string[]) => Object.fromEntries(PERMS.map((p) => [p, on.includes(p)]));
  return {
    v: VERSION,
    notes: [
      { id: 1, to: "parent", text: "اجتماع الأولياء يوم الخميس على الساعة 16:00", at: "أمس", read: true, tone: "announce" },
      { id: 2, to: "director", text: "طلبان بانتظار موافقتك", at: "صباح اليوم", read: true, tone: "approval" },
    ],
    absences: [
      { id: 1, pupil: "يونس قادري", date: "أمس", session: "08:00 رياضيات", status: "open" },
      { id: 2, pupil: "سارة بن يوسف", date: "أمس", session: "10:00 فيزياء", status: "sent", note: "حمّى — شهادة طبية مرفقة" },
      { id: 3, pupil: "مريم عيساوي", date: "الأحد", session: "اليوم كاملًا", status: "justified", note: "ظرف عائلي" },
    ],
    fees: [
      { id: 1, pupil: "آدم بوعلام", month: "أكتوبر", amount: 18000, status: "due" },
      { id: 2, pupil: "يونس قادري", month: "أكتوبر", amount: 18000, status: "receipt", method: "بريدي موب" },
      { id: 3, pupil: "لينا مزيان", month: "أكتوبر", amount: 18000, status: "receipt", method: "CCP" },
      { id: 4, pupil: "مريم عيساوي", month: "سبتمبر", amount: 18000, status: "late" },
      { id: 5, pupil: "أنيس طالبي", month: "سبتمبر", amount: 18000, status: "late" },
      { id: 6, pupil: "رامي حداد", month: "أكتوبر", amount: 18000, status: "confirmed", method: "نقدًا" },
      { id: 7, pupil: "سارة بن يوسف", month: "أكتوبر", amount: 18000, status: "confirmed", method: "بريدي موب" },
      { id: 8, pupil: "إيناس شريف", month: "أكتوبر", amount: 18000, status: "due" },
    ],
    reqs: [
      { id: 11, child: "أنس بن علي", parent: "علي بن علي", level: "1 متوسط", school: "najah", stage: 0, files: { [FILES[0]]: true, [FILES[1]]: false, [FILES[2]]: false, [FILES[3]]: false } },
      { id: 12, child: "هبة سعيدي", parent: "فريدة سعيدي", level: "3 متوسط", school: "najah", stage: 1, files: { [FILES[0]]: true, [FILES[1]]: true, [FILES[2]]: false, [FILES[3]]: false } },
      { id: 13, child: "زكريا عمراني", parent: "مراد عمراني", level: "2 متوسط", school: "najah", stage: 2, files: { [FILES[0]]: true, [FILES[1]]: true, [FILES[2]]: true, [FILES[3]]: false }, slot: "الأحد 09:30" },
      { id: 14, child: "ياسمين خليفي", parent: "سعاد خليفي", level: "1 متوسط", school: "najah", stage: 4, files: Object.fromEntries(FILES.map((f) => [f, true])) },
    ],
    appts: [
      { id: 1, who: "مراد عمراني", when: "الأحد 09:30", why: "اختبار مستوى زكريا" },
      { id: 2, who: "وليّة لينا مزيان", when: "الإثنين 14:00", why: "لقاء مع الأستاذة الرئيسية" },
    ],
    incidents: [{ id: 1, pupil: "رامي حداد", text: "تأخر صباحي — المرة الثالثة هذا الأسبوع", at: "صباح اليوم" }],
    convocations: [{ id: 1, pupil: "رامي حداد", when: "الثلاثاء 15:00", reason: "تأخرات متكررة", status: "confirmed" }],
    approvals: [
      { id: 1, from: "accounting", title: "تخفيض الإخوة 10٪", detail: "عائلة قادري — ابنان مسجّلان (يونس وأخته في 1 متوسط)", status: "pending" },
      { id: 2, from: "supervisor", title: "تعويض حصة فيزياء", detail: "4 متوسط أ — السبت 09:00 بدل حصة الأستاذ الغائب", status: "pending" },
    ],
    threads: [
      {
        id: 1, with: "teacher", title: "أ. سميرة مداني — الرياضيات",
        msgs: [
          { by: "teacher", text: "السلام عليكم، آدم تحسّن كثيرًا في الهندسة هذا الشهر. يحتاج فقط مراجعة الكسور.", at: "الأحد" },
          { by: "parent", text: "شكرًا أستاذة، سنراجعها معه في البيت.", at: "الأحد" },
        ],
      },
      { id: 2, with: "admin", title: "الإدارة — الاستقبال", msgs: [{ by: "admin", text: "مرحبًا، كشف نقاط الفصل الأول متوفر في حسابكم ابتداءً من 15 ديسمبر.", at: "الأسبوع الماضي" }] },
    ],
    homework: [
      { id: 1, subject: "الرياضيات", text: "تمارين الصفحة 42 (من 1 إلى 4)", due: "الثلاثاء" },
      { id: 2, subject: "اللغة الفرنسية", text: "قراءة النص «Le petit prince» وتلخيصه", due: "الخميس" },
    ],
    announcements: [{ id: 1, from: "الإدارة", text: "اجتماع الأولياء يوم الخميس على الساعة 16:00 في قاعة المحاضرات.", at: "أمس" }],
    exam: { id: 1, title: "الفرض الأول — الرياضيات", published: false, marks: { "آدم بوعلام": "15.5", "إيناس شريف": "17", "يونس قادري": "11", "مريم عيساوي": "13.5", "رامي حداد": "9.5", "لينا مزيان": "16", "سارة بن يوسف": "14", "أنيس طالبي": "12" } },
    sessions: [
      { id: 1, day: "الأحد", time: "08:00", subject: "الرياضيات", room: "ق 12" },
      { id: 2, day: "الأحد", time: "10:00", subject: "اللغة العربية", room: "ق 12" },
      { id: 3, day: "الأحد", time: "13:30", subject: "العلوم الطبيعية", room: "مخبر 2" },
      { id: 4, day: "الإثنين", time: "08:00", subject: "اللغة الفرنسية", room: "ق 12" },
      { id: 5, day: "الإثنين", time: "10:00", subject: "الفيزياء", room: "مخبر 1" },
      { id: 6, day: "الإثنين", time: "13:30", subject: "الإنجليزية", room: "ق 7" },
      { id: 7, day: "الثلاثاء", time: "08:00", subject: "الرياضيات", room: "ق 12" },
      { id: 8, day: "الثلاثاء", time: "10:00", subject: "التاريخ والجغرافيا", room: "ق 12" },
      { id: 9, day: "الأربعاء", time: "08:00", subject: "العلوم الطبيعية", room: "مخبر 2" },
      { id: 10, day: "الأربعاء", time: "10:00", subject: "الرياضيات", room: "ق 12" },
      { id: 11, day: "الخميس", time: "08:00", subject: "اللغة العربية", room: "ق 12" },
      { id: 12, day: "الخميس", time: "10:00", subject: "التربية البدنية", room: "الملعب" },
    ],
    reviews: [
      { id: 1, school: "najah", by: "وليّ تلميذ في 4 متوسط", stars: 5, text: "متابعة يومية واضحة، ونعرف بالغياب في نفس الساعة.", reply: "شكرًا لثقتكم.", at: "سبتمبر" },
      { id: 2, school: "najah", by: "وليّة تلميذة في 1 متوسط", stars: 4, text: "مستوى جيد، لكن النقل المدرسي يتأخر أحيانًا.", at: "سبتمبر" },
      { id: 3, school: "mostaqbal", by: "وليّ تلميذ في الابتدائي", stars: 4, text: "اهتمام جيد بالرياضيات والعلوم.", at: "أكتوبر" },
      { id: 4, school: "ofoq", by: "متعلّم راشد", stars: 5, text: "اختبار مستوى دقيق وأفواج صغيرة.", reply: "سعداء بتقدّمك!", at: "أكتوبر" },
      { id: 5, school: "tafawok", by: "وليّة تلميذ في البكالوريا", stars: 5, text: "تحسّن واضح في الرياضيات خلال شهرين.", at: "أكتوبر" },
      { id: 6, school: "itqane", by: "متربّص", stars: 4, text: "تكوين تطبيقي وتربص في مؤسسات.", at: "سبتمبر" },
      { id: 7, school: "nour-oran", by: "وليّ تلميذ في الابتدائي", stars: 4, text: "إدارة متعاونة ومعلمون أكفاء.", at: "سبتمبر" },
    ],
    staff: [
      { id: 1, name: "رشيد بلقاسم", job: "مستشار التربية", perms: all(["الغيابات", "الرسائل"]) },
      { id: 2, name: "أمال سعدي", job: "الاستقبال والتسجيلات", perms: all(["التسجيلات"]) },
      { id: 3, name: "نسيم بوزيد", job: "المحاسبة", perms: all(["المستحقات"]) },
      { id: 4, name: "سميرة مداني", job: "أستاذة الرياضيات", perms: all(["الغيابات", "النقاط", "الرسائل"]) },
      { id: 5, name: "فريد زروقي", job: "أستاذ الفيزياء", perms: all(["الغيابات", "النقاط"]) },
    ],
    attendanceSent: false,
  };
}

// ----------------------------------------------------------------- store core
const SEED = seed();
let world: World = SEED;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const w = JSON.parse(raw) as World;
      if (w.v === VERSION) world = w;
    }
  } catch {}
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try {
      world = e.newValue ? (JSON.parse(e.newValue) as World) : seed();
    } catch {
      world = seed();
    }
    emit();
  });
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useWorld(): World {
  return useSyncExternalStore(subscribe, () => (load(), world), () => SEED);
}

function commit(fn: (w: World) => World) {
  world = fn(world);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(world));
  } catch {}
  emit();
}

let seq = Date.now() % 1_000_000;
const nid = () => ++seq;

function notify(w: World, to: Role[], text: string, tone: Tone): World {
  const at = Date.now();
  return { ...w, notes: [...to.map((r) => ({ id: nid(), to: r, text, at, read: false, tone })), ...w.notes] };
}
const map = <T extends { id: number }>(xs: T[], id: number, f: (x: T) => T) => xs.map((x) => (x.id === id ? f(x) : x));

// ------------------------------------------------------------------- actions
export const act = {
  reset() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {}
    world = seed();
    emit();
  },
  markRead(role: Role) {
    if (!world.notes.some((n) => n.to === role && !n.read)) return;
    commit((w) => ({ ...w, notes: w.notes.map((n) => (n.to === role ? { ...n, read: true } : n)) }));
  },

  // teacher
  sendAttendance(absent: string[]) {
    commit((w) => {
      let x: World = {
        ...w,
        attendanceSent: true,
        absences: [...absent.map((p) => ({ id: nid(), pupil: p, date: "اليوم", session: "08:00 رياضيات", status: "open" as const })), ...w.absences],
      };
      if (absent.includes(ME_CHILD)) x = notify(x, ["parent"], "غياب آدم اليوم — حصة الرياضيات 08:00. يمكنك إرسال تبرير.", "absence");
      if (absent.length) x = notify(x, ["supervisor"], `${absent.length} غياب في ${CLASS} (حصة 08:00)`, "absence");
      return x;
    });
  },
  setMark(pupil: string, v: string) {
    commit((w) => ({ ...w, exam: { ...w.exam, marks: { ...w.exam.marks, [pupil]: v } } }));
  },
  publishExam() {
    commit((w) => {
      const x = { ...w, exam: { ...w.exam, published: true } };
      const m = w.exam.marks[ME_CHILD];
      return notify(notify(notify(x, ["parent"], `نقطة آدم في ${w.exam.title}: ${m} / 20`, "grade"), ["student"], `نقطتك في ${w.exam.title}: ${m} / 20`, "grade"), ["director"], `نُشرت نقاط ${w.exam.title} — ${CLASS}`, "grade");
    });
  },
  addHomework(subject: string, text: string, due: string) {
    commit((w) => notify({ ...w, homework: [{ id: nid(), subject, text, due }, ...w.homework] }, ["student", "parent"], `واجب جديد في ${subject}: ${text}`, "homework"));
  },

  // parent
  justify(id: number, note: string) {
    commit((w) => notify({ ...w, absences: map(w.absences, id, (a) => ({ ...a, status: "sent", note })) }, ["supervisor"], `تبرير جديد من وليّ آدم: ${note}`, "absence"));
  },
  uploadReceipt(id: number, method: string) {
    commit((w) => notify({ ...w, fees: map(w.fees, id, (f) => ({ ...f, status: "receipt", method })) }, ["accounting"], `وصل دفع جديد (${method}) — وليّ آدم بوعلام`, "fee"));
  },
  sendMessage(threadId: number, by: "parent" | "teacher" | "admin", text: string) {
    commit((w) => {
      const t = w.threads.find((x) => x.id === threadId)!;
      const x = { ...w, threads: map(w.threads, threadId, (th) => ({ ...th, msgs: [...th.msgs, { by, text, at: Date.now() }] })) };
      if (by === "parent") return notify(x, [t.with === "teacher" ? "teacher" : "reception"], `رسالة من وليّ آدم: ${text}`, "message");
      return notify(x, ["parent"], `رسالة جديدة من ${by === "teacher" ? "أ. سميرة" : "الإدارة"}`, "message");
    });
  },
  confirmConvocation(id: number) {
    commit((w) => notify({ ...w, convocations: map(w.convocations, id, (c) => ({ ...c, status: "confirmed" })) }, ["supervisor"], "وليّ آدم أكّد حضور الاستدعاء", "discipline"));
  },
  register(schoolId: string, schoolName: string, child: string, level: string) {
    commit((w) => {
      const r: Req = { id: nid(), child, parent: PARENT, level, school: schoolId, stage: 0, mine: true, files: Object.fromEntries(FILES.map((f) => [f, false])) };
      let x: World = { ...w, reqs: [r, ...w.reqs] };
      x = notify(x, ["parent"], `أُرسل طلب تسجيل ${child} إلى ${schoolName}`, "request");
      if (schoolId === "najah") x = notify(x, ["reception"], `طلب تسجيل جديد: ${child} (${level})`, "request");
      return x;
    });
  },
  review(stars: number, text: string) {
    commit((w) => notify({ ...w, reviews: [{ id: nid(), school: "najah", by: "وليّ تلميذ في 4 متوسط", stars, text, at: Date.now() }, ...w.reviews] }, ["director"], "تقييم جديد موثّق على صفحة المدرسة", "approval"));
  },

  // reception
  advance(id: number) {
    commit((w) => {
      const r = w.reqs.find((q) => q.id === id)!;
      if (r.stage === 2) {
        // admission needs the director's approval
        const x = { ...w, reqs: map(w.reqs, id, (q) => ({ ...q, waiting: true })) };
        return notify({ ...x, approvals: [{ id: nid(), from: "reception", title: `قبول ${r.child}`, detail: `${r.level} — نجح في اختبار المستوى`, status: "pending", reqId: id }, ...x.approvals] }, ["director"], `طلب موافقة: قبول ${r.child}`, "approval");
      }
      const stage = Math.min(r.stage + 1, REQ_STAGES.length - 1);
      let x: World = { ...w, reqs: map(w.reqs, id, (q) => ({ ...q, stage, slot: stage === 2 ? "الأحد 09:30" : q.slot })) };
      if (stage === 2) x = { ...x, appts: [...x.appts, { id: nid(), who: r.parent, when: "الأحد 09:30", why: `اختبار مستوى ${r.child}` }] };
      if (stage === 4) {
        x = { ...x, fees: [{ id: nid(), pupil: r.child, month: "أكتوبر", amount: 18000, status: "due" }, ...x.fees] };
        x = notify(x, ["accounting"], `تلميذ جديد مسجّل: ${r.child} — أُضيفت مستحقاته`, "fee");
        x = notify(x, ["director"], `تسجيل جديد: ${r.child} (${r.level})`, "request");
      }
      if (r.mine) x = notify(x, ["parent"], stage === 2 ? `موعد اختبار مستوى ${r.child}: الأحد 09:30` : `طلب تسجيل ${r.child}: ${REQ_STAGES[stage]}`, "request");
      return x;
    });
  },
  toggleFile(id: number, f: string) {
    commit((w) => ({ ...w, reqs: map(w.reqs, id, (q) => ({ ...q, files: { ...q.files, [f]: !q.files[f] } })) }));
  },
  addAppt(who: string, when: string, why: string) {
    commit((w) => notify({ ...w, appts: [...w.appts, { id: nid(), who, when, why }] }, who === PARENT ? ["parent"] : [], `موعد مع الإدارة: ${when} — ${why}`, "schedule"));
  },

  // accounting
  confirmFee(id: number) {
    commit((w) => {
      const f = w.fees.find((x) => x.id === id)!;
      let x: World = { ...w, fees: map(w.fees, id, (y) => ({ ...y, status: "confirmed" })) };
      x = notify(x, ["director"], `تحصيل ${f.amount.toLocaleString("fr-FR")} دج — ${f.pupil}`, "fee");
      if (f.pupil === ME_CHILD) x = notify(x, ["parent"], `أكّدت المحاسبة استلام مستحقات ${f.month}`, "fee");
      return x;
    });
  },
  rejectFee(id: number) {
    commit((w) => {
      const f = w.fees.find((x) => x.id === id)!;
      const x = { ...w, fees: map(w.fees, id, (y) => ({ ...y, status: "due" as const, method: undefined })) };
      return f.pupil === ME_CHILD ? notify(x, ["parent"], "الوصل غير واضح — أعد رفعه من فضلك", "fee") : x;
    });
  },
  remind(ids: number[]) {
    commit((w) => {
      const x = { ...w, fees: w.fees.map((f) => (ids.includes(f.id) ? { ...f, reminded: true } : f)) };
      const mine = w.fees.find((f) => ids.includes(f.id) && f.pupil === ME_CHILD);
      return mine ? notify(x, ["parent"], `تذكير: مستحقات ${mine.month} لآدم (${mine.amount.toLocaleString("fr-FR")} دج)`, "fee") : x;
    });
  },
  askDiscount(pupil: string) {
    commit((w) => notify({ ...w, approvals: [{ id: nid(), from: "accounting", title: `تخفيض لعائلة ${pupil.split(" ")[1] ?? pupil}`, detail: `طلب تخفيض 10٪ على مستحقات ${pupil}`, status: "pending" }, ...w.approvals] }, ["director"], "طلب موافقة جديد من المحاسبة", "approval"));
  },

  // supervisor
  decideJustification(id: number, ok: boolean) {
    commit((w) => {
      const a = w.absences.find((x) => x.id === id)!;
      let x: World = { ...w, absences: map(w.absences, id, (y) => ({ ...y, status: ok ? "justified" : "rejected" })) };
      if (a.pupil === ME_CHILD) x = notify(x, ["parent"], ok ? "قُبل تبرير غياب آدم" : "رُفض تبرير غياب آدم — تواصل مع المستشار", "absence");
      x = notify(x, ["director"], `${ok ? "غياب مبرَّر" : "تبرير مرفوض"}: ${a.pupil}`, "absence");
      return x;
    });
  },
  addIncident(pupil: string, text: string) {
    commit((w) => {
      let x: World = { ...w, incidents: [{ id: nid(), pupil, text, at: Date.now() }, ...w.incidents] };
      if (pupil === ME_CHILD) x = notify(x, ["parent"], `ملاحظة انضباط: ${text}`, "discipline");
      return notify(x, ["director"], `انضباط: ${pupil} — ${text}`, "discipline");
    });
  },
  convoke(pupil: string, when: string, reason: string) {
    commit((w) => {
      let x: World = { ...w, convocations: [{ id: nid(), pupil, when, reason, status: "sent" }, ...w.convocations] };
      if (pupil === ME_CHILD) x = notify(x, ["parent"], `استدعاء: ${when} — ${reason}`, "discipline");
      return x;
    });
  },
  changeSession(id: number, change: string) {
    commit((w) => {
      const s = w.sessions.find((x) => x.id === id)!;
      const txt = `${s.day} ${s.time} (${s.subject}): ${change}`;
      return notify({ ...w, sessions: map(w.sessions, id, (y) => ({ ...y, change })) }, ["student", "parent", "teacher"], `تعديل في استعمال الزمن — ${txt}`, "schedule");
    });
  },

  // director
  decide(id: number, ok: boolean) {
    commit((w) => {
      const a = w.approvals.find((x) => x.id === id)!;
      let x: World = { ...w, approvals: map(w.approvals, id, (y) => ({ ...y, status: ok ? "approved" : "refused" })) };
      if (a.reqId) {
        const r = x.reqs.find((q) => q.id === a.reqId)!;
        x = { ...x, reqs: map(x.reqs, a.reqId, (q) => ({ ...q, waiting: false, stage: ok ? 3 : q.stage })) };
        if (r.mine && ok) x = notify(x, ["parent"], `قُبل ${r.child} في ${SCHOOL.name} — أكمل الملف للتسجيل`, "request");
      }
      return notify(x, [a.from], `${ok ? "وافق" : "رفض"} المدير: ${a.title}`, "approval");
    });
  },
  togglePerm(id: number, p: string) {
    commit((w) => ({ ...w, staff: map(w.staff, id, (s) => ({ ...s, perms: { ...s.perms, [p]: !s.perms[p] } })) }));
  },
  announce(text: string, from: string) {
    commit((w) => notify({ ...w, announcements: [{ id: nid(), from, text, at: Date.now() }, ...w.announcements] }, ["parent", "student", "teacher"], `إعلان من ${from}: ${text}`, "announce"));
  },
  reply(id: number, text: string) {
    commit((w) => ({ ...w, reviews: map(w.reviews, id, (r) => ({ ...r, reply: text })) }));
  },

  // student
  toggleHomework(id: number) {
    commit((w) => ({ ...w, homework: map(w.homework, id, (h) => ({ ...h, done: !h.done })) }));
  },
};

// ------------------------------------------------------------------- helpers
export const fmt = (n: number) => `${n.toLocaleString("fr-FR").replace(/\s/g, " ")} دج`;

export function ago(at: Stamp, now: number) {
  if (typeof at === "string") return at;
  const m = Math.floor((now - at) / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  return h < 24 ? `منذ ${h} سا` : "أمس";
}

export const unread = (w: World, r: Role) => w.notes.filter((n) => n.to === r && !n.read).length;
