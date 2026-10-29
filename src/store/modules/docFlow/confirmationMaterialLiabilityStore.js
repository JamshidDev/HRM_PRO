import { defineStore } from 'pinia'

// Imzolovchi kiruvchi ro'yxati — moddiy javobgarlik shartnomalari.
export const useConfirmationMaterialLiabilityStore = defineStore(
  'confirmationMaterialLiabilityStore',
  {
    state: () => ({
      list: [],
      loading: false,
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
        $ApiService.documentService
          ._confirmationMaterialLiability({ params: this.params })
          .then((res) => {
            this.list = res.data.data.data
            this.totalItems = res.data.data.total
          })
          .finally(() => {
            this.loading = false
          })
      }
    }
  }
)
