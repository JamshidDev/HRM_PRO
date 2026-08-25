import { defineStore } from 'pinia'
import rawAxios from 'axios'

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

// Ob-havo uchun zaxira koordinata. Tashkilot shahri bo'yicha koordinata
// jadvali backendda yo'q, shuning uchun Toshkent olinadi.
const DEFAULT_CITY = { name: 'Toshkent', latitude: 41.2995, longitude: 69.2401 }

export const useHomeStore = defineStore('homeStore', {
  state: () => ({
    // ── Bannerlar (bayram tabriknomalari) ──
    banners: [],
    bannersLoading: false,

    // ── Story'lar (mobil e'lonlar) ──
    stories: [],
    storiesLoading: false,

    // ── Yangiliklar ──
    news: [],
    newsLoading: false,

    // ── Ob-havo ── { min, max, city } yoki null
    weather: null,
    weatherLoading: false
  }),

  actions: {
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

    _stories() {
      this.storiesLoading = true
      return $ApiService.mobileStoryService
        ._index({ params: { page: 1, per_page: 10 }, silentError: true })
        .then((res) => {
          // status: 1 = qoralama, 2 = chop etilgan
          this.stories = (res.data.data.data ?? [])
            .filter((v) => v.status === 2 && v.slides?.length)
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
        })
        .catch(() => {
          this.stories = []
        })
        .finally(() => {
          this.storiesLoading = false
        })
    },

    _news() {
      this.newsLoading = true
      // status: 1 = chop etilgan. Maketda 2 ta element ko'rinadi.
      return $ApiService.newsService
        ._index({ params: { page: 1, per_page: 2, status: 1 }, silentError: true })
        .then((res) => {
          this.news = res.data.data.data ?? []
        })
        .catch(() => {
          this.news = []
        })
        .finally(() => {
          this.newsLoading = false
        })
    },

    /**
     * Ob-havo — Open-Meteo (kalit talab qilmaydi).
     *
     * Loyihaning `axios` instansi `baseURL` va `Authorization` header qo'shadi,
     * shuning uchun tashqi API xom `axios` bilan chaqiriladi.
     */
    _weather() {
      this.weatherLoading = true
      const city = DEFAULT_CITY
      return rawAxios
        .get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: city.latitude,
            longitude: city.longitude,
            daily: 'temperature_2m_min,temperature_2m_max',
            timezone: 'Asia/Tashkent',
            forecast_days: 1
          },
          timeout: 8000
        })
        .then((res) => {
          const daily = res.data?.daily
          const min = daily?.temperature_2m_min?.[0]
          const max = daily?.temperature_2m_max?.[0]
          if (min == null || max == null) {
            this.weather = null
            return
          }
          this.weather = { min: Math.round(min), max: Math.round(max), city: city.name }
        })
        .catch(() => {
          this.weather = null
        })
        .finally(() => {
          this.weatherLoading = false
        })
    }
  }
})
