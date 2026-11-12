import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import router from '@/router/index.js'
import { AppPaths } from '@/utils/index.js'
const { t } = i18n.global
export const useIncentiveStore = defineStore('incentiveStore', {
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
      status: null,
      award_id: null,
      departments: []
    },
    awards: [],
    awardsLoading: false,
    downloading: true
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
        status: this.params.status || undefined,
        award_id: this.params.award_id || undefined,
        departments: this.params.departments.toString() || undefined
      }
      // BACKEND: GET /v1/hr/incentives ro'yxatni `id` bo'yicha (yaratilish tartibi) qaytaradi —
      // sanalar aralash chiqadi (07.07, 22.06, 15.12.2025, 24.12.2025…). `date` bo'yicha kamayish
      // tartibida saralash kerak (yoki `sort` parametri); sahifalangan ro'yxatni frontend o'zi
      // to'g'ri saralay olmaydi. Dev bazadagi test yozuvlari («boshliq») — ma'lumot masalasi,
      // kod emas (DAS-14227).
      $ApiService.incentiveService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Filtr uchun mukofotlar (ichki turlar + davlat mukofotlari).
    _awards() {
      if (this.awards.length || this.awardsLoading) return
      this.awardsLoading = true
      $ApiService.incentiveService
        ._awards()
        .then((res) => (this.awards = res.data.data || []))
        .finally(() => (this.awardsLoading = false))
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
        award_id: this.params.award_id || undefined,
        departments: this.params.departments.toString() || undefined,
        download: true
      }
      $ApiService.incentiveService
        ._index({ params })
        .then((res) => {
          // router.push(Utils.routeHrmPathMaker(AppPaths.Export))
        })
        .finally(() => {
          this.downloading = false
        })
    }
  }
})
