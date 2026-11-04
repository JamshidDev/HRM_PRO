import { defineStore } from 'pinia'

// Imzolovchi kiruvchi ro'yxati — xodim hujjatlari (umumiy `documents`), tur bo'yicha filtr.
export const useConfirmationEmployeeDocumentStore = defineStore('confirmationEmployeeDocumentStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      type: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.documentService
        ._confirmationEmployeeDocuments({ params: this.params })
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
