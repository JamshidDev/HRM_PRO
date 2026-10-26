import { cycleDays, isRotating } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'

const DAILY_TYPE = 2
const WEEK_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Kechqurun yoki tunda boshlanadigan smena — «tungi».
const isNight = (start) => Boolean(start) && (start >= '18:00' || start < '06:00')

// Smena turining kunlar ketma-ketligi (aylanma — sikl, har kunlik — hafta); boshqa turlarda bo'sh.
export const dayStrip = (shiftType) => {
  const weekly = shiftType?.type?.id === DAILY_TYPE
  const days = isRotating(shiftType)
    ? cycleDays(shiftType)
    : weekly && Array.isArray(shiftType.days)
      ? shiftType.days
      : []
  return days.map((d, i) => {
    const start = d.start_time?.slice(0, 5)
    return {
      work: Boolean(d.work_status),
      night: Boolean(d.work_status) && isNight(start),
      start,
      end: d.end_time?.slice(0, 5),
      weekKey: weekly ? WEEK_KEYS[(d.day ?? i + 1) - 1] : null
    }
  })
}

export const formatCount = (n) => Number(n || 0).toLocaleString('ru-RU')
