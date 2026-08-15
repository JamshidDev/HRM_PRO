import { defineStore } from 'pinia'

/**
 * Baza zaxira nusxalari — FAQAT KO'RISH sahifasi.
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
  getters: {
    // Tepadagi holat kartasi — "backup umuman ishlayaptimi?" degan asosiy savol.
    lastSuccess: (s) => s.list.find((v) => v.status === 2) || null,
    lastAny: (s) => s.list[0] || null,
    // Faqat diskda TURGAN nusxalar (retention o'chirganlari sanalmaydi).
    storedCount: (s) => s.list.filter((v) => v.status === 2).length,
    storedSize: (s) =>
      s.list.filter((v) => v.status === 2).reduce((a, v) => a + (v.size_bytes || 0), 0)
  },
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
