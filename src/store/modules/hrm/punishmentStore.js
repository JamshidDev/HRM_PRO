import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { AppPaths } from '@/utils/index.js'
import router from '@/router/index.js'
export const usePunishmentStore = defineStore('punishmentStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      created: null,
      year: null,
      month: null,
      status: null
    },
    downloading: false
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        created: Utils.timeToZone(this.params.created),
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined,
        status: this.params.status || undefined
      }
      // BACKEND: GET /v1/hr/discips ro'yxatni `id` bo'yicha (yaratilish tartibi) qaytaradi — sanalar
      // aralash chiqadi (07.07, 26.06, 04.06, 18.06…). `date` bo'yicha kamayish tartibida
      // saralash kerak (yoki `sort` parametri); sahifalangan ro'yxatni frontend o'zi
      // to'g'ri saralay olmaydi. Dev bazadagi test yozuvlari («test demo», «boshliq») —
      // ma'lumot masalasi, kod emas (DAS-14227).
      $ApiService.punishmentService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _download() {
      this.downloading = true
      const params = {
        ...this.params,
        created: Utils.timeToZone(this.params.created),
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined,
        status: this.params.status || undefined,
        download: true
      }
      $ApiService.punishmentService._index({ params }).finally(() => {
        this.downloading = false
      })
    }
  }
})
