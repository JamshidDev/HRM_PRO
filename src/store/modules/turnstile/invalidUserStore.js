import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

export const useInvalidUserStore = defineStore('invalidUserStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    structureCheck2: [],
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: []
    }
  }),
  actions: {
    _params() {
      return {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
    },
    _index() {
      this.loading = true
      const params = {
        ...this._params()
      }
      $ApiService.invalidUserService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data.data.map((v) => ({
            ...v,
            sync_time: Utils.timeWithMonth(res.data.data.time)
          }))
          this.totalItems = res.data.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
})
