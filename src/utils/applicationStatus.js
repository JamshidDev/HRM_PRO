import i18n from '@/i18n/index.js'
import { ArrowReply16Filled, DismissCircle16Filled } from '@vicons/fluent'

// Arizaning yagona holati — xodim, HR va kelishuvchi jadvallarida bir xil (backend application-state.ts).
export const APPLICATION_STATES = ['draft', 'returned', 'checking', 'process', 'approved', 'rejected']

// Backend `state.key` bo'lmasa (eski javob) — maydonlardan bir xil tartibda hisoblanadi.
export const applicationState = (app) => {
  if (app?.state?.key) return app.state.key
  const conf = Number(app?.confirmation?.id ?? app?.confirmation)
  const hr = Number(app?.status)
  if (conf === 6) return app?.returned ? 'returned' : 'draft'
  if (conf === 3) return 'approved'
  if (conf === 4 || hr === 2) return 'rejected'
  if (hr === 1) return 'process'
  return 'checking'
}

// UIStatus id'lari: 2 kulrang, 18 qaytarilgan, 9 sariq, 1 ko'k, 3 yashil, 4 qizil.
const COLOR = { draft: 2, returned: 18, checking: 9, process: 1, approved: 3, rejected: 4 }
// Qaytarilgan — pushti, «javob» strelkasi (egasiga qaytdi); rad etilgan — doira ichida ✕.
const EXTRA = { returned: { tone: 'pink', icon: ArrowReply16Filled }, rejected: { icon: DismissCircle16Filled } }

export const applicationStatus = (app) => {
  const key = applicationState(app)
  return { id: COLOR[key], name: i18n.global.t(`applicationPage.statuses.${key}`), ...EXTRA[key] }
}
