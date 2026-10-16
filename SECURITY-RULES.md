# 🔐 Xavfsizlik qoidalari — frontend (Vue)

2026-10 xavfsizlik auditida topilgan zaifliklar takrorlanmasligi uchun. Har yangi sahifa/komponent/store yozganda
shu ro'yxat bo'yicha tekshir.

## 1. Sirlar

1. **Har `VITE_*` o'zgaruvchi ommaviy** — build'da JS bundle'ga tushadi. Unga hech qachon sir qo'yilmaydi
   (JWT siri, socket siri, bot tokeni, API kaliti). Imzolash/maxfiy amal kerak bo'lsa — backend endpointi orqali.
2. Kodda «admin secret», parol, token, ichki IP yozilmaydi.
3. `console.log` da token, konfiguratsiya, foydalanuvchi ma'lumoti chiqarilmaydi.

## 2. XSS

1. `v-html` / `innerHTML` **faqat** `sanitizeHtml()` (DOMPurify) orqali: `v-html="sanitizeHtml(text)"`.
   Server'dan kelgan har qanday matn (yangilik, yo'riqnoma, vakansiya, xabar, izoh) — ishonchsiz.
2. `eval`, `new Function`, `document.write` ishlatilmaydi.
3. Tashqi URL'ga o'tish/`window.open` — faqat `safeUrl()` orqali (`http/https` sxemasi), `noopener,noreferrer` bilan.
   `javascript:`/`data:` URL'lar bloklanadi.
4. PDF ko'rsatishda `pdfjs-dist` — `isEvalSupported: false`; kutubxona versiyasi yangilangan bo'lsin.

## 3. Ruxsat

1. Route guard va tugmalarni yashirish — faqat UX. Haqiqiy tekshiruv **backend'da**; frontend'da qo'shilgan har
   yangi amal uchun backend endpointida `@Permission` borligini tekshir.

## 4. Saqlash

1. Logout/seans tugaganda foydalanuvchiga oid `localStorage`/`sessionStorage` kalitlari tozalanadi.
2. Yangi maxfiy ma'lumotni `localStorage` ga yozma.

## Tekshiruv ro'yxati

- [ ] Yangi `VITE_*` sir emasmi?
- [ ] `v-html` → `sanitizeHtml`?
- [ ] Dinamik URL → `safeUrl`?
- [ ] Yangi amal uchun backend'da ruxsat bormi?
