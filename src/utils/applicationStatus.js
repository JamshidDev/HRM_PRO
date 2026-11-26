import i18n from '@/i18n/index.js'

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

// UIStatus rang id'lari: 2 kulrang, 11 qaytarilgan, 9 sariq, 1 ko'k, 3 yashil, 4 qizil.
const COLOR = { draft: 2, returned: 11, checking: 9, process: 1, approved: 3, rejected: 4 }

export const applicationStatus = (app) => {
  const key = applicationState(app)
  return { id: COLOR[key], name: i18n.global.t(`applicationPage.statuses.${key}`) }
}
