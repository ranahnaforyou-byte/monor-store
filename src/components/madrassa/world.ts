/**
 * MA DRASSA demo world — types, seed data and pure actions.
 * Shared by the browser store (single device) and the room API (two devices),
 * so an action means exactly the same thing on both sides.
 * Fictional people and institutions (demo data).
 */

export type Role = "director" | "supervisor" | "reception" | "accounting" | "teacher" | "parent" | "student" | "directory" | "jobs";

export const ROLES: { key: Role; label: string; who: string }[] = [
  { key: "director", label: "المدير", who: "نادية حمدي" },
  { key: "supervisor", label: "المستشار التربوي", who: "رشيد بلقاسم" },
  { key: "reception", label: "الاستقبال", who: "أمال سعدي" },
  { key: "accounting", label: "المحاسبة", who: "نسيم بوزيد" },
  { key: "teacher", label: "الأستاذة", who: "سميرة مداني" },
  { key: "parent", label: "الولي", who: "كريم بوعلام" },
  { key: "student", label: "التلميذ", who: "آدم بوعلام" },
  { key: "directory", label: "الدليل العام", who: "للجميع" },
  { key: "jobs", label: "عروض العمل", who: "للباحثين عن عمل" },
];
export const ROLE_KEYS = ROLES.map((r) => r.key);
export const roleLabel = (r: Role) => ROLES.find((x) => x.key === r)!.label;

/** Everything that changes from one institution to another. Filled from the «أنشئ نسخة عرض» page. */
export type Profile = {
  name: string; area: string; kind: "school" | "language" | "training" | "support";
  levels: string; group: string; teacher: string; teacherTitle: string; learnerTitle: string; subject: string;
  fee: number; regFee: number; length: string; diploma: string; hours: string; pupils: number;
};
export const DEFAULT_PROFILE: Profile = {
  name: "مدرسة الأفق", area: "حيدرة", kind: "school", levels: "تحضيري، ابتدائي، متوسط", group: "4 متوسط — أ",
  teacher: "سميرة مداني", teacherTitle: "الأستاذة", learnerTitle: "التلميذ", subject: "الرياضيات",
  fee: 18000, regFee: 15000, length: "3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية: الابتدائي والمتوسط", hours: "07:45 – 16:30", pupils: 286,
};
export const KIND_LABEL: Record<Profile["kind"], string> = { school: "مدرسة خاصة", language: "مركز لغات", training: "تكوين مهني", support: "مركز دعم" };
/** The institution of this world (falls back to the default demo school). */
export const info = (w: { profile?: Partial<Profile> } | null | undefined): Profile => ({ ...DEFAULT_PROFILE, ...(w?.profile ?? {}) });
export const roleName = (r: Role, p: Profile) => (r === "teacher" ? p.teacherTitle : r === "student" ? p.learnerTitle : ROLES.find((x) => x.key === r)!.label);
export const roleWho = (r: Role, p: Profile) => (r === "teacher" ? p.teacher : ROLES.find((x) => x.key === r)!.who);
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
export type Review = { id: number; school: string; by: string; student?: boolean; stars: number; text: string; reply?: string; at: Stamp };
export type Job = { id: number; school: string; title: string; kind: "تدريس" | "إدارة" | "حراسة" | "نظافة"; hours: string; note: string; open: boolean };
export type Application = { id: number; jobId: number; name: string; exp: string; status: "new" | "interview" | "declined"; at: Stamp };
export type Gate = { pupil: string; in?: string; out?: string };
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
  profile?: Profile;
  jobs: Job[];
  applications: Application[];
  gate: Gate[];
};

export const VERSION = 6;

export function seed(profile?: Profile): World {
  const P = { ...DEFAULT_PROFILE, ...(profile ?? {}) };
  const all = (on: string[]) => Object.fromEntries(PERMS.map((p) => [p, on.includes(p)]));
  return {
    v: VERSION,
    profile,
    notes: [
      { id: 1, to: "parent", text: "اجتماع الأولياء يوم الخميس على الساعة 16:00", at: "أمس", read: true, tone: "announce" },
      { id: 2, to: "director", text: "طلبان بانتظار موافقتك", at: "صباح اليوم", read: true, tone: "approval" },
    ],
    absences: [
      { id: 1, pupil: "يونس قادري", date: "أمس", session: `08:00 ${P.subject}`, status: "open" },
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
        id: 1, with: "teacher", title: `${P.teacherTitle} ${P.teacher} — ${P.subject}`,
        msgs: [
          { by: "teacher", text: "السلام عليكم، آدم تحسّن كثيرًا في الهندسة هذا الشهر. يحتاج فقط مراجعة الكسور.", at: "الأحد" },
          { by: "parent", text: "شكرًا أستاذة، سنراجعها معه في البيت.", at: "الأحد" },
        ],
      },
      { id: 2, with: "admin", title: "الإدارة — الاستقبال", msgs: [{ by: "admin", text: "مرحبًا، كشف نقاط الفصل الأول متوفر في حسابكم ابتداءً من 15 ديسمبر.", at: "الأسبوع الماضي" }] },
    ],
    homework: [
      { id: 1, subject: P.subject, text: "تمارين الصفحة 42 (من 1 إلى 4)", due: "الثلاثاء" },
      { id: 2, subject: "اللغة الفرنسية", text: "قراءة النص «Le petit prince» وتلخيصه", due: "الخميس" },
    ],
    announcements: [{ id: 1, from: "الإدارة", text: "اجتماع الأولياء يوم الخميس على الساعة 16:00 في قاعة المحاضرات.", at: "أمس" }],
    exam: { id: 1, title: `الفرض الأول — ${P.subject}`, published: false, marks: { "آدم بوعلام": "15.5", "إيناس شريف": "17", "يونس قادري": "11", "مريم عيساوي": "13.5", "رامي حداد": "9.5", "لينا مزيان": "16", "سارة بن يوسف": "14", "أنيس طالبي": "12" } },
    sessions: [
      { id: 1, day: "الأحد", time: "08:00", subject: P.subject, room: "ق 12" },
      { id: 2, day: "الأحد", time: "10:00", subject: "اللغة العربية", room: "ق 12" },
      { id: 3, day: "الأحد", time: "13:30", subject: "العلوم الطبيعية", room: "مخبر 2" },
      { id: 4, day: "الإثنين", time: "08:00", subject: "اللغة الفرنسية", room: "ق 12" },
      { id: 5, day: "الإثنين", time: "10:00", subject: "الفيزياء", room: "مخبر 1" },
      { id: 6, day: "الإثنين", time: "13:30", subject: "الإنجليزية", room: "ق 7" },
      { id: 7, day: "الثلاثاء", time: "08:00", subject: P.subject, room: "ق 12" },
      { id: 8, day: "الثلاثاء", time: "10:00", subject: "التاريخ والجغرافيا", room: "ق 12" },
      { id: 9, day: "الأربعاء", time: "08:00", subject: "العلوم الطبيعية", room: "مخبر 2" },
      { id: 10, day: "الأربعاء", time: "10:00", subject: P.subject, room: "ق 12" },
      { id: 11, day: "الخميس", time: "08:00", subject: "اللغة العربية", room: "ق 12" },
      { id: 12, day: "الخميس", time: "10:00", subject: "التربية البدنية", room: "الملعب" },
    ],
    reviews: [
      { id: 1, school: "najah", by: "وليّ تلميذ في 4 متوسط", stars: 5, text: "متابعة يومية واضحة، ونعرف بالغياب في نفس الساعة.", reply: "شكرًا لثقتكم.", at: "سبتمبر" },
      { id: 2, school: "najah", by: "وليّة تلميذة في 1 متوسط", stars: 4, text: "مستوى جيد، لكن النقل المدرسي يتأخر أحيانًا.", at: "سبتمبر" },
      { id: 3, school: "mostaqbal", by: "وليّ تلميذ في الابتدائي", stars: 4, text: "اهتمام جيد بالرياضيات والعلوم.", at: "أكتوبر" },
      { id: 4, school: "ofoq", by: "متعلّم راشد", student: true, stars: 5, text: "اختبار مستوى دقيق وأفواج صغيرة.", reply: "سعداء بتقدّمك!", at: "أكتوبر" },
      { id: 5, school: "tafawok", by: "وليّة تلميذ في البكالوريا", stars: 5, text: "تحسّن واضح في الرياضيات خلال شهرين.", at: "أكتوبر" },
      { id: 6, school: "itqane", by: "متربّص في الإعلام الآلي", student: true, stars: 4, text: "تكوين تطبيقي وتربص في مؤسسات.", at: "سبتمبر" },
      { id: 7, school: "nour-oran", by: "وليّ تلميذ في الابتدائي", stars: 4, text: "إدارة متعاونة ومعلمون أكفاء.", at: "سبتمبر" },
      { id: 8, school: "lamsa", by: "متربّصة في الحلاقة", student: true, stars: 5, text: "تطبيق يومي على زبائن حقيقيين، والمكوّنة صبورة.", reply: "بالتوفيق في الامتحان النهائي!", at: "أكتوبر" },
      { id: 9, school: "lamsa", by: "متربّصة في التجميل", student: true, stars: 4, text: "البرنامج واضح، لكن الأفواج كبيرة قليلًا.", at: "سبتمبر" },
    ],
    staff: [
      { id: 1, name: "رشيد بلقاسم", job: "مستشار التربية", perms: all(["الغيابات", "الرسائل"]) },
      { id: 2, name: "أمال سعدي", job: "الاستقبال والتسجيلات", perms: all(["التسجيلات"]) },
      { id: 3, name: "نسيم بوزيد", job: "المحاسبة", perms: all(["المستحقات"]) },
      { id: 4, name: P.teacher, job: `${P.teacherTitle} ${P.subject}`, perms: all(["الغيابات", "النقاط", "الرسائل"]) },
      { id: 5, name: "فريد زروقي", job: "أستاذ الفيزياء", perms: all(["الغيابات", "النقاط"]) },
    ],
    attendanceSent: false,
    jobs: [
      { id: 1, school: "najah", title: "أستاذ(ة) لغة إنجليزية — المتوسط", kind: "تدريس", hours: "دوام كامل", note: "ليسانس إنجليزية، خبرة سنتين على الأقل", open: true },
      { id: 2, school: "mostaqbal", title: "حارس ليلي", kind: "حراسة", hours: "ليلي، 6 ليالٍ", note: "خبرة في الحراسة، سجل عدلي نظيف", open: true },
      { id: 3, school: "najah", title: "عاملة نظافة", kind: "نظافة", hours: "صباحي 06:30 – 13:00", note: "قرب حيدرة مفضّل", open: true },
      { id: 4, school: "itqane", title: "مكوّن(ة) إعلام آلي", kind: "تدريس", hours: "مسائي", note: "إتقان Excel وWord، خبرة في التكوين", open: true },
      { id: 5, school: "ofoq", title: "مسؤول(ة) استقبال وتسجيلات", kind: "إدارة", hours: "دوام كامل", note: "العربية والفرنسية، حسن التعامل مع الأولياء", open: true },
    ],
    applications: [{ id: 1, jobId: 1, name: "ليلى حمّادي", exp: "4 سنوات في مدرسة خاصة ببن عكنون", status: "new", at: "أمس" }],
    gate: [
      { pupil: "إيناس شريف", in: "07:41" },
      { pupil: "يونس قادري" },
      { pupil: "مريم عيساوي", in: "07:49" },
      { pupil: "رامي حداد", in: "08:07" },
      { pupil: "لينا مزيان", in: "07:44" },
      { pupil: "سارة بن يوسف", in: "07:52" },
      { pupil: "أنيس طالبي", in: "07:38" },
      { pupil: "آدم بوعلام" },
    ],
  };
}


let seq = Date.now() % 1_000_000_000;
const nid = () => ++seq;

function notify(w: World, to: Role[], text: string, tone: Tone): World {
  const at = Date.now();
  return { ...w, notes: [...to.map((r) => ({ id: nid(), to: r, text, at, read: false, tone })), ...w.notes] };
}
const map = <T extends { id: number }>(xs: T[], id: number, f: (x: T) => T) => xs.map((x) => (x.id === id ? f(x) : x));

// ------------------------------------------------------------------- actions
export const reducers = {
  // teacher
  sendAttendance(w0: World, absent: string[]): World {
    return ((w: World) => {
      let x: World = {
        ...w,
        attendanceSent: true,
        absences: [...absent.map((p) => ({ id: nid(), pupil: p, date: "اليوم", session: `08:00 ${info(w).subject}`, status: "open" as const })), ...w.absences],
      };
      if (absent.includes(ME_CHILD)) x = notify(x, ["parent"], `غياب آدم اليوم — حصة ${info(w).subject} 08:00. يمكنك إرسال تبرير.`, "absence");
      if (absent.length) x = notify(x, ["supervisor"], `${absent.length} غياب في ${info(w).group} (حصة 08:00)`, "absence");
      return x;
    })(w0);
  },
  setMark(w0: World, pupil: string, v: string): World {
    return ((w: World) => ({ ...w, exam: { ...w.exam, marks: { ...w.exam.marks, [pupil]: v } } }))(w0);
  },
  publishExam(w0: World): World {
    return ((w: World) => {
      const x = { ...w, exam: { ...w.exam, published: true } };
      const m = w.exam.marks[ME_CHILD];
      return notify(notify(notify(x, ["parent"], `نقطة آدم في ${w.exam.title}: ${m} / 20`, "grade"), ["student"], `نقطتك في ${w.exam.title}: ${m} / 20`, "grade"), ["director"], `نُشرت نقاط ${w.exam.title} — ${info(w).group}`, "grade");
    })(w0);
  },
  addHomework(w0: World, subject: string, text: string, due: string): World {
    return ((w: World) => notify({ ...w, homework: [{ id: nid(), subject, text, due }, ...w.homework] }, ["student", "parent"], `واجب جديد في ${subject}: ${text}`, "homework"))(w0);
  },

  // parent
  justify(w0: World, id: number, note: string): World {
    return ((w: World) => notify({ ...w, absences: map(w.absences, id, (a) => ({ ...a, status: "sent", note })) }, ["supervisor"], `تبرير جديد من وليّ آدم: ${note}`, "absence"))(w0);
  },
  uploadReceipt(w0: World, id: number, method: string): World {
    return ((w: World) => notify({ ...w, fees: map(w.fees, id, (f) => ({ ...f, status: "receipt", method })) }, ["accounting"], `وصل دفع جديد (${method}) — وليّ آدم بوعلام`, "fee"))(w0);
  },
  sendMessage(w0: World, threadId: number, by: "parent" | "teacher" | "admin", text: string): World {
    return ((w: World) => {
      const t = w.threads.find((x) => x.id === threadId)!;
      const x = { ...w, threads: map(w.threads, threadId, (th) => ({ ...th, msgs: [...th.msgs, { by, text, at: Date.now() }] })) };
      if (by === "parent") return notify(x, [t.with === "teacher" ? "teacher" : "reception"], `رسالة من وليّ آدم: ${text}`, "message");
      return notify(x, ["parent"], `رسالة جديدة من ${by === "teacher" ? info(w).teacher : "الإدارة"}`, "message");
    })(w0);
  },
  confirmConvocation(w0: World, id: number): World {
    return ((w: World) => notify({ ...w, convocations: map(w.convocations, id, (c) => ({ ...c, status: "confirmed" })) }, ["supervisor"], "وليّ آدم أكّد حضور الاستدعاء", "discipline"))(w0);
  },
  register(w0: World, schoolId: string, schoolName: string, child: string, level: string): World {
    return ((w: World) => {
      const r: Req = { id: nid(), child, parent: PARENT, level, school: schoolId, stage: 0, mine: true, files: Object.fromEntries(FILES.map((f) => [f, false])) };
      let x: World = { ...w, reqs: [r, ...w.reqs] };
      x = notify(x, ["parent"], `أُرسل طلب تسجيل ${child} إلى ${schoolName}`, "request");
      if (schoolId === "najah") x = notify(x, ["reception"], `طلب تسجيل جديد: ${child} (${level})`, "request");
      return x;
    })(w0);
  },
  review(w0: World, stars: number, text: string): World {
    return ((w: World) => notify({ ...w, reviews: [{ id: nid(), school: "najah", by: "وليّ تلميذ في 4 متوسط", stars, text, at: Date.now() }, ...w.reviews] }, ["director"], "تقييم جديد موثّق على صفحة المدرسة", "approval"))(w0);
  },

  // reception
  advance(w0: World, id: number): World {
    return ((w: World) => {
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
    })(w0);
  },
  toggleFile(w0: World, id: number, f: string): World {
    return ((w: World) => ({ ...w, reqs: map(w.reqs, id, (q) => ({ ...q, files: { ...q.files, [f]: !q.files[f] } })) }))(w0);
  },
  addAppt(w0: World, who: string, when: string, why: string): World {
    return ((w: World) => notify({ ...w, appts: [...w.appts, { id: nid(), who, when, why }] }, who === PARENT ? ["parent"] : [], `موعد مع الإدارة: ${when} — ${why}`, "schedule"))(w0);
  },

  // accounting
  confirmFee(w0: World, id: number): World {
    return ((w: World) => {
      const f = w.fees.find((x) => x.id === id)!;
      let x: World = { ...w, fees: map(w.fees, id, (y) => ({ ...y, status: "confirmed" })) };
      x = notify(x, ["director"], `تحصيل ${f.amount.toLocaleString("fr-FR")} دج — ${f.pupil}`, "fee");
      if (f.pupil === ME_CHILD) x = notify(x, ["parent"], `أكّدت المحاسبة استلام مستحقات ${f.month}`, "fee");
      return x;
    })(w0);
  },
  rejectFee(w0: World, id: number): World {
    return ((w: World) => {
      const f = w.fees.find((x) => x.id === id)!;
      const x = { ...w, fees: map(w.fees, id, (y) => ({ ...y, status: "due" as const, method: undefined })) };
      return f.pupil === ME_CHILD ? notify(x, ["parent"], "الوصل غير واضح — أعد رفعه من فضلك", "fee") : x;
    })(w0);
  },
  remind(w0: World, ids: number[]): World {
    return ((w: World) => {
      const x = { ...w, fees: w.fees.map((f) => (ids.includes(f.id) ? { ...f, reminded: true } : f)) };
      const mine = w.fees.find((f) => ids.includes(f.id) && f.pupil === ME_CHILD);
      return mine ? notify(x, ["parent"], `تذكير: مستحقات ${mine.month} لآدم (${mine.amount.toLocaleString("fr-FR")} دج)`, "fee") : x;
    })(w0);
  },
  askDiscount(w0: World, pupil: string): World {
    return ((w: World) => notify({ ...w, approvals: [{ id: nid(), from: "accounting", title: `تخفيض لعائلة ${pupil.split(" ")[1] ?? pupil}`, detail: `طلب تخفيض 10٪ على مستحقات ${pupil}`, status: "pending" }, ...w.approvals] }, ["director"], "طلب موافقة جديد من المحاسبة", "approval"))(w0);
  },

  // supervisor
  decideJustification(w0: World, id: number, ok: boolean): World {
    return ((w: World) => {
      const a = w.absences.find((x) => x.id === id)!;
      let x: World = { ...w, absences: map(w.absences, id, (y) => ({ ...y, status: ok ? "justified" : "rejected" })) };
      if (a.pupil === ME_CHILD) x = notify(x, ["parent"], ok ? "قُبل تبرير غياب آدم" : "رُفض تبرير غياب آدم — تواصل مع المستشار", "absence");
      x = notify(x, ["director"], `${ok ? "غياب مبرَّر" : "تبرير مرفوض"}: ${a.pupil}`, "absence");
      return x;
    })(w0);
  },
  addIncident(w0: World, pupil: string, text: string): World {
    return ((w: World) => {
      let x: World = { ...w, incidents: [{ id: nid(), pupil, text, at: Date.now() }, ...w.incidents] };
      if (pupil === ME_CHILD) x = notify(x, ["parent"], `ملاحظة انضباط: ${text}`, "discipline");
      return notify(x, ["director"], `انضباط: ${pupil} — ${text}`, "discipline");
    })(w0);
  },
  convoke(w0: World, pupil: string, when: string, reason: string): World {
    return ((w: World) => {
      let x: World = { ...w, convocations: [{ id: nid(), pupil, when, reason, status: "sent" }, ...w.convocations] };
      if (pupil === ME_CHILD) x = notify(x, ["parent"], `استدعاء: ${when} — ${reason}`, "discipline");
      return x;
    })(w0);
  },
  changeSession(w0: World, id: number, change: string): World {
    return ((w: World) => {
      const s = w.sessions.find((x) => x.id === id)!;
      const txt = `${s.day} ${s.time} (${s.subject}): ${change}`;
      return notify({ ...w, sessions: map(w.sessions, id, (y) => ({ ...y, change })) }, ["student", "parent", "teacher"], `تعديل في استعمال الزمن — ${txt}`, "schedule");
    })(w0);
  },

  // director
  decide(w0: World, id: number, ok: boolean): World {
    return ((w: World) => {
      const a = w.approvals.find((x) => x.id === id)!;
      let x: World = { ...w, approvals: map(w.approvals, id, (y) => ({ ...y, status: ok ? "approved" : "refused" })) };
      if (a.reqId) {
        const r = x.reqs.find((q) => q.id === a.reqId)!;
        x = { ...x, reqs: map(x.reqs, a.reqId, (q) => ({ ...q, waiting: false, stage: ok ? 3 : q.stage })) };
        if (r.mine && ok) x = notify(x, ["parent"], `قُبل ${r.child} في ${info(w).name} — أكمل الملف للتسجيل`, "request");
      }
      return notify(x, [a.from], `${ok ? "وافق" : "رفض"} المدير: ${a.title}`, "approval");
    })(w0);
  },
  togglePerm(w0: World, id: number, p: string): World {
    return ((w: World) => ({ ...w, staff: map(w.staff, id, (s) => ({ ...s, perms: { ...s.perms, [p]: !s.perms[p] } })) }))(w0);
  },
  announce(w0: World, text: string, from: string): World {
    return ((w: World) => notify({ ...w, announcements: [{ id: nid(), from, text, at: Date.now() }, ...w.announcements] }, ["parent", "student", "teacher"], `إعلان من ${from}: ${text}`, "announce"))(w0);
  },
  reply(w0: World, id: number, text: string): World {
    return ((w: World) => ({ ...w, reviews: map(w.reviews, id, (r) => ({ ...r, reply: text })) }))(w0);
  },

  // jobs (public board) and hiring (director)
  postJob(w0: World, title: string, kind: Job["kind"], hours: string, note: string): World {
    return ((w: World) => notify({ ...w, jobs: [{ id: nid(), school: "najah", title, kind, hours, note, open: true }, ...w.jobs] }, ["jobs"], `عرض عمل جديد: ${title} — ${info(w).name}`, "request"))(w0);
  },
  applyJob(w0: World, jobId: number, name: string, exp: string): World {
    return ((w: World) => {
      const j = w.jobs.find((x) => x.id === jobId)!;
      const x: World = { ...w, applications: [{ id: nid(), jobId, name, exp, status: "new", at: Date.now() }, ...w.applications] };
      return j.school === "najah" ? notify(x, ["director"], `طلب توظيف جديد: ${name} — ${j.title}`, "request") : x;
    })(w0);
  },
  decideApplication(w0: World, id: number, ok: boolean): World {
    return ((w: World) => {
      const a = w.applications.find((x) => x.id === id)!;
      const x: World = { ...w, applications: map(w.applications, id, (y) => ({ ...y, status: ok ? "interview" : "declined" })) };
      return notify(x, ["jobs"], ok ? `${a.name}: دُعيت لمقابلة في ${info(w).name}` : `${a.name}: شكرًا لاهتمامك، لم يُقبل الطلب هذه المرة`, "approval");
    })(w0);
  },
  closeJob(w0: World, id: number): World {
    return ((w: World) => ({ ...w, jobs: map(w.jobs, id, (j) => ({ ...j, open: false })) }))(w0);
  },

  // gate: entries and exits checked against class attendance
  gateMark(w0: World, pupil: string, dir: "in" | "out", time: string): World {
    return ((w: World) => {
      const has = w.gate.some((g) => g.pupil === pupil);
      const gate = has ? w.gate.map((g) => (g.pupil === pupil ? { ...g, [dir]: time } : g)) : [...w.gate, { pupil, [dir]: time }];
      const x: World = { ...w, gate };
      if (pupil !== ME_CHILD) return x;
      return notify(x, ["parent", "student"], dir === "in" ? `دخل آدم إلى المدرسة على الساعة ${time}` : `خرج آدم من المدرسة على الساعة ${time}`, "schedule");
    })(w0);
  },

  // student
  toggleHomework(w0: World, id: number): World {
    return ((w: World) => ({ ...w, homework: map(w.homework, id, (h) => ({ ...h, done: !h.done })) }))(w0);
  },
};

export type ActionName = keyof typeof reducers;
export type ActionArgs<K extends ActionName> = (typeof reducers)[K] extends (w: World, ...a: infer A) => World ? A : never;

export function applyAction(w: World, name: string, args: unknown[]): World | null {
  if (!Object.prototype.hasOwnProperty.call(reducers, name)) return null;
  const fn = reducers[name as ActionName] as unknown as (w: World, ...a: unknown[]) => World;
  return fn(w, ...args);
}

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



// ------------------------------------------------- profile in the link (?p=)
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const encodeProfile = (p: Profile) => b64(new TextEncoder().encode(JSON.stringify(p)));
export function decodeProfile(s: string | null): Profile | undefined {
  if (!s) return undefined;
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const p = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))) as Partial<Profile>;
    if (typeof p.name !== "string" || !p.name.trim()) return undefined;
    // keep only known fields, as plain short values
    const clean = Object.fromEntries(
      Object.keys(DEFAULT_PROFILE).map((k) => {
        const d = DEFAULT_PROFILE[k as keyof Profile];
        const v = (p as Record<string, unknown>)[k];
        return [k, typeof d === "number" ? (Number.isFinite(Number(v)) ? Number(v) : d) : typeof v === "string" ? v.slice(0, 160) : d];
      }),
    ) as Profile;
    if (!["school", "language", "training", "support"].includes(clean.kind)) clean.kind = "school";
    return clean;
  } catch {
    return undefined;
  }
}
