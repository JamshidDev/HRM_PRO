import { defineStore } from 'pinia'

export const useTelegramBroadcastStore = defineStore('telegramBroadcastStore', {
  state: () => ({
    list: [],
    total: 0,
    loading: false,
    saveLoading: false,
    params: {
      page: 1,
      per_page: 15,
      status: null
    },
    // Yuborish rejimi: 'all_staff' (barcha shtatdagi xodimlar) yoki 'selected' (tanlab).
    payload: {
      audience: 'all_staff',
      user_ids: [],
      // uz majburiy; ru/en bo'sh bo'lsa o'sha odamga ham uz ketadi.
      message: { uz: '', ru: '', en: '' },
      scheduled_at: null
    },
    // Ko'rish modali (detal + qabul qiluvchilar daftari).
    viewRow: null,
    viewLoading: false
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.telegramBroadcastService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.total = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _store(callback) {
      this.saveLoading = true
      const payload = {
        audience: this.payload.audience,
        user_ids: this.payload.audience === 'selected' ? this.payload.user_ids : undefined,
        message: {
          uz: this.payload.message.uz,
          ru: this.payload.message.ru || undefined,
          en: this.payload.message.en || undefined
        },
        scheduled_at: this.payload.scheduled_at || undefined
      }
      $ApiService.telegramBroadcastService
        ._store({ data: payload })
        .then(() => {
          this.resetForm()
          this._index()
          callback?.()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _show(id) {
      this.viewLoading = true
      $ApiService.telegramBroadcastService
        ._show({ id })
        .then((res) => {
          this.viewRow = res.data.data
        })
        .finally(() => {
          this.viewLoading = false
        })
    },
    _cancel(id) {
      $ApiService.telegramBroadcastService._cancel({ id }).then(() => {
        this._index()
      })
    },
    resetForm() {
      this.payload.audience = 'all_staff'
      this.payload.user_ids = []
      this.payload.message = { uz: '', ru: '', en: '' }
      this.payload.scheduled_at = null
    }
  }
})
