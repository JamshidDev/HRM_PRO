import { defineStore } from 'pinia'

export const useMobileUserStore = defineStore('mobileUser', {
  state: () => ({
    list: [],
    loading: false,
    detailLoading: false,
    totalItems: 0,
    detailVisible: false,
    detail: null,
    params: {
      page: 1,
      per_page: 10,
      search: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.mobileUserService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _show(id) {
      this.detailLoading = true
      this.detailVisible = true
      $ApiService.mobileUserService
        ._show({ id })
        .then((res) => {
          this.detail = res.data.data
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    _filterEvent() {
      this.params.page = 1
      this._index()
    }
  }
})
