// Frontend xatolarini Telegram guruhidagi "website" topic'iga yuboradi (@hrm_logger_bot).
//
// Nima uchun kerak: ilovada global xato ushlagichi yo'q edi — oq ekran, crash yoki
// 500 xatolar faqat foydalanuvchi aytsagina bilinardi. Endi to'rt manba yig'iladi:
//   1) window 'error'              — ushlanmagan JS xatolari
//   2) window 'unhandledrejection' — ushlanmagan promise'lar (chunk yuklanmasligi ham)
//   3) app.config.errorHandler     — Vue render/lifecycle xatolari
//   4) reportApiError()            — src/service/index.js axios interceptor'idan
//
// Telegram limitlari (guruhga ~20 xabar/daqiqa, ketma-ket xabarlar orasida ~3 s):
// xatolar 5 soniyalik oynada to'planib, BITTA xabar bo'lib ketadi; navbat ketma-ket
// yuboradi, 429 kelsa retry_after gacha butun navbat to'xtaydi. Shu sabab bot flood
// uchun bloklanmaydi.
//
// DIQQAT: token prod bundle ichida ochiq bo'ladi (VITE_* build vaqtida inline bo'ladi).
// Shuning uchun bu bot faqat log guruhida turishi kerak. Backend proxy'ga o'tish uchun
// faqat pastdagi postMessage() ni almashtirish kifoya — qolgan mantiq o'zgarmaydi.

import { useAppSetting } from '@/utils/AppSetting.js'

const env = import.meta.env

const TOKEN = (env.VITE_TG_LOG_BOT_TOKEN || '').trim()
const CHAT_ID = (env.VITE_TG_LOG_CHAT_ID || '').trim()
const TOPIC_ID = (env.VITE_TG_LOG_TOPIC_ID || '').trim()

// Har qanday `vite build` da ishlaydi. Ilgari shart `env.MODE === 'production'` edi —
// shu sabab `build:dev` / `build:local` buildlarida logger sassiz o'chib qolardi.
// VITE_TG_LOG_ENABLED=true  — dev serverda (`npm run local`) sinash uchun.
// VITE_TG_LOG_ENABLED=false — buildda ham majburan o'chirish uchun.
const flag = String(env.VITE_TG_LOG_ENABLED ?? '')
  .trim()
  .toLowerCase()
const forcedOn = flag === 'true' || flag === '1'
const forcedOff = flag === 'false' || flag === '0'
const hasCredentials = !!TOKEN && !!CHAT_ID

const isEnabled = hasCredentials && !forcedOff && (env.PROD || forcedOn)

// Eng ko'p uchragan nosozlik: kalitlar `.env` da bor, lekin `.env.<mode>` da bo'sh
// qayta e'lon qilingan — Vite'da mode fayli `.env` ustidan bosadi va logger jim o'chadi.
// Endi buni konsolda aytamiz (ilovaga ta'sir qilmaydi).
if (!hasCredentials && env.PROD && !forcedOff) {
  console.warn(
    "[errorReporter] VITE_TG_LOG_BOT_TOKEN / VITE_TG_LOG_CHAT_ID bo'sh — Telegram log o'chiq. " +
      "Ular `.env` da bo'lsa ham, `.env.<mode>` da bo'sh qayta e'lon qilinsa ustidan bosiladi."
  )
}

const TELEGRAM_HOST = 'api.telegram.org'

// Spamdan himoya: bir xil xato DEDUP_WINDOW ichida bir marta ketadi.
const DEDUP_WINDOW = 5 * 60 * 1000

// Guruhlash: FLUSH_DELAY oynasida to'plangan xatolar bitta xabarga birlashadi.
const FLUSH_DELAY = 5000
const MAX_BATCH = 8 // buferda shuncha xato yig'ilsa oynani kutmay yuboriladi
const MAX_QUEUE = 10 // navbatda kutayotgan xabarlar chegarasi (ortig'i tashlanadi)

// Telegram tezlik limitlari: guruhga 20 xabar/daqiqa. Biroz zaxira bilan olamiz.
const RATE_WINDOW = 60 * 1000
const RATE_MAX = 15
const MIN_INTERVAL = 3000

// Telegram xabar limiti 4096 belgi.
const TEXT_LIMIT = 3900
const STACK_LIMIT = 1000

const seen = new Map() // signature -> { count, lastSentAt }
const buffer = [] // flush kutayotgan xatolar
const sentAt = [] // oxirgi yuborilgan xabarlar vaqti (rate limit uchun)

let flushTimer = null
let queue = Promise.resolve()
let queueLength = 0
let cooldownUntil = 0 // 429 dan keyin butun navbat shu vaqtgacha kutadi
let droppedCount = 0 // navbat to'lgani uchun tashlangan xabarlar

// Bu matnlar log qilinmaydi: brauzer/kengaytma shovqini yoki bekor qilingan so'rovlar.
const IGNORED = [
  'ResizeObserver loop',
  'Non-Error promise rejection captured',
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'CanceledError',
  'AbortError',
  TELEGRAM_HOST
]

// ------------------------------------------------------------------ yordamchilar

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const cut = (value, max) => {
  const text = String(value ?? '')
  return text.length > max ? `${text.slice(0, max)}…` : text
}

const pad = (n) => String(n).padStart(2, '0')

const formatTime = (date) =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

// Stack'ni qisqartiramiz: prod buildda sourcemap yo'q, baribir minified bo'ladi.
const formatStack = (stack, maxLines) => {
  if (!stack) return ''
  const lines = String(stack)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxLines)
  return cut(lines.join('\n'), STACK_LIMIT)
}

const browserInfo = () => {
  const ua = navigator.userAgent || ''
  const browser =
    /Edg\/([\d.]+)/.exec(ua)?.[0] ||
    /OPR\/([\d.]+)/.exec(ua)?.[0] ||
    /Firefox\/([\d.]+)/.exec(ua)?.[0] ||
    /Chrome\/([\d.]+)/.exec(ua)?.[0] ||
    /Version\/([\d.]+).*Safari/.exec(ua)?.[1] ||
    'unknown'
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS X/.test(ua)
      ? 'macOS'
      : /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad/.test(ua)
          ? 'iOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'unknown'
  return `${browser.replace('/', ' ')} · ${os}`
}

const fromStorage = (key) => {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

const isIgnored = (text) => (text ? IGNORED.some((needle) => text.includes(needle)) : false)

const signatureOf = (entry) =>
  [entry.type, entry.code, entry.message, formatStack(entry.stack, 1)].join('|').slice(0, 300)

// seen xaritasi cheksiz o'smasin — eskirganlarini tozalaymiz.
const pruneSeen = (now) => {
  if (seen.size < 200) return
  for (const [key, record] of seen) {
    if (now - record.lastSentAt > 2 * DEDUP_WINDOW) seen.delete(key)
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ------------------------------------------------------------------ xabar matni

// Sessiya tokeni TO'LIQ yuboriladi — xatoni foydalanuvchining o'z sessiyasida
// qayta ko'rish uchun. Shu sabab log guruhi yopiq bo'lishi va faqat jamoa a'zolari
// turishi shart: token bilan o'sha foydalanuvchi nomidan API'ga kirish mumkin.
const buildText = (entries, dropped) => {
  const authToken = fromStorage(useAppSetting.tokenKey)
  const userId = fromStorage(useAppSetting.accountUserId)

  const head = [
    entries.length > 1
      ? `\u{1F534} <b>Frontend xato</b> — ${entries.length} ta`
      : '\u{1F534} <b>Frontend xato</b>',
    `<b>Muhit:</b> ${escapeHtml(env.MODE)} · ${escapeHtml(browserInfo())}`,
    `<b>Vaqt:</b> ${formatTime(new Date())}`,
    `<b>User:</b> ${escapeHtml(userId ? `id=${userId}` : 'mehmon')}`,
    `<b>Token:</b> <code>${escapeHtml(authToken || '—')}</code>`
  ]

  // Bitta xato bo'lsa stack uzunroq, ko'p bo'lsa qisqaroq — 4096 belgiga sig'ishi uchun.
  const stackLines = entries.length > 1 ? 4 : 8
  const blocks = []
  let skipped = 0

  entries.forEach((entry, index) => {
    const lines = []
    const number = entries.length > 1 ? `${index + 1}) ` : ''
    const code = entry.code ? ` · <code>${escapeHtml(entry.code)}</code>` : ''

    lines.push(`${number}<b>${escapeHtml(entry.type)}</b>${code}`)
    lines.push(`<b>Sahifa:</b> ${escapeHtml(cut(entry.page, 200))}`)

    for (const [label, value] of entry.rows || []) {
      if (value) lines.push(`<b>${escapeHtml(label)}:</b> ${escapeHtml(cut(value, 300))}`)
    }

    lines.push(`<b>Xabar:</b> ${escapeHtml(cut(entry.message, 500))}`)

    const stack = formatStack(entry.stack, stackLines)
    if (stack) lines.push(`<pre>${escapeHtml(stack)}</pre>`)

    if (entry.repeated > 0) {
      lines.push(`<i>+${entry.repeated} marta takrorlangan</i>`)
    }

    // 4096 chegarasidan oshib ketmasin — sig'maganini sanab qo'yamiz.
    const block = lines.join('\n')
    const used = head.join('\n').length + blocks.join('\n\n').length + block.length
    if (used > TEXT_LIMIT) {
      skipped += 1
      return
    }
    blocks.push(block)
  })

  const footer = []
  if (skipped > 0) footer.push(`<i>… yana ${skipped} ta xato bu xabarga sigʻmadi</i>`)
  if (dropped > 0) footer.push(`<i>⏸ ${dropped} ta xabar limit tufayli yuborilmadi</i>`)

  return cut(
    [head.join('\n'), blocks.join('\n\n'), ...footer].filter(Boolean).join('\n\n'),
    TEXT_LIMIT
  )
}

// ------------------------------------------------------------------ yuborish

// Topic id noto'g'ri/o'chirilgan bo'lsa Telegram 400 "message thread not found" qaytaradi.
// O'sha holda topic'siz qayta yuboramiz — aks holda xato xabarlari umuman ko'rinmaydi.
let useTopic = !!TOPIC_ID

const postMessage = (text, keepalive) => {
  const body = {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  }
  if (useTopic) body.message_thread_id = Number(TOPIC_ID)

  return fetch(`https://${TELEGRAM_HOST}/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive
  })
}

// Telegram qoidalari: ketma-ket xabarlar orasida MIN_INTERVAL, daqiqasiga RATE_MAX,
// 429 kelsa retry_after gacha umumiy tanaffus.
const waitForSlot = async () => {
  for (;;) {
    const now = Date.now()

    if (now < cooldownUntil) {
      await sleep(cooldownUntil - now)
      continue
    }

    const last = sentAt.length ? sentAt[sentAt.length - 1] : 0
    if (last && now - last < MIN_INTERVAL) {
      await sleep(MIN_INTERVAL - (now - last))
      continue
    }

    while (sentAt.length && now - sentAt[0] > RATE_WINDOW) sentAt.shift()
    if (sentAt.length >= RATE_MAX) {
      await sleep(sentAt[0] + RATE_WINDOW - now)
      continue
    }

    return
  }
}

const sendToTelegram = async (text) => {
  try {
    await waitForSlot()
    sentAt.push(Date.now())

    let response = await postMessage(text, false)

    // 400 lar: noto'g'ri topic yoki HTML. Jim yo'qotmaymiz — sababini konsolga yozamiz
    // va topic aybdor bo'lsa topic'siz (guruhning General'iga) qayta yuboramiz.
    if (response.status === 400) {
      const data = await response.json().catch(() => ({}))
      const description = String(data?.description || '')
      console.warn('[errorReporter] Telegram 400:', description)

      if (useTopic && /thread|topic/i.test(description)) {
        useTopic = false
        await waitForSlot()
        sentAt.push(Date.now())
        response = await postMessage(text, false)
      }
    }

    // 429 — flood limit. retry_after gacha butun navbat kutadi, keyin bir marta qayta uriniladi.
    if (response.status === 429) {
      const data = await response.json().catch(() => ({}))
      const wait = Math.min((data?.parameters?.retry_after || 5) * 1000, 60000)
      cooldownUntil = Date.now() + wait
      await sleep(wait)
      cooldownUntil = 0
      sentAt.push(Date.now())
      await postMessage(text, false)
    }
  } catch {
    // Reporter hech qachon ilovaga xato qaytarmaydi. O'z so'rovi yiqilsa ham
    // bu yerda tugaydi (unhandledrejection'ga aylanmaydi), qolgani IGNORED'da.
  }
}

const enqueue = (text) => {
  if (queueLength >= MAX_QUEUE) {
    droppedCount += 1
    return
  }
  queueLength += 1
  queue = queue
    .then(() => sendToTelegram(text))
    .catch(() => {})
    .finally(() => {
      queueLength -= 1
    })
}

// immediate=true — sahifa yopilayotganda: navbat va intervalni kutmasdan darhol.
const flush = (immediate = false) => {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  if (!buffer.length) return

  const entries = buffer.splice(0, buffer.length)
  // Guruhlash oynasi ichida takrorlanganlarni ham shu xabarda ko'rsatamiz.
  for (const entry of entries) {
    const record = seen.get(entry.signature)
    if (!record) continue
    entry.repeated += record.count
    record.count = 0
  }

  const dropped = droppedCount
  droppedCount = 0
  const text = buildText(entries, dropped)

  if (immediate) {
    try {
      // .catch() shart: keepalive so'rov yiqilsa u unhandledrejection bo'lib
      // qaytib reportError'ni chaqirardi — logger o'ziga xato yozish halqasi.
      postMessage(text, true).catch(() => {})
    } catch {
      // jim
    }
    return
  }

  enqueue(text)
}

const scheduleFlush = () => {
  if (buffer.length >= MAX_BATCH) {
    flush()
    return
  }
  if (flushTimer) return
  flushTimer = setTimeout(() => flush(), FLUSH_DELAY)
}

// ------------------------------------------------------------------ asosiy kirish nuqtasi

/**
 * Bitta xatoni buferga qo'yadi (5 s ichidagilar bitta xabar bo'lib ketadi).
 * Hech qachon throw qilmaydi.
 * @param {{ type: string, message: string, code?: string, stack?: string, rows?: Array<[string, string]> }} entry
 */
export const reportError = (entry) => {
  try {
    if (!isEnabled) return
    if (!entry?.message) return
    if (isIgnored(`${entry.message} ${entry.stack || ''} ${entry.code || ''}`)) return

    const now = Date.now()
    const signature = signatureOf(entry)
    const record = seen.get(signature)

    // Dedup: oyna ichida takrorlansa faqat sanaymiz.
    if (record && now - record.lastSentAt < DEDUP_WINDOW) {
      record.count += 1
      return
    }

    const repeated = record ? record.count : 0
    seen.set(signature, { count: 0, lastSentAt: now })
    pruneSeen(now)

    buffer.push({
      ...entry,
      signature,
      repeated,
      page: `${location.pathname}${location.search}`
    })
    scheduleFlush()
  } catch {
    // Log yuborish ilovani hech qachon buzmasligi kerak.
  }
}

/**
 * Axios interceptor'idan chaqiriladi (src/service/index.js).
 * 401/403/422 — normal biznes holatlari, yuborilmaydi.
 */
export const reportApiError = (error) => {
  try {
    if (!isEnabled || !error) return
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return

    const config = error.config || {}
    const url = `${config.baseURL || ''}${config.url || ''}`
    if (url.includes(TELEGRAM_HOST)) return

    const method = String(config.method || 'get').toUpperCase()
    const status = error.response?.status
    let type

    if (!error.response) {
      // Foydalanuvchining o'z interneti uzilgan bo'lsa — bizning xatoyimiz emas.
      if (navigator.onLine === false) return
      type = error.code === 'ECONNABORTED' ? 'API timeout' : 'API network'
    } else if (status >= 500) {
      type = 'API server xatosi'
    } else if (status >= 400 && ![401, 403, 422].includes(status)) {
      type = 'API xatosi'
    } else {
      return
    }

    const data = error.response?.data
    const backendMessage = typeof data?.message === 'string' ? data.message : ''
    const backendCode = data?.code || data?.error_code || ''
    const requestId =
      error.response?.headers?.['x-request-id'] || error.response?.headers?.['X-Request-Id'] || ''

    reportError({
      type,
      // Kod: HTTP status + axios kodi (ERR_NETWORK, ECONNABORTED, ...)
      code: [status, error.code].filter(Boolean).join(' · '),
      message: backendMessage || error.message || 'Nomaʼlum API xatosi',
      stack: error.stack,
      rows: [
        ['Soʻrov', `${method} ${cut(url, 200)}`],
        ['Backend kod', String(backendCode || '')],
        ['Request-Id', requestId]
      ]
    })
  } catch {
    // jim
  }
}

const onWindowError = (event) => {
  // Resurs xatolari (img/script/link) — asosan kengaytma/tarmoq shovqini, o'tkazib yuboramiz.
  if (!event.error && event.target && event.target !== window) return

  reportError({
    type: 'JS runtime',
    code: event.error?.name || 'Error',
    message: event.error?.message || event.message || 'Unknown error',
    stack: event.error?.stack,
    rows: [['Manba', event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : '']]
  })
}

const onUnhandledRejection = (event) => {
  const reason = event.reason
  // Axios xatolari interceptor orqali allaqachon hisobga olingan.
  if (reason?.isAxiosError) return

  const message = reason?.message || (typeof reason === 'string' ? reason : String(reason))
  // Eski deploy belgisi: brauzer hali eski chunk nomlarini so'rayapti.
  const isChunkError =
    /dynamically imported module|Loading chunk|Importing a module script failed/i.test(message)

  reportError({
    type: isChunkError ? 'Chunk yuklanmadi' : 'Promise',
    code: reason?.name || (isChunkError ? 'ChunkLoadError' : ''),
    message,
    stack: reason?.stack
  })
}

// Sahifa yopilayotganda buferdagi xatolar yo'qolmasin (keepalive so'rov bilan).
const onPageHide = () => flush(true)
const onVisibilityChange = () => {
  if (document.visibilityState === 'hidden') flush(true)
}

/**
 * main.js dan bir marta chaqiriladi. app berilsa Vue xatolari ham ushlanadi.
 */
export const initErrorReporter = (app) => {
  if (!isEnabled) return

  if (app) {
    const previous = app.config.errorHandler
    app.config.errorHandler = (err, instance, info) => {
      reportError({
        type: 'Vue',
        code: err?.name || 'Error',
        message: err?.message || String(err),
        stack: err?.stack,
        rows: [
          ['Komponent', instance?.$options?.__name || instance?.$?.type?.__name || ''],
          ['Hook', info || '']
        ]
      })
      // errorHandler o'rnatilganda Vue o'zi konsolga yozmaydi — dev'da ko'rinib tursin.
      if (typeof previous === 'function') previous(err, instance, info)
      else console.error(err)
    }
  }

  window.addEventListener('error', onWindowError)
  window.addEventListener('unhandledrejection', onUnhandledRejection)
  window.addEventListener('pagehide', onPageHide)
  document.addEventListener('visibilitychange', onVisibilityChange)
}

export const errorReporterEnabled = isEnabled
