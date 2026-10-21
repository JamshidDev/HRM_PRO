<!--
  API HUJJAT SHABLONI — backend yangi endpoint chiqarganda shu faylni nusxalab to'ldiradi.

  Fayl nomi:  docs/api/<modul>-<qisqa-nom>.md   (masalan: docs/api/hr-vacation-transfer.md)
  Qoidalar:
    • Har bir bo'limni to'ldiring. Tegishli bo'lmasa — "yo'q" deb yozing, o'chirmang.
    • JSON namunalar HAQIQIY javobdan olinsin (Postman/Swagger'dan nusxa), qo'lda o'ylab topilmasin.
    • `<...>` bilan belgilangan joylarni almashtiring, ushbu izoh blokini esa o'chiring.
  Frontend (va uning Claude'i) UI'ni AYNAN shu hujjat asosida quradi — hujjatda yo'q narsa UI'da ham bo'lmaydi.
-->

# <Modul> — <Funksiya nomi>

| | |
|---|---|
| **Holat** | `draft` / `dev-da tayyor` / `prod-da` |
| **Backend** | <ism>, <sana YYYY-MM-DD> |
| **Branch / PR** | <link> |
| **Ruxsat (permission)** | `<slug>` — ko'rish uchun `<slug>-read` (masalan `hr-report`, `hr-report-read`) |
| **Figma / maket** | <link yoki "yo'q"> |
| **Frontend sahifa** | <qaysi sahifa/modal, masalan "HRM → Ta'til → yangi tab" yoki "yangi sahifa"> |

## 1. Qisqacha

<2–4 gap: bu funksiya nima qiladi, kim ishlatadi, qaysi biznes jarayonga tegishli.>

## 2. Endpointlar ro'yxati

| Metod | URL | Vazifasi |
|---|---|---|
| `GET` | `/v1/<...>` | Ro'yxat (sahifalangan) |
| `GET` | `/v1/<...>/{id}` | Bitta yozuv |
| `POST` | `/v1/<...>` | Yaratish |
| `PUT` | `/v1/<...>/{id}` | Tahrirlash |
| `DELETE` | `/v1/<...>/{id}` | O'chirish |

> Base URL: `${VITE_API_URL}/api` — URL'lar shunga nisbatan yoziladi (`/v1/...`).

---

## 3. `GET /v1/<...>` — ro'yxat

### Query paramlar

| Param | Tur | Majburiy | Default | Izoh |
|---|---|---|---|---|
| `page` | int | yo'q | `1` | |
| `per_page` | int | yo'q | `10` | |
| `search` | string | yo'q | — | Qaysi maydonlar bo'yicha qidiradi: <...> |
| `organization_id` | int | yo'q | — | |
| `<...>` | | | | |

### Javob — `200`

Frontend `res.data.data` ni o'qiydi; sahifalangan ro'yxat `{ data: [], total }` ko'rinishida:

```json
{
  "data": {
    "data": [
      {
        "id": 1,
        "<maydon>": "<qiymat>",
        "status": { "id": 2, "name": "Tasdiqlangan" },
        "created_at": "2026-10-05 14:30:00"
      }
    ],
    "total": 1
  }
}
```

### Maydonlar

| Maydon | Tur | `null` bo'la oladimi | Izoh |
|---|---|---|---|
| `id` | int | yo'q | |
| `<maydon>` | string | ha | <nima, qayerdan keladi> |
| `status` | object `{id, name}` | yo'q | Mumkin qiymatlar — 7-bo'limga qarang |
| `created_at` | string `YYYY-MM-DD HH:mm:ss` | yo'q | |

---

## 4. `POST /v1/<...>` — yaratish

### So'rov tanasi

`Content-Type`: `application/json` yoki `multipart/form-data` (fayl bo'lsa — qaysi biri ekanini yozing)

```json
{
  "<maydon>": "<qiymat>",
  "worker_id": 15,
  "date": "2026-10-05",
  "files": ["<fayl>"]
}
```

| Maydon | Tur | Majburiy | Validatsiya | Izoh |
|---|---|---|---|---|
| `<maydon>` | string | ha | max 255 | |
| `worker_id` | int | ha | mavjud xodim | Ro'yxat qayerdan olinadi: `GET /v1/<...>` |
| `date` | string `YYYY-MM-DD` | ha | bugundan oldin emas | |
| `files[]` | file | yo'q | pdf, max 5 MB | |

### Javob — `200` / `201`

```json
{ "message": "Muvaffaqiyatli saqlandi", "data": { "id": 10 } }
```

> ⚠️ `POST`/`PUT`/`DELETE` javobidagi `message` frontendda **avtomatik toast** bo'lib chiqadi.
> Foydalanuvchiga ko'rsatiladigan, `Accept-Language` bo'yicha tarjima qilingan matn bo'lsin.

## 5. `PUT /v1/<...>/{id}` — tahrirlash

<POST bilan farqi bo'lsa yozing: qaysi maydonlar tahrirlanmaydi, qaysi holatda tahrirlab bo'lmaydi.>

## 6. `DELETE /v1/<...>/{id}` — o'chirish

<Qachon o'chirib bo'lmaydi? Soft delete'mi? Bog'liq yozuvlar bilan nima bo'ladi?>

---

## 7. Enum / statuslar

| Qiymat | Nomi | Izoh / UI'dagi rangi |
|---|---|---|
| `1` | Yangi | kulrang |
| `2` | Tasdiqlangan | yashil |
| `3` | Rad etilgan | qizil |

Statuslar orasidagi o'tishlar (kim, qachon): <masalan "1 → 2 faqat `hr-boss` ruxsatida">

## 8. Xatolar

| Kod | Qachon | Javob namunasi |
|---|---|---|
| `401` | Token yo'q/eskirgan | (frontend o'zi login'ga yo'naltiradi) |
| `403` | Ruxsat yo'q | `{ "message": "..." }` |
| `404` | Yozuv topilmadi | `{ "message": "..." }` |
| `422` | Validatsiya | `{ "message": "...", "errors": { "date": ["..."] } }` |
| `<...>` | <biznes xato, masalan "ta'til kuni yetarli emas"> | `{ "message": "..." }` |

> Frontend xatolarda `message` ni toast qilib ko'rsatadi — u ham foydalanuvchiga tushunarli bo'lsin.

## 9. Frontend uchun eslatmalar

- <Qaysi maydon qaysi ruxsatda ko'rinadi/yashiriladi>
- <Hisob-kitob backendda bo'ladimi (foiz, summa, kunlar soni) — frontend qayta hisoblamasin>
- <Ro'yxat qanday tartibda saralangan holda keladi>
- <Real-time (socket) hodisa bormi>
- <Kesh bormi, "yangilash" uchun param>

## 10. Ochiq savollar

- [ ] <hali hal qilinmagan narsa>

## O'zgarishlar tarixi

| Sana | Kim | Nima o'zgardi |
|---|---|---|
| <YYYY-MM-DD> | <ism> | Birinchi versiya |
