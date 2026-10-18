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
  najah: {
    label: "مدرسة النجاح — باب الزوار",
    profile: {
      name: "مدرسة النجاح", area: "باب الزوار", kind: "school", levels: "تحضيري، ابتدائي", group: "5 ابتدائي — أ",
      teacher: "فاطمة زروقي", teacherTitle: "الأستاذة", learnerTitle: "التلميذ", subject: "الرياضيات",
      fee: 15000, regFee: 10000, length: "3 فصول (سبتمبر – جوان)", diploma: "التحضير لامتحان نهاية الطور الابتدائي", hours: "08:00 – 16:00", pupils: 210,
    },
  },
  rouad: {
    label: "مدرسة الروّاد — باب الزوار",
    profile: {
      name: "مدرسة الروّاد", area: "باب الزوار", kind: "school", levels: "ابتدائي، متوسط", group: "4 متوسط — ب",
      teacher: "عبد الحق مسعودي", teacherTitle: "الأستاذ", learnerTitle: "التلميذ", subject: "الفيزياء",
      fee: 17000, regFee: 12000, length: "3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية: الابتدائي والمتوسط", hours: "07:45 – 16:30", pupils: 320,
    },
  },
  itqan: {
    label: "مدرسة الإتقان — باب الزوار",
    profile: {
      name: "مدرسة الإتقان", area: "باب الزوار", kind: "school", levels: "تحضيري، ابتدائي، متوسط", group: "3 متوسط — أ",
      teacher: "نسيمة بوزيد", teacherTitle: "الأستاذة", learnerTitle: "التلميذ", subject: "اللغة العربية",
      fee: 16000, regFee: 12000, length: "3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية: الابتدائي والمتوسط", hours: "07:45 – 16:00", pupils: 260,
    },
  },
  fajr: {
    label: "مجموعة الفجر المدرسية — الدار البيضاء",
    profile: {
      name: "مجموعة الفجر المدرسية", area: "الدار البيضاء", kind: "school", levels: "تحضيري، ابتدائي، متوسط، ثانوي", group: "1 ثانوي — علوم",
      teacher: "رشيد عمراني", teacherTitle: "الأستاذ", learnerTitle: "التلميذ", subject: "العلوم الطبيعية",
      fee: 20000, regFee: 15000, length: "3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية حتى البكالوريا", hours: "07:45 – 16:30", pupils: 540,
    },
  },
  maarifa: {
    label: "مركز المعرفة — بن عكنون",
    profile: {
      name: "مركز المعرفة للغات والإعلام الآلي", area: "بن عكنون", kind: "language", levels: "إنجليزية، فرنسية، إعلام آلي مكتبي", group: "فرنسية A2 — مسائي",
      teacher: "ليلى حمدي", teacherTitle: "الأستاذة", learnerTitle: "المتعلّم", subject: "الفرنسية",
      fee: 5500, regFee: 2000, length: "دورة شهرين لكل مستوى", diploma: "شهادة مستوى من المركز", hours: "مسائي والسبت", pupils: 130,
    },
  },
  jisr: {
    label: "مركز الجسر للغات — حيدرة",
    profile: {
      name: "مركز الجسر للغات", area: "حيدرة", kind: "language", levels: "إنجليزية للأطفال والكبار، تحضير IELTS وTOEFL", group: "إنجليزية B2 — IELTS",
      teacher: "سارة لوناس", teacherTitle: "الأستاذة", learnerTitle: "المتعلّم", subject: "الإنجليزية",
      fee: 9000, regFee: 3000, length: "دورة 10 أسابيع لكل مستوى", diploma: "شهادة مستوى حسب الإطار الأوروبي، وتحضير للامتحانات الدولية", hours: "مسائي وعطلة الأسبوع", pupils: 200,
    },
  },
  nokhba: {
    label: "مدرسة النخبة — حيدرة",
    profile: {
      name: "مدرسة النخبة", area: "حيدرة", kind: "school", levels: "تحضيري، ابتدائي، متوسط، ثانوي", group: "2 ثانوي — رياضيات",
      teacher: "أمينة سعدي", teacherTitle: "الأستاذة", learnerTitle: "التلميذ", subject: "الرياضيات",
      fee: 25000, regFee: 20000, length: "3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية حتى البكالوريا", hours: "08:00 – 16:30", pupils: 420,
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
