# Hujjatlar → Buyruqlar — tanishuvchilar (backend uchun)

| | |
|---|---|
| **Holat** | `draft` — frontend tayyor, backend kutilmoqda |
| **Frontend** | Shahriyor, 2026-10-23 |
| **Frontend sahifa** | Hujjatlar → Buyruqlar → «Buyruq yaratish» modali va hujjatdagi «Ma'lumotlar» tabi |

## 1. Qisqacha (muammo)

Buyruq kelishuvchilariga endi rol beriladi:

- **Kelishuvchi** — hujjatni ko'rib chiqadi va imzolaydi (hozirgi kelishuvchi).
- **Tanishuvchi** — imzolamaydi, hujjat unga faqat ma'lumot uchun boradi (xatdagi nusxa / CC kabi).

Yuborish tartibi o'zgarmagan: **Parallel** — hammaga bir vaqtda (`order` hammasida `1`),
**Tartibli** — navbat bilan (`order` = 1, 2, 3 …). Tartib faqat kelishuvchilar orasida.

Hozir `CreateCommandDto` da tanishuvchi uchun maydon yo'q. Arizalarda bu allaqachon bor
(`ForwardWorkerApplicationDto.viewers`), shuning uchun shu shaklni takrorladik.

## 2. `POST /v1/hr/commands`, `PUT /v1/hr/commands/{id}`, `POST /v1/hr/commands/{id}/signers-preview` — yangi maydon

Frontend endi yuboradi (kamida bitta tanishuvchi bo'lsa):

```json
{
  "confirmations": [
    { "id": 31, "order": 1 },
    { "id": 44, "order": 2 }
  ],
  "viewers": [52, 60]
}
```

| Maydon | Tur | Majburiy | Izoh |
|---|---|---|---|
| `confirmations[]` | `{ id, order }` | ha, lekin **bo'sh bo'lishi mumkin** | Faqat **kelishuvchilar** |
| `viewers[]` | int[] | yo'q | Tanishuvchilarning `confirmation_worker` id'lari (kelishuvchilar ro'yxatidagi `id`) |

- Tanishuvchi bo'lmasa `viewers` **umuman yuborilmaydi** — so'rov avvalgidek qoladi.
- Bitta odam ikkala ro'yxatda bo'lmaydi; rahbar va buxgalter `viewers` ga tushmaydi.
- Hamma tanishuvchi bo'lishi mumkin — unda `confirmations: []`, faqat `viewers` to'la. Bunda hujjatni
  faqat rahbar (va buxgalter) imzolaydi, tanishuvchilar ko'radi. Hozir backend bo'sh `confirmations`
  ni qabul qilmasligi mumkin — buni ham ruxsat berish kerak.
- Frontend kamida bitta odam (kelishuvchi yoki tanishuvchi) tanlanishini talab qiladi.

## 3. Backenddan nima kerak

1. DTO'ga `viewers?: number[]` qo'shish (hozir `forbidNonWhitelisted` bo'lsa `400` qaytishi mumkin).
2. Tanishuvchiga hujjat **qachon** borishini belgilash. Taklif:
   - Parallel — kelishuvchilar bilan birga, darhol;
   - Tartibli — ham darhol (tanishuvchi navbatni kutmaydi va to'xtatmaydi).
3. Tanishuvchi hujjatni ochganda «ko'rdi» deb belgilash (Arizalardagi `viewerRead` kabi) — ixtiyoriy.
4. Buyruq ma'lumotida (`signers-preview` va hujjat imzolovchilari) tanishuvchini ajratib berish,
   masalan `role: "view"` — keyin frontend ularni «Tanishuvchi» belgisi bilan ko'rsatadi.

## 3.1. Marshrut API'si buyruq uchun — `GET/PUT /v1/document-route` (`model=commands`)

Frontend endi buyruq kelishuvchilarini **faqat «Ma'lumotlar» tabida** tahrirlaydi (drawer'dagi alohida
«Kelishuvchilar» tugmasi va oynasi buyruq uchun olib tashlandi; shartnoma / qo'shimcha kelishuvda qoldi).
«Ma'lumotlar» ochilganda joriy marshrut `GET /v1/document-route` va `GET /v1/document-route/approvers`
dan o'qiladi.

Savollar / kerak bo'ladigan narsalar:

1. **`GET /v1/document-route?model=commands`** — `items[].role` buyruq uchun ham qaytadimi
   (`"sign"` / `"view"`)? Hozir frontend `role` bo'lmasa kelishuvchi deb oladi.
2. **`PUT /v1/document-route`** buyruq uchun `viewers` ni qabul qiladimi? Sxemada bor, lekin frontend
   hozircha buyruqda tanishuvchini shu API orqali yubormaydi (`documentRouteStore.allowViewers`).
3. **Keyingi qadam (reja):** «Ma'lumotlar → Saqlash» aqlli bo'ladi —
   - **faqat kelishuvchilar o'zgarsa** (kim, tartib, parallel/tartibli, rol) — buyruq qayta
     rasmiylashtirilmaydi, faqat `PUT /v1/document-route` chaqiriladi; allaqachon imzolaganlar
     imzosi saqlanib qoladi (`items[].locked`);
   - **matn / ma'lumotlar o'zgarsa** — hozirgidek `PUT /v1/hr/commands/{id}` (qayta rasmiylashtirish +
     kimga qayta yuborish).

   Buning uchun tasdiqlang: buyruq **jarayonda** bo'lganda `PUT /v1/document-route` ishlaydimi va
   imzolaganlarni o'zgartirmaydimi? Qaysi holatlarda `locked` qaytadi (tasdiqlangan, rad etilgan...)?

## 4. Frontend uchun eslatmalar

- Rol `form_state.sortableConfirmations[].role` da saqlanadi (`"sign"` / `"view"`, yo'q bo'lsa `"sign"`),
  shuning uchun tahrirlashda tiklanadi.
- Kod: `src/pages/docFlow/document/command/CommandSigners.vue`, payload — `CommandFormBody.vue` (`validateAll`).

## 5. Ochiq savollar

- [ ] Tartibli rejimda tanishuvchi darhol oladimi yoki hujjat tasdiqlangandan keyinmi?
- [ ] Tanishuvchi bildirishnoma (push/Telegram) oladimi?
- [ ] `PUT /v1/document-route` buyruq uchun `viewers` va jarayondagi buyruqni qo'llaydimi (3.1-bo'lim)?
- [ ] Barcha kelishuvchilar bir xil `order` da bo'lsa — parallel deb hisoblanadi; tartibli buyruqda
      `order` lar har xil (1, 2, 3) kelishini tasdiqlang (o'ng paneldagi navbat raqamlari shunga tayanadi).

## O'zgarishlar tarixi

| Sana | Kim | Nima o'zgardi |
|---|---|---|
| 2026-10-23 | Shahriyor | Birinchi versiya |
| 2026-10-26 | Shahriyor | Marshrut API'si bo'yicha savollar va «aqlli Saqlash» rejasi (3.1) |
