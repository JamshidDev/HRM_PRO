# Turniket → Smenalar — kun uchun tushlik vaqti (backend uchun)

| | |
|---|---|
| **Holat** | `draft` — frontend tayyor, backend kutilmoqda |
| **Frontend** | Shahriyor, 2026-10-22 |
| **Frontend sahifa** | Turniket → Smenalar → guruh grafigi → katakni bosish → «Kunni o'zgartirish» |

## 1. Qisqacha (muammo)

Xodimning bitta kunini o'zgartirganda (`POST /v1/turnstile/schedule/schedule-day`) hozir faqat
`start_time` / `end_time` yuboriladi — **tushlik yo'q**. Tushlik faqat smena turida
(`days[].break_times`) saqlanadi.

Natija: «Boshqa vaqt» bilan 11:00–20:00 qo'yilsa, `daily_minutes` tushliksiz hisoblanishi mumkin
(9 soat o'rniga 8), ya'ni tabelda xodimga ortiqcha soat yoziladi; turniket ham tushlikda chiqishni
«erta ketdi» deb ko'rishi mumkin.

**Frontend tayyor:** yangi maydonlarni allaqachon yuboradi va kelsa ko'rsatadi. Backend'dan
quyidagi 3 narsa kerak.

## 2. `POST /v1/turnstile/schedule/schedule-day` — yangi maydonlar

Frontend endi yuboradi (ish kuni uchun):

```json
{
  "worker_position_id": 12703,
  "date": "2026-10-22",
  "group_id": 45,
  "work_status": true,
  "start_time": "11:00",
  "end_time": "20:00",
  "break_start_time": "14:00",
  "break_end_time": "15:00"
}
```

| Maydon | Tur | Majburiy | Izoh |
|---|---|---|---|
| `break_start_time` | string `HH:mm` yoki `null` | yo'q | Tushlik boshi. `null` = tushliksiz kun |
| `break_end_time` | string `HH:mm` yoki `null` | yo'q | Tushlik oxiri |

- UI'da bu **«Tanaffus (ovqatlanish uchun)»** deb ataladi — asosan ovqatlanish uchun, ish vaqtiga kirmaydi.
  Ichki nomlar (`break_*`, smena turidagi `break_times`) o'zgarmaydi.
- Dam kuni (`work_status: false`) uchun bu maydonlar **yuborilmaydi**.
- Smena turidagi vaqt tanlansa (masalan 09:00–18:00) — frontend o'sha smenaning tanaffusini yuboradi
  (smena turida tanaffus bo'lmasa — `null`).
- «Boshqa vaqt» tanlansa — «Tanaffus bor» belgisi **standart holatda olinmagan**:
  - belgi olinmagan → ikkalasi `null` (tanaffussiz kun, masalan 4 soatlik ish);
  - belgi qo'yilgan → foydalanuvchi kiritgan vaqt (oldindan smena turidagi tanaffus bilan to'ldirilgan).
- **Muhim:** `null` = «tanaffus yo'q» degani. Maydon umuman kelmasa (eski klient) — pastdagi
  qoidaga ko'ra smena turidan olinsin. Bu ikki holatni farqlang.
- **Maydonlar kelmasa** (eski klient) — avvalgidek ishlasin: vaqt smena turidagi kun bilan mos
  kelsa, o'sha smenaning `break_times` i olinsin.

**Validatsiya (422):** ikkalasi birga keladi yoki ikkalasi `null`; tushlik ish vaqti ichida,
boshi < oxiri. Tungi smena (masalan 20:00–08:00, tushlik 01:00–02:00) — yarim tundan o'tishini
hisobga oling. Frontend ham shuni tekshiradi.

## 3. `daily_minutes` hisobi

```
daily_minutes = (end_time − start_time) − (break_end_time − break_start_time)
```

Misol: 11:00–20:00, tushlik 14:00–15:00 → `480`. Tushliksiz → `540`.
`daily_minutes` ni **faqat backend** hisoblaydi — tabel, «Ish soati» ustuni va turniket shundan
foydalanadi. Frontend oynada faqat ko'rsatish uchun oldindan hisoblaydi.

## 4. Saqlash

Kun grafigi jadvaliga (`schedule-workers` kunlari) 2 ta nullable ustun:

```
break_start_time  TIME NULL
break_end_time    TIME NULL
```

Grafik generatsiya qilinganda (`generate-schedule-workers`, qayta generatsiya) ham har kunga
smena turidagi tushlik yozilsin — shunda hamma kunlar bir xil manbadan o'qiladi.

## 5. Qaytarish — `GET /v1/turnstile/schedule/schedule-workers`

`days[]` dagi har bir kunda 2 ta maydon bo'lsin (dam kunida `null`):

```json
{
  "id": 29985239,
  "worker_id": 12703,
  "date": "2026-10-22",
  "work_status": 1,
  "start_time": "09:00",
  "end_time": "18:00",
  "break_start_time": "13:00",
  "break_end_time": "14:00",
  "daily_minutes": 480,
  "fact_daily_minutes": null
}
```

Frontend ularni o'qiydi (`scheduleWorker/ui/Table.vue` → `breakStart` / `breakEnd`) va
«Kunni o'zgartirish» hamda «O'zgartirilgan kun» oynalarida kunning **haqiqiy** tushligini
ko'rsatadi. Kelmaguncha smena turidagi tushlik ko'rsatiladi.

## 6. Ochiq savollar

- [ ] `schedule-day` noma'lum maydonlarni rad etmaydimi (422/400)? Frontend ularni allaqachon
      yuboryapti — agar validatsiya qat'iy bo'lsa, maydonlarni DTO'ga qo'shish shu zahoti kerak.
- [ ] Turniket hisobida (kech qoldi / erta ketdi) kunning tushligi hisobga olinadimi
      (`planned_break` — day-detail javobida bor)?
- [ ] Swagger'ga `schedule-day` so'rov sxemasini qo'shish (hozir body umuman hujjatlanmagan).

## O'zgarishlar tarixi

| Sana | Kim | Nima o'zgardi |
|---|---|---|
| 2026-10-22 | Shahriyor (frontend) | Birinchi versiya |
