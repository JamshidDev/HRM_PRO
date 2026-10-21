// Qo'llanma kategoriyalari — backend `GUIDE_CATEGORIES` bilan bir xil kalitlar.
export const GUIDE_CATEGORIES = [
  'general',
  'workers',
  'commands',
  'contracts',
  'signing',
  'turnstile',
  'timesheet',
  'vacations',
  'vacancies',
  'learning',
  'attestation',
  'applications',
  'mobile',
  'reports'
]

export const formatDuration = (sec) => {
  if (!sec && sec !== 0) return ''
  const m = Math.floor(sec / 60)
  const s = String(Math.round(sec % 60)).padStart(2, '0')
  return `${m}:${s}`
}
