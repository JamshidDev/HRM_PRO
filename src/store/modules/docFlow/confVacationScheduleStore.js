import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@utils/Utils.js'
const { t } = i18n.global
export const useConfVacationScheduleStore = defineStore('confVacationScheduleStore', {
  state: () => ({
    list: [],
    params: {
      page: 1,
      per_page: 10,
      search: null
    },
    loading: false,
    totalItems: 0
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params
      }
      $ApiService.confVacationScheduleService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data.map((v) => ({
            ...v,
            ...v.schedule
          }))
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
})
