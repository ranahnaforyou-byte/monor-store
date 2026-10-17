import { DEFAULT_PROFILE, type Profile } from "./world";

/**
 * Ready-made institution profiles. Fictional names; each one mirrors only the
 * area, type and offer of a real target, never its name, logo or address.
 * `?school=<key>` opens one directly; the builder page starts from these.
 */
export const PRESETS: Record<string, { label: string; template?: boolean; profile: Profile }> = {
  ofoq: { label: "قالب: مدرسة خاصة", template: true, profile: DEFAULT_PROFILE },
  lang: {
    label: "قالب: مركز لغات",
    template: true,
    profile: {
      name: "مركز البيان للغات", area: "بن عكنون", kind: "language", levels: "إنجليزية، فرنسية، ألمانية، تحضير IELTS", group: "إنجليزية B1 — مسائي",
      teacher: "كريمة بلعيد", teacherTitle: "الأستاذة", learnerTitle: "المتعلّم", subject: "الإنجليزية",
      fee: 6000, regFee: 2000, length: "دورة 3 أشهر لكل مستوى (A1 إلى C1)", diploma: "شهادة مستوى من المركز حسب الإطار الأوروبي", hours: "مسائي وعطلة الأسبوع", pupils: 160,
    },
  },
  train: {
    label: "قالب: مركز تكوين مهني",
    template: true,
    profile: {
      name: "أكاديمية لمسة للحلاقة والتجميل", area: "بودواو", kind: "training", levels: "حلاقة نسائية، تجميل، ماكياج", group: "حلاقة — فوج صباحي",
      teacher: "سهام قاسمي", teacherTitle: "المكوّنة", learnerTitle: "المتربّصة", subject: "الحلاقة",
      fee: 8000, regFee: 5000, length: "6 أشهر، تطبيق يومي", diploma: "شهادة تأهيل مهني من مؤسسة معتمدة", hours: "صباحي", pupils: 90,
    },
  },
  qalam: {
    label: "مركز القلم للتكوين — الرويبة",
    profile: {
      name: "مركز القلم للتكوين", area: "الرويبة", kind: "training", levels: "إعلام آلي، محاسبة، فرنسية وإنجليزية", group: "إعلام آلي — فوج أ",
      teacher: "يوسف بن عمر", teacherTitle: "المكوّن", learnerTitle: "المتربّص", subject: "الإعلام الآلي",
      fee: 7000, regFee: 3000, length: "3 إلى 6 أشهر حسب التخصص", diploma: "شهادة تكوين من مؤسسة معتمدة", hours: "صباحي ومسائي", pupils: 140,
    },
  },
  riyada: {
    label: "معهد الريادة للتكوين — الرويبة",
    profile: {
      name: "معهد الريادة للتكوين", area: "الرويبة", kind: "training", levels: "إنجليزية وفرنسية مهنية، QHSE، السلامة المهنية", group: "إنجليزية مهنية — فوج B1",
      teacher: "نوال شريفي", teacherTitle: "المكوّنة", learnerTitle: "المتربّص", subject: "الإنجليزية المهنية",
      fee: 9000, regFee: 4000, length: "دورات من 2 إلى 3 أشهر، وتكوين داخل المؤسسات", diploma: "شهادة تكوين معتمدة، وشهادة حضور للمؤسسات", hours: "مسائي والسبت", pupils: 180,
    },
  },
  kafaa: {
    label: "معهد الكفاءة للتكوين — الرويبة",
    profile: {
      name: "معهد الكفاءة للتكوين", area: "الرويبة", kind: "training", levels: "QHSE، تسيير الموارد البشرية، السلامة في العمل", group: "QHSE — فوج مسائي",
      teacher: "مراد حمودي", teacherTitle: "المكوّن", learnerTitle: "المتربّص", subject: "QHSE",
      fee: 10000, regFee: 5000, length: "6 أشهر مع تربص في مؤسسة", diploma: "شهادة تكوين من مؤسسة معتمدة لدى قطاع التكوين المهني", hours: "مسائي", pupils: 120,
    },
  },
};
