import { defineStore } from 'pinia'
import rawAxios from 'axios'
import i18n from '@/i18n/index.js'

/**
 * Bosh sahifa (Figma "Asosiy", node 3257:112457) ma'lumot manbalari.
 *
 * Sahifadagi har bir blok MUSTAQIL yuklanadi va xatoni yutadi: story/banner
 * uchun faqat admin endpoint'lari mavjud, oddiy xodimda ularga ruxsat
 * bo'lmasligi mumkin. Shuning uchun chaqiruvlar `silentError` bilan ketadi
 * (toast chiqmaydi) va rad javobida ro'yxat bo'sh qoladi — blok o'zi
 * `v-if` bilan yashiriladi, sahifa esa buzilmaydi.
 *
 * Backend keyinchalik consumer endpoint bersa (masalan `/v1/me/stories`),
 * faqat shu yerdagi servis chaqiruvi almashadi — komponentlar tegilmaydi.
 */

// Mobil API javob qobig'i bir xil emas: story'lar `data` da to'g'ridan-to'g'ri
// massiv, yangiliklar esa sahifalangan `data.data` bo'lib kelishi mumkin.
// Ikkalasini ham (va qobiqsiz massivni ham) qabul qilamiz.
const unwrapList = (res) => {
  const payload = res?.data?.data ?? res?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/* ──────────────────────────── Joylashuv va ob-havo ────────────────────────────
 *
 * Joylashuv shu tartibda aniqlanadi va birinchi muvaffaqiyatlisi olinadi:
 *   1. localStorage keshi (1 soat) — ruxsat oynasi qayta chiqmasin;
 *   2. brauzer geolokatsiyasi + teskari geokodlash (shahar nomi uchun);
 *   3. tashkilot shahri (`/v1/user/organization-info` → `/v1/structure/cities`)
 *      + Open-Meteo geokodlash;
 *   4. zaxira — Toshkent.
 *
 * Har bir bosqich xatoni yutadi: ob-havo bezak element, u tufayli sahifada
 * xato toast chiqmasligi kerak.
 */

const FALLBACK_LOCATION = { name: 'Toshkent', latitude: 41.2995, longitude: 69.2401 }

const LOCATION_CACHE_KEY = 'home-weather-location'
const LOCATION_CACHE_TTL = 60 * 60 * 1000 // 1 soat

const readCachedLocation = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCATION_CACHE_KEY))
    if (!parsed || Date.now() - (parsed.ts ?? 0) > LOCATION_CACHE_TTL) return null
    if (typeof parsed.latitude !== 'number' || typeof parsed.longitude !== 'number') return null
    return parsed
  } catch {
    // Buzilgan JSON yoki localStorage bloklangan — kesh yo'q deb hisoblanadi
    return null
  }
}

const writeCachedLocation = (location) => {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ ...location, ts: Date.now() }))
  } catch {
    // Kvota to'lgan yoki yozish taqiqlangan — kesh shunchaki ishlamaydi
  }
}

/** Brauzer geolokatsiyasi. Rad etilsa yoki qo'llab-quvvatlanmasa — `null`. */
const requestBrowserPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: LOCATION_CACHE_TTL }
    )
  })

/**
 * Koordinatadan shahar nomi — BigDataCloud'ning kalitsiz mijoz endpoint'i
 * (Open-Meteo teskari geokodlashni qo'llab-quvvatlamaydi). Topilmasa `null`
 * qaytadi va chip'da faqat harorat ko'rsatiladi.
 */
const reverseGeocode = async (latitude, longitude, language) => {
  try {
    const res = await rawAxios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: { latitude, longitude, localityLanguage: language },
      timeout: 8000
    })
    const data = res.data
    return data?.city || data?.locality || data?.principalSubdivision || null
  } catch {
    return null
  }
}

/** Shahar nomidan koordinata — Open-Meteo geokodlash (kalit talab qilmaydi). */
const geocodeCity = async (name, language) => {
  try {
    const res = await rawAxios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name, count: 1, language, format: 'json' },
      timeout: 8000
    })
    const hit = res.data?.results?.[0]
    if (!hit) return null
    return { name, latitude: hit.latitude, longitude: hit.longitude }
  } catch {
    return null
  }
}

/**
 * Tashkilot shahri: `organization-info` faqat `city.id` va `city.region.id`
 * beradi, nomi esa hududdagi shaharlar ro'yxatidan topiladi.
 */
const resolveOrganizationCity = async (language) => {
  try {
    const orgRes = await $ApiService.accountService._orgInfo({ silentError: true })
    const city = orgRes.data?.data?.city
    const regionId = city?.region?.id
    if (!city?.id || !regionId) return null

    const cityRes = await $ApiService.districtService._index({
      params: { page: 1, per_page: 1000, region_id: regionId },
      silentError: true
    })
    const match = unwrapList(cityRes).find((v) => v.id === city.id)
    if (!match?.name) return null

    return await geocodeCity(match.name, language)
  } catch {
    return null
  }
}

export const useHomeStore = defineStore('homeStore', {
  state: () => ({
    // ── Bannerlar (bayram tabriknomalari) ──
    banners: [],
    bannersLoading: false,

    // ── Story'lar (mobil e'lonlar) ──
    stories: [],
    storiesLoading: false,
    // To'liq ekran ko'ruvchida ochilgan story indeksi (`null` — yopiq)
    activeStoryIndex: null,

    // ── Yangiliklar ──
    news: [],
    newsLoading: false,
    // Modalda ochilgan yangilik (`null` — yopiq)
    activeNews: null,

    // ── Ob-havo ── { min, max, city } yoki null
    weather: null,
    weatherLoading: false
  }),

  getters: {
    activeStory: (state) =>
      state.activeStoryIndex === null ? null : (state.stories[state.activeStoryIndex] ?? null)
  },

  actions: {
    // ── To'liq ekran story ko'ruvchisi ──
    openStory(index) {
      if (index < 0 || index >= this.stories.length) return
      this.activeStoryIndex = index
      this._markStorySeen(this.stories[index])
    },

    closeStory() {
      this.activeStoryIndex = null
    },

    /** Keyingi/oldingi story; oxiridan nariga o'tilsa ko'ruvchi yopiladi. */
    stepStory(delta) {
      if (this.activeStoryIndex === null) return
      const next = this.activeStoryIndex + delta
      if (next < 0 || next >= this.stories.length) {
        this.closeStory()
        return
      }
      this.openStory(next)
    },

    /**
     * `POST /v1/mobile/stories/{id}/seen` — idempotent, javobi kerak emas.
     * `is_seen` lokal ravishda ham yangilanadi: sahifa qayta yuklanmasa ham
     * qaytadan so'rov yuborilmasin.
     */
    _markStorySeen(story) {
      if (!story || story.is_seen) return
      story.is_seen = true
      $ApiService.storyService._seen({ id: story.id }).catch(() => {
        story.is_seen = false
      })
    },

    // ── Yangilik modali ──
    openNews(item) {
      this.activeNews = item
    },

    closeNews() {
      this.activeNews = null
    },

    /** Barcha bloklarni parallel yuklaydi; biri yiqilsa qolganlari to'xtamaydi. */
    _init() {
      return Promise.allSettled([this._banners(), this._stories(), this._news(), this._weather()])
    },

    _banners() {
      this.bannersLoading = true
      return $ApiService.holidayGreetingService
        ._index({ params: { page: 1, per_page: 20 }, silentError: true })
        .then((res) => {
          // `is_active` so'rov parametri backendda kafolatlanmagan (admin
          // jadvalida filtr sifatida ishlatilmaydi), shuning uchun mijoz
          // tomonida filtrlaymiz. Rasm maydoni ro'yxatda `banner_url`.
          this.banners = (res.data.data.data ?? []).filter((v) => v.is_active && v.banner_url)
        })
        .catch(() => {
          this.banners = []
        })
        .finally(() => {
          this.bannersLoading = false
        })
    },

    /**
     * `GET /v1/mobile/stories` — foydalanuvchi tomoni.
     *
     * Server chop etilganlarini o'zi filtrlaydi va tartiblaydi, matnlarni
     * `Accept-Language` bo'yicha tanlangan holda beradi:
     * `{ id, title, subtitle, action_type, is_seen, slides[{id, sort, media_type, url, duration}] }`.
     * Slayd `url` i — MinIO presigned havolasi (30 daqiqa amal qiladi).
     */
    _stories() {
      this.storiesLoading = true
      return $ApiService.storyService
        ._index({ silentError: true })
        .then((res) => {
          this.stories = unwrapList(res).filter((v) => v.slides?.length)
        })
        .catch(() => {
          this.stories = []
        })
        .finally(() => {
          this.storiesLoading = false
        })
    },

    /**
     * `GET /v1/news` — yangiliklarning ochiq (foydalanuvchi) ro'yxati.
     * CMS ro'yxatidan (`/v1/chat/news`) farqli o'laroq qoralamalarni
     * qaytarmaydi va admin ruxsatini talab qilmaydi. Maketda 2 ta element.
     */
    _news() {
      this.newsLoading = true
      return $ApiService.newsService
        ._publicIndex({ params: { page: 1, per_page: 2 }, silentError: true })
        .then((res) => {
          this.news = unwrapList(res)
        })
        .catch(() => {
          this.news = []
        })
        .finally(() => {
          this.newsLoading = false
        })
    },

    /**
     * Joylashuvni aniqlaydi va keshlaydi. Tartib fayl boshidagi izohda.
     * Hech qachon `reject` qilmaydi — eng yomon holatda zaxira shahar qaytadi.
     */
    async _resolveLocation() {
      // Geokodlash API'lari `uz_kr` kabi ichki kodlarni bilmaydi
      const language = i18n.global.locale === 'ru' ? 'ru' : 'en'

      const cached = readCachedLocation()
      if (cached) return cached

      const position = await requestBrowserPosition()
      if (position) {
        const name = await reverseGeocode(position.latitude, position.longitude, language)
        const location = { ...position, name }
        writeCachedLocation(location)
        return location
      }

      // Ruxsat berilmadi yoki geolokatsiya ishlamadi — ish joyi shahri
      const organizationCity = await resolveOrganizationCity(language)
      if (organizationCity) {
        writeCachedLocation(organizationCity)
        return organizationCity
      }

      // Zaxira ham keshlanadi: geolokatsiya butunlay taqiqlangan bo'lsa har
      // sahifa ochilishida ish joyi shahri zanjiri behuda takrorlanmasin.
      // Kesh muddati tugagach urinish qaytadan boshlanadi.
      writeCachedLocation(FALLBACK_LOCATION)
      return FALLBACK_LOCATION
    },

    /**
     * Ob-havo — Open-Meteo (kalit talab qilmaydi).
     *
     * Loyihaning `axios` instansi `baseURL` va `Authorization` header qo'shadi,
     * shuning uchun tashqi API xom `axios` bilan chaqiriladi.
     * `timezone: 'auto'` — sutkalik min/max koordinataning mahalliy vaqtida
     * hisoblanadi, ya'ni foydalanuvchi qayerda bo'lsa o'sha yerning kuni.
     */
    async _weather() {
      this.weatherLoading = true
      try {
        const location = await this._resolveLocation()
        const res = await rawAxios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            daily: 'temperature_2m_min,temperature_2m_max',
            timezone: 'auto',
            forecast_days: 1
          },
          timeout: 8000
        })

        const daily = res.data?.daily
        const min = daily?.temperature_2m_min?.[0]
        const max = daily?.temperature_2m_max?.[0]
        if (min == null || max == null) {
          this.weather = null
          return
        }

        // `city` topilmasa joylashuv chipi chizilmaydi, harorat esa qoladi.
        this.weather = {
          min: Math.round(min),
          max: Math.round(max),
          city: location.name || null
        }
      } catch {
        this.weather = null
      } finally {
        this.weatherLoading = false
      }
    }
  }
})
