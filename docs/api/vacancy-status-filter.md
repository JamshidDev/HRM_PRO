# HRM → Ochiq vakansiyalar — «Holati» bo'yicha filter (backend uchun)

| | |
|---|---|
| **Holat** | `draft` — frontend tayyor, backend kutilmoqda |
| **Frontend** | Shahriyor, 2026-10-28 (ClickUp DAS-11879) |
| **Frontend sahifa** | HRM → Ochiq vakansiyalar (`/hrm/public-vacancy`) → «Filterlar» paneli |

## 1. Qisqacha (muammo)

«Filterlar» paneliga **«Holati»** filtri qo'shildi: **Faol** / **Faol emas**. Bu jadvaldagi «Holati»
switch'i saqlaydigan o'sha `status` maydoni (`true` / `false`). Frontend `status` parametrini
yuboryapti, lekin backend uni hisobga olmayapti — ro'yxat o'zgarmayapti.

Dev'da tekshirildi (2026-10-27): `GET /v1/hr/vacancy` ga `status=1`, `status=0`, `status=true`,
`status=false`, `active=0`, `is_active=0` yuborilganda **har safar 38 ta vakansiyaning hammasi** qaytdi
(25 ta faol, 13 ta faol emas). Swagger'da bu endpoint uchun faqat `page`, `per_page`, `search`,
`organization_id`, `organizations` bor.

## 2. `GET /v1/hr/vacancy` — yangi query param

| Param | Tur | Majburiy | Default | Izoh |
|---|---|---|---|---|
| `status` | int (`1` / `0`) | yo'q | — | `1` — faqat faol (`status: true`), `0` — faqat faol emas (`status: false`). Yuborilmasa — hammasi (hozirgidek) |

Frontend yuboradigan so'rov namunalari:

```
GET /v1/hr/vacancy?page=1&per_page=15&status=1
GET /v1/hr/vacancy?page=1&per_page=15&status=0&organizations=199
```

## 3. Backenddan nima kerak

1. `GET /v1/hr/vacancy` — ixtiyoriy `status` parametri (yuqoridagi jadval bo'yicha).
2. `total` (pagination) filtrlangan ro'yxat bo'yicha hisoblansin.
3. Boshqa filtrlar (`search`, `organizations`) bilan birga ishlasin.
4. `status` yuborilmasa — javob hozirgidek qolsin (eski so'rovlar o'zgarmaydi).
5. Swagger'ga `status` parametri qo'shilsin.

Javob shakli o'zgarmaydi — frontend `res.data.data.data` va `res.data.data.total` ni o'qiydi.

## 4. Qanday tekshirish

«Ochiq vakansiyalar» → «Filterlar» → «Holati» → «Faol emas» → jadvalda faqat switch'i o'chiq
vakansiyalar qolishi kerak. «Faol» — faqat yoqilganlar. Tozalansa — hammasi.

## 5. Frontend uchun eslatmalar

- Kod: `src/pages/hrm/vacancy/ui/Filter.vue` (`statusOptions`), param — `vacancyStore.params.status`
  (`null` — yuborilmaydi, axios `null` ni tashlab yuboradi).
- Filtr o'zgarganda 1-sahifaga qaytadi; «Filterni tozalash» uni ham tozalaydi.

## 6. Ochiq savollar

- [ ] Backend `status` ni `1/0` sifatida qabul qiladimi yoki `true/false` kerakmi? (Frontend hozir `1/0` yuboradi.)

## O'zgarishlar tarixi

| Sana | Kim | Nima o'zgardi |
|---|---|---|
| 2026-10-28 | Shahriyor | Birinchi versiya |
