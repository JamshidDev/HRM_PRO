import { defineStore } from 'pinia'

/**
 * Baza zaxira nusxalari — FAQAT KO'RISH sahifasi.
 *
 * Zaxira faqat tizim cron'i orqali olinadi — qo'lda boshlash action'i yo'q
 * (backendda ham endpoint olib tashlandi).
 *
 * Yuklab olish ATAYLAB yo'q: to'liq dump ~90k xodimning shaxsiy ma'lumoti
 * (JSHSHIR, pasport, parol hashlari, tokenlar) — uni brauzer orqali chiqarish
 * xavf maydonini SSH'dan admin sessiyasiga ko'chiradi. Faylni serverdan `scp`
 * bilan olinadi. Backend endpointi bor, ruxsat hech kimga berilmagan.
 */
export const useDbBackupStore = defineStore('dbBackupStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 20
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.dbBackupService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data || []
          this.totalItems = res.data.data.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    changePage(page) {
      this.params.page = page
      this._index()
    }
  }
})
