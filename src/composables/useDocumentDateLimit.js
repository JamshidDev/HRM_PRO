import { useDocumentSettingsStore } from '@/store/modules/index.js'

// Hujjat sanasi chegarasi: bugundan keyin emas va `backdate_days` kundan eski emas (0 — pastki chegara yo'q).
export function useDocumentDateLimit() {
  const store = useDocumentSettingsStore()
  if (!store.loaded && !store.loading) store._show().catch(() => {})

  const isDateDisabled = (ts) => {
    const day = new Date(ts)
    day.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (day > today) return true
    const days = store.loaded?.backdate_days ?? 7
    if (days <= 0) return false
    const min = new Date(today)
    min.setDate(min.getDate() - days)
    return day < min
  }

  return { isDateDisabled }
}
