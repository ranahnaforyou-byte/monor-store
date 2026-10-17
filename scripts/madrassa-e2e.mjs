/**
 * MA DRASSA — multi-phone network test.
 *
 * Plays every role as its own "phone" in one shared session (room) and walks
 * the whole school scenario: each phone sends its actions to the server, every
 * phone polls like the real app does, and the test checks that each action
 * reached exactly the role it should (red badge note) and that the data moved.
 * Ends with simultaneous actions from several phones (no lost updates).
 *
 *   node scripts/madrassa-e2e.mjs                       # https://hanout-demo.vercel.app
 *   node scripts/madrassa-e2e.mjs http://localhost:3107 # local dev server
 */

const BASE = (process.argv[2] ?? "https://hanout-demo.vercel.app").replace(/\/$/, "");
const ROLES = ["director", "supervisor", "reception", "accounting", "teacher", "parent", "student", "directory", "jobs"];
const ADAM = "آدم بوعلام";

let passed = 0;
let failed = 0;
const ok = (cond, label) => {
  if (cond) passed++;
  else failed++;
  console.log(`${cond ? "  ✓" : "  ✗"} ${label}`);
};

async function api(path, init) {
  const r = await fetch(`${BASE}/api/madrassa/room${path}`, { cache: "no-store", ...init });
  return { status: r.status, body: r.status === 204 ? null : await r.json().catch(() => null) };
}

// --------------------------------------------------------------- the phones
const created = await api("", { method: "POST" });
if (created.status !== 200) {
  console.error("Could not create a session:", created.status);
  process.exit(1);
}
const code = created.body.code;
console.log(`Session ${code} on ${BASE} — ${ROLES.length} phones\n`);

const phones = Object.fromEntries(ROLES.map((r) => [r, { role: r, v: 0, world: null, seen: new Set() }]));

async function pull(p) {
  const { status, body } = await api(`/${code}?v=${p.v}`);
  if (status === 200) {
    p.v = body.v;
    p.world = body.world;
  }
  return status;
}
const pullAll = () => Promise.all(Object.values(phones).map(pull));

async function send(role, action, ...args) {
  const { status, body } = await api(`/${code}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, args }),
  });
  if (status !== 200) throw new Error(`${role} → ${action}: HTTP ${status} ${JSON.stringify(body)}`);
  await pullAll();
  return body.world;
}

/** Did `role`'s own phone receive a new note containing `text`? */
function got(role, text) {
  const p = phones[role];
  const hit = p.world.notes.find((n) => n.to === role && !n.read && !p.seen.has(n.id) && n.text.includes(text));
  if (hit) p.seen.add(hit.id);
  return !!hit;
}
const w = () => phones.director.world;

// ----------------------------------------------------------------- scenario
await pullAll();
ok(Object.values(phones).every((p) => p.v === 1), "all 9 phones joined the same session (v1)");

console.log("\nAbsence → parent → supervisor → director");
await send("teacher", "sendAttendance", [ADAM]);
ok(got("parent", "غياب آدم"), "parent phone: absence alert");
ok(got("supervisor", "غياب في"), "supervisor phone: class absences");
await send("supervisor", "gateMark", ADAM, "in", "07:58");
ok(got("parent", "دخل آدم"), "parent phone: gate entry 07:58");
ok(got("student", "دخل آدم"), "student phone: gate entry");
ok(w().gate.find((g) => g.pupil === ADAM)?.in === "07:58", "gate shows Adam in (absent in class → red check for supervisor)");
const abs = w().absences.find((a) => a.pupil === ADAM && a.status === "open");
await send("parent", "justify", abs.id, "موعد طبي");
ok(got("supervisor", "تبرير جديد"), "supervisor phone: justification arrived");
await send("supervisor", "decideJustification", abs.id, true);
ok(got("parent", "قُبل تبرير"), "parent phone: justification accepted");
ok(got("director", "غياب مبرَّر"), "director phone: justified absence in live feed");

console.log("\nFees → accounting → director");
const fee = w().fees.find((f) => f.pupil === ADAM && f.status === "due");
await send("parent", "uploadReceipt", fee.id, "بريدي موب");
ok(got("accounting", "وصل دفع جديد"), "accounting phone: receipt to confirm");
await send("accounting", "confirmFee", fee.id);
ok(got("parent", "أكّدت المحاسبة"), "parent phone: payment confirmed");
ok(got("director", "تحصيل"), "director phone: collection");
await send("accounting", "remind", [w().fees.find((f) => f.status === "late").id]);
ok(w().fees.some((f) => f.reminded), "late payer reminded");

console.log("\nRegistration → reception → director approval → accounting");
await send("directory", "register", "najah", "مدرسة الأفق", "نور بوعلام", "1 متوسط");
ok(got("reception", "طلب تسجيل جديد"), "reception phone: new request");
ok(got("parent", "أُرسل طلب تسجيل"), "parent phone: request tracked");
const req = w().reqs.find((r) => r.child === "نور بوعلام");
await send("reception", "advance", req.id);
await send("reception", "advance", req.id);
ok(got("parent", "موعد اختبار مستوى"), "parent phone: level-test appointment");
await send("reception", "advance", req.id);
ok(got("director", "طلب موافقة: قبول"), "director phone: admission approval");
const appr = w().approvals.find((a) => a.reqId === req.id);
await send("director", "decide", appr.id, true);
ok(got("parent", "قُبل نور"), "parent phone: admitted");
ok(got("reception", "وافق المدير"), "reception phone: director approved");
for (const f of Object.keys(w().reqs.find((r) => r.id === req.id).files)) await send("reception", "toggleFile", req.id, f);
await send("reception", "advance", req.id);
ok(got("accounting", "تلميذ جديد مسجّل"), "accounting phone: new pupil fees created");
ok(got("director", "تسجيل جديد"), "director phone: new enrolment");
ok(w().fees.some((f) => f.pupil === "نور بوعلام"), "fee line exists for the new pupil");

console.log("\nTeaching: grades, homework, announcement, timetable");
await send("teacher", "publishExam");
ok(got("parent", "نقطة آدم"), "parent phone: grade");
ok(got("student", "نقطتك"), "student phone: grade");
ok(got("director", "نُشرت نقاط"), "director phone: results published");
await send("teacher", "addHomework", "الرياضيات", "تمارين الصفحة 51", "الأربعاء");
ok(got("student", "واجب جديد"), "student phone: homework");
ok(got("parent", "واجب جديد"), "parent phone: homework");
await send("director", "announce", "اجتماع الأولياء الخميس", "المديرة");
ok(["parent", "student", "teacher"].every((r) => got(r, "إعلان من المديرة")), "announcement reached parent, student, teacher");
await send("supervisor", "changeSession", 5, "ملغاة — غياب الأستاذ");
ok(["student", "parent", "teacher"].every((r) => got(r, "تعديل في استعمال الزمن")), "timetable change reached student, parent, teacher");

console.log("\nDiscipline and private messages");
await send("supervisor", "convoke", ADAM, "الأربعاء 15:00", "تأخرات");
ok(got("parent", "استدعاء"), "parent phone: convocation");
await send("parent", "confirmConvocation", w().convocations.find((c) => c.pupil === ADAM && c.status === "sent").id);
ok(got("supervisor", "أكّد حضور"), "supervisor phone: parent confirmed");
await send("parent", "sendMessage", 1, "parent", "شكرًا أستاذة");
ok(got("teacher", "رسالة من وليّ آدم"), "teacher phone: private message");
await send("teacher", "sendMessage", 1, "teacher", "بالتوفيق");
ok(got("parent", "رسالة جديدة"), "parent phone: teacher's reply");
ok(!got("student", "رسالة"), "student phone did NOT get the private message");

console.log("\nJobs board → director");
await send("jobs", "applyJob", 1, "ليلى حمّادي", "4 سنوات");
ok(got("director", "طلب توظيف جديد"), "director phone: job application");
const app = w().applications.find((a) => a.status === "new");
await send("director", "decideApplication", app.id, true);
ok(got("jobs", "دُعيت لمقابلة"), "job seeker: invited to interview");
await send("director", "postJob", "أستاذ رياضيات", "تدريس", "دوام كامل", "ليسانس");
ok(got("jobs", "عرض عمل جديد"), "jobs board: new offer published");

console.log("\nReview (verified parent) → director reply");
await send("parent", "review", 5, "متابعة ممتازة");
ok(got("director", "تقييم جديد"), "director phone: new verified review");
const rev = w().reviews.find((r) => r.text === "متابعة ممتازة");
await send("director", "reply", rev.id, "شكرًا");
ok(phones.directory.world.reviews.find((r) => r.id === rev.id)?.reply === "شكرًا", "directory phone shows the public reply");

console.log("\nSeveral phones at the same time");
const before = w().gate.filter((g) => g.in).length;
const v0 = phones.director.v;
await Promise.all([
  api(`/${code}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "gateMark", args: ["يونس قادري", "in", "08:10"] }) }),
  api(`/${code}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "addHomework", args: ["الفيزياء", "مراجعة", "الخميس"] }) }),
  api(`/${code}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "toggleHomework", args: [1] }) }),
  api(`/${code}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "togglePerm", args: [1, "النقاط"] }) }),
]);
await pullAll();
ok(phones.director.v === v0 + 4, `4 simultaneous actions all saved (v${v0} → v${phones.director.v})`);
ok(w().gate.filter((g) => g.in).length === before + 1 && w().homework.some((h) => h.subject === "الفيزياء"), "no update was lost");
ok(new Set(Object.values(phones).map((p) => p.v)).size === 1, "all 9 phones on the same version");

console.log("\nSafety");
ok((await api(`/${code}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "constructor", args: [] }) })).status === 400, "unknown action refused");
ok((await api(`/${code}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "confirmFee", args: [999999] }) })).status === 400, "bad id refused without breaking the session");
ok((await api(`/0000`)).status === 404, "missing session → 404");
await send("director", "reset");
ok(w().absences.every((a) => a.date !== "اليوم") && w().jobs.length === 5, "reset brings every phone back to the demo start");

console.log("\nCustom institution (profile) session");
const QALAM = { name: "مركز القلم للتكوين", area: "الرويبة", kind: "training", levels: "إعلام آلي، محاسبة", group: "إعلام آلي — فوج أ", teacher: "يوسف بن عمر", teacherTitle: "المكوّن", learnerTitle: "المتربّص", subject: "الإعلام الآلي", fee: 7000, regFee: 3000, length: "3 إلى 6 أشهر", diploma: "شهادة تكوين", hours: "صباحي ومسائي", pupils: 140 };
const c2 = await api("", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profile: QALAM }) });
const room2 = c2.body.code;
const post2 = (action, ...args) => api(`/${room2}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, args }) });
let w2 = (await api(`/${room2}?v=0`)).body.world;
ok(w2.profile?.name === QALAM.name && w2.exam.title.includes("الإعلام الآلي"), "session starts with the institution's own name and subject");
w2 = (await post2("sendAttendance", [ADAM])).body.world;
ok(w2.notes.some((n) => n.to === "supervisor" && n.text.includes("إعلام آلي — فوج أ")), "notes use the institution's group name");
ok(w2.notes.some((n) => n.to === "parent" && n.text.includes("حصة الإعلام الآلي")), "parent alert uses the institution's subject");
w2 = (await post2("reset")).body.world;
ok(w2.profile?.name === QALAM.name && w2.absences.every((a) => a.date !== "اليوم"), "reset keeps the institution");
ok((await api("", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profile: { name: "", kind: "x" } }) })).status === 200, "bad profile falls back safely");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
