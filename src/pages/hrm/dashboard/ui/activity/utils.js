import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
]
const WEEK_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const monthName = (month) => t(`month.${MONTH_KEYS[month]}`)

export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

export const isWeekend = (year, month, day) => {
  const wd = new Date(year, month, day).getDay()
  return wd === 0 || wd === 6
}

/** «14-avgust» */
export const dayMonth = (year, month, day) =>
  t('dashboardPage.activity.dayMonth', { day, month: monthName(month).toLowerCase() })

/** «14-avgust, juma» */
export const dayMonthWeek = (year, month, day) =>
  `${dayMonth(year, month, day)}, ${t(`longWeek.${WEEK_KEYS[new Date(year, month, day).getDay()]}`)}`

/** Maketdagi raqam ko'rinishi: «11 850», «4 620» (0 ham chiziladi). */
export const formatCount = (value) => Utils.formatNumberToMoney(value) ?? '0'

export const totalOf = (item) =>
  (item.add || 0) + (item.edit || 0) + (item.delete || 0) + (item.create || 0)

const pad = (n) => String(n).padStart(2, '0')

/** «Bugun, 11:05» / «Kecha, 16:12» / «23.09.2026» */
export const formatLastActivity = (iso) => {
  if (!iso) return '—'
  const date = new Date(iso)
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const today = new Date()
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startOf(today) - startOf(date)) / 86400000)
  if (diff === 0) return t('dashboardPage.activity.today', { time })
  if (diff === 1) return t('dashboardPage.activity.yesterday', { time })
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}
