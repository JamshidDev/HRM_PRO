# Tarix (audit) — kodli maydonlarga nom berish (backend uchun)

| | |
|---|---|
| **Holat** | `backend tayyor` — `feat/review-codes` branchida, dev'ga merge kutilmoqda |
| **Frontend** | Shahriyor, 2026-10-29 |
| **Frontend sahifa** | Tarix → yozuv tarixi modali («O'zgarish tafsiloti — Buyruqlar #…») |
| **ClickUp** | DAS-12124 |

## 1. Qisqacha (muammo)

`GET /v1/audit` javobidagi `changes[].fields[]` da ba'zi maydonlar xom kod bilan keladi.
Masalan buyruq imzolovchisi yozuvida (Buyruqlar #92691):

| Maydon (yorliq) | Hozir keladi | Frontend bilgan ma'no |
|---|---|---|
| Imzolovchi turi | `"s"` | `w` Xodim, `s` Kelishuvchi, `d` Rahbar, `r` Tanishuvchi |
| Imzo holati | `1`, `5` | `1` Jarayonda, `2` Ko'rilgan, `3` Tasdiqlagan, `4` Rad etgan — **`5` noma'lum** |
| Imzo usuli | `1` | `1` E-IMZO (taxmin) — qolganlari noma'lum |

Foydalanuvchi tarixda `5` ni ko'radi va nima bo'lganini tushunmaydi. Frontend kodning
ma'nosini o'zi taxmin qilib yozmaydi — noto'g'ri yozuv tarixda chalg'itadi.

## 2. So'rov

Kodli (enum) maydonlarni `ref` tipidagi maydonlar kabi qaytaring: `type: "ref"`, qiymat
`{ id, name }`, `name` — so'rov tilida (`Accept-Language`).

```json
{
  "field": "status",
  "label": "Imzo holati",
  "type": "ref",
  "changed": true,
  "old": { "id": 1, "name": "Jarayonda" },
  "new": { "id": 5, "name": "<5 ning nomi>" }
}
```

Frontend `ref` tipini allaqachon `name` bilan ko'rsatadi. Backend shunday bersa, keyin yangi
kod qo'shilganda ham frontendni o'zgartirish kerak bo'lmaydi.

Bu faqat imzolovchilarga emas — Tarix'dagi barcha sahifalarning kodli maydonlariga tegishli.

## 3. Javob kerak bo'lgan savollar

- [ ] **Imzo holati `5`** nimani bildiradi? Holatlarning to'liq ro'yxati qanday?
- [ ] **Imzo usuli** kodlarining to'liq ro'yxati qanday? Imzolash tarixida frontend `2` ni
      havola, `5` ni Face ID deb, qolganini E-IMZO deb ko'rsatadi — to'g'rimi? `1`, `3`, `4` nima?
- [ ] Imzolovchi yozuvidagi turi / holati / usuli maydonlarining aniq `field` kalitlari qanday?

## 4. Frontend hozir nima qiladi

Backend javob berguncha `src/pages/audit/ui/detail/auditValues.js` yozuv imzolovchiniki
bo'lsa (turi maydonida `w/s/d/r` turibdi) bilgan kodlarini o'zi nomga aylantiradi.
Bilmagan kod (masalan holat `5`) raqamligicha, «tavsifi yo'q» degan izoh bilan chiqadi.
Backend `{ id, name }` qaytara boshlasa, bu xarita kerak bo'lmay qoladi.

## Backend javobi (2026-10-29)

- `GET /v1/audit` — kodli maydonlar endi `type: "ref"` va `old/new: { id, name }` (`name` — `Accept-Language` tilida):
  - imzolovchilar jadvallari (`*_confirmations`): `type`, `status`, `confirmation_type`;
  - hujjatlar: `confirmation`, hujjat turi `type` (buyruq, shartnoma, qo'shimcha kelishuv, ariza).
  - Noma'lum kod — `{ id, name: null }`.
- Savollarga javob:
  - **Holat:** `1` Jarayonda, `2` O'qilgan, `3` Tasdiqlangan, `4` Rad etilgan, **`5` O'chirilgan** (tahrirda almashtirilgan imzolovchi qatori),
    `6` Qoralama, `7` Muammoli.
  - **Imzo usuli:** `1` E-IMZO, `2` qo'lda chizilgan imzo (havola orqali), `3` tugma, `4` imzolanmagan, `5` Face ID.
  - **`field` kalitlari:** `type`, `status`, `confirmation_type`.
- Hali raqam bo'lib qoladi: shartnoma va ariza `status` maydonlari.

## O'zgarishlar tarixi

| Sana | Kim | Nima o'zgardi |
|---|---|---|
| 2026-10-29 | Shahriyor (frontend) | Birinchi versiya |
| 2026-10-29 | Backend | Kodli maydonlar `{id, name}` bilan |
