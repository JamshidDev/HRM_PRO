import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useConfirmCommandStore = defineStore('confirmCommandStore', {
  state: () => ({
    list: [],
    loading: false,
    searched: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 15,
      search: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      // Bo'sh holat matni uchun: ro'yxat qidiruv bilan olinganmi (yozilayotgan matn emas).
      this.searched = !!this.params.search?.trim()
      $ApiService.documentService
        ._confirmationCommand({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },

    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
    }
  }
})
