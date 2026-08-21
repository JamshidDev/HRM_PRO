/**
 * Figma v3 dashboard uchun mock ma'lumot.
 *
 * Shakli repo ildizidagi `dashboard-api.md` dagi API kontraktiga **aynan mos**:
 * backend shu endpointlarni bergach `adapter.js` javobni shu shaklga o'giradi va
 * `merge.js` real qiymatlarni mock ustiga yozadi — kartalarga tegilmaydi.
 *
 * Raqamlar maketdan aynan olingan. Ikki joyda maketning o'zi ziddiyatli:
 *   1. KPI kartalarining "Erkaklar / Ayollar" qatorlari (maketda ikkisi ham
 *      `16 000`) jami songa yig'ilmaydi — bu Figma shablonidan qolgan artefakt,
 *      shu sababli qatorlar jami songa mos ravishda (76 % / 24 %) taqsimlangan.
 *   2. Umumiy tabdagi KPI jamilari (280 000 …) o'sha tabdagi grafiklar bilan
 *      bir xil masshtabda emas (grafiklar 3 412 xodim atrofida). Maket bilan
 *      solishtirish oson bo'lishi uchun maketdagi qiymatlar o'zgartirilmadi.
 */

// ── Yordamchilar ──────────────────────────────────────────────────────────────

/** `{value, prev, delta, delta_percent}` — kontraktdagi `metric` obyekti. */
const metric = (value, prev) => {
  const delta = value - prev
  return {
    value,
    prev,
    delta,
    delta_percent: prev ? Number(((delta / prev) * 100).toFixed(1)) : null
  }
}

/** `2024-09` dan boshlab `count` ta oy: `['2024-09', '2024-10', …]` */
const monthRange = (startYear, startMonth, count) =>
  Array.from({ length: count }, (_, i) => {
    const month = startMonth - 1 + i
    const year = startYear + Math.floor(month / 12)
    return `${year}-${String((month % 12) + 1).padStart(2, '0')}`
  })

// ── Umumiy (overview) ─────────────────────────────────────────────────────────

const HEADCOUNT_CURRENT = [
  3240, 3232, 3226, 3238, 3246, 3252, 3250, 3244, 3258, 3276, 3268, 3252, 3244,
  3262, 3288, 3310, 3336, 3358, 3372, 3364, 3348, 3340, 3366, 3412
]

const HEADCOUNT_PREV = [
  3104, 3112, 3120, 3126, 3134, 3142, 3150, 3158, 3164, 3172, 3180, 3188, 3196,
  3204, 3212, 3220, 3228, 3236, 3244, 3252, 3258, 3264, 3270, 3274
]

const TREND_MONTHS = monthRange(2024, 9, 24)

const overview = {
  kpi: {
    workers: { total: metric(280000, 267400), male: 212800, female: 67200 },
    pension_age: { total: metric(1280000, 1194000), male: 720000, female: 560000 },
    staff_units: { total: metric(648000, 639600), vacant: 64000, over: 0 },
    fxsh: { total: metric(987000, 1001500), male: 750120, female: 236880 }
  },

  headcount_trend: {
    from: TREND_MONTHS[0],
    to: TREND_MONTHS[TREND_MONTHS.length - 1],
    target: 3300,
    last: metric(3412, 3274),
    series: TREND_MONTHS.map((month, idx) => ({
      month,
      current: HEADCOUNT_CURRENT[idx],
      prev_year: HEADCOUNT_PREV[idx]
    }))
  },

  today_status: {
    date: null,
    total: 3412,
    items: [
      { key: 'working', count: 2968, percent: 87.0, delta: 72, delta_percent: 2.1 },
      { key: 'vacation', count: 214, percent: 6.3, delta: 14, delta_percent: 0.4 },
      { key: 'sick_leave', count: 138, percent: 4.0, delta: 17, delta_percent: 0.5 },
      { key: 'absent', count: 92, percent: 2.7, delta: 27, delta_percent: 0.8 }
    ]
  },

  // Yosh guruhlari yorliqlari barcha tillarda bir xil, shu sababli kontraktda
  // ko'rsatilganidek `label` bilan beriladi (i18n kaliti kerak emas).
  age_gender: {
    buckets: [
      { key: '18_25', label: '18–25', count: 412, percent: 12.0, male: 300, female: 112, delta: 34, delta_percent: 9.0 },
      { key: '26_35', label: '26–35', count: 1058, percent: 31.0, male: 800, female: 258, delta: 60, delta_percent: 6.0 },
      { key: '36_45', label: '36–45', count: 956, percent: 28.0, male: 730, female: 226, delta: 9, delta_percent: 1.0 },
      { key: '46_55', label: '46–55', count: 682, percent: 20.0, male: 520, female: 162, delta: 45, delta_percent: 7.0 },
      { key: '56_plus', label: '56+', count: 304, percent: 9.0, male: 254, female: 50, delta: 30, delta_percent: 11.0 }
    ],
    gender_total: {
      male: { count: 2604, percent: 76.0 },
      female: { count: 808, percent: 24.0 },
      delta_pp: 3.0
    }
  },

  education: {
    levels: [
      { key: 'vocational_college', count: 1120, percent: 32.8, delta: 22, delta_percent: 2.0 },
      { key: 'bachelor', count: 1008, percent: 29.5, delta: 75, delta_percent: 8.0 },
      { key: 'general_secondary', count: 614, percent: 18.0, delta: -39, delta_percent: -6.0 },
      { key: 'academic_lyceum', count: 450, percent: 13.2, delta: 13, delta_percent: 3.0 },
      { key: 'master', count: 186, percent: 5.5, delta: 23, delta_percent: 14.1 },
      { key: 'not_specified', count: 34, percent: 1.0, delta: -30, delta_percent: -46.9 }
    ],
    groups: [
      { key: 'higher', count: 1194, percent: 35.0, delta_pp: 2.1 },
      { key: 'secondary_special', count: 1570, percent: 46.0, delta_pp: 0.4 }
    ]
  },

  nationality: {
    total: metric(5000, 4380),
    items: [
      { key: 'uzbek', count: 4000, percent: 80.0 },
      { key: 'tajik', count: 300, percent: 6.0 },
      { key: 'karakalpak', count: 200, percent: 4.0 },
      { key: 'kazakh', count: 150, percent: 3.0 },
      { key: 'russian', count: 135, percent: 2.7 },
      { key: 'kyrgyz', count: 100, percent: 2.0 },
      { key: 'turkmen', count: 65, percent: 1.3 },
      { key: 'other', count: 50, percent: 1.0 }
    ]
  },

  // `day` — backend hozir `MM-DD` formatida beradi (`adapter.js` ham shunday
  // o'giradi), shu sababli mock ham xuddi shu formatda.
  birthdays: {
    result: [
      { day: '08-03', count: 154, has_more: true, workers: [] },
      { day: '08-04', count: 25, has_more: true, workers: [] },
      { day: '08-05', count: 3, has_more: true, workers: [] },
      { day: '08-06', count: 0, has_more: false, workers: [] },
      { day: '08-07', count: 154, has_more: true, workers: [] }
    ]
  }
}

// ── Kadrlar harakati (movement) ───────────────────────────────────────────────

const movement = {
  kpi: {
    time_to_fill: { avg_days: metric(38, 44), target_days: 30, max_days: 124 },
    tenure: {
      avg_years: { value: 6.4, prev: 6.5, delta: -0.1, delta_percent: -1.5 },
      median_years: 5.1,
      over_10_years_count: 986
    },
    pension_age: overview.kpi.pension_age,
    staff_units: overview.kpi.staff_units
  },

  hiring_by_contract_type: {
    total: 418,
    items: [
      { key: 'permanent', count: 198, percent: 47.0, delta: 27, delta_percent: 16.0 },
      { key: 'fixed_term', count: 110, percent: 26.0, delta: 9, delta_percent: 9.0 },
      { key: 'fxsh', count: 62, percent: 15.0, delta: 12, delta_percent: 24.0 },
      { key: 'secondary', count: 36, percent: 9.0, delta: 2, delta_percent: 6.0 },
      { key: 'temporary', count: 12, percent: 3.0, delta: 2, delta_percent: 20.0 }
    ]
  },

  dismissal_reasons: {
    total: 302,
    items: [
      { key: 'own_will', count: 146, percent: 48.0 },
      { key: 'contract_ended', count: 68, percent: 23.0 },
      { key: 'mutual_agreement', count: 45, percent: 15.0 },
      { key: 'retirement', count: 31, percent: 10.0 },
      { key: 'disciplinary', count: 12, percent: 4.0 }
    ]
  },

  staff_vs_actual: {
    items: [
      { organization_id: 1, name: "Vagon xo'jaligi", actual: 862, plan: 889, percent: 97.0, delta_pp: 1.2 },
      { organization_id: 2, name: 'Lokomotiv depo', actual: 1240, plan: 1334, percent: 93.0, delta_pp: 0.8 },
      { organization_id: 3, name: "Yo'l distansiyasi", actual: 604, plan: 755, percent: 80.0, delta_pp: -3.4 },
      { organization_id: 4, name: 'Signalizatsiya', actual: 318, plan: 482, percent: 66.0, delta_pp: -7.1 }
    ]
  },

  open_vacancies_by_position: {
    total: metric(64, 56),
    items: [
      { position_id: 1, name: 'Mashinist', count: 20, percent: 31.0, delta: 5, delta_percent: 33.0 },
      { position_id: 2, name: "Yo'l ishchisi", count: 15, percent: 23.0, delta: 3, delta_percent: 25.0 },
      { position_id: 3, name: 'Vagon ustasi', count: 10, percent: 16.0, delta: -1, delta_percent: -9.0 },
      { position_id: 4, name: 'Elektromexanik', count: 8, percent: 13.0, delta: 1, delta_percent: 14.0 },
      { position_id: 5, name: 'Dispetcher', count: 5, percent: 8.0, delta: -1, delta_percent: -17.0 }
    ],
    others: { positions_count: 12, count: 6, percent: 9.0, delta: -1, delta_percent: -14.0 }
  },

  vacancy_age: {
    total: 64,
    buckets: [
      { key: 'lt_10', count: 21, percent: 32.8, delta: 2, delta_percent: 11.0 },
      { key: '10_90', count: 32, percent: 50.0, delta: 5, delta_percent: 19.0 },
      { key: 'gt_90', count: 11, percent: 17.2, delta: 4, delta_percent: 57.0 }
    ]
  },

  worker_disabilities: {
    total: metric(987000, 969000),
    levels: [
      { level: 1, count: 4500 },
      { level: 2, count: 690 },
      { level: 3, count: 2300 }
    ]
  },

  worker_relative_disabilities: {
    total: metric(987000, 969000),
    levels: [
      { level: 1, count: 4500 },
      { level: 2, count: 690 },
      { level: 3, count: 2300 }
    ]
  },

  upcoming_events: {
    total: metric(153, 134),
    items: [
      { key: 'probation_end', days: 7, workers_count: 9 },
      { key: 'contract_end', days: 14, workers_count: 18 },
      { key: 'contract_end', days: 30, workers_count: 29 },
      { key: 'pension_age', days: 60, workers_count: 14 },
      { key: 'attestation', days: 90, workers_count: 83 }
    ]
  },

  retention_cohorts: {
    months: [6, 12, 18, 24, 30],
    rows: [
      { year: 2022, hired_count: 286, values: [88.0, 79.0, 71.0, 66.0, 62.0] },
      { year: 2023, hired_count: 341, values: [86.0, 76.0, 68.0, 63.0, null] },
      { year: 2024, hired_count: 372, values: [84.0, 74.0, 67.0, null, null] },
      { year: 2025, hired_count: 396, values: [81.0, 70.0, null, null, null] },
      { year: 2026, hired_count: 418, values: [79.0, null, null, null, null] }
    ]
  }
}

// ── Davomat va ta'til (attendance) ────────────────────────────────────────────

const attendance = {
  kpi: {
    at_work_today: { count: 2968, percent: 87.0, on_vacation: 214, delta_pp: 2.1 },
    on_vacation: { count: 214, percent: 6.3, planned: 178, delta_pp: 0.4 },
    chronic_late: { count: 38, percent: 1.1, three_plus_times: 17, delta: 9, delta_percent: 31.0 }
  },

  vacation_by_department: {
    unit: 'days',
    legend: {
      used: { value: 8420, percent: 71.0 },
      planned: { value: 2180, percent: 18.0 },
      accrued: { value: 1290, percent: 11.0, delta_percent: 24.0 }
    },
    items: [
      { organization_id: 1, name: 'Lokomotiv', used: 3100, planned: 800, accrued: 450 },
      { organization_id: 2, name: 'Vagon', used: 2200, planned: 550, accrued: 280 },
      { organization_id: 3, name: "Yo'l", used: 1950, planned: 500, accrued: 260 },
      { organization_id: 4, name: 'Signal', used: 1170, planned: 330, accrued: 300 }
    ]
  },

  sick_leaves: { total: metric(987000, 1023000), active: 4500, finished: 690 },

  incentive_vs_discipline_monthly: {
    year: new Date().getFullYear(),
    incentives: { total: metric(268, 235) },
    disciplinary: { total: metric(94, 83) },
    series: [
      { month: 1, incentives: 50, disciplinary: 26 },
      { month: 2, incentives: 50, disciplinary: 26 },
      { month: 3, incentives: 50, disciplinary: 26 },
      { month: 4, incentives: 50, disciplinary: 26 },
      { month: 5, incentives: 50, disciplinary: 26 },
      { month: 6, incentives: 50, disciplinary: 26 },
      { month: 7, incentives: 50, disciplinary: 26 },
      { month: 8, incentives: 50, disciplinary: 26 },
      { month: 9, incentives: 0, disciplinary: 0 },
      { month: 10, incentives: 0, disciplinary: 0 },
      { month: 11, incentives: 0, disciplinary: 0 },
      { month: 12, incentives: 0, disciplinary: 0 }
    ]
  },

  incentive_types: {
    total: metric(5000, 4380),
    items: [
      { key: 'money', count: 129, percent: 48.0, delta: 16, delta_percent: 14.0 },
      { key: 'honorary_certificate', count: 78, percent: 29.0, delta: 4, delta_percent: 6.0 },
      { key: 'gratitude', count: 61, percent: 23.0, delta: 5, delta_percent: 9.0 }
    ]
  },

  disciplinary_types: {
    total: metric(5000, 4380),
    items: [
      { key: 'reprimand', count: 39, percent: 41.0, delta: 6, delta_percent: 18.0 },
      { key: 'warning', count: 35, percent: 37.0, delta: 3, delta_percent: 8.0 },
      { key: 'other', count: 20, percent: 22.0, delta: 1, delta_percent: 5.0 }
    ]
  }
}

// ── Drill-down ("Batafsil") jadvallari ────────────────────────────────────────

/**
 * Mock kartalarning "Batafsil" jadvallari uchun xodimlar ro'yxati.
 * Backend endpointi paydo bo'lganda `constants.js` dagi `mockKey` o'rniga
 * `filterCallback` beriladi va bu ma'lumot ishlatilmay qoladi.
 */
const WORKER_NAMES = [
  ['Aliyev', 'Alisher', 'Baxtiyorovich', 'Mashinist', 'Lokomotiv depo'],
  ['Karimova', 'Nilufar', 'Rustamovna', 'Dispetcher', 'Signalizatsiya'],
  ['Yusupov', 'Jasur', 'Farhodovich', 'Vagon ustasi', "Vagon xo'jaligi"],
  ['Toshmatov', 'Bekzod', 'Ilhomovich', 'Elektromexanik', 'Signalizatsiya'],
  ['Ismoilova', 'Zulfiya', 'Anvarovna', 'Buxgalter', 'Boshqarma'],
  ['Rahimov', 'Sardor', 'Ulug‘bekovich', "Yo'l ishchisi", "Yo'l distansiyasi"],
  ['Abdullayev', 'Otabek', 'Shavkatovich', 'Mashinist', 'Lokomotiv depo'],
  ['Norboyeva', 'Dilnoza', 'Qahramonovna', 'Kadrlar inspektori', 'Boshqarma'],
  ['Sultonov', 'Aziz', 'Murodovich', 'Vagon ustasi', "Vagon xo'jaligi"],
  ['Xolmatov', 'Ravshan', 'Tohirovich', "Yo'l ishchisi", "Yo'l distansiyasi"],
  ['Ergasheva', 'Kamola', 'Baxodirovna', 'Iqtisodchi', 'Boshqarma'],
  ['Qodirov', 'Shohruh', 'Nodirovich', 'Elektromexanik', 'Signalizatsiya'],
  ['Mirzayev', 'Ulug‘bek', 'Sherzodovich', 'Mashinist', 'Lokomotiv depo'],
  ['Saidova', 'Malika', 'Akmalovna', 'Tabelchi', "Vagon xo'jaligi"],
  ['Tursunov', 'Doniyor', 'Ravshanovich', "Yo'l ishchisi", "Yo'l distansiyasi"]
]

const mockWorkers = WORKER_NAMES.map(([last, first, middle, position, organization], idx) => ({
  id: idx + 1,
  worker: {
    id: idx + 1,
    photo: null,
    last_name: last,
    first_name: first,
    middle_name: middle,
    birthday: `${String((idx % 28) + 1).padStart(2, '0')}.${String((idx % 12) + 1).padStart(2, '0')}.19${70 + (idx % 25)}`,
    age: 25 + ((idx * 3) % 35)
  },
  organization: { id: idx + 1, name: organization },
  department: { id: idx + 1, name: `${organization} — 1-uchastka` },
  position: { id: idx + 1, name: position }
}))

/** `rows` — `worker` ustuni doim bor, qolgan maydonlar jadvalga qarab qo'shiladi. */
const withFields = (fields) =>
  mockWorkers.map((row, idx) => ({ ...row, ...fields(row, idx) }))

const WORKER_COLUMN = { key: 'worker', title: 'content.worker', minWidth: 220 }
const ORG_COLUMN = { key: 'organization.name', title: 'content.organization', minWidth: 160 }
const POSITION_COLUMN = { key: 'position.name', title: 'content.position', minWidth: 150 }

const detailMock = {
  today_status: {
    columns: [
      WORKER_COLUMN,
      ORG_COLUMN,
      POSITION_COLUMN,
      { key: 'status', title: 'dashboardPage.today.status', width: 160, align: 'center', enumPrefix: 'dashboardPage.today.statuses.' }
    ],
    rows: withFields((row, idx) => ({
      status: ['working', 'working', 'vacation', 'working', 'sick_leave', 'working', 'absent'][idx % 7]
    }))
  },

  headcount_trend: {
    columns: [WORKER_COLUMN, ORG_COLUMN, POSITION_COLUMN, { key: 'from', title: 'dashboardPage.headcount.hiredAt', width: 150, align: 'center' }],
    rows: withFields((row, idx) => ({ from: `${String((idx % 28) + 1).padStart(2, '0')}.08.2026` }))
  },

  nationality: {
    columns: [WORKER_COLUMN, ORG_COLUMN, POSITION_COLUMN, { key: 'nationality', title: 'dashboardPage.nationality.column', width: 160, align: 'center', enumPrefix: 'dashboardPage.nationality.items.' }],
    rows: withFields((row, idx) => ({
      nationality: ['uzbek', 'uzbek', 'uzbek', 'tajik', 'uzbek', 'russian', 'kazakh', 'uzbek'][idx % 8]
    }))
  },

  hiring: {
    columns: [WORKER_COLUMN, ORG_COLUMN, POSITION_COLUMN, { key: 'contractType', title: 'dashboardPage.hiring.column', width: 170, align: 'center', enumPrefix: 'dashboardPage.hiring.types.' }, { key: 'from', title: 'dashboardPage.hiring.hiredAt', width: 140, align: 'center' }],
    rows: withFields((row, idx) => ({
      contractType: ['permanent', 'permanent', 'fixed_term', 'fxsh', 'permanent', 'secondary', 'temporary'][idx % 7],
      from: `${String((idx % 28) + 1).padStart(2, '0')}.0${(idx % 8) + 1}.2026`
    }))
  },

  dismissal: {
    columns: [WORKER_COLUMN, ORG_COLUMN, POSITION_COLUMN, { key: 'reason', title: 'dashboardPage.dismissal.column', minWidth: 190, enumPrefix: 'dashboardPage.dismissal.reasons.' }, { key: 'to', title: 'dashboardPage.dismissal.firedAt', width: 140, align: 'center' }],
    rows: withFields((row, idx) => ({
      reason: ['own_will', 'own_will', 'contract_ended', 'mutual_agreement', 'own_will', 'retirement', 'disciplinary'][idx % 7],
      to: `${String((idx % 28) + 1).padStart(2, '0')}.0${(idx % 8) + 1}.2026`
    }))
  },

  staff_vs_actual: {
    columns: [
      { key: 'organization.name', title: 'content.organization', minWidth: 200 },
      { key: 'position.name', title: 'content.position', minWidth: 170 },
      { key: 'plan', title: 'dashboardPage.staffFact.plan', width: 120, align: 'center' },
      { key: 'actual', title: 'dashboardPage.staffFact.actual', width: 120, align: 'center' },
      { key: 'vacant', title: 'dashboardPage.staffFact.vacant', width: 120, align: 'center' }
    ],
    rows: mockWorkers.map((row, idx) => ({
      ...row,
      plan: 40 + idx * 3,
      actual: 36 + idx * 3,
      vacant: 4
    }))
  },

  open_vacancies: {
    columns: [
      { key: 'organization.name', title: 'content.organization', minWidth: 200 },
      { key: 'position.name', title: 'content.position', minWidth: 170 },
      { key: 'count', title: 'dashboardPage.vacancy.count', width: 120, align: 'center' },
      { key: 'openedAt', title: 'dashboardPage.vacancy.openedAt', width: 150, align: 'center' },
      { key: 'days', title: 'dashboardPage.vacancy.days', width: 120, align: 'center' }
    ],
    rows: mockWorkers.map((row, idx) => ({
      ...row,
      count: (idx % 5) + 1,
      openedAt: `${String((idx % 28) + 1).padStart(2, '0')}.0${(idx % 8) + 1}.2026`,
      days: [4, 22, 118, 9, 45, 96, 31][idx % 7]
    }))
  },

  vacancy_age: {
    columns: [
      { key: 'organization.name', title: 'content.organization', minWidth: 200 },
      { key: 'position.name', title: 'content.position', minWidth: 170 },
      { key: 'openedAt', title: 'dashboardPage.vacancy.openedAt', width: 150, align: 'center' },
      { key: 'days', title: 'dashboardPage.vacancy.days', width: 120, align: 'center' }
    ],
    rows: mockWorkers.map((row, idx) => ({
      ...row,
      openedAt: `${String((idx % 28) + 1).padStart(2, '0')}.0${(idx % 8) + 1}.2026`,
      days: [4, 22, 118, 9, 45, 96, 31][idx % 7]
    }))
  },

  upcoming_events: {
    columns: [
      WORKER_COLUMN,
      ORG_COLUMN,
      { key: 'eventType', title: 'dashboardPage.events.column', minWidth: 190, enumPrefix: 'dashboardPage.events.types.' },
      { key: 'to', title: 'dashboardPage.events.date', width: 140, align: 'center' },
      { key: 'days', title: 'dashboardPage.events.daysLeft', width: 120, align: 'center' }
    ],
    rows: withFields((row, idx) => ({
      eventType: ['probation_end', 'contract_end', 'contract_end', 'pension_age', 'attestation'][idx % 5],
      to: `${String((idx % 28) + 1).padStart(2, '0')}.09.2026`,
      days: [7, 14, 30, 60, 90][idx % 5]
    }))
  },

  retention: {
    columns: [WORKER_COLUMN, ORG_COLUMN, POSITION_COLUMN, { key: 'from', title: 'dashboardPage.retention.hiredAt', width: 140, align: 'center' }, { key: 'status', title: 'dashboardPage.retention.status', width: 150, align: 'center', enumPrefix: 'dashboardPage.retention.statuses.' }],
    rows: withFields((row, idx) => ({
      from: `${String((idx % 28) + 1).padStart(2, '0')}.03.202${2 + (idx % 5)}`,
      status: idx % 4 === 3 ? 'left' : 'active'
    }))
  },

  vacation_by_department: {
    columns: [
      WORKER_COLUMN,
      ORG_COLUMN,
      { key: 'used', title: 'dashboardPage.vacationState.used', width: 130, align: 'center' },
      { key: 'planned', title: 'dashboardPage.vacationState.planned', width: 130, align: 'center' },
      { key: 'accrued', title: 'dashboardPage.vacationState.accrued', width: 150, align: 'center' }
    ],
    rows: withFields((row, idx) => ({
      used: 12 + (idx % 9),
      planned: 6 + (idx % 5),
      accrued: idx % 7
    }))
  },

  sick_leaves: {
    columns: [
      WORKER_COLUMN,
      ORG_COLUMN,
      { key: 'from', title: 'dashboardPage.disability.fromDate', width: 140, align: 'center' },
      { key: 'to', title: 'dashboardPage.disability.toDate', width: 140, align: 'center' },
      { key: 'status', title: 'dashboardPage.vacancy.state', width: 140, align: 'center', enumPrefix: 'dashboardPage.vacancy.states.' }
    ],
    rows: withFields((row, idx) => ({
      from: `${String((idx % 28) + 1).padStart(2, '0')}.07.2026`,
      to: `${String((idx % 28) + 1).padStart(2, '0')}.08.2026`,
      status: idx % 3 === 2 ? 'finished' : 'active'
    }))
  },

  incentive_monthly: {
    columns: [
      WORKER_COLUMN,
      ORG_COLUMN,
      { key: 'eventType', title: 'dashboardPage.monthly.column', minWidth: 170, enumPrefix: 'dashboardPage.monthly.types.' },
      { key: 'date', title: 'content.date', width: 140, align: 'center' }
    ],
    rows: withFields((row, idx) => ({
      eventType: idx % 3 === 2 ? 'disciplinary' : 'incentive',
      date: `${String((idx % 28) + 1).padStart(2, '0')}.0${(idx % 8) + 1}.2026`
    }))
  }
}

export const dashboardMock = { overview, movement, attendance }
export { detailMock }
