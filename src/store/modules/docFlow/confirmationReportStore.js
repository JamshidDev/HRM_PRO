import { defineStore } from 'pinia'

export const useConfirmationReportStore = defineStore('confirmationReportStore', {
  state: () => ({
    list: [],
    totalItems: 0,
    loading: false,
    params: {
      page: 1,
      per_page: 10,
      search: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.confirmationReportService
        ._index({ params: this.params })
        .then((res) => {
          const resData = res.data.data || res.data || {}
          this.list = resData.data || []
          this.totalItems = resData.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
})
