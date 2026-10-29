# Shartnoma — eski hujjatlarni tahrirlash (backend uchun)

| | |
|---|---|
| **Holat** | `draft` — frontend tayyor, backend kutilmoqda |
| **Frontend** | Shahriyor, 2026-10-29 (ClickUp DAS-12128) |
| **Frontend sahifa** | HRM → Shartnomalar (`/hrm/contract`): qatordagi «Tahrirlash» va hujjat oynasidagi «Ma'lumotlar» tabi |
| **Bog'liq** | Qo'shimcha kelishuvlar uchun xuddi shu so'rov — `docs/api/ad-contract-edit-old.md` |

## 1. Qisqacha (muammo)

Shartnomani tahrirlash frontendda tayyor. Ishlash tartibi:

1. Yaratishda frontend butun formani `form_state` sifatida yuboradi, backend uni saqlaydi.
2. Tahrirda frontend `GET .../{id}/form` ni chaqiradi va javobdagi `form_state` dan formani tiklaydi.
3. Saqlashda `POST .../{id}/signers-preview`, keyin `PUT .../{id}` chaqiriladi.

Muammo — **eski hujjatlar**. `form_state` saqlash 2026-10-14 da qo'shilgan va `main` ga 2026-10-26 da
tushgan. Undan oldin yaratilgan hujjatlarda `form_state` yo'q, shuning uchun backend:

```json
{ "editable": false, "edit_block": "no_form_state", "form_state": null }
```

qaytaradi. Foydalanuvchi esa «Bu shartnoma tahrir imkoniyati qo'shilishidan oldin yaratilgan —
tahrirlab bo'lmaydi» degan yozuvni ko'radi. Bunday hujjatlar hozir umuman tahrirlanmaydi.

## 2. So'rov 1 — eski hujjatlar uchun `form_state` ni backend o'zi tuzsin

`form_state` yo'q hujjat uchun `GET .../{id}/form` bazadagi ma'lumotdan `form_state` ni **tuzib**
qaytarsin (`editable: true`, agar boshqa to'siq bo'lmasa). Bir martalik migratsiya bilan saqlab
qo'yish ham mumkin. Frontend o'zgarmaydi: `form_state` kelsa, forma o'zi to'ladi.

Endpoint: `GET /v1/hr/contracts/{id}/form`.

### 2.1 `form_state` shakli

Frontend yaratishda yuboradigan shakl (`contractStore.snapshotFormState()`):

```json
{
  "payload": {
    "pin": "…",
    "organization_id": [{ "id": 199, "name": "…" }],
    "number": "…",
    "table_number": "…",
    "type": 1,
    "contract_date": 1793232000000,
    "contract_to_date": null,
    "position_date": 1793232000000,
    "director_id": 12,
    "finance_id": 34,
    "department_id": [{ "id": 55, "name": "…" }],
    "department_position_id": 77,
    "position_status": 1,
    "position_id": 8,
    "salary": 5000000,
    "group": 3,
    "rank": 5,
    "rate": 1,
    "probation": 3,
    "vacation_main_day": 21,
    "additional_vacation_day": 4,
    "schedule_id": 1,
    "command_status": true,
    "command_type": 46,
    "command_date": 1793232000000,
    "command_number": "…",
    "confirmations": [101, 102],
    "temporary_worker_id": null,
    "competition_decision_date": null,
    "competition_decision_number": null,
    "work_day": null,
    "week_days": null,
    "start_time": null,
    "end_time": null
  },
  "structureCheck": [],
  "departmentCheck": [],
  "sortableConfirmations": [
    { "id": 101, "data": { "firstName": "…", "lastName": "…", "middleName": "…", "photo": "…", "position": "…" } }
  ],
  "oneByOne": true,
  "worker": { "pin": "…", "first_name": "…", "last_name": "…", "middle_name": "…", "photo": "…" }
}
```

Izohlar:

- Sanalar — millisekund timestamp (`n-date-picker` qiymati).
- `organization_id` va `department_id` — massiv, ichida bitta `{ id, name }` obyekt.
- `sortableConfirmations` — kelishuvchilar **tartib bilan** (`order` bo'yicha); `oneByOne` —
  kelishuvchilar har xil `order` da bo'lsa `true`, hammasi bir xil bo'lsa `false`.
- `worker` — xodim kartasi uchun (`UIUser`): ism, familiya, otasining ismi, rasm, `pin`.
- Bazada yo'q maydon `null` bo'lsin — frontend bo'sh maydonni o'zi ko'rsatadi.

## 3. Javob kerak bo'lgan savollar

1. 2-bo'limdagi yo'l (so'rovda tuzish yoki bir martalik migratsiya) mumkinmi? Qaysi biri qulay?
2. Eski hujjatlarda bazada yo'q maydonlar bormi (masalan, kelishuvchilar tartibi)? Bo'lsa — qaysilari,
   frontend ularni majburiy qilmasin.
3. `edit_block` ning boshqa qiymatlari (`approved`, `command_approved`, `expired`) qanday hisoblanadi?

## 4. Frontend tomoni

O'zgarish kerak emas: `form_state` va `editable: true` kelishi bilan «Tahrirlash» va
«Ma'lumotlar» tabi ishlaydi (`contractStore._openEdit`, `DocumentFormDataTab.vue`).
