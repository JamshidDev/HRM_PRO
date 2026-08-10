import { defineStore } from 'pinia'

// KPI ko'rsatgichlar sahifasi (HR moduli).
// Backend: `GET /v1/hr/kpi/workers` — shtatdagi (FXSH emas) faol xodimlar, org-scope
// ichida. Qidiruv F.I.Sh/PIN bo'yicha.
//
// `show*` holati — "ko'rish" modali. Ko'rsatkichlar BOSHQA TIZIMDAN olinadi;
// integratsiya endpointi tayyor bo'lgach `_show` ichida chaqiriladi.

const initialParams = () => ({
  page: 1,
  per_page: 15,
  search: null
})

export const useKpiStore = defineStore('kpiStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: initialParams(),
    showVisible: false,
    showLoading: false,
    showWorker: null,
    showData: null
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.kpiService
        ._index({ params: { ...this.params } })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Xodim qatoridagi "ko'rish". Hozircha faqat modalni ochadi — ma'lumot manbai
    // (tashqi tizim API'si) ulangach shu yerda so'rov yuboriladi.
    _show(row) {
      this.showWorker = row
      this.showData = null
      this.showVisible = true
    },
    resetFilter() {
      this.params = initialParams()
    }
  }
})
