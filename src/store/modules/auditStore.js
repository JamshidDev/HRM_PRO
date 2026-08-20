import { defineStore } from 'pinia'

// O'zgarishlar tarixi (audit) — BITTA global store, barcha CRUD page'lar uchun.
//
// `params.trigger_name` — qaysi page tarixi ko'rsatilyapti. U QULFLANGAN:
// foydalanuvchi CRUD page'dagi [↺ Tarix] tugmasi orqali kiradi va shu page
// doirasidan chiqa olmaydi. Qolgan filtrlar (status / foydalanuvchi / sana)
// ochiq. Chegara server tomonda ham majburlanadi — backend har so'rovda
// so'ralgan page'ning permission'ini tekshiradi.
export const useAuditStore = defineStore('auditStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    totalIsCapped: false,

    // Filter dropdown manbalari (GET /audit/meta).
    metaLoading: false,
    pageTitle: null,
    statusList: [],
    userList: [],
    dateRange: { min: null, max: null },

    // Kartochka maydonlari ta'rifi (GET /audit/fields) — hozircha faqat
    // yorliq/tartib manbai sifatida; ro'yxat javobida ular allaqachon keladi.
    fieldList: [],

    // Detal modali — bitta HODISA emas, tanlangan YOZUVNING BUTUN TARIXI.
    // Foydalanuvchi scroll qilib "kim, qachon, nimani o'zgartirgan" ni ketma-ket
    // ko'radi. Manba: xuddi shu `GET /audit`, faqat `trigger_id` filtri bilan.
    detailVisible: false,
    detailLoading: false,
    detailEvent: null, // bosilgan qator — sarlavha uchun
    // Ro'yxatdan BOSILGAN hodisa. Modal ochilganda shu hodisa ajratib
    // ko'rsatiladi va unga scroll qilinadi — tarix uzun bo'lsa foydalanuvchi
    // qayerdan kelganini yo'qotmasin.
    detailFocusId: null,
    detailList: [],
    detailTotal: 0,
    detailParams: {
      trigger_name: null,
      trigger_id: null,
      page: 1,
      per_page: 30
    },

    params: {
      trigger_name: null,
      trigger_id: null,
      statuses: null,
      users: null,
      date_from: null,
      date_to: null,
      page: 1,
      per_page: 15
    }
  }),

  getters: {
    // Filter rozetkasidagi son — qulflangan `trigger_name` HISOBGA OLINMAYDI,
    // u filtr emas, kontekst.
    filterCount() {
      return (
        Number(Boolean(this.params.statuses)) +
        Number(Boolean(this.params.users)) +
        Number(Boolean(this.params.date_from || this.params.date_to))
      )
    }
  },

  actions: {
    // CRUD page'dan kirishda chaqiriladi: kontekstni o'rnatadi va filtrlarni tozalaydi.
    openFor(triggerName, triggerId = null) {
      this.params.trigger_name = triggerName
      this.params.trigger_id = triggerId
      this.params.statuses = null
      this.params.users = null
      this.params.date_from = null
      this.params.date_to = null
      this.params.page = 1
      this.list = []
      this.totalItems = 0
    },

    _index() {
      if (!this.params.trigger_name) return

      const params = { ...this.params }
      // Bo'sh filtrlar so'rovga qo'shilmasin.
      Object.keys(params).forEach((k) => {
        if (params[k] === null || params[k] === '' || params[k] === undefined) {
          delete params[k]
        }
      })

      this.loading = true
      $ApiService.auditService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
          this.totalIsCapped = Boolean(res.data.data.total_is_capped)
        })
        .finally(() => {
          this.loading = false
        })
    },

    _meta() {
      if (!this.params.trigger_name) return

      this.metaLoading = true
      $ApiService.auditService
        ._meta({ params: { trigger_name: this.params.trigger_name } })
        .then((res) => {
          const d = res.data.data
          this.pageTitle = d.page_title
          // Faqat real uchragan turlar dropdown'da ko'rinsin.
          this.statusList = (d.statuses || []).filter((s) => s.count > 0)
          this.userList = d.users || []
          this.dateRange = d.date_range || { min: null, max: null }
        })
        .finally(() => {
          this.metaLoading = false
        })
    },

    _fields() {
      if (!this.params.trigger_name) return

      $ApiService.auditService
        ._fields({ params: { trigger_name: this.params.trigger_name } })
        .then((res) => {
          this.fieldList = res.data.data
        })
    },

    openDetail(event) {
      this.detailEvent = event
      this.detailFocusId = event?.request_id ?? null
      this.detailList = []
      this.detailTotal = 0
      this.detailParams = {
        trigger_name: this.params.trigger_name,
        // Bitta hodisadagi barcha o'zgarishlar bitta yozuvga tegishli
        // (trigger_id = page'ning asosiy yozuvi id'si), shuning uchun
        // birinchisidan olish yetarli.
        trigger_id: event?.changes?.[0]?.trigger_id ?? null,
        page: 1,
        per_page: 30
      }
      this.detailVisible = true
      this._detail()
    },

    // `append=true` — cheksiz scroll (ro'yxat oxiriga qo'shib boriladi).
    _detail(append = false) {
      const { trigger_name, trigger_id } = this.detailParams
      if (!trigger_name) return

      // trigger_id yo'q bo'lsa (kamdan-kam: pk aniqlanmagan) — faqat bosilgan
      // hodisani ko'rsatamiz, so'rov yubormaymiz.
      if (trigger_id == null) {
        this.detailList = this.detailEvent ? [this.detailEvent] : []
        this.detailTotal = this.detailList.length
        return
      }

      this.detailLoading = true
      $ApiService.auditService
        ._index({ params: { ...this.detailParams } })
        .then((res) => {
          const rows = res.data.data.data
          this.detailList = append ? [...this.detailList, ...rows] : rows
          this.detailTotal = res.data.data.total
        })
        .finally(() => {
          this.detailLoading = false
        })
    },

    loadMoreDetail() {
      // Qo'sh chaqiriqdan himoya: IntersectionObserver bir necha marta ishga
      // tushishi mumkin, so'rov esa hali tugamagan bo'ladi.
      if (this.detailLoading) return
      if (this.detailList.length >= this.detailTotal) return
      this.detailParams.page += 1
      this._detail(true)
    },

    resetFilter() {
      this.params.statuses = null
      this.params.users = null
      this.params.date_from = null
      this.params.date_to = null
      this.params.page = 1
      this._index()
    }
  }
})
