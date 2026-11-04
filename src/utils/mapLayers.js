// Xarita qatlamlari (Leaflet): OpenStreetMap va Yandex.
// Yandex — faqat Tiles API (rasmlar). Xaritani Leaflet chizadi, shuning uchun aylana/hudud chizish
// kodi ikkala qatlamda ham bir xil ishlaydi. JS API ishlatilmaydi (Tiles kaliti bilan u 403 qaytaradi).
import L from 'leaflet'

// Ommaviy kalit — bundle'ga tushadi, himoyasi Yandex kabinetidagi HTTP Referer cheklovi.
const YANDEX_KEY = import.meta.env.VITE_YANDEX_TILES_KEY || ''

export const MAP_PROVIDERS = { OSM: 'osm', YANDEX: 'yandex' }
export const hasYandexKey = Boolean(YANDEX_KEY)

const STORAGE_KEY = 'map.provider'
// Ketma-ket shuncha tile yuklanmasa (va bittasi ham yuklanmagan bo'lsa) — Yandex ishlamayapti deb hisoblanadi.
const FAIL_LIMIT = 4
// 429 (so'rovlar limiti) uchun qayta urinishlar: 0.8 → 1.6 → 3.2 s.
const MAX_RETRIES = 3

const MAX_ZOOM = 19

// Standart — Yandex (kalit bo'lsa). Foydalanuvchi OSM'ni o'zi tanlagan bo'lsagina OSM.
export const getSavedProvider = () => {
  if (!hasYandexKey) return MAP_PROVIDERS.OSM
  try {
    return localStorage.getItem(STORAGE_KEY) === MAP_PROVIDERS.OSM ? MAP_PROVIDERS.OSM : MAP_PROVIDERS.YANDEX
  } catch {
    return MAP_PROVIDERS.YANDEX
  }
}

export const saveProvider = (provider) => {
  try {
    localStorage.setItem(STORAGE_KEY, provider)
  } catch {
    // localStorage yopiq bo'lsa — tanlov shu oynada qoladi xolos
  }
}

export const createOsmLayer = () =>
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: MAX_ZOOM
  })

const yandexUrl = ({ dark }) => {
  const params = new URLSearchParams({
    lang: 'ru_RU', // boshqa tillar (uz_UZ) 400 qaytaradi
    l: 'map',
    // MAJBURIY: standart EPSG:3395 da xarita GPS nuqtalaridan yuzlab metrga siljiydi
    projection: 'web_mercator',
    ...(dark ? { theme: 'dark' } : {}),
    ...(window.devicePixelRatio > 1 ? { scale: '2' } : {}),
    apikey: YANDEX_KEY
  })
  return `https://tiles.api-maps.yandex.ru/v1/tiles/?x={x}&y={y}&z={z}&${params}`
}

/**
 * Yandex qatlami.
 * @param {{ dark?: boolean, onFail?: () => void }} options
 *   onFail — Yandex umuman yuklanmasa (noto'g'ri kalit, Referer, Yandex o'chiq) bir marta chaqiriladi.
 */
export const createYandexLayer = ({ dark = false, onFail } = {}) => {
  const layer = L.tileLayer(yandexUrl({ dark }), {
    maxZoom: MAX_ZOOM,
    // Yandex shartlari bo'yicha imzo majburiy
    attribution:
      '&copy; <a href="https://yandex.ru/maps" target="_blank" rel="noopener noreferrer">Яндекс</a> · ' +
      '<a href="https://yandex.ru/legal/maps_termsofuse/" target="_blank" rel="noopener noreferrer">Условия</a>',
    // So'rovlar kamroq: oraliq zum tile'lari yuklanmaydi, surish tugagach yuklanadi
    updateWhenZooming: false,
    updateWhenIdle: true
  })

  const attempts = new WeakMap()
  let loadedOnce = false
  let failCount = 0
  let failed = false

  layer.on('tileload', () => {
    loadedOnce = true
    failCount = 0
  })

  layer.on('tileerror', (e) => {
    const tile = e.tile
    const n = attempts.get(tile) ?? 0

    if (!loadedOnce && !failed) {
      failCount++
      if (failCount >= FAIL_LIMIT) {
        failed = true
        onFail?.()
        return
      }
    }

    // Leaflet o'zi qayta so'ramaydi — 429 odatda bir-ikki soniyada o'tib ketadi
    if (n >= MAX_RETRIES || failed) return
    attempts.set(tile, n + 1)
    setTimeout(
      () => {
        if (tile.isConnected && !failed) tile.src = `${layer.getTileUrl(e.coords)}&retry=${n + 1}`
      },
      800 * 2 ** n + Math.random() * 300
    )
  })

  return layer
}
