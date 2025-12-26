import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
export const useListenerStore = defineStore('listenerStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    showLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    payload: {},
    params: {
      page: 1,
      per_page: 10,
      search: null,
      year: null,
      month: null
    },
    currentTime: null
  }),
  actions: {
    _index() {
      this.loading = true
      const rangeMonth = Utils.getMonthRange(this.params.year, this.params.month)
      const params = {
        ...this.params,
        ...rangeMonth,
        year: undefined,
        month: undefined
      }
      $ApiService.listenerService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    _join() {
      this.showLoading = true
      $ApiService.listenerService
        ._joinLesson({ id: this.elementId })
        .then((res) => {
          window.open(res.data.data.zoom_start_url, '_blank')
        })
        .finally(() => {
          this.showLoading = false
        })
    },

    openVisible(data) {
      this.visible = data
    }
  }
})
