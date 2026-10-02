// 🔄 Foydalanuvchi tizimda turganda production yangilansa — buni sezib, xabar beramiz.
//
// Qanday aniqlanadi: Vite har build'da kirish skripti nomini o'zgartiradi
// (`/assets/index-XXXX.js`). Serverdagi `index.html` ni vaqti-vaqti bilan o'qib,
// undagi nom joriy sahifadagidan farq qilsa — yangi deploy chiqqan.
//
// Aniqlangach: 3 soniyalik "Tizim yangilandi" xabari chiqadi va KEYINGI sahifa
// almashishida to'liq reload qilinadi (router/index.js) — yangi chunk'lar olinadi,
// eski chunk nomlari tufayli navigatsiya to'xtab qolmaydi.
import i18n from '@/i18n/index.js'
import { useNotify } from '@/composables/useNotify'

const CHECK_INTERVAL = 2 * 60 * 1000
const NOTICE_DURATION = 3000
// Reload'dan keyin xabarni ko'rsatish kerakligi (eski chunk xatosi bilan reload bo'lganda).
const PENDING_NOTICE_KEY = 'app-update-notice'

const ENTRY_RE = /<script[^>]+src="([^"]*\/assets\/index-[^"]+\.js)"/

let updateAvailable = false
let started = false

const currentEntry = () =>
  document.querySelector('script[type="module"][src*="/assets/index-"]')?.getAttribute('src') ??
  null

// Deploy tab ochiq turganda aniqlandi — yangi versiya hali yuklanmagan: izoh va
// "Hozir yangilash" tugmasi. Reload'dan keyin (`afterReload`) esa foydalanuvchi
// allaqachon yangi versiyada — faqat sarlavha.
const showNotice = ({ afterReload = false } = {}) => {
  const { t } = i18n.global
  useNotify().info(t('message.appUpdated'), {
    duration: NOTICE_DURATION,
    ...(afterReload
      ? {}
      : {
          description: t('message.appUpdatedHint'),
          action: { label: t('message.appUpdateNow'), onClick: () => window.location.reload() }
        })
  })
}

const checkForUpdate = async () => {
  if (updateAvailable) return
  const current = currentEntry()
  if (!current) return
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}?_=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return
    const latest = (await res.text()).match(ENTRY_RE)?.[1]
    if (!latest || latest === current) return
    updateAvailable = true
    showNotice()
  } catch {
    // Tarmoq uzilgan — keyingi tekshiruvda qayta urinamiz.
  }
}

/** Yangi versiya aniqlanganmi — router keyingi navigatsiyada to'liq reload qiladi. */
export const isAppUpdateAvailable = () => updateAvailable

/**
 * Eski chunk yuklanmay reload qilinayotganda chaqiriladi: yangi sahifa ochilgach
 * xabar ko'rsatilsin. Tekshiruv allaqachon xabar bergan bo'lsa takrorlamaymiz.
 */
export const markAppUpdateNotice = () => {
  if (updateAvailable) return
  sessionStorage.setItem(PENDING_NOTICE_KEY, '1')
}

export const initAppUpdateWatcher = () => {
  if (started) return
  started = true

  if (sessionStorage.getItem(PENDING_NOTICE_KEY)) {
    sessionStorage.removeItem(PENDING_NOTICE_KEY)
    showNotice({ afterReload: true })
  }

  // Dev serverda build hash'lari yo'q — tekshirishning ma'nosi yo'q.
  if (!import.meta.env.PROD) return

  setInterval(checkForUpdate, CHECK_INTERVAL)
  // Tab'ga qaytganda darhol tekshiramiz — uzoq yopiq turgan tab'da deploy ko'p bo'ladi.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
}
