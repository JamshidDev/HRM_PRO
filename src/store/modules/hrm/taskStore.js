import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      // 'created' — men berganlar; 'assigned' — menga biriktirilganlar.
      view: 'created',
      status: null,
      organization_id: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        search: this.params.search || undefined,
        status: this.params.status || undefined,
        organization_id: this.params.organization_id || undefined
      }
      $ApiService.taskService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
})
