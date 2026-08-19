import { defineStore } from 'pinia'

// HRM'siz qo'shilgan xodimlarning o'tishlari — "Qurilma" tabi.
// Backend: GET /v1/turnstile/hik-central/device-events
export const useDeviceEventStore = defineStore('deviceEventStore', {
  state: () => ({
    list: [],
    loading: false,
    syncLoading: false,
    resolveLoading: false,
    removeLoading: false,
    totalItems: 0,
    // Rasm ko'rish modali (objectURL — yopilganda revoke qilinadi)
    photoVisible: false,
    photoLoading: false,
    photoSrc: null,
    params: {
      page: 1,
      per_page: 20,
      search: null,
      from: null,
      to: null,
      access_levels: [],
      reason: null,
      // Sukut bo'yicha faqat HAL QILINMAGANLAR — bu ish ro'yxati, arxiv emas.
      resolved: 'no'
    }
  }),
  actions: {
    // Backend CSV kutadi (`access_levels=1,2`), n-select esa massiv beradi.
    _payload() {
      const p = { ...this.params }
      p.access_levels = this.params.access_levels?.length
        ? this.params.access_levels.join(',')
        : null
      return p
    },
    _index() {
      this.loading = true
      $ApiService.deviceEventService
        ._index({ params: this._payload() })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _filterEvent() {
      this.params.page = 1
      this._index()
    },
    // fixed — qurilmadan o'chirilib HRM orqali qayta qo'shildi
    // ignored — e'tiborsiz (mehmon, pudratchi va h.k.)
    _resolve(id, resolution, workerId = null, note = null) {
      this.resolveLoading = true
      $ApiService.deviceEventService
        ._resolve({ id, data: { resolution, worker_id: workerId, note } })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.resolveLoading = false
        })
    },
    // Qurilmadan o'chirish — HCP shaxs kartochkasi o'chadi; muvaffaqiyatli
    // bo'lsa shu shaxsning barcha hodisalari `fixed` bo'ladi, ya'ni ro'yxatdan
    // tushadi (sukut filtri — hal qilinmaganlar).
    _removePerson(id) {
      this.removeLoading = true
      $ApiService.deviceEventService
        ._removePerson({ id })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.removeLoading = false
        })
    },
    _sync() {
      this.syncLoading = true
      $ApiService.deviceEventService
        ._sync({ data: {} })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.syncLoading = false
        })
    },
    _photo(id) {
      this.closePhoto()
      this.photoVisible = true
      this.photoLoading = true
      $ApiService.deviceEventService
        ._photo({ id })
        .then((res) => {
          this.photoSrc = URL.createObjectURL(res.data)
        })
        .finally(() => {
          this.photoLoading = false
        })
    },
    closePhoto() {
      if (this.photoSrc) URL.revokeObjectURL(this.photoSrc)
      this.photoSrc = null
    },
    resetFilter() {
      this.params.search = null
      this.params.from = null
      this.params.to = null
      this.params.access_levels = []
      this.params.reason = null
      this.params.resolved = 'no'
      this._filterEvent()
    }
  }
})
