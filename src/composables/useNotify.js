// Ilova ichidagi push toast'lari navbati (socket bildirishnomalari shu yerdan chiqadi).
// Modul darajasida — butun ilovada BITTA nusxa, shuning uchun qayerdan chaqirilmasin
// bir xil ro'yxatga tushadi.
import { ref } from 'vue'

const notifications = ref([])
// item.id -> { timeoutId, endsAt, remaining }
const timers = new Map()
let id = 0

const DEFAULT_DURATION = 5000
// Ekranni to'ldirib yubormasligi uchun: eng eskisi tushib qoladi.
const MAX_VISIBLE = 4

// `error()` yordamchisi tarixan 'danger' beradi, `notificationTypes` esa 'error' biladi.
const TYPE_ALIASES = { danger: 'error' }
const KNOWN_TYPES = ['info', 'success', 'warning', 'error']

const normalizeType = (type) => {
  const value = TYPE_ALIASES[type] || type
  return KNOWN_TYPES.includes(value) ? value : 'info'
}

// Yordamchilar `duration` ni raqam sifatida uzatishi mumkin — ikkalasini ham qabul qilamiz.
const normalizeOptions = (options) =>
  typeof options === 'number' ? { duration: options } : options || {}

const stopTimer = (itemId) => {
  const timer = timers.get(itemId)
  if (timer) clearTimeout(timer.timeoutId)
  return timer
}

const remove = (itemId) => {
  stopTimer(itemId)
  timers.delete(itemId)
  const index = notifications.value.findIndex((n) => n.id === itemId)
  if (index > -1) notifications.value.splice(index, 1)
}

const startTimer = (itemId, ms) => {
  timers.set(itemId, {
    timeoutId: setTimeout(() => remove(itemId), ms),
    endsAt: Date.now() + ms,
    remaining: ms
  })
}

/** Sichqoncha toast ustida — hisoblagich to'xtaydi (o'qib ulgurmay yopilmasin). */
const pause = (itemId) => {
  const timer = stopTimer(itemId)
  if (!timer) return
  timer.remaining = Math.max(0, timer.endsAt - Date.now())
  const item = notifications.value.find((n) => n.id === itemId)
  if (item) item.paused = true
}

const resume = (itemId) => {
  const timer = timers.get(itemId)
  const item = notifications.value.find((n) => n.id === itemId)
  if (item) item.paused = false
  if (!timer || timer.remaining <= 0) return
  startTimer(itemId, timer.remaining)
}

export const useNotify = () => {
  const notify = (content, type = 'success', options = {}) => {
    const { duration, persistent, meta } = normalizeOptions(options)

    // DUBLIKATNI TO'SISH: bitta push socket qayta ulanganda yoki server ikki
    // marta emit qilganda ayni xabar ikki toast bo'lib chiqib qolardi.
    // Backend `id` beradi — shu ochiq toast bo'lsa, ikkinchisini chizmaymiz.
    const key = meta?.id != null ? String(meta.id) : null
    if (key && notifications.value.some((n) => n.key === key)) return

    id++
    const ms = duration ?? DEFAULT_DURATION
    const item = {
      id,
      key,
      type: normalizeType(type),
      content,
      meta,
      // Progress bar shu qiymat bo'yicha animatsiya qilinadi.
      duration: persistent ? 0 : ms,
      paused: false
    }

    notifications.value.push(item)
    while (notifications.value.length > MAX_VISIBLE) remove(notifications.value[0].id)

    if (persistent || !(ms > 0)) return
    startTimer(item.id, ms)
  }

  const success = (msg, options) => notify(msg, 'success', options)
  const error = (msg, options) => notify(msg, 'error', options)
  const warning = (msg, options) => notify(msg, 'warning', options)
  const info = (msg, options) => notify(msg, 'info', options)
  const clear = () => {
    notifications.value.forEach((n) => stopTimer(n.id))
    timers.clear()
    notifications.value = []
  }

  return { notifications, notify, success, error, warning, info, remove, pause, resume, clear }
}
