import { defineStore } from 'pinia'

export const useIntegrationLogStore = defineStore('integrationLog', {
  state: () => ({
    list: [],
    loading: false,
    activeCol: null,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 10,
      search: null,
      api_type: null,
      method: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      let params = {
        page: this.params.page,
        per_page: this.params.per_page,
        search: this.params.search,
        api_type: this.params.api_type,
        method: this.params.method
      }
      $ApiService.integrationLogService
        ._index({ params })
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
      this.params.per_page = 10
      this._index()
    },
    resetParams() {
      this.params = {
        page: 1,
        per_page: 10,
        search: null,
        api_type: null,
        method: null
      }
    }
  }
})
