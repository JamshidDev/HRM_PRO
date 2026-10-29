# Qo'shimcha kelishuv — eski hujjatlarni tahrirlash (backend uchun)

| | |
|---|---|
| **Holat** | `draft` — frontend tayyor, backend kutilmoqda |
| **Frontend** | Shahriyor, 2026-10-29 (ClickUp DAS-12129) |
| **Frontend sahifa** | HRM → Qo'shimcha kelishuvlar (`/hrm/ad-contract`): qatordagi «Tahrirlash» va hujjat oynasidagi «Ma'lumotlar» tabi |
| **Bog'liq** | Shartnomalar uchun xuddi shu so'rov — `docs/api/contract-edit-old.md` |

## 1. Qisqacha (muammo)

Qo'shimcha kelishuvni tahrirlash frontendda tayyor. Ishlash tartibi:

1. Yaratishda frontend butun formani `form_state` sifatida yuboradi, backend uni saqlaydi.
2. Tahrirda frontend `GET /v1/hr/contract-additional/{id}/form` ni chaqiradi va `form_state` dan formani tiklaydi.
3. Saqlashda `POST /v1/hr/contract-additional/{id}/signers-preview`, keyin `PUT /v1/hr/contract-additional/{id}`.

Muammo — **eski kelishuvlar** va **noto'g'ri «tasdiqlangan» bloki**. `form_state` saqlash 2026-10-26 da
`main` ga tushgan; undan oldingi kelishuvlarda u yo'q. Bunday kelishuvlar hozir umuman tahrirlanmaydi.

## 2. So'rov 1 — eski kelishuvlar uchun `form_state` ni backend o'zi tuzsin

`form_state` yo'q kelishuv uchun `GET /v1/hr/contract-additional/{id}/form` bazadagi ma'lumotdan
`form_state` ni **tuzib** qaytarsin (`editable: true`, agar boshqa to'siq bo'lmasa). Bir martalik
migratsiya bilan saqlab qo'yish ham mumkin. Frontend o'zgarmaydi: `form_state` kelsa, forma o'zi to'ladi.

### 2.1 `form_state` shakli

`adContractStore.snapshotFormState()`:

```json
{
  "payload": {
    "…": "qo'shimcha kelishuv maydonlari (yaratishdagi POST bilan bir xil nomlar)",
    "organization_id": [{ "id": 199, "name": "…" }],
    "department_id": [{ "id": 55, "name": "…" }],
    "confirmations": [101, 102]
  },
  "organization": [{ "id": 199, "name": "…" }],
  "structureCheck": [],
  "structureCheck2": [],
  "departmentCheck": [],
  "sortableConfirmations": [
    { "id": 101, "data": { "firstName": "…", "lastName": "…", "middleName": "…", "photo": "…", "position": "…" } }
  ],
  "oneByOne": true,
  "workerOption": { "id": 5001, "name": "…" }
}
```

`workerOption` — «Xodimni tanlang» ro'yxatidagi tanlangan qator (xodim lavozimi, `id` =
`worker_position_id`).

Umumiy qoidalar shartnomadagi bilan bir xil: sanalar — millisekund timestamp, `organization_id` /
`department_id` — bitta `{ id, name }` li massiv, `sortableConfirmations` — kelishuvchilar `order`
bo'yicha tartibda, `oneByOne` — tartibli bo'lsa `true`. Bazada yo'q maydon `null` bo'lsin.

## 3. So'rov 2 — jarayondagi qo'shimcha kelishuv «tasdiqlangan» deb bloklanmoqda

DAS-12129 skrinshotida (qo'shimcha kelishuv, 30.06.2026): ikkala imzolovchi ham **«Jarayonda»**,
lekin `GET /v1/hr/contract-additional/{id}/form` `edit_block: "approved"` qaytaradi.
Foydalanuvchi «Tasdiqlangan qo'shimcha kelishuvni tahrirlab bo'lmaydi» deb ko'radi.

Iltimos, `approved` sharti qaysi maydonga qarab hisoblanayotganini tekshiring. Hujjat hali
imzolanmagan bo'lsa, `approved` bo'lmasligi kerak. `form_state` yo'q bo'lsa, sabab
`no_form_state` bo'lsin (yoki 2-bo'limdagidek forma tuzib berilsin).

## 4. Javob kerak bo'lgan savollar

1. 2-bo'limdagi yo'l (so'rovda tuzish yoki bir martalik migratsiya) mumkinmi?
2. Eski kelishuvlarda bazada yo'q maydonlar bormi (masalan, kelishuvchilar tartibi)?
3. `edit_block` qiymatlari (`approved`, `command_approved`, `expired`) qanday hisoblanadi?

## 5. Frontend tomoni

O'zgarish kerak emas: `form_state` va `editable: true` kelishi bilan «Tahrirlash» va «Ma'lumotlar» tabi
ishlaydi (`adContractStore._openEdit`, `DocumentFormDataTab.vue`).
