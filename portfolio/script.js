// ===== Edit here: contact details (leave "" to hide a button) =====
const CONTACT = {
  whatsapp: "",   // international format without "+", e.g. "213555000000"
  instagram: "",  // username only, e.g. "everest.digital"
  email: "",      // e.g. "contact@example.com"
  phone: "",      // e.g. "+213 555 00 00 00"
};

// ===== MA DRASSA role tabs =====
const ROLES = {
  director: {
    label: "المدير",
    desc: "التلاميذ، المحصّل والمتأخرات، غيابات اليوم، «ما يحدث الآن»، نتائج الأقسام، الموافقات وصلاحيات الموظفين.",
  },
  teacher: {
    label: "الأستاذة",
    desc: "الحضور والنقاط والواجبات، ورسائل خاصة مع الأولياء. غياب واحد يصل للولي في ثانية.",
  },
  parent: {
    label: "الولي",
    desc: "حساب واحد لكل أبنائه: التنبيهات، التبرير، كشف النقاط، دفع المستحقات بالوصل، والرسائل.",
  },
  student: {
    label: "التلميذ",
    desc: "استعمال الزمن، الواجبات، النقاط والإعلانات.",
  },
  accounting: {
    label: "المحاسبة",
    desc: "تأكيد وصولات بريدي موب وCCP، قائمة المتأخرين، التذكير وطلبات التخفيض.",
  },
};
const DEMO_URL = "https://hanout-demo.vercel.app/madrassa/demo?view=";

document.documentElement.classList.add("js");

document.querySelectorAll("[data-roles]").forEach((box) => {
  const tabs = box.querySelectorAll("[data-role]");
  const desc = box.querySelector("[data-role-desc]");
  const link = box.querySelector("[data-role-link]");

  function select(key) {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.role === key)));
    desc.textContent = ROLES[key].desc;
    link.href = DEMO_URL + key;
    link.textContent = "افتح واجهة " + ROLES[key].label + " ↗";
  }

  tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.role)));
  select("director");
});

// Screenshots: hide the <img> until the file exists, so the placeholder shows instead.
document.querySelectorAll(".shot img").forEach((img) => {
  const drop = () => img.remove();
  if (img.complete && img.naturalWidth === 0) drop();
  else img.addEventListener("error", drop);
});

// Contact buttons
(function renderContacts() {
  const box = document.querySelector("[data-contacts]");
  if (!box) return;
  const links = [];
  if (CONTACT.whatsapp) links.push(["واتساب", "https://wa.me/" + CONTACT.whatsapp, true]);
  if (CONTACT.instagram) links.push(["إنستغرام", "https://instagram.com/" + CONTACT.instagram, false]);
  if (CONTACT.email) links.push(["البريد الإلكتروني", "mailto:" + CONTACT.email, false]);
  if (CONTACT.phone) links.push(["اتصل بنا", "tel:" + CONTACT.phone.replace(/\s/g, ""), false]);

  if (!links.length) {
    box.innerHTML = '<p class="contacts__empty">وسائل التواصل تُضاف قريباً.</p>';
    return;
  }
  links.forEach(([label, href, primary], i) => {
    const a = document.createElement("a");
    a.className = "btn" + (primary || i === 0 ? " btn--primary" : " btn--ghost");
    a.href = href;
    a.textContent = label;
    if (href.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    box.appendChild(a);
  });
})();

// Year in footer
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Reveal sections on scroll
const revealables = document.querySelectorAll(".service, .project, .package, .steps li, .section__head");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealables.forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}
