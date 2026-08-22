# HRM Dashboard — backend API talablari

> **Maqsad:** Figma maketidagi HRM dashboard'ni to'liq chizish uchun backend'dan qanday
> ma'lumotlar kelishi kerakligini aniq belgilash.
>
> **Figma:** [HRM Dashboard — chart variantlari (v3)](https://www.figma.com/design/kB7JzDpdhDB8kan1gt3mxF/HRM-Railway?node-id=2959-58213) (node `2959:58213`)
>
> **Qamrov:** 3 ta tab — **Umumiy**, **Kadrlar harakati**, **Davomat va ta'til**.
> (`Ma'lumot sifati` va `Audit` tablari bu hujjatga kirmaydi — ular alohida hal qilinadi.)
>
> **Holat:** Frontend maket bo'yicha allaqachon qurilgan. Hozirgi backend javoblari maketdagi
> ma'lumotlarning ~1/3 qismini beradi, shu sababli ko'p kartalar qisqartirilgan holda chizilmoqda
> (masalan har bir KPI kartasidagi "o'tgan yilga" qatori butunlay chizilmaydi, chunki backend
> o'tgan yil ko'rsatkichini qaytarmaydi).

---

## Mundarija

1. [Umumiy konvensiyalar](#1-umumiy-konvensiyalar)
2. [Hozirgi holat — nima bor](#2-hozirgi-holat--nima-bor)
3. [Endpoint 1 — Umumiy (`/overview`)](#3-endpoint-1--umumiy-overview)
4. [Endpoint 2 — Kadrlar harakati (`/movement`)](#4-endpoint-2--kadrlar-harakati-movement)
5. [Endpoint 3 — Davomat va ta'til (`/attendance`)](#5-endpoint-3--davomat-va-tatil-attendance)
6. [Detal (`Batafsil`) endpointlari](#6-detal-batafsil-endpointlari)
7. [Ustuvorliklar](#7-ustuvorliklar)
8. [Ochiq savollar](#8-ochiq-savollar)

---

## 1. Umumiy konvensiyalar

### 1.1. Javob konverti

Frontend javobni `res.data.data` deb o'qiydi. Ya'ni:

```json
{ "data": { "kpi": { }, "headcount_trend": { } } }
```

Sahifalanadigan (detal) javoblar:

```json
{ "data": { "data": [ ], "total": 123 } }
```

### 1.2. Umumiy query paramlar

Uchta asosiy endpoint uchun (hammasi ixtiyoriy):

| Param | Tur | Izoh |
|---|---|---|
| `organizations` | string | Vergul bilan ajratilgan tashkilot id'lari: `12,45,78`. Yuqoridagi tashkilot filtri. Bo'sh bo'lsa — butun tizim kesimida. |
| `cache` | string | `cache=update` — "Yangilash" tugmasi bosilganda. Aks holda keshlangan natija qaytariladi. |
| `year` | int | Oylik/yillik seriyalar uchun bazis yil. Default — joriy yil. |

**Muhim:** dashboard sahifasi bir vaqtda 3 ta endpointni chaqiradi, shuning uchun har biri
**keshlangan** bo'lishi shart. Kesh kaliti `organizations` + `year` bo'yicha ajratilishi kerak.

### 1.3. `metric` obyekti — "o'tgan yilga" qatori

Maketdagi har bir `o'tgan yilga ▲ +12 600 (4,7 %)` qatori uchun **yagona** shakl ishlatiladi:

```json
{
  "value": 3412,
  "prev": 3274,
  "delta": 138,
  "delta_percent": 4.2
}
```

- `value` — joriy qiymat
- `prev` — o'tgan yildagi shu davr qiymati (taqqoslash bazasi)
- `delta` — `value - prev` (ishorali: manfiy bo'lishi mumkin)
- `delta_percent` — o'zgarish foizi, ishorali

**Foizli ko'rsatkichlarda** (masalan `87 % → 89,1 %`) `delta_percent` o'rniga **`delta_pp`**
(protsent punkt) ishlatiladi — maketda `p.p.` deb yozilgan barcha joylar:

```json
{ "value": 87.0, "prev": 84.9, "delta_pp": 2.1 }
```

O'sish/pasayish rangi va strelkasini (▲ yashil / ▼ qizil) frontend `delta` ishorasidan o'zi
chiqaradi — backend alohida `direction` yuborishi shart emas.

### 1.4. Boshqa qoidalar

- **`percent`** — har doim `0..100` oralig'ida `float` (masalan `32.8`), **backendda hisoblanadi**.
  Frontend foizni qayta hisoblamaydi, chunki agregat qiymatlar (masalan "qolgan 12 lavozim")
  yig'indisi umumiy songa teng bo'lmasligi mumkin.
- **`key`** — har bir kesim elementida barqaror inglizcha kalit bo'lishi shart (rang, ikonka va
  tarjima frontendda `key` bo'yicha tanlanadi). `label` — foydalanuvchiga ko'rsatiladigan nom
  (o'zbekcha), backend `Accept-Language` bo'yicha qaytaradi.
- **`null` vs `0`** — ma'lumot yo'q bo'lsa `null` (frontend `—` chizadi), haqiqatan nol bo'lsa `0`.
  Bu, masalan, retention matritsasida muhim (kelajakdagi oylar `null`).
- **Tartib** — ro'yxatlar backendda **kamayish tartibida** saralangan holda kelishi kerak
  (frontend qayta saralamaydi).
- Maketdagi KPI qatorlaridagi `25+` matni — Figma shablonidan qolgan artefakt
  (`Birthday Count` text node, `2959:58245`). **Bu haqiqiy maydon emas**, e'tiborga olinmaydi.

---

## 2. Hozirgi holat — nima bor

Hozirda dashboard 3 ta endpointni parallel chaqiradi:

### `GET /v1/hr/dashboard`

Frontend ishlatayotgan maydonlar:

```
workers_count, mans_count, woman_count
retired_men_count, retired_women_count
positions_rate, worker_positions_rate
fxsh_count, fxsh_mans_count, fxsh_woman_count
age_30_and_younger, age_31_to_45, age_46_and_older
higher_edu_count, middle_edu_count, special_edu_count
passports_count, passports_more_count
contract_types[]  -> { type, active_contracts }
vacation_types[]  -> { name, active_vacations }
contracts[]       -> { month: "YYYY-MM", new_contracts, ended_contracts }
birthdays.result[] -> { day: "DD-MM", count, has_more, workers[] }
```

### `GET /v1/hr/dashboard-two`

```
incentives, incentive_actions_gift_type
disciplinary_actions, disciplinary_actions_fine_type
meds_finished, meds_approaching
```

### `GET /v1/hr/dashboard-three`

```
worker_disabilities          -> { total_count, levels: [ { level, count } ] }
worker_relative_disabilities -> { total_count, levels: [ { level, count } ] }
worker_sick_leaves           -> { total_count, active_count, finished_count }
```

### Mavjud detal (`Batafsil`) endpointlari

```
GET /v1/hr/dashboard/age
GET /v1/hr/dashboard/birthdays
GET /v1/hr/dashboard/educations
GET /v1/hr/dashboard/passport
GET /v1/hr/dashboard/meds
GET /v1/hr/dashboard/pension
GET /v1/hr/dashboard/contracts
GET /v1/hr/dashboard/worker-disabilities/preview
GET /v1/hr/dashboard/worker-relative-disabilities/preview
GET /v1/hr/dashboard/incentive-actions
GET /v1/hr/dashboard/disciplinary-actions
```

Detal paramlari: `page`, `per_page`, `search`, `organizations`, `year`, `month`,
`age_start`, `age_end`, `sex`, `type`, `birth_day`, `birth_month`, `filter`.

### Taklif

Yuqoridagi 3 ta endpoint tab bo'yicha bo'linmagan — natijada har bir tabda keraksiz ma'lumot
ham tashiladi. Yangi struktura **tab bo'yicha bitta endpoint**:

| Tab | Yangi endpoint |
|---|---|
| Umumiy | `GET /v1/hr/dashboard/overview` |
| Kadrlar harakati | `GET /v1/hr/dashboard/movement` |
| Davomat va ta'til | `GET /v1/hr/dashboard/attendance` |

Eski 3 ta endpoint migratsiya davrida saqlanib turishi mumkin, keyin o'chiriladi.

---

## 3. Endpoint 1 — Umumiy (`/overview`)

`GET /v1/hr/dashboard/overview?organizations=&year=&cache=`

### 3.1. Holat jadvali

| # | Figma vidjet | Holat | Yetmayotgani |
|---|---|:---:|---|
| 1 | 4 ta KPI: Xodimlar soni, Pensiya yoshidagi xodimlar, Shtat birliklari, FXSH xodimlari | ⚠️ | har biriga **YoY** (`metric`) — hozir "o'tgan yilga" qatori umuman chizilmaydi |
| 2 | Xodimlar soni trendi — 24 oy (line, 2 seriya + maqsad chizig'i) | ❌ | oylik headcount seriyasi |
| 3 | Bugungi holat (donut: Ishda / Ta'tilda / Kasallik varaqasi / Sababsiz) | ❌ | bugungi davomat kesimi + deltalar |
| 4 | Yosh va jins bo'yicha tuzilma (5 guruh, jins kesimi, delta) | ⚠️ | hozir 3 guruh; jins kesimi va delta yo'q |
| 5 | Xodimlarning ma'lumoti bo'yicha (6 daraja + 2 agregat) | ⚠️ | hozir faqat 3 agregat; daraja kesimi va delta yo'q |
| 6 | Xodimlarning millati — waffle | ❌ | millat kesimi butunlay yo'q |
| 7 | Tug'ilgan kunlar (5 kun) | ✅ | kamida **5 kun** qaytarilishi kerak (hozir kam kelishi mumkin) |

### 3.2. Kutilgan javob

```json
{
  "data": {
    "kpi": {
      "workers": {
        "total": { "value": 3412, "prev": 3274, "delta": 138, "delta_percent": 4.2 },
        "male": 2604,
        "female": 808
      },
      "pension_age": {
        "total": { "value": 1280, "prev": 1194, "delta": 86, "delta_percent": 7.2 },
        "male": 720,
        "female": 560
      },
      "staff_units": {
        "total": { "value": 648, "prev": 639, "delta": 9, "delta_percent": 1.3 },
        "vacant": 64,
        "over": 0
      },
      "fxsh": {
        "total": { "value": 987, "prev": 1001, "delta": -14, "delta_percent": -1.4 },
        "male": 640,
        "female": 347
      }
    },

    "headcount_trend": {
      "from": "2024-09",
      "to": "2026-08",
      "target": 3300,
      "last": { "value": 3412, "prev": 3274, "delta": 138, "delta_percent": 4.2 },
      "series": [
        { "month": "2024-09", "current": 3240, "prev_year": 3150 },
        { "month": "2024-10", "current": 3255, "prev_year": 3162 },
        { "month": "2026-08", "current": 3412, "prev_year": 3274 }
      ]
    },

    "today_status": {
      "date": "2026-08-21",
      "total": 3412,
      "items": [
        { "key": "working",    "label": "Ishda",             "count": 2968, "percent": 87.0, "delta": 72, "delta_percent": 2.1 },
        { "key": "vacation",   "label": "Ta'tilda",          "count": 214,  "percent": 6.3,  "delta": 14, "delta_percent": 0.4 },
        { "key": "sick_leave", "label": "Kasallik varaqasi", "count": 138,  "percent": 4.0,  "delta": 17, "delta_percent": 0.5 },
        { "key": "absent",     "label": "Sababsiz",          "count": 92,   "percent": 2.7,  "delta": 27, "delta_percent": 0.8 }
      ]
    },

    "age_gender": {
      "buckets": [
        { "key": "18_25",   "label": "18–25", "count": 412,  "percent": 12.0, "male": 300,  "female": 112, "delta": 34, "delta_percent": 9.0 },
        { "key": "26_35",   "label": "26–35", "count": 1058, "percent": 31.0, "male": 800,  "female": 258, "delta": 60, "delta_percent": 6.0 },
        { "key": "36_45",   "label": "36–45", "count": 956,  "percent": 28.0, "male": 730,  "female": 226, "delta": 9,  "delta_percent": 1.0 },
        { "key": "46_55",   "label": "46–55", "count": 682,  "percent": 20.0, "male": 520,  "female": 162, "delta": 45, "delta_percent": 7.0 },
        { "key": "56_plus", "label": "56+",   "count": 304,  "percent": 9.0,  "male": 254,  "female": 50,  "delta": 30, "delta_percent": 11.0 }
      ],
      "gender_total": {
        "male":   { "count": 2604, "percent": 76.0 },
        "female": { "count": 808,  "percent": 24.0 },
        "delta_pp": 3.0
      }
    },

    "education": {
      "levels": [
        { "key": "vocational_college", "label": "Kasb-hunar kolleji", "count": 1120, "percent": 32.8, "delta": 22,  "delta_percent": 2.0 },
        { "key": "bachelor",           "label": "Bakalavr",           "count": 1008, "percent": 29.5, "delta": 75,  "delta_percent": 8.0 },
        { "key": "general_secondary",  "label": "Umumiy o'rta",       "count": 614,  "percent": 18.0, "delta": -39, "delta_percent": -6.0 },
        { "key": "academic_lyceum",    "label": "Akademik litsey",    "count": 450,  "percent": 13.2, "delta": 13,  "delta_percent": 3.0 },
        { "key": "master",             "label": "Magistr",            "count": 186,  "percent": 5.5,  "delta": 23,  "delta_percent": 14.1 },
        { "key": "not_specified",      "label": "Kiritilmagan",       "count": 34,   "percent": 1.0,  "delta": -30, "delta_percent": -46.9 }
      ],
      "groups": [
        { "key": "higher",            "label": "Oliy ma'lumotli", "count": 1194, "percent": 35.0, "delta_pp": 2.1 },
        { "key": "secondary_special", "label": "O'rta maxsus",    "count": 1570, "percent": 46.0, "delta_pp": 0.4 }
      ]
    },

    "nationality": {
      "total": { "value": 5000, "prev": 4380, "delta": 620, "delta_percent": 14.2 },
      "items": [
        { "key": "uzbek",      "label": "O'zbek",     "count": 4000, "percent": 80.0 },
        { "key": "tajik",      "label": "Tojik",      "count": 300,  "percent": 6.0 },
        { "key": "karakalpak", "label": "Qoraqalpoq", "count": 200,  "percent": 4.0 },
        { "key": "kazakh",     "label": "Qozoq",      "count": 150,  "percent": 3.0 },
        { "key": "russian",    "label": "Rus",        "count": 135,  "percent": 2.7 },
        { "key": "kyrgyz",     "label": "Qirg'iz",    "count": 100,  "percent": 2.0 },
        { "key": "turkmen",    "label": "Turkman",    "count": 65,   "percent": 1.3 },
        { "key": "other",      "label": "Boshqa",     "count": 50,   "percent": 1.0 }
      ]
    },

    "birthdays": {
      "result": [
        {
          "day": "08-21",
          "count": 154,
          "has_more": true,
          "workers": [
            { "id": 101, "full_name": "Aliyev Ali Alievich", "avatar": "https://.../a.jpg", "position": "Mashinist" }
          ]
        }
      ]
    }
  }
}
```

### 3.3. Izohlar

**`headcount_trend`** — 24 oylik oynada har oy uchun oy oxiridagi xodimlar soni.
`prev_year` — shu oyning o'tgan yildagi qiymati (maketda kulrang punktir chiziq).
`target` — maqsadli headcount (agar tizimda yo'q bo'lsa `null`, frontend chizmaydi).
Hozirgi `contracts[] { month, new_contracts, ended_contracts }` maydoni shu seriyani hisoblash
uchun asos bo'la oladi — **o'chirilmasligi so'raladi**.

**`today_status`** — `working + vacation + sick_leave + absent = total` bo'lishi kerak.
`delta` — kechagi kunga yoki o'tgan yilning shu kuniga nisbatan (qaysi bazis ishlatilganini
javobda `delta_basis: "yesterday" | "last_year"` deb belgilash mumkin).

**`age_gender.buckets`** — `male + female = count` bo'lishi shart.
Hozirgi `age_30_and_younger` / `age_31_to_45` / `age_46_and_older` guruhlari **5 guruhga**
almashtiriladi.

**`education.levels`** — hozirgi `higher_edu_count` / `middle_edu_count` / `special_edu_count`
`groups` massivida saqlanadi, `levels` esa yangi, batafsil kesim.
`not_specified` — ma'lumoti kiritilmagan xodimlar (bu ko'rsatkich "ma'lumot sifati" uchun ham
muhim, shuning uchun alohida qator sifatida kerak).

**`nationality`** — waffle grafik 100 ta nuqta chizadi, shuning uchun `percent` yig'indisi
100 ga yaqin bo'lishi kerak. Kichik millatlar `other` ga yig'iladi.

**`birthdays`** — `day` formati **`MM-DD`** (oy avval) — hozirgi backend ham shunday beradi,
frontend shu bo'yicha "03 - Avgust" ko'rinishida chizadi. Maketda **5 qator** ko'rsatilgan
(bugun, ertaga va keyingi 3 kun).
`workers[]` da kamida 3 ta xodim (avatar uchun) va `has_more` bilan qolganlar bor-yo'qligi.
`count` — o'sha kundagi jami tug'ilgan kunlar soni.

---

## 4. Endpoint 2 — Kadrlar harakati (`/movement`)

`GET /v1/hr/dashboard/movement?organizations=&year=&cache=`

### 4.1. Holat jadvali

| # | Figma vidjet | Holat | Yetmayotgani |
|---|---|:---:|---|
| 1 | KPI: Vakansiya yopilish muddati (o'rtacha / maqsad / eng uzun) | ❌ | time-to-fill hisobi |
| 2 | KPI: O'rtacha staj (o'rtacha / median / 10+ yil) | ❌ | staj hisobi |
| 3 | KPI: Pensiya yoshidagi xodimlar, Shtat birliklari | ⚠️ | YoY |
| 4 | Ishga qabul — shartnoma turlari (5 ustun, ulush + delta) | ⚠️ | **semantika boshqa:** hozir `contract_types[]` *faol shartnomalar* sonini beradi, maketda *davr ichida ishga qabul qilinganlar* kerak |
| 5 | Ishdan bo'shatish — treemap (5 sabab) | ❌ | bo'shatish sabablari kesimi |
| 6 | Shtat va fakt — bullet (bo'lim kesimida fakt/reja) | ⚠️ | hozir faqat umumiy `positions_rate` / `worker_positions_rate` |
| 7 | Ochiq vakansiyalar — lavozimlar (top-5 + "qolgan N lavozim") | ❌ | vakansiyalar lavozim kesimida |
| 8 | Vakansiya yoshi (3 guruh) | ❌ | vakansiya ochilganidan beri o'tgan vaqt guruhlari |
| 9 | Ishchi nogironligi ×2 (xodim + qarindosh donut) | ⚠️ | YoY delta |
| 10 | Yaqinlashayotgan hodisalar — vaqt o'qi (5 hodisa) | ❌ | 7/14/30/60/90 kunlik hodisalar |
| 11 | Ishga qabul yiliga ko'ra saqlanib qolish (retention matritsa) | ❌ | kohorta bo'yicha retention |

### 4.2. Kutilgan javob

```json
{
  "data": {
    "kpi": {
      "time_to_fill": {
        "avg_days":    { "value": 38, "prev": 44, "delta": -6, "delta_percent": -13.6 },
        "target_days": 30,
        "max_days":    124
      },
      "tenure": {
        "avg_years":           { "value": 6.4, "prev": 6.5, "delta": -0.1, "delta_percent": -1.5 },
        "median_years":        5.1,
        "over_10_years_count": 986
      },
      "pension_age": {
        "total": { "value": 1280, "prev": 1194, "delta": 86, "delta_percent": 7.2 },
        "male": 720,
        "female": 560
      },
      "staff_units": {
        "total": { "value": 648, "prev": 639, "delta": 9, "delta_percent": 1.3 },
        "vacant": 64,
        "over": 0
      }
    },

    "hiring_by_contract_type": {
      "period": { "from": "2026-01-01", "to": "2026-08-21" },
      "total": 418,
      "items": [
        { "key": "permanent",  "id": 1, "label": "Muddatsiz",    "count": 198, "percent": 47.0, "delta": 27, "delta_percent": 16.0 },
        { "key": "fixed_term", "id": 2, "label": "Muddatli",     "count": 110, "percent": 26.0, "delta": 9,  "delta_percent": 9.0 },
        { "key": "fxsh",       "id": 3, "label": "FXSH",         "count": 62,  "percent": 15.0, "delta": 12, "delta_percent": 24.0 },
        { "key": "secondary",  "id": 4, "label": "O'rindosh",    "count": 36,  "percent": 9.0,  "delta": 2,  "delta_percent": 6.0 },
        { "key": "temporary",  "id": 5, "label": "Vaqtinchalik", "count": 12,  "percent": 3.0,  "delta": 2,  "delta_percent": 20.0 }
      ]
    },

    "dismissal_reasons": {
      "period": { "from": "2026-01-01", "to": "2026-08-21" },
      "total": 302,
      "items": [
        { "key": "own_will",         "label": "O'z xohishiga ko'ra", "count": 146, "percent": 48.0 },
        { "key": "contract_ended",   "label": "Shartnoma tugadi",    "count": 68,  "percent": 23.0 },
        { "key": "mutual_agreement", "label": "Taraflar kelishuvi",  "count": 45,  "percent": 15.0 },
        { "key": "retirement",       "label": "Pensiyaga chiqish",   "count": 31,  "percent": 10.0 },
        { "key": "disciplinary",     "label": "Intizomiy jazo",      "count": 12,  "percent": 4.0 }
      ]
    },

    "staff_vs_actual": {
      "items": [
        { "organization_id": 12, "name": "Vagon xo'jaligi",   "actual": 862,  "plan": 889,  "percent": 97.0, "delta_pp": 1.2 },
        { "organization_id": 13, "name": "Lokomotiv depo",    "actual": 1240, "plan": 1334, "percent": 93.0, "delta_pp": 0.8 },
        { "organization_id": 14, "name": "Yo'l distansiyasi", "actual": 604,  "plan": 755,  "percent": 80.0, "delta_pp": -3.4 },
        { "organization_id": 15, "name": "Signalizatsiya",    "actual": 318,  "plan": 482,  "percent": 66.0, "delta_pp": -7.1 }
      ]
    },

    "open_vacancies_by_position": {
      "total": { "value": 64, "prev": 56, "delta": 8, "delta_percent": 14.2 },
      "items": [
        { "position_id": 21, "name": "Mashinist",     "count": 20, "percent": 31.0, "delta": 5,  "delta_percent": 33.0 },
        { "position_id": 22, "name": "Yo'l ishchisi", "count": 15, "percent": 23.0, "delta": 3,  "delta_percent": 25.0 },
        { "position_id": 23, "name": "Vagon ustasi",  "count": 10, "percent": 16.0, "delta": -1, "delta_percent": -9.0 },
        { "position_id": 24, "name": "Elektromexanik","count": 8,  "percent": 13.0, "delta": 1,  "delta_percent": 14.0 },
        { "position_id": 25, "name": "Dispetcher",    "count": 5,  "percent": 8.0,  "delta": -1, "delta_percent": -17.0 }
      ],
      "others": { "positions_count": 12, "count": 6, "percent": 9.0, "delta": -1, "delta_percent": -14.0 }
    },

    "vacancy_age": {
      "total": 64,
      "buckets": [
        { "key": "lt_10",  "label": "10 kundan kam",   "count": 21, "percent": 33.0, "delta": 2, "delta_percent": 11.0 },
        { "key": "10_90",  "label": "10–90 kun",       "count": 32, "percent": 50.0, "delta": 5, "delta_percent": 19.0 },
        { "key": "gt_90",  "label": "90 kundan ortiq", "count": 11, "percent": 17.0, "delta": 4, "delta_percent": 57.0 }
      ]
    },

    "worker_disabilities": {
      "total": { "value": 7490, "prev": 7350, "delta": 140, "delta_percent": 1.9 },
      "levels": [
        { "level": 1, "label": "1-Guruh", "count": 4500 },
        { "level": 2, "label": "2-Guruh", "count": 690 },
        { "level": 3, "label": "3-Guruh", "count": 2300 }
      ]
    },

    "worker_relative_disabilities": {
      "total": { "value": 7490, "prev": 7350, "delta": 140, "delta_percent": 1.9 },
      "levels": [
        { "level": 1, "label": "1-Guruh", "count": 4500 },
        { "level": 2, "label": "2-Guruh", "count": 690 },
        { "level": 3, "label": "3-Guruh", "count": 2300 }
      ]
    },

    "upcoming_events": {
      "total": { "value": 153, "prev": 134, "delta": 19, "delta_percent": 14.2 },
      "items": [
        { "key": "probation_end", "label": "Sinov muddati tugaydi",  "days": 7,  "workers_count": 9 },
        { "key": "contract_end",  "label": "Shartnoma tugaydi",      "days": 14, "workers_count": 18 },
        { "key": "contract_end",  "label": "Shartnoma tugaydi",      "days": 30, "workers_count": 29 },
        { "key": "pension_age",   "label": "Pensiya yoshiga yetadi", "days": 60, "workers_count": 14 },
        { "key": "attestation",   "label": "Attestatsiya muddati",   "days": 90, "workers_count": 83 }
      ]
    },

    "retention_cohorts": {
      "months": [6, 12, 18, 24, 30],
      "rows": [
        { "year": 2022, "hired_count": 286, "values": [88.0, 79.0, 71.0, 66.0, 62.0] },
        { "year": 2023, "hired_count": 341, "values": [86.0, 76.0, 68.0, 63.0, null] },
        { "year": 2024, "hired_count": 372, "values": [84.0, 74.0, 67.0, null,  null] },
        { "year": 2025, "hired_count": 396, "values": [81.0, 70.0, null,  null,  null] },
        { "year": 2026, "hired_count": 418, "values": [79.0, null,  null,  null,  null] }
      ]
    }
  }
}
```

### 4.3. Izohlar

**`time_to_fill`** — vakansiya ochilgan sanadan to yopilgan (xodim qabul qilingan) sanagacha
o'tgan kunlar o'rtachasi. Faqat **davr ichida yopilgan** vakansiyalar hisobga olinadi.
`target_days` — normativ muddat (agar tizimda sozlama yo'q bo'lsa `null`).
`max_days` — davr ichida yopilgan vakansiyalar orasidagi eng uzun muddat.

**`tenure`** — joriy faol xodimlar bo'yicha ishga qabul sanasidan bugungacha o'tgan yillar.
`avg_years` va `median_years` alohida kerak (maketda ikkisi ham ko'rsatilgan).

**`hiring_by_contract_type`** — ⚠️ **eng muhim semantik o'zgarish.** Hozirgi
`contract_types[] { type, active_contracts }` — *ayni damdagi faol shartnomalar*.
Maket esa *davr ichida ishga qabul qilinganlar*ni shartnoma turi kesimida so'raydi
(`delta` — o'tgan yilning shu davriga nisbatan). Ikkisi ham kerak bo'lsa, ikkinchisini
`active_by_contract_type` deb alohida qo'shish mumkin.

**`staff_vs_actual`** — `organizations` filtri qo'llanganda, filtrlangan tashkilotlarning
**bir pog'ona pastdagi** bo'linmalari qatorlari qaytariladi. Filtr bo'sh bo'lsa — eng yuqori
darajadagi bo'linmalar. Maketda 4 qator, lekin frontend `N` qatorni chizadi (scroll bilan).

**`open_vacancies_by_position`** — top-5 lavozim + qolganlari `others` da yig'iladi
(maketda "Qolgan 12 lavozim" deb ko'rsatilgan — shu sababli `positions_count` kerak).

**`vacancy_age`** — hozirda **ochiq** vakansiyalarning ochilganidan beri o'tgan kunlari
bo'yicha 3 guruh. `total` = `open_vacancies_by_position.total.value` bo'lishi kerak.

**`worker_disabilities` / `worker_relative_disabilities`** — hozirgi shakl saqlanadi, faqat
`total_count` (int) o'rniga `total` (`metric` obyekti) bo'ladi, va `levels[]` ga `label`
qo'shiladi.

**`upcoming_events`** — `days` — bugundan boshlab necha kun ichida hodisa yuz beradi
(maketda 7/14/30/60/90 nuqtalari). Bir `key` bir nechta `days` bilan takrorlanishi mumkin
(masalan `contract_end` 14 va 30 kunda). `total` — barcha hodisalar yig'indisi.

**`retention_cohorts`** — qatorlar: ishga qabul yili + o'sha yili qabul qilinganlar soni.
`values[]` — `months[]` bilan bir xil uzunlikda; hali kelmagan davr uchun `null`
(frontend `—` chizadi). Qiymat — o'sha kohortadan hali ham ishlab turganlar foizi.

---

## 5. Endpoint 3 — Davomat va ta'til (`/attendance`)

`GET /v1/hr/dashboard/attendance?organizations=&year=&cache=`

### 5.1. Holat jadvali

| # | Figma vidjet | Holat | Yetmayotgani |
|---|---|:---:|---|
| 1 | KPI: Bugun ishda / Ta'tilda / Surunkali kechikish | ❌ | uchalasi ham yo'q |
| 2 | Ta'til holati — bo'lim kesimida (3 qatlamli ustun) | ⚠️ | hozir `vacation_types[]` faqat **tur** kesimida; bo'lim kesimi va kunlar (chiqqan/rejada/yig'ilgan) yo'q |
| 3 | Kasallik varaqalari | ⚠️ | YoY delta |
| 4 | Rag'batlantirish va intizomiy jazo — oyma-oy (12 oy ×2 seriya) | ⚠️ | hozir faqat umumiy sonlar; oylik seriya yo'q |
| 5 | Rag'batlantirish — radial (3 tur) | ⚠️ | hozir 2 tur; ulush va delta yo'q |
| 6 | Intizomiy jazo — ustun (3 tur) | ⚠️ | hozir 2 tur; ulush va delta yo'q |

### 5.2. Kutilgan javob

```json
{
  "data": {
    "kpi": {
      "at_work_today": {
        "count": 2968,
        "percent": 87.0,
        "on_vacation": 214,
        "delta_pp": 2.1
      },
      "on_vacation": {
        "count": 214,
        "percent": 6.3,
        "planned": 178,
        "delta_pp": 0.4
      },
      "chronic_late": {
        "count": 38,
        "percent": 1.1,
        "three_plus_times": 17,
        "delta": 9,
        "delta_percent": 31.0
      }
    },

    "vacation_by_department": {
      "unit": "days",
      "legend": {
        "used":    { "value": 8420, "percent": 71.0 },
        "planned": { "value": 2180, "percent": 18.0 },
        "accrued": { "value": 1290, "percent": 11.0, "delta_percent": 24.0 }
      },
      "items": [
        { "organization_id": 13, "name": "Lokomotiv", "total": 4350, "used": 3100, "planned": 800, "accrued": 450 },
        { "organization_id": 12, "name": "Vagon",     "total": 3030, "used": 2200, "planned": 550, "accrued": 280 },
        { "organization_id": 14, "name": "Yo'l",      "total": 2710, "used": 1950, "planned": 500, "accrued": 260 },
        { "organization_id": 15, "name": "Signal",    "total": 1800, "used": 1170, "planned": 330, "accrued": 300 }
      ]
    },

    "sick_leaves": {
      "total": { "value": 5190, "prev": 5378, "delta": -188, "delta_percent": -3.5 },
      "active": 4500,
      "finished": 690
    },

    "incentive_vs_discipline_monthly": {
      "year": 2026,
      "incentives":   { "total": { "value": 268, "prev": 235, "delta": 33, "delta_percent": 14.0 } },
      "disciplinary": { "total": { "value": 94,  "prev": 83,  "delta": 11, "delta_percent": 13.3 } },
      "series": [
        { "month": 1,  "incentives": 50, "disciplinary": 26 },
        { "month": 2,  "incentives": 50, "disciplinary": 26 },
        { "month": 3,  "incentives": 50, "disciplinary": 26 },
        { "month": 4,  "incentives": 50, "disciplinary": 26 },
        { "month": 5,  "incentives": 50, "disciplinary": 26 },
        { "month": 6,  "incentives": 50, "disciplinary": 26 },
        { "month": 7,  "incentives": 50, "disciplinary": 26 },
        { "month": 8,  "incentives": 50, "disciplinary": 26 },
        { "month": 9,  "incentives": 0,  "disciplinary": 0 },
        { "month": 10, "incentives": 0,  "disciplinary": 0 },
        { "month": 11, "incentives": 0,  "disciplinary": 0 },
        { "month": 12, "incentives": 0,  "disciplinary": 0 }
      ]
    },

    "incentive_types": {
      "total": { "value": 268, "prev": 235, "delta": 33, "delta_percent": 14.0 },
      "items": [
        { "key": "money",                 "id": 1, "label": "Pul mukofoti",   "count": 129, "percent": 48.0, "delta": 16, "delta_percent": 14.0 },
        { "key": "honorary_certificate",  "id": 2, "label": "Faxriy yorliq",  "count": 78,  "percent": 29.0, "delta": 4,  "delta_percent": 6.0 },
        { "key": "gratitude",             "id": 3, "label": "Minnatdorchilik","count": 61,  "percent": 23.0, "delta": 5,  "delta_percent": 9.0 }
      ]
    },

    "disciplinary_types": {
      "total": { "value": 94, "prev": 83, "delta": 11, "delta_percent": 13.3 },
      "items": [
        { "key": "reprimand", "id": 1, "label": "Hayfsan",       "count": 39, "percent": 41.0, "delta": 6, "delta_percent": 18.0 },
        { "key": "warning",   "id": 2, "label": "Ogohlantirish", "count": 35, "percent": 37.0, "delta": 3, "delta_percent": 8.0 },
        { "key": "other",     "id": 3, "label": "Boshqa",        "count": 20, "percent": 22.0, "delta": 1, "delta_percent": 5.0 }
      ]
    }
  }
}
```

### 5.3. Izohlar

**`kpi.at_work_today` / `on_vacation`** — `percent` jami xodimlar sonidan ulush.
`delta_pp` — o'tgan yilning shu kuniga nisbatan protsent punkt farqi.
`on_vacation.planned` — grafikka ko'ra bugun ta'tilda bo'lishi kerak bo'lganlar
(fakt bilan reja farqi ko'rinadi).

**`kpi.chronic_late`** — davr (joriy oy) ichida **kamida 1 marta** kechikkan xodimlar soni;
`three_plus_times` — 3 va undan ko'p marta kechikkanlar. Manba turnstile modulidan bo'lishi
mumkin — [Ochiq savollar](#8-ochiq-savollar) bo'limiga qarang.

**`vacation_by_department`** — hozirgi `vacation_types[] { name, active_vacations }` o'rniga
**bo'lim kesimida** va **3 qatlamli**:
- `used` — foydalanilgan (chiqqan) ta'til kunlari
- `planned` — grafik bo'yicha rejalashtirilgan, hali chiqilmagan kunlar
- `accrued` — yig'ilib qolgan (foydalanilmagan, o'tgan davrlardan)

`total` = `used + planned + accrued`. `unit: "days"` — o'lchov birligi kunlarda
(agar xodim hisobida bo'lsa `unit: "workers"`, lekin maket kunlarni nazarda tutadi).
Agar ta'til turi kesimi ham kerak bo'lsa, u alohida `vacation_by_type[]` sifatida qo'shiladi.

**`sick_leaves`** — hozirgi `worker_sick_leaves` shakli saqlanadi, faqat `total_count` (int)
o'rniga `total` (`metric`), `active_count` → `active`, `finished_count` → `finished`.

**`incentive_vs_discipline_monthly.series`** — **har doim 12 element** (yanvar–dekabr),
kelmagan oylar `0`. Hozirda faqat yillik jami sonlar bor.

**`incentive_types` / `disciplinary_types`** — hozirda backend faqat **2 turni** ajratadi
(`incentives` / `incentive_actions_gift_type`, `disciplinary_actions` /
`disciplinary_actions_fine_type`). Maketda **3 tur** bor. Eng to'g'ri yechim — turlarni
qattiq kodlash o'rniga **ma'lumotnomadagi barcha turlarni** `items[]` sifatida qaytarish
(frontend `N` element bilan ishlaydi, ranglarni `key` bo'yicha beradi).

---

## 6. Detal (`Batafsil`) endpointlari

Maketdagi har bir `Batafsil ↗` havolasi xodimlar ro'yxatini sahifalangan jadvalda ochadi.

### 6.1. Umumiy naqsh

Barcha detal endpointlari bir xil paramlarni qabul qiladi:

| Param | Izoh |
|---|---|
| `page` | Sahifa raqami (1 dan) |
| `per_page` | Sahifadagi yozuvlar soni (default 15) |
| `search` | Xodim F.I.Sh. bo'yicha qidiruv |
| `organizations` | Tashkilot filtri (asosiy endpoint bilan bir xil) |
| + o'ziga xos filtr | Har bir endpoint uchun alohida (pastda) |

Javob:

```json
{ "data": { "data": [ ], "total": 123 } }
```

Qatorlarda kutilgan maydonlar (mavjud jadvallar bilan bir xil):

```
worker              — xodim F.I.Sh.
organization.name   — tashkilot
department.name     — bo'lim
position            — lavozim
birthday, age       — tug'ilgan sana, yosh
from, to, duration  — davr boshi/oxiri, davomiyligi
status, reason, date
```

### 6.2. Mavjud endpointlarga qo'shilishi kerak bo'lgan filtrlar

| Endpoint | Qo'shilishi kerak |
|---|---|
| `GET /v1/hr/dashboard/educations` | `type` param **6 ta yangi `key`ni** qabul qilishi: `vocational_college`, `bachelor`, `general_secondary`, `academic_lyceum`, `master`, `not_specified` |
| `GET /v1/hr/dashboard/age` | `bucket` param: `18_25`, `26_35`, `36_45`, `46_55`, `56_plus` (hozirgi `age_start`/`age_end` bilan birga) + `sex` filtri |
| `GET /v1/hr/dashboard/incentive-actions` | `type` param barcha rag'batlantirish turlari `key`i bo'yicha |
| `GET /v1/hr/dashboard/disciplinary-actions` | `type` param barcha jazo turlari `key`i bo'yicha |
| `GET /v1/hr/dashboard/contracts` | `contract_type` param (`permanent`, `fixed_term`, `fxsh`, `secondary`, `temporary`) |

### 6.3. Yangi kerak bo'lgan detal endpointlari

| Endpoint | Filtr | Qaysi vidjet uchun |
|---|---|---|
| `GET /v1/hr/dashboard/attendance-today` | `status=working\|vacation\|sick_leave\|absent` | Umumiy → Bugungi holat; Davomat → KPI |
| `GET /v1/hr/dashboard/nationalities` | `nationality=<key>` | Umumiy → Millat waffle |
| `GET /v1/hr/dashboard/headcount-trend` | `month=YYYY-MM` | Umumiy → 24 oylik trend |
| `GET /v1/hr/dashboard/dismissals` | `reason=<key>`, `from`, `to` | Kadrlar harakati → Ishdan bo'shatish |
| `GET /v1/hr/dashboard/vacancies` | `position_id`, `age_bucket=lt_10\|10_90\|gt_90` | Kadrlar harakati → Ochiq vakansiyalar, Vakansiya yoshi |
| `GET /v1/hr/dashboard/staff-units` | `organization_id`, `state=vacant\|filled\|over` | Kadrlar harakati → Shtat va fakt |
| `GET /v1/hr/dashboard/upcoming-events` | `type=<key>`, `days` | Kadrlar harakati → Yaqinlashayotgan hodisalar |
| `GET /v1/hr/dashboard/retention` | `year`, `month_offset=6\|12\|18\|24\|30` | Kadrlar harakati → Retention matritsa |
| `GET /v1/hr/dashboard/vacations` | `organization_id`, `state=used\|planned\|accrued` | Davomat → Ta'til holati |
| `GET /v1/hr/dashboard/sick-leaves` | `state=active\|finished` | Davomat → Kasallik varaqalari |
| `GET /v1/hr/dashboard/chronic-late` | `min_times` | Davomat → Surunkali kechikish KPI |

---

## 7. Ustuvorliklar

Maketni bosqichma-bosqich yopish uchun tavsiya etilgan tartib.

### 1-bosqich — arzon, lekin maketning katta qismini yopadi

1. **Barcha KPI kartalariga YoY qo'shish** (`metric` obyekti). Bu 11 ta kartadagi
   "o'tgan yilga" qatorini bir yo'la ishga tushiradi — hozir ular umuman chizilmaydi.
2. **Mavjud kesimlarni to'liq ochish** — turlarni qattiq kodlash o'rniga ma'lumotnomadan
   to'liq ro'yxat: rag'batlantirish turlari (2 → N), jazo turlari (2 → N),
   ma'lumot darajalari (3 agregat → 6 daraja), yosh guruhlari (3 → 5).
3. **Har bir kesim elementiga `percent` va `delta`** qo'shish.

### 2-bosqich — yangi agregatlar

4. Millat kesimi (`nationality`)
5. Bugungi davomat holati (`today_status`, `kpi.at_work_today`, `kpi.on_vacation`)
6. Ishdan bo'shatish sabablari (`dismissal_reasons`)
7. 24 oylik headcount trendi (`headcount_trend`)
8. Rag'batlantirish/jazo oylik seriyasi (`incentive_vs_discipline_monthly.series`)
9. Shtat va fakt bo'lim kesimida (`staff_vs_actual`)
10. Ta'til 3 qatlamli, bo'lim kesimida (`vacation_by_department`)
11. Yosh guruhlarida jins kesimi (`age_gender.buckets[].male/female`)

### 3-bosqich — og'ir hisoblar

12. Vakansiya yopilish muddati (`time_to_fill`)
13. O'rtacha/median staj (`tenure`)
14. Ochiq vakansiyalar lavozim kesimida + vakansiya yoshi
15. Yaqinlashayotgan hodisalar (`upcoming_events`)
16. Retention kohortalari (`retention_cohorts`)
17. Surunkali kechikish (`chronic_late`)

Har bir bosqichdan keyin frontend darhol ulanadi — endpointni to'liq tugallashni kutish shart
emas, yangi kalitlar qo'shilgani sari kartalar to'ldiriladi.

---

## 8. Ochiq savollar

Backend tomonidan aniqlashtirilishi kerak:

1. **Davomat manbasi.** "Ishda / Sababsiz / Surunkali kechikish" ko'rsatkichlari turnstile
   modulidan (`/v1/turnstile/hik-central/dashboard` allaqachon mavjud) olinadimi yoki HR
   modulida alohida davomat jadvali bormi? Agar turnstile'dan bo'lsa — turnikeit qo'yilmagan
   tashkilotlar uchun qanday qiymat qaytariladi (`null` yoki `0`)?

2. **Ta'til o'lchov birligi.** `vacation_by_department` da ustunlar **kunlar** hisobidami yoki
   **xodimlar** hisobida? Maketdagi 4 350 / 3 030 / 2 710 / 1 800 raqamlari kunlarga o'xshaydi,
   lekin tasdiqlash kerak.

3. **Retention bazasi.** Kohorta ishga qabul **buyrug'i** sanasidan hisoblanadimi yoki
   **shartnoma** boshlanish sanasidan? Bo'lim ichida bir lavozimdan ikkinchisiga o'tgan xodim
   kohortada saqlanadimi?

4. **Taqqoslash bazasi.** `delta` hamma joyda "o'tgan yilning shu davri" bilan taqqoslanadi
   deb qabul qilindi. Bugungi holat (`today_status`) uchun bazis "kechagi kun" bo'lishi
   mantiqiyroq — qaysi biri kerakligini tasdiqlash kerak (javobda `delta_basis` maydoni bilan
   belgilash mumkin).

5. **Shtat rejasi.** `staff_vs_actual.plan` shtat jadvalidan olinadimi? Hozirgi
   `positions_rate` / `worker_positions_rate` maydonlari kasr sonlar (`rate`) — bu ish
   birligi (0.5 shtat) hisobidami yoki xodim sonidami?

6. **Vakansiya obyekti.** Tizimda "vakansiya" alohida entity sifatida bormi (ochilgan sana,
   yopilgan sana, lavozim bilan)? Agar yo'q bo'lsa, `time_to_fill`, `open_vacancies_by_position`
   va `vacancy_age` uchun avval shu model kerak bo'ladi.

7. **`Ma'lumot sifati` va `Audit` tablari.** Bu hujjatga kirmagan, lekin maketda mavjud.
   Audit uchun `GET /v1/hr/dashboard-audit-personal` va `GET /v1/hr/dashboard-audit-preview` allaqachon bor.
   Ma'lumot sifati tabi uchun alohida hujjat kerakmi?
