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

## 4. Frontend uchun eslatmalar

- Rol `form_state.sortableConfirmations[].role` da saqlanadi (`"sign"` / `"view"`, yo'q bo'lsa `"sign"`),
  shuning uchun tahrirlashda tiklanadi.
- Kod: `src/pages/docFlow/document/command/CommandSigners.vue`, payload — `CommandFormBody.vue` (`validateAll`).

## 5. Ochiq savollar

- [ ] Tartibli rejimda tanishuvchi darhol oladimi yoki hujjat tasdiqlangandan keyinmi?
- [ ] Tanishuvchi bildirishnoma (push/Telegram) oladimi?

## O'zgarishlar tarixi

| Sana | Kim | Nima o'zgardi |
|---|---|---|
| 2026-10-23 | Shahriyor | Birinchi versiya |
