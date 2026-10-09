import "server-only";
import { randomBytes } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { WILAYAS } from "@/lib/algeria/wilayas";
import { HANOUT_IMAGES } from "@/lib/hanout-image-manifest";
import { formatDZD } from "@/lib/money";
import { changeOrderStatus } from "@/server/services/admin-orders";
import type { AdminRole, ConfirmOutcome, OrderStatus, Prisma } from "@/generated/prisma";

/**
 * Hanout «النظام» — the expo demo layer on top of MONOR.
 * Departments + team chat + confirmation desk. All demo data is idempotent and
 * can be reset between booth visitors (leads are never deleted).
 */

// --------------------------------------------------------------------------
// Static demo world
// --------------------------------------------------------------------------

export const DEPARTMENTS = [
  { slug: "confirm", name: "التأكيد", position: 1 },
  { slug: "prepare", name: "التحضير", position: 2 },
  { slug: "ship", name: "الشحن", position: 3 },
] as const;
export type DeptSlug = (typeof DEPARTMENTS)[number]["slug"];

export const CHANNELS = [
  { slug: "team", name: "الفريق", position: 0, dept: null },
  { slug: "confirm", name: "التأكيد", position: 1, dept: "confirm" },
  { slug: "prepare", name: "التحضير", position: 2, dept: "prepare" },
  { slug: "ship", name: "الشحن", position: 3, dept: "ship" },
] as const;
export type ChannelSlug = (typeof CHANNELS)[number]["slug"];

/** Which order status each department works on. */
export const DEPT_STATUSES: Record<DeptSlug, OrderStatus[]> = {
  confirm: ["PENDING"],
  prepare: ["CONFIRMED"],
  ship: ["PREPARING", "SHIPPED"],
};

export const COURIERS = ["Yalidine", "ZR Express", "Maystro", "NOEST", "Ecotrack"] as const;

export type DemoRoleKey = "owner" | "manager" | "confirm" | "prepare" | "ship";

type StaffSeed = {
  key: string;
  email: string;
  name: string;
  title: string;
  role: AdminRole;
  dept: DeptSlug | null;
  demoRole?: DemoRoleKey;
};

export const STAFF: StaffSeed[] = [
  { key: "owner", email: "owner@hanout.demo", name: "ياسين بلقاسم", title: "صاحب المتجر", role: "OWNER", dept: null, demoRole: "owner" },
  { key: "manager", email: "manager@hanout.demo", name: "أمينة دراجي", title: "مديرة الفريق", role: "MANAGER", dept: null, demoRole: "manager" },
  { key: "sara", email: "sara@hanout.demo", name: "سارة منصوري", title: "مسؤولة التأكيد", role: "STAFF", dept: "confirm", demoRole: "confirm" },
  { key: "karim", email: "karim@hanout.demo", name: "كريم حداد", title: "مؤكِّد الطلبات", role: "STAFF", dept: "confirm" },
  { key: "amine", email: "amine@hanout.demo", name: "أمين بن يوسف", title: "مسؤول التحضير", role: "STAFF", dept: "prepare", demoRole: "prepare" },
  { key: "yasmine", email: "yasmine@hanout.demo", name: "ياسمين قاسمي", title: "مسؤولة الشحن", role: "STAFF", dept: "ship", demoRole: "ship" },
];

const CATEGORIES = [
  { slug: "hn-home", name: "المنزل والديكور", nameFr: "Maison & déco", position: 1 },
  { slug: "hn-beauty", name: "التجميل والعناية", nameFr: "Beauté & soin", position: 2 },
  { slug: "hn-tech", name: "الإلكترونيات", nameFr: "Électronique", position: 3 },
  { slug: "hn-fashion", name: "الأزياء والإكسسوارات", nameFr: "Mode & accessoires", position: 4 },
];

export const ONE_SIZE = "مقاس واحد";

type ProductSeed = {
  slug: string;
  img: string;
  name: string;
  nameFr: string;
  cat: string;
  price: number; // DZD
  compareAt?: number;
  brand: string;
  desc: string;
  sizes?: string[];
  featured?: boolean;
  isNew?: boolean;
};

const PRODUCTS: ProductSeed[] = [
  { slug: "hn-coffee-set", img: "coffee-set", name: "طقم قهوة تقليدي بصينية", nameFr: "Service à café traditionnel", cat: "hn-home", price: 3800, brand: "Dar Noor", desc: "طقم قهوة من 6 فناجين مع إبريق وصينية نحاسية اللون. هدية مثالية للمناسبات.", featured: true },
  { slug: "hn-table-lamp", img: "table-lamp", name: "مصباح طاولة ديكور", nameFr: "Lampe de table déco", cat: "hn-home", price: 4500, brand: "Dar Noor", desc: "مصباح بإضاءة دافئة وقاعدة معدنية ثابتة، مناسب لغرفة النوم والصالون.", isNew: true },
  { slug: "hn-cookware", img: "cookware-set", name: "طقم أواني طبخ غير لاصقة", nameFr: "Batterie de cuisine antiadhésive", cat: "hn-home", price: 8900, compareAt: 9900, brand: "Kitchen Pro", desc: "قدر وطنجرة بطلاء غير لاصق، تعمل على كل أنواع المواقد." },
  { slug: "hn-care-box", img: "care-gift-box", name: "علبة هدية عناية ومنزل", nameFr: "Coffret maison & soin", cat: "hn-beauty", price: 2900, brand: "Noor Care", desc: "علبة تضم صابونًا طبيعيًا، زيت عناية، شمعة معطرة ومنشفة صغيرة.", featured: true, isNew: true },
  { slug: "hn-perfume", img: "perfume", name: "عطر شرقي فاخر 100 مل", nameFr: "Parfum oriental 100 ml", cat: "hn-beauty", price: 4900, brand: "Oud Noor", desc: "عطر بنفحات العود والعنبر، ثبات طويل طوال اليوم.", featured: true },
  { slug: "hn-moisturizer", img: "moisturizer", name: "كريم ترطيب يومي", nameFr: "Crème hydratante quotidienne", cat: "hn-beauty", price: 1600, brand: "Noor Care", desc: "كريم خفيف لكل أنواع البشرة، بزبدة الشيا والصبار." },
  { slug: "hn-earbuds", img: "wireless-earbuds", name: "سماعات لاسلكية مع علبة شحن", nameFr: "Écouteurs sans fil", cat: "hn-tech", price: 3500, compareAt: 4200, brand: "SoundGo", desc: "بلوتوث 5.3، عزل للضوضاء وبطارية حتى 24 ساعة مع العلبة.", featured: true },
  { slug: "hn-smartwatch", img: "smartwatch", name: "ساعة ذكية رياضية", nameFr: "Montre connectée sport", cat: "hn-tech", price: 6900, brand: "FitPulse", desc: "قياس النبض والخطوات والنوم، مقاومة للماء وشاشة لمس.", isNew: true },
  { slug: "hn-power-bank", img: "power-bank", name: "بطارية متنقلة 20000 مللي أمبير", nameFr: "Batterie externe 20 000 mAh", cat: "hn-tech", price: 2400, brand: "VoltX", desc: "شحن سريع لهاتفين في نفس الوقت، مؤشر رقمي للطاقة." },
  { slug: "hn-speaker", img: "bluetooth-speaker", name: "مكبر صوت بلوتوث محمول", nameFr: "Enceinte Bluetooth portable", cat: "hn-tech", price: 4200, brand: "SoundGo", desc: "صوت قوي وجهير عميق، مقاوم للرذاذ، 12 ساعة تشغيل." },
  { slug: "hn-handbag", img: "leather-handbag", name: "حقيبة يد جلدية", nameFr: "Sac à main en cuir", cat: "hn-fashion", price: 4500, brand: "Atelier Noor", desc: "جلد طبيعي بخياطة متقنة وجيوب داخلية منظمة.", featured: true },
  { slug: "hn-sneakers", img: "running-sneakers", name: "حذاء رياضي خفيف للجري", nameFr: "Baskets de running légères", cat: "hn-fashion", price: 5900, brand: "Stride", desc: "نعل مريح ومرن، تهوية ممتازة للاستعمال اليومي.", sizes: ["39", "40", "41", "42", "43", "44"], isNew: true },
];

// Seeded history so the dashboard and chat look alive on first open.
type HistorySeed = {
  name: string;
  phone: string;
  wilaya: number;
  commune: string;
  items: { slug: string; qty: number; size?: string }[];
  status: OrderStatus;
  minutesAgo: number;
  by: string; // staff key who handled the latest step
  courier?: (typeof COURIERS)[number];
  selfConfirmed?: boolean;
};

const HISTORY: HistorySeed[] = [
  { name: "محمد بلقاسم", phone: "0661234501", wilaya: 31, commune: "وهران", items: [{ slug: "hn-smartwatch", qty: 1 }], status: "DELIVERED", minutesAgo: 410, by: "yasmine", courier: "Yalidine" },
  { name: "نسرين عمراني", phone: "0770234502", wilaya: 16, commune: "باب الزوار", items: [{ slug: "hn-perfume", qty: 1 }, { slug: "hn-moisturizer", qty: 2 }], status: "DELIVERED", minutesAgo: 380, by: "yasmine", courier: "ZR Express" },
  { name: "عبد الرحمن سعدي", phone: "0550234503", wilaya: 25, commune: "قسنطينة", items: [{ slug: "hn-cookware", qty: 1 }], status: "SHIPPED", minutesAgo: 300, by: "yasmine", courier: "Maystro" },
  { name: "هند نوري", phone: "0698234504", wilaya: 9, commune: "البليدة", items: [{ slug: "hn-handbag", qty: 1 }], status: "SHIPPED", minutesAgo: 260, by: "yasmine", courier: "Yalidine" },
  { name: "ياسين كمال", phone: "0661234505", wilaya: 6, commune: "بجاية", items: [{ slug: "hn-speaker", qty: 1 }], status: "PREPARING", minutesAgo: 180, by: "amine" },
  { name: "ليلى بن علي", phone: "0770234506", wilaya: 19, commune: "سطيف", items: [{ slug: "hn-sneakers", qty: 1, size: "41" }], status: "PREPARING", minutesAgo: 150, by: "amine" },
  { name: "سفيان مرابط", phone: "0550234507", wilaya: 15, commune: "تيزي وزو", items: [{ slug: "hn-earbuds", qty: 2 }], status: "CONFIRMED", minutesAgo: 95, by: "karim" },
  { name: "أمال زروقي", phone: "0698234508", wilaya: 16, commune: "الشراقة", items: [{ slug: "hn-care-box", qty: 1 }], status: "CONFIRMED", minutesAgo: 70, by: "sara", selfConfirmed: true },
  { name: "رياض بوزيد", phone: "0661234509", wilaya: 31, commune: "بئر الجير", items: [{ slug: "hn-power-bank", qty: 1 }], status: "CONFIRMED", minutesAgo: 55, by: "sara" },
  { name: "خديجة فرحات", phone: "0770234510", wilaya: 25, commune: "الخروب", items: [{ slug: "hn-coffee-set", qty: 1 }], status: "CANCELLED", minutesAgo: 240, by: "karim" },
  { name: "إسماعيل طالب", phone: "0550234511", wilaya: 9, commune: "بوفاريك", items: [{ slug: "hn-table-lamp", qty: 1 }], status: "PENDING", minutesAgo: 34, by: "karim" },
  { name: "منال حمدي", phone: "0698234512", wilaya: 16, commune: "حيدرة", items: [{ slug: "hn-perfume", qty: 1 }], status: "PENDING", minutesAgo: 22, by: "sara" },
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

export const shortRef = (reference: string) => `#${reference.slice(-4)}`;

const centimes = (dzd: number) => dzd * 100;

function wilayaAr(code: number) {
  return WILAYAS.find((w) => w.code === code)?.nameAr ?? String(code);
}

function minutesAgo(n: number) {
  return new Date(Date.now() - n * 60_000);
}

async function staffIdsByKey() {
  const rows = await db.adminUser.findMany({
    where: { email: { in: STAFF.map((s) => s.email) } },
    select: { id: true, email: true },
  });
  const map = new Map<string, string>();
  for (const s of STAFF) {
    const r = rows.find((x) => x.email === s.email);
    if (r) map.set(s.key, r.id);
  }
  return map;
}

export async function getChannelId(slug: ChannelSlug) {
  const c = await db.channel.findUnique({ where: { slug }, select: { id: true } });
  return c?.id ?? null;
}

export async function postSystemMessage(
  channel: ChannelSlug,
  body: string,
  opts: { orderRef?: string; tone?: "new" | "confirmed" | "warning" | "done"; at?: Date; authorId?: string | null } = {},
) {
  const channelId = await getChannelId(channel);
  if (!channelId) return;
  await db.message.create({
    data: {
      channelId,
      kind: "SYSTEM",
      body,
      orderRef: opts.orderRef,
      tone: opts.tone,
      authorId: opts.authorId ?? null,
      createdAt: opts.at,
    },
  });
}

// --------------------------------------------------------------------------
// Provisioning + reset
// --------------------------------------------------------------------------

const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export async function provisionHanout() {
  // Departments + channels
  for (const d of DEPARTMENTS) {
    await db.department.upsert({ where: { slug: d.slug }, update: { name: d.name, position: d.position }, create: d });
  }
  const depts = await db.department.findMany();
  const deptId = (slug: string | null) => (slug ? depts.find((d) => d.slug === slug)?.id ?? null : null);
  for (const c of CHANNELS) {
    await db.channel.upsert({
      where: { slug: c.slug },
      update: { name: c.name, position: c.position, departmentId: deptId(c.dept) },
      create: { slug: c.slug, name: c.name, position: c.position, departmentId: deptId(c.dept) },
    });
  }

  // Demo staff — random unusable passwords; they enter through /team demo login only.
  for (const s of STAFF) {
    const existing = await db.adminUser.findUnique({ where: { email: s.email }, select: { id: true } });
    if (existing) {
      await db.adminUser.update({
        where: { id: existing.id },
        data: { name: s.name, title: s.title, role: s.role, departmentId: deptId(s.dept), disabled: false },
      });
    } else {
      await db.adminUser.create({
        data: {
          email: s.email,
          name: s.name,
          title: s.title,
          role: s.role,
          departmentId: deptId(s.dept),
          passwordHash: await hash(randomBytes(24).toString("base64url"), ARGON),
        },
      });
    }
  }

  // Store identity — the merchant running on Hanout.
  await db.storeSetting.upsert({
    where: { id: "singleton" },
    update: {
      storeName: "متجر نور",
      announcementBar: "توصيل إلى 58 ولاية · الدفع عند الاستلام · تأكيد كل طلب برسالة",
      announcementActive: true,
    },
    create: {
      id: "singleton",
      storeName: "متجر نور",
      announcementBar: "توصيل إلى 58 ولاية · الدفع عند الاستلام · تأكيد كل طلب برسالة",
      announcementActive: true,
      defaultHomeFee: 45000,
      defaultStopDeskFee: 30000,
      codEnabled: true,
    },
  });

  // Catalog: Noor's 12 products; MONOR's football catalog is archived on this branch.
  for (const c of CATEGORIES) {
    await db.category.upsert({ where: { slug: c.slug }, update: { name: c.name, nameFr: c.nameFr, position: c.position }, create: c });
  }
  await db.product.updateMany({ where: { NOT: { slug: { startsWith: "hn-" } } }, data: { status: "ARCHIVED" } });

  const cats = await db.category.findMany({ where: { slug: { in: CATEGORIES.map((c) => c.slug) } } });
  for (const p of PRODUCTS) {
    const sizes = p.sizes ?? [ONE_SIZE];
    const img = HANOUT_IMAGES[p.img];
    const url = `/uploads/hanout/${p.img}.webp`;
    const exists = await db.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (exists) continue;
    const sizeStock = sizes.map((size) => ({ size, quantity: 40 }));
    const data: Prisma.ProductCreateInput = {
      slug: p.slug,
      name: p.name,
      nameFr: p.nameFr,
      description: `${p.desc}\n\nمنتج تجريبي لعرض حانوت — الأسعار وهمية.`,
      descriptionFr: "Produit de démonstration Hanout — prix fictifs.",
      brand: p.brand,
      sku: `HN-${p.slug.slice(3).toUpperCase()}`,
      price: centimes(p.price),
      compareAtPrice: p.compareAt ? centimes(p.compareAt) : null,
      sale: Boolean(p.compareAt),
      sizes,
      colors: [],
      stock: sizeStock.reduce((s, r) => s + r.quantity, 0),
      featured: Boolean(p.featured),
      newArrival: Boolean(p.isNew),
      status: "ACTIVE",
      seoTitle: `${p.name} | متجر نور`,
      category: { connect: { id: cats.find((c) => c.slug === p.cat)!.id } },
      sizeStock: { create: sizeStock },
      images: {
        create: [
          {
            url,
            storageKey: url.slice(1),
            alt: p.name,
            position: 0,
            width: img?.w ?? 800,
            height: img?.h ?? 800,
            blurDataURL: img?.blur ?? "",
            isPrimary: true,
          },
        ],
      },
    };
    await db.product.create({ data });
  }

  if ((await db.order.count()) === 0) await seedHistory();

  return { departments: DEPARTMENTS.length, staff: STAFF.length, products: PRODUCTS.length };
}

/** Wipe orders + chat and reseed the demo history. Leads are kept. */
export async function resetHanoutDemo() {
  await db.message.deleteMany({});
  await db.paymentAttempt.deleteMany({});
  await db.inventoryMovement.deleteMany({ where: { orderId: { not: null } } });
  await db.order.deleteMany({});
  await db.customer.deleteMany({ where: { orders: { none: {} } } });
  // Restore Noor's stock.
  const products = await db.product.findMany({ where: { slug: { startsWith: "hn-" } }, select: { id: true } });
  for (const p of products) {
    await db.sizeStock.updateMany({ where: { productId: p.id }, data: { quantity: 40 } });
    const n = await db.sizeStock.count({ where: { productId: p.id } });
    await db.product.update({ where: { id: p.id }, data: { stock: n * 40 } });
  }
  await seedHistory();
}

function seedReference(i: number) {
  const yy = new Date().getFullYear().toString().slice(-2);
  return `HNT-${yy}-${String(201240 + i).padStart(6, "0")}`;
}

async function seedHistory() {
  const staff = await staffIdsByKey();
  const products = await db.product.findMany({
    where: { slug: { startsWith: "hn-" } },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const welcome = minutesAgo(480);
  await postSystemMessage("team", "مرحبًا بالفريق في حانوت. كل طلب جديد يظهر هنا وفي قسمه تلقائيًا.", { tone: "done", at: welcome });

  for (let i = 0; i < HISTORY.length; i++) {
    const h = HISTORY[i];
    const created = minutesAgo(h.minutesAgo);
    const step = (k: number) => new Date(created.getTime() + k * 7 * 60_000);
    const reference = seedReference(i);
    const lines = h.items.map((it) => {
      const p = bySlug.get(it.slug)!;
      return {
        productId: p.id,
        nameSnapshot: p.name,
        slugSnapshot: p.slug,
        imageSnapshot: p.images[0]?.url ?? null,
        unitPrice: p.price,
        size: it.size ?? ONE_SIZE,
        quantity: it.qty,
        lineTotal: p.price * it.qty,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shippingFee = 45000;
    const reached = (s: OrderStatus) =>
      ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].indexOf(h.status) >= ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].indexOf(s) &&
      h.status !== "PENDING" &&
      h.status !== "CANCELLED";

    const customer = await db.customer.upsert({
      where: { phone: h.phone },
      update: {},
      create: { phone: h.phone, name: h.name, wilayaCode: h.wilaya, wilayaName: wilayaAr(h.wilaya), communeName: h.commune, ordersCount: 1, totalSpent: subtotal + shippingFee },
    });

    const confirmerKey = h.by === "karim" ? "karim" : "sara";
    const confirmer = h.selfConfirmed ? "customer" : staff.get(confirmerKey) ?? "system";
    const events: Prisma.OrderEventCreateWithoutOrderInput[] = [
      { type: "STATUS_CHANGE", message: "Order placed (COD)", createdBy: "system", createdAt: created },
    ];
    if (reached("CONFIRMED")) events.push({ type: "STATUS_CHANGE", message: "PENDING → CONFIRMED", createdBy: confirmer, createdAt: step(1) });
    if (reached("PREPARING")) events.push({ type: "STATUS_CHANGE", message: "CONFIRMED → PREPARING", createdBy: staff.get("amine") ?? "system", createdAt: step(2) });
    if (reached("SHIPPED")) events.push({ type: "STATUS_CHANGE", message: "PREPARING → SHIPPED", createdBy: staff.get("yasmine") ?? "system", createdAt: step(3) });
    if (reached("DELIVERED")) events.push({ type: "STATUS_CHANGE", message: "SHIPPED → DELIVERED", createdBy: staff.get("yasmine") ?? "system", createdAt: step(6) });
    if (h.status === "CANCELLED") {
      events.push({ type: "CONFIRM_ATTEMPT", message: "NO_ANSWER", createdBy: staff.get(h.by) ?? "system", createdAt: step(1) });
      events.push({ type: "STATUS_CHANGE", message: "PENDING → CANCELLED", createdBy: staff.get(h.by) ?? "system", createdAt: step(3) });
    }

    await db.order.create({
      data: {
        reference,
        status: h.status,
        paymentMethod: "COD",
        paymentStatus: h.status === "DELIVERED" ? "PAID" : "UNPAID",
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        customerName: h.name,
        customerPhone: h.phone,
        wilayaCode: h.wilaya,
        wilayaName: wilayaAr(h.wilaya),
        communeName: h.commune,
        addressLine: "حي 120 مسكن، عمارة ب",
        deliveryMode: "HOME",
        customerId: customer.id,
        createdAt: created,
        confirmedAt: reached("CONFIRMED") ? step(1) : null,
        customerConfirmedAt: h.selfConfirmed ? step(1) : null,
        shippedAt: reached("SHIPPED") ? step(3) : null,
        deliveredAt: reached("DELIVERED") ? step(6) : null,
        cancelledAt: h.status === "CANCELLED" ? step(3) : null,
        courier: h.courier ?? null,
        confirmAttempts: h.status === "CANCELLED" ? 2 : reached("CONFIRMED") ? 1 : 0,
        lastOutcome: h.status === "CANCELLED" ? "NO_ANSWER" : null,
        items: { createMany: { data: lines } },
        events: { create: events },
      },
    });

    // Chat history for this order
    const r = shortRef(reference);
    await postSystemMessage("confirm", `طلب جديد ${r} · ${h.name} · ${wilayaAr(h.wilaya)} · ${formatDZD(subtotal + shippingFee)}`, { orderRef: reference, tone: "new", at: created });
    if (reached("CONFIRMED")) {
      const who = h.selfConfirmed
        ? "الزبون أكّد بنفسه عبر الرابط"
        : confirmerKey === "karim"
          ? "كريم أكّد الطلب"
          : "سارة أكّدت الطلب";
      await postSystemMessage("confirm", `${who} ${r}`, { orderRef: reference, tone: "confirmed", at: step(1) });
      await postSystemMessage("prepare", `طلب جاهز للتحضير ${r} · ${lines.length} منتج`, { orderRef: reference, tone: "new", at: step(1) });
    }
    if (reached("PREPARING")) {
      await postSystemMessage("prepare", `أمين جهّز الطلب ${r} للشحن`, { orderRef: reference, tone: "done", at: step(2) });
      await postSystemMessage("ship", `طرد جديد جاهز ${r} · ${wilayaAr(h.wilaya)}`, { orderRef: reference, tone: "new", at: step(2) });
    }
    if (reached("SHIPPED")) await postSystemMessage("ship", `ياسمين سلّمت ${r} إلى ${h.courier}`, { orderRef: reference, tone: "done", at: step(3) });
    if (reached("DELIVERED")) await postSystemMessage("ship", `وصل الطلب ${r} إلى الزبون وتم الدفع`, { orderRef: reference, tone: "confirmed", at: step(6) });
    if (h.status === "CANCELLED") {
      await postSystemMessage("confirm", `كريم: الزبون لم يرد على ${r} (محاولتان) — تم الإلغاء`, { orderRef: reference, tone: "warning", at: step(3) });
    }
  }

  // A few human messages so the groups feel used.
  const human: { ch: ChannelSlug; who: string; body: string; ago: number }[] = [
    { ch: "team", who: "owner", body: "صباح الخير للجميع، هدفنا اليوم 50 طلبًا مؤكدًا.", ago: 420 },
    { ch: "team", who: "manager", body: "تذكير: الطرود الجاهزة تُسلَّم لشركة التوصيل قبل الساعة 3 مساءً.", ago: 200 },
    { ch: "confirm", who: "sara", body: "سأتصل بطلبات وهران الآن، كريم خذ طلبات قسنطينة.", ago: 120 },
    { ch: "confirm", who: "karim", body: "تمام، عندي 3 مكالمات متبقية.", ago: 115 },
    { ch: "prepare", who: "amine", body: "نفد ورق التغليف الكبير، أحتاج طلبية جديدة.", ago: 140 },
    { ch: "ship", who: "yasmine", body: "مندوب Yalidine يمر الساعة 2:30.", ago: 90 },
  ];
  for (const m of human) {
    const channelId = await getChannelId(m.ch);
    const authorId = staff.get(m.who);
    if (!channelId || !authorId) continue;
    await db.message.create({ data: { channelId, authorId, kind: "TEXT", body: m.body, createdAt: minutesAgo(m.ago) } });
  }
}

// --------------------------------------------------------------------------
// Live order flow (called from server actions)
// --------------------------------------------------------------------------

export async function notifyNewOrder(reference: string) {
  const o = await db.order.findUnique({ where: { reference }, include: { items: true } });
  if (!o) return;
  await postSystemMessage(
    "confirm",
    `طلب جديد ${shortRef(reference)} · ${o.customerName} · ${o.wilayaName} · ${formatDZD(o.total)}`,
    { orderRef: reference, tone: "new" },
  );
}

type Actor = { id: string; name: string } | "customer";

/** Moves an order one step and posts the matching team-chat messages. */
export async function advanceOrder(orderId: string, next: OrderStatus, actor: Actor, courier?: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new Error("not found");
  const actorId = actor === "customer" ? "customer" : actor.id;
  const actorName = actor === "customer" ? "الزبون" : actor.name.split(" ")[0];

  if (next === "SHIPPED" && courier) {
    await db.order.update({ where: { id: orderId }, data: { courier } });
  }
  await changeOrderStatus(orderId, next, actorId);
  if (next === "CONFIRMED" && actor === "customer") {
    await db.order.update({ where: { id: orderId }, data: { customerConfirmedAt: new Date() } });
  }
  if (next === "CONFIRMED" && actor !== "customer") {
    await db.order.update({ where: { id: orderId }, data: { confirmAttempts: { increment: 1 } } });
  }

  const r = shortRef(order.reference);
  const ref = order.reference;
  switch (next) {
    case "CONFIRMED":
      await postSystemMessage(
        "confirm",
        actor === "customer" ? `الزبون أكّد الطلب ${r} بنفسه عبر الرابط` : `${actorName} أكّد الطلب ${r}`,
        { orderRef: ref, tone: "confirmed" },
      );
      await postSystemMessage("prepare", `طلب جاهز للتحضير ${r} · ${order.items.length} منتج`, { orderRef: ref, tone: "new" });
      break;
    case "PREPARING":
      await postSystemMessage("prepare", `${actorName} جهّز الطلب ${r} للشحن`, { orderRef: ref, tone: "done" });
      await postSystemMessage("ship", `طرد جديد جاهز ${r} · ${order.wilayaName}`, { orderRef: ref, tone: "new" });
      break;
    case "SHIPPED":
      await postSystemMessage("ship", `${actorName} سلّم ${r} إلى ${courier ?? order.courier ?? "شركة التوصيل"}`, { orderRef: ref, tone: "done" });
      break;
    case "DELIVERED":
      await postSystemMessage("ship", `وصل الطلب ${r} إلى الزبون وتم الدفع`, { orderRef: ref, tone: "confirmed" });
      break;
    case "CANCELLED":
      await postSystemMessage(
        "confirm",
        actor === "customer" ? `الزبون ألغى الطلب ${r}` : `${actorName} ألغى الطلب ${r}`,
        { orderRef: ref, tone: "warning" },
      );
      break;
  }
}

const OUTCOME_TEXT: Record<ConfirmOutcome, string> = {
  NO_ANSWER: "لم يرد",
  POSTPONED: "طلب التأجيل",
  WRONG_NUMBER: "رقم خاطئ",
};

export async function recordOutcome(orderId: string, outcome: ConfirmOutcome, actor: { id: string; name: string }) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { lastOutcome: outcome, lastOutcomeAt: new Date(), confirmAttempts: { increment: 1 } },
  });
  await db.orderEvent.create({
    data: { orderId, type: "CONFIRM_ATTEMPT", message: outcome, createdBy: actor.id },
  });
  const first = actor.name.split(" ")[0];
  const r = shortRef(order.reference);
  if (outcome === "WRONG_NUMBER") {
    await changeOrderStatus(orderId, "CANCELLED", actor.id);
    await postSystemMessage("confirm", `${first}: رقم خاطئ في ${r} — أُلغي الطلب وأُضيف الرقم للمراقبة`, { orderRef: order.reference, tone: "warning" });
    return;
  }
  await postSystemMessage(
    "confirm",
    `${first}: الزبون ${OUTCOME_TEXT[outcome]} في ${r} (المحاولة ${order.confirmAttempts})`,
    { orderRef: order.reference, tone: "warning" },
  );
}

// --------------------------------------------------------------------------
// Read models
// --------------------------------------------------------------------------

export async function getTeamMembers() {
  return db.adminUser.findMany({
    where: { email: { in: STAFF.map((s) => s.email) } },
    include: { department: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDeptOrders(dept: DeptSlug) {
  return db.order.findMany({
    where: { status: { in: DEPT_STATUSES[dept] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function getDeptCounts() {
  const groups = await db.order.groupBy({ by: ["status"], _count: { _all: true } });
  const n = (s: OrderStatus) => groups.find((g) => g.status === s)?._count._all ?? 0;
  return {
    confirm: n("PENDING"),
    prepare: n("CONFIRMED"),
    ship: n("PREPARING") + n("SHIPPED"),
    byStatus: Object.fromEntries(groups.map((g) => [g.status, g._count._all])) as Partial<Record<OrderStatus, number>>,
  };
}

export async function getChannelMessages(slug: ChannelSlug, take = 40) {
  const channel = await db.channel.findUnique({ where: { slug } });
  if (!channel) return [];
  const rows = await db.message.findMany({
    where: { channelId: channel.id },
    include: { author: { select: { id: true, name: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.reverse();
}

export async function getLeaderboard() {
  const members = await getTeamMembers();
  const events = await db.orderEvent.groupBy({
    by: ["createdBy"],
    where: { createdBy: { in: members.map((m) => m.id) } },
    _count: { _all: true },
  });
  return members
    .filter((m) => m.role === "STAFF")
    .map((m) => ({
      id: m.id,
      name: m.name,
      title: m.title,
      dept: m.department?.name ?? "",
      score: events.find((e) => e.createdBy === m.id)?._count._all ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
}

export async function getOwnerKpis() {
  const counts = await getDeptCounts();
  const s = counts.byStatus;
  const confirmed = (s.CONFIRMED ?? 0) + (s.PREPARING ?? 0) + (s.SHIPPED ?? 0) + (s.DELIVERED ?? 0) + (s.RETURNED ?? 0);
  const decided = confirmed + (s.CANCELLED ?? 0);
  const total = decided + (s.PENDING ?? 0);
  const revenue = await db.order.aggregate({
    where: { status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] } },
    _sum: { total: true },
  });
  const selfConfirmed = await db.order.count({ where: { customerConfirmedAt: { not: null } } });
  const leads = await db.lead.count();
  return {
    total,
    confirmRate: decided ? Math.round((confirmed / decided) * 100) : 0,
    pending: s.PENDING ?? 0,
    inShipping: (s.PREPARING ?? 0) + (s.SHIPPED ?? 0),
    delivered: s.DELIVERED ?? 0,
    cancelled: s.CANCELLED ?? 0,
    revenue: revenue._sum.total ?? 0,
    selfConfirmed,
    leads,
    byStatus: s,
  };
}

/** The most recent order, for the live «النظام» page. */
export async function getSpotlightOrder() {
  return db.order.findFirst({
    where: { status: { notIn: ["CANCELLED", "RETURNED"] } },
    orderBy: { createdAt: "desc" },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getOrderTimeline(reference: string) {
  return db.order.findUnique({
    where: { reference },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
}
