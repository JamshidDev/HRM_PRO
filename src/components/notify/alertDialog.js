import { markRaw, reactive } from 'vue'

// Xato modali holati: bir vaqtda bitta modal, takror xabarlar tashlab yuboriladi.
export const alertState = reactive({ queue: [] })

export const ALERT_TYPES = ['forbidden', 'validation', 'warning', 'notfound', 'network']
// Tasdiq turlari — faqat ikki tugmali oynada (confirmDialog / UIConfirm).
export const CONFIRM_TYPES = ['warning', 'delete', 'confirm', 'success']

// O'zi yopiladigan turlar (ms); qolganlari faqat tugma bilan yopiladi.
const AUTO_CLOSE = { notfound: 4000, network: 5000 }

// Login va ochiq sahifalarda modal emas, eski toast qoladi.
const TOAST_ONLY_PATHS = ['/login', '/register', '/verification-email', '/public', '/privacy']

export const isToastOnlyPage = () =>
  TOAST_ONLY_PATHS.some((p) => window.location.pathname.startsWith(p))

// onConfirm berilsa — ikki tugmali tasdiqlash (bekor / tasdiqlash), o'zi yopilmaydi.
// onConfirm Promise qaytarsa — tugmada loading, bajarilgach yopiladi; xato bersa oyna ochiq qoladi.
// onCancel — ixtiyoriy: faqat chap tugma bosilganda (masalan «Saqlamasdan yopish»);
// fon / Esc / ✕ bilan yopilganda chaqirilmaydi — bu «ortga qaytish».
// onClose — har qanday yopilishda (tasdiqdan tashqari) chaqiriladi.
export function showAlert({
  type = 'warning',
  title = null,
  message = '',
  errors = [],
  duration,
  listHint,
  content,
  danger,
  extraText,
  onExtra,
  onConfirm,
  onCancel,
  onClose,
  confirmText,
  cancelText
} = {}) {
  const items = errors.filter(Boolean)
  const key = `${type}|${title}|${message}|${items.join('|')}`
  if (alertState.queue.some((a) => a.key === key)) return false
  const allowed = onConfirm ? [...ALERT_TYPES, ...CONFIRM_TYPES] : ALERT_TYPES
  const kind = allowed.includes(type) ? type : 'warning'
  alertState.queue.push({
    key,
    type: kind,
    title,
    message,
    errors: items,
    listHint,
    // Matn ostidagi qo'shimcha kontent: () => VNode (ro'yxat, kodlar va h.k.).
    content: content ? markRaw(content) : null,
    // Tasdiq tugmasi qizil — o'chirish / qaytarib bo'lmaydigan amal.
    danger: danger ?? kind === 'delete',
    extraText,
    onExtra,
    onConfirm,
    onCancel,
    onClose,
    confirmText,
    cancelText,
    loading: false,
    duration: onConfirm ? 0 : (duration ?? AUTO_CLOSE[kind] ?? 0)
  })
  return true
}

// Universal tasdiq oynasi (loyihadagi barcha «ishonchingiz komilmi?» uchun).
// Promise<boolean>: true — tasdiqlandi (onConfirm muvaffaqiyatli tugadi), false — bekor / yopildi.
//   confirmDialog({ type: 'delete', message: t('content.deleteWarning'), onConfirm: () => store._delete(id) })
//   if (await confirmDialog({ title, message })) save()
// type: 'warning' (standart) | 'delete' | 'confirm' | 'success'.
export function confirmDialog({ onConfirm, onCancel, onClose, onExtra, ...opts } = {}) {
  return new Promise((resolve) => {
    const added = showAlert({
      ...opts,
      onConfirm: async () => {
        await onConfirm?.()
        resolve(true)
      },
      onCancel: () => {
        onCancel?.()
      },
      onExtra: onExtra
        ? () => {
            onExtra()
          }
        : undefined,
      onClose: () => {
        onClose?.()
        resolve(false)
      }
    })
    if (!added) resolve(false)
  })
}

// O'chirish tasdig'i — eng ko'p ishlatiladigan holat uchun qisqartma.
export const confirmDelete = (opts = {}) => confirmDialog({ type: 'delete', ...opts })

const current = () => alertState.queue[0]

export async function confirmAlert() {
  const item = current()
  if (!item || item.loading) return
  const result = item.onConfirm?.()
  if (result && typeof result.then === 'function') {
    item.loading = true
    try {
      await result
    } catch {
      // Xato — oyna ochiq qoladi, foydalanuvchi qayta urinadi yoki bekor qiladi.
      item.loading = false
      return
    }
  }
  if (current() === item) alertState.queue.shift()
}

export function cancelAlert() {
  const item = current()
  if (!item || item.loading) return
  alertState.queue.shift()
  item.onCancel?.()
  item.onClose?.()
}

export function extraAlert() {
  const item = current()
  if (!item || item.loading) return
  alertState.queue.shift()
  item.onExtra?.()
  item.onClose?.()
}

export function closeAlert() {
  const item = current()
  if (!item || item.loading) return
  alertState.queue.shift()
  item.onClose?.()
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
