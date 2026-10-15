import { reactive } from 'vue'

// Xato modali holati: bir vaqtda bitta modal, takror xabarlar tashlab yuboriladi.
export const alertState = reactive({ queue: [] })

export const ALERT_TYPES = ['forbidden', 'validation', 'warning', 'notfound', 'network']

// O'zi yopiladigan turlar (ms); qolganlari faqat tugma bilan yopiladi.
const AUTO_CLOSE = { notfound: 4000, network: 5000 }

// Login va ochiq sahifalarda modal emas, eski toast qoladi.
const TOAST_ONLY_PATHS = ['/login', '/register', '/verification-email', '/public', '/privacy']

export const isToastOnlyPage = () =>
  TOAST_ONLY_PATHS.some((p) => window.location.pathname.startsWith(p))

export function showAlert({ type = 'warning', title = null, message = '', errors = [], duration } = {}) {
  const items = errors.filter(Boolean)
  const key = `${type}|${message}|${items.join('|')}`
  if (alertState.queue.some((a) => a.key === key)) return
  const kind = ALERT_TYPES.includes(type) ? type : 'warning'
  alertState.queue.push({ key, type: kind, title, message, errors: items, duration: duration ?? AUTO_CLOSE[kind] ?? 0 })
}

export function closeAlert() {
  alertState.queue.shift()
}

// Axios xatosidan modal turini aniqlaydi; null — toast'da qoladi.
export function alertFromAxiosError(error, { anyMethod = false } = {}) {
  if (error?.name === 'CanceledError') return null
  const status = error?.response?.status
  const data = error?.response?.data ?? {}
  const method = (error?.config?.method ?? 'get').toLowerCase()
  const isAction = anyMethod || method !== 'get'

  if (status === 422 && data.errors && typeof data.errors === 'object') {
    const errors = Object.values(data.errors).flat().map(String)
    return { type: 'validation', message: errors.length ? '' : data.message, errors }
  }
  if (status === 403) return { type: 'forbidden', message: data.message }
  if (!isAction) return null
  if (status === 404) return { type: 'notfound', message: data.message }
  if (status === 400 || status === 409 || status === 422) return { type: 'warning', message: data.message }
  // 5xx — toast'da qoladi, modal faqat aloqa uzilganda.
  if (!status && error?.isAxiosError) return { type: 'network', message: '' }
  return null
}

// Forma tekshiruvi: to'ldirilmagan maydon va h.k.
export function alertValidation(message) {
  if (isToastOnlyPage()) return window.$Toast?.warning(message)
  showAlert({ type: 'validation', message })
}

// Biznes qoidasi / ogohlantirish (xato emas, lekin amal bajarilmaydi).
export function alertWarning(message, opts = {}) {
  if (isToastOnlyPage()) return window.$Toast?.warning(message)
  showAlert({ type: 'warning', message, ...opts })
}

// catch ichidagi xato: interceptor allaqachon ko'rsatgan bo'lsa takrorlanmaydi.
export function alertError(error, fallback = '') {
  if (error?.__notified) return
  const message = String(error?.response?.data?.message ?? '').trim() || fallback
  const alert = !isToastOnlyPage() && alertFromAxiosError(error, { anyMethod: true })
  if (alert) return showAlert({ ...alert, message: alert.type === 'network' ? '' : alert.message || message })
  if (message) window.$Toast?.error(message)
}
