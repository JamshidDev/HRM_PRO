import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useConfTimesheetStore = defineStore('confTimesheetStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    rejectVisible: false,
    confirmVisible: false,
    comment: null,
    params: {
      page: 1,
      per_page: 15,
      search: null
    }
  }),
  actions: {
    // Imzosiz qaror: 3 = tasdiqlash, 4 = izoh bilan rad etish.
    _decide(status) {
      this.saveLoading = true
      $ApiService.timesheetService
        ._decide({ id: this.elementId, data: { status, comment: this.comment || undefined } })
        .then(() => {
          this.confirmVisible = false
          this.rejectVisible = false
          this.comment = null
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _index() {
      this.loading = true
      $ApiService.documentService
        ._confirmationTimesheet({ params: this.params })
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
