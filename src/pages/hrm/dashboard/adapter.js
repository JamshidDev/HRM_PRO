/**
 * Hozirgi (legacy) dashboard endpointlarini `dashboard-api.md` dagi kontrakt
 * shakliga o'giradi.
 *
 *   GET /v1/hr/dashboard        → fromLegacyOne
 *   GET /v1/hr/dashboard-two    → fromLegacyTwo
 *   GET /v1/hr/dashboard-three  → fromLegacyThree
 *
 * Faqat **semantikasi aynan bir xil** maydonlar o'giriladi. Quyidagilar
 * ataylab o'girilmadi — mock qiymati o'z o'rnida qoladi va kartada "mock"
 * chipi ko'rinadi:
 *
 *   • `age_30_and_younger` / `age_31_to_45` / `age_46_and_older` — maketda
 *     beshta yosh guruhi va har birida jins kesimi kerak, legacy uchta
 *     yig'indini beradi va jinsga ajratmaydi.
 *   • `higher/middle/special_edu_count` — `education.groups` ga o'giriladi,
 *     ammo maketdagi oltita **daraja** (`education.levels`) legacy'da yo'q.
 *   • `contract_types[]` — legacy *faol shartnomalar* sonini beradi, maket esa
 *     *davr ichida ishga qabul qilinganlar*ni so'raydi (boshqa ko'rsatkich).
 *   • `vacation_types[]` — tur kesimida, maket bo'linma kesimida va uch
 *     qatlamli (chiqqan / rejada / yig'ilib qolgan kunlar).
 *   • `incentives` / `disciplinary_actions` va ularning `*_type` juftliklari —
 *     legacy ikki turga ajratadi, maketda uch nomlangan tur bor.
 *   • `contracts[]` (oylik yangi/tugagan) — "Ishga qabul dinamikasi" kartasi
 *     o'zi shu maydonni to'g'ridan-to'g'ri o'qiydi, kontraktga kirmaydi.
 *
 * `prev` va delta maydonlari `null` qilib beriladi: backend o'tgan yil
 * ko'rsatkichini qaytarmaydi, `merge.js` esa `null` ni mock bilan
 * to'ldirmaydi — shunday qilib haqiqiy son ustiga o'ylab topilgan o'zgarish
 * chizilmaydi.
 */

const num = (value) => (value === null || value === undefined ? null : Number(value))

/** Real qiymat, ammo taqqoslash bazasi yo'q. */
const bare = (value) => ({
  value: num(value),
  prev: null,
  delta: null,
  delta_percent: null
})

export const fromLegacyOne = (res) => {
  const v = res?.data?.data
  if (!v) return {}

  const positions = num(v.positions_rate) ?? 0
  const filled = num(v.worker_positions_rate) ?? 0

  const kpi = {
    workers: {
      total: bare(v.workers_count),
      male: num(v.mans_count),
      female: num(v.woman_count)
    },
    pension_age: {
      total: bare((num(v.retired_men_count) ?? 0) + (num(v.retired_women_count) ?? 0)),
      male: num(v.retired_men_count),
      female: num(v.retired_women_count)
    },
    staff_units: {
      total: bare(v.positions_rate),
      // Maketda "Vakant" va "Sverx" — shtat va fakt orasidagi farqning
      // musbat/manfiy tomoni (`FigKpiCard` ilgari ham shunday hisoblardi).
      vacant: Number(Math.max(positions - filled, 0).toFixed(2)),
      over: Number(Math.max(filled - positions, 0).toFixed(2))
    },
    fxsh: {
      total: bare(v.fxsh_count),
      male: num(v.fxsh_mans_count),
      female: num(v.fxsh_woman_count)
    }
  }

  // Legacy uchta agregatni `groups` ga beradi; `levels` (oltita daraja) mock'da qoladi.
  const groups = [
    { key: 'higher', count: num(v.higher_edu_count), percent: null, delta_pp: null },
    { key: 'general_secondary', count: num(v.middle_edu_count), percent: null, delta_pp: null },
    { key: 'secondary_special', count: num(v.special_edu_count), percent: null, delta_pp: null }
  ].filter((item) => item.count !== null)

  return {
    overview: {
      kpi,
      education: groups.length ? { groups } : undefined,
      birthdays: v.birthdays
    },
    movement: {
      kpi: { pension_age: kpi.pension_age, staff_units: kpi.staff_units }
    },
    legacy: {
      passports_count: num(v.passports_count),
      passports_more_count: num(v.passports_more_count),
      // "Ishga qabul dinamikasi" kartasi (oylik yangi/tugagan shartnomalar)
      contracts: v.contracts || []
    }
  }
}

export const fromLegacyTwo = (res) => {
  const v = res?.data?.data
  if (!v) return {}

  // Maketda alohida karta yo'q, ammo Umumiy tabdagi "Tibbiy ko'rik" kartasi
  // shu ikki maydonni o'qiydi — kontrakt tashqarisida, o'z holida uzatiladi.
  return {
    legacy: {
      meds_approaching: num(v.meds_approaching),
      meds_finished: num(v.meds_finished),
      incentives: num(v.incentives),
      incentive_actions_gift_type: num(v.incentive_actions_gift_type),
      disciplinary_actions: num(v.disciplinary_actions),
      disciplinary_actions_fine_type: num(v.disciplinary_actions_fine_type)
    }
  }
}

export const fromLegacyThree = (res) => {
  const v = res?.data?.data
  if (!v) return {}

  const disability = (source) =>
    source
      ? { total: bare(source.total_count), levels: source.levels }
      : undefined

  return {
    movement: {
      worker_disabilities: disability(v.worker_disabilities),
      worker_relative_disabilities: disability(v.worker_relative_disabilities)
    },
    attendance: {
      sick_leaves: v.worker_sick_leaves
        ? {
            total: bare(v.worker_sick_leaves.total_count),
            active: num(v.worker_sick_leaves.active_count),
            finished: num(v.worker_sick_leaves.finished_count)
          }
        : undefined
    }
  }
}

/** Bir nechta adapter natijasini bitta `{overview, movement, attendance, legacy}` ga yig'adi. */
export const combine = (...parts) =>
  parts.filter(Boolean).reduce((acc, part) => {
    Object.keys(part).forEach((tab) => {
      acc[tab] = { ...(acc[tab] || {}), ...part[tab] }
    })
    return acc
  }, {})
