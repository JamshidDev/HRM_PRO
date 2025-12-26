import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global
export const usePensionStore = defineStore('pensionStore', {
  state: () => ({
    list: [],
    loading: false,
    showLoading: false,
    downloadLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      year: null,
      month: null
    },
    structureCheck2: []
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.pensionService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _show() {
      this.showLoading = true
      $ApiService.pensionService
        ._show({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    _download() {
      this.downloadLoading = true
      $ApiService.pensionService
        ._example()
        .then((res) => {
          Utils.downloadFileByUrl(res.data.data.url)
        })
        .finally(() => {
          this.downloadLoading = false
        })
    },
    resetParams() {
      this.params.organizations = []
      this.params.year = new Date().getFullYear()
      this.params.month = new Date().getMonth()
    },

    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
    }
  }
})
