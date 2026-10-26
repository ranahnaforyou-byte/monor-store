# EVEREST Digital Services — Portfolio

موقع ثابت (HTML + CSS + JS) بدون أي build. منفصل تماماً عن متجر MONOR.

## الملفات

| الملف | المحتوى |
|---|---|
| `index.html` | كل الأقسام والمشاريع والنصوص |
| `styles.css` | التصميم (ألوان الشعار في أعلى الملف) |
| `script.js` | **وسائل التواصل** في أعلى الملف، وتبويبات أدوار MA DRASSA |
| `assets/` | الشعار وأيقونة الموقع وصورة المشاركة |

## لقطات الشاشة

ضع الصور في `assets/` بهذه الأسماء، وتظهر تلقائياً مكان الإطار الفارغ:

- `assets/madrassa.png`
- `assets/hanout.png`
- `assets/editor.png`

الأفضل نسبة 4:3 (مثلاً 1200×900). صورة المونتير 16:10.

## وسائل التواصل

في أعلى `script.js` املأ `whatsapp` و `instagram` و `email` و `phone`. الحقل الفارغ لا يظهر.

## النشر (Cloudflare Pages أو Vercel)

- **Cloudflare Pages:** Create project ← اختر هذا الـ repo والفرع ← Framework: None ← Build command: فارغ ← Build output directory: `portfolio`.
- **Vercel:** New Project ← نفس الـ repo ← Root Directory: `portfolio` ← Framework: Other.

بعد النشر، غيّر `og:image` في `index.html` إلى الرابط الكامل (مثلاً `https://your-domain/assets/og.png`) حتى تظهر صورة المعاينة عند مشاركة الرابط.

## روابط ممنوعة

لا تضف أبداً روابط `/owner` أو `/team` أو `/team/dashboard` أو `/admin` من hanout-demo: فيها بيانات المهتمين ولوحات الإدارة.
