/**
 * Figma v3 KPI qatorini kontrakt ma'lumotidan yasaydi (node 2959:58230).
 *
 * Har bir bobda o'z KPI to'plami bor; karta ichida esa tuzilma bir xil:
 * sarlavha + jami qiymat + `bg-secondary` blokda ikkita "nom — qiymat" qatori
 * va eng pastda "o'tgan yilga" trend qatori.
 *
 * Bu modul **faqat matn tayyorlaydi**: i18n kalitlari qaytariladi (tarjima
 * shablonda `$t()` bilan bo'ladi — til almashganda karta o'zi yangilanadi),
 * sonlar esa `format.js` orqali maketdagi ko'rinishga keltiriladi.
 */
import { toCount, toDecimal, toPercent } from './format.js'

const DAYS = 'dashboardPage.trend.days'
const YEARS = 'dashboardPage.trend.years'

const row = (titleKey, value, unitKey = null) => ({ titleKey, value, unitKey })

/** Jins kesimli KPI (xodimlar, pensiya yoshi, FXSH) — uchtasi bir xil tuzilgan. */
const genderCard = (variant, titleKey, maleKey, femaleKey, source, mockPath) => ({
  variant,
  titleKey,
  value: toCount(source?.total?.value),
  rows: [row(maleKey, toCount(source?.male)), row(femaleKey, toCount(source?.female))],
  trend: { metric: source?.total, unit: 'count' },
  mockPath
})

const staffUnitsCard = (source) => ({
  variant: 'positions',
  titleKey: 'dashboardPage.position.title',
  value: toCount(source?.total?.value),
  rows: [
    row('dashboardPage.position.vakant', toCount(source?.vacant)),
    row('dashboardPage.position.sverx', toCount(source?.over))
  ],
  trend: { metric: source?.total, unit: 'count' },
  mockPath: 'kpi.staff_units'
})

const pensionCard = (source) =>
  genderCard(
    'pension',
    'dashboardPage.pension.title',
    'dashboardPage.pension.men',
    'dashboardPage.pension.women',
    source,
    'kpi.pension_age'
  )

const overviewCards = (data) => {
  const kpi = data?.kpi || {}
  return [
    genderCard(
      'users',
      'dashboardPage.mainCard.totalWorker',
      'dashboardPage.mainCard.man',
      'dashboardPage.mainCard.woman',
      kpi.workers,
      'kpi.workers'
    ),
    pensionCard(kpi.pension_age),
    staffUnitsCard(kpi.staff_units),
    genderCard(
      'fxsh',
      'dashboardPage.mainCard.fxsh',
      'dashboardPage.mainCard.man',
      'dashboardPage.mainCard.woman',
      kpi.fxsh,
      'kpi.fxsh'
    )
  ]
}

const movementCards = (data) => {
  const kpi = data?.kpi || {}
  const fill = kpi.time_to_fill
  const tenure = kpi.tenure

  return [
    {
      variant: 'timeToFill',
      titleKey: 'dashboardPage.timeToFill.title',
      value: toCount(fill?.avg_days?.value),
      unitKey: DAYS,
      rows: [
        row('dashboardPage.timeToFill.target', toCount(fill?.target_days), DAYS),
        row('dashboardPage.timeToFill.longest', toCount(fill?.max_days), DAYS)
      ],
      trend: { metric: fill?.avg_days, unit: 'days' },
      mockPath: 'kpi.time_to_fill'
    },
    {
      variant: 'tenure',
      titleKey: 'dashboardPage.tenure.title',
      value: toDecimal(tenure?.avg_years?.value),
      unitKey: YEARS,
      rows: [
        row('dashboardPage.tenure.median', toDecimal(tenure?.median_years), YEARS),
        row('dashboardPage.tenure.overTen', toCount(tenure?.over_10_years_count))
      ],
      trend: { metric: tenure?.avg_years, unit: 'years' },
      mockPath: 'kpi.tenure'
    },
    pensionCard(kpi.pension_age),
    staffUnitsCard(kpi.staff_units)
  ]
}

const attendanceCards = (data) => {
  const kpi = data?.kpi || {}
  const atWork = kpi.at_work_today
  const vacation = kpi.on_vacation
  const late = kpi.chronic_late

  return [
    {
      variant: 'atWork',
      titleKey: 'dashboardPage.today.atWorkTitle',
      value: toCount(atWork?.count),
      rows: [
        row('dashboardPage.today.share', toPercent(atWork?.percent)),
        row('dashboardPage.today.onVacation', toCount(atWork?.on_vacation))
      ],
      trend: { metric: atWork, unit: 'pp' },
      mockPath: 'kpi.at_work_today'
    },
    {
      variant: 'vacation',
      titleKey: 'dashboardPage.today.onVacationTitle',
      value: toCount(vacation?.count),
      rows: [
        row('dashboardPage.today.share', toPercent(vacation?.percent)),
        row('dashboardPage.today.planned', toCount(vacation?.planned))
      ],
      trend: { metric: vacation, unit: 'pp' },
      mockPath: 'kpi.on_vacation'
    },
    {
      variant: 'chronicLate',
      titleKey: 'dashboardPage.today.chronicLateTitle',
      value: toCount(late?.count),
      rows: [
        row('dashboardPage.today.share', toPercent(late?.percent)),
        row('dashboardPage.today.threePlus', toCount(late?.three_plus_times))
      ],
      trend: { metric: late, unit: 'count' },
      mockPath: 'kpi.chronic_late'
    }
  ]
}

// Bob nomlari `constants.js` dagi `DashboardTab` bilan bir xil; bu yerda
// literal sifatida yozilgan — `constants.js` karta komponentlarini import
// qiladi va aylanma import hosil bo'lmasligi kerak.
const BUILDERS = {
  general: overviewCards,
  movement: movementCards,
  attendance: attendanceCards
}

/** `tab` bobining KPI kartalari; audit bobida KPI qatori yo'q. */
export const buildKpiCards = (tab, data) => BUILDERS[tab]?.(data) || []
