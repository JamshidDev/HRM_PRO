# HRM → Xodim qo'shish — pasport nusxasi: rasm va ikki tomon (backend uchun)

| | |
|---|---|
| **Holat** | `draft` — frontend tayyor, backend'dan tasdiq kerak |
| **Frontend** | Shahriyor, 2026-10-28 (ClickUp DAS-12042) |
| **Frontend sahifa** | HRM → Xodimlar → «Xodim qo'shish» (`/hrm/worker/create`) → «Pasport ma'lumotlari» bloki |

## 1. Qisqacha

Pasport nusxasi endi faqat `.pdf` emas, **rasm** ham bo'lishi mumkin (`.jpg`, `.jpeg`, `.png`).
ID karta ikki tomonli bo'lgani uchun frontend **old** va **orqa** tomonini alohida tanlatadi, lekin
backendga hozirgidek **bitta** `file` yuboradi: ikki rasm bitta rasmga birlashtiriladi (old tomoni
tepada, orqa tomoni pastda, JPG). PDF tanlansa — o'zi yuboriladi (unda ikkala tomon bor deb olinadi).

Ya'ni **so'rov shakli o'zgarmagan** — backend o'zgarishisiz ham ishlashi kerak. Quyidagilarni
tasdiqlash kerak.

## 2. `POST /v1/hr/worker-passports` — hozirgi so'rov (o'zgarmagan)

`multipart/form-data`:

| Maydon | Tur | Izoh |
|---|---|---|
| `worker_id` | int | |
| `serial_number` | string | |
| `from_date` | string `YYYY-MM-DD` | |
| `to_date` | string `YYYY-MM-DD` | |
| `address` | string | |
| `file` | file | **endi:** `application/pdf`, `image/jpeg` yoki `image/png`. Ikki tomon birlashtirilganda nomi `<asl-nom>-ikki-tomoni.jpg` |

Dev'da tekshirildi (2026-10-28): mavjud bo'lmagan `worker_id` bilan PNG, JPG va PDF yuborilganda
uchalasi ham faqat `worker_id does not exist` xatosini oldi — fayl turi rad etilmadi. Lekin haqiqiy
saqlash tekshirilmadi.

## 3. Backenddan nima kerak (tasdiq)

1. **Rasm saqlanadimi?** `file` sifatida `image/jpeg` / `image/png` qabul qilinib, saqlanib,
   `GET /v1/hr/worker-passports` javobida `file` URL bo'lib qaytishini tasdiqlang. Agar faqat PDF
   ruxsat etilgan bo'lsa (`mimes:pdf` va h.k.) — `jpg, jpeg, png` qo'shilsin.
2. **Hajm cheklovi qancha?** Frontend birlashtirilgan rasmni kengligi bo'yicha 2000px gacha
   kichraytiradi, JPG sifati 90% (odatda 1 MB dan kam). Backend limitini yozing — kerak bo'lsa
   frontend ham shunga moslaydi.
3. `PUT /v1/hr/worker-passports/{id}` (xodim profilida tahrirlash) ham rasm qabul qilsin — keyin
   profil sahifasida ham rasm yuklash ochiladi.

## 4. Ixtiyoriy (keyinroq): ikki tomon alohida

Hozir ikki tomon bitta rasm. Agar alohida saqlash kerak bo'lsa (masalan, profilda ikki tomonni
alohida ko'rsatish uchun), backend ikki maydon qo'shishi mumkin:

| Maydon | Tur | Izoh |
|---|---|---|
| `file_front` | file | old tomoni (rasm yoki PDF) |
| `file_back` | file | orqa tomoni (rasm), ixtiyoriy |

Va `GET` javobida ikkala URL. Bu talab emas — kelishilsa, frontend birlashtirishni o'chirib, ikki
faylni alohida yuboradi.

## 5. Frontend uchun eslatmalar

- Kod: `src/pages/hrm/candidate/ui/PassportFrom.vue` (old/orqa katakchalari),
  `src/utils/passportImage.js` (`mergePassportSides`), `createWorkerStore._passportFormData`.
- Xodim profilidagi pasport bloki (`workerProfile/ui/blocks/PassportBlock.vue`) hali faqat PDF
  qabul qiladi va faylni PDF belgisi bilan ko'rsatadi.

## 6. Ochiq savollar

- [ ] Backend rasmni saqlaydimi va qanday hajm cheklovi bor? (3-bo'lim)
- [ ] Ikki tomonni alohida saqlash kerakmi? (4-bo'lim)

## O'zgarishlar tarixi

| Sana | Kim | Nima o'zgardi |
|---|---|---|
| 2026-10-28 | Shahriyor | Birinchi versiya |
