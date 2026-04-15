import { defineStore } from 'pinia'

export const useVacancyApproveStore = defineStore('vacancyApproveStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 10
    },
    modalVisible: false,
    selectedFrom: [],
    selectedTo: [],
    structureCheckFrom: [],
    structureCheckTo: []
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.vacancyApproveService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _attach() {
      this.saveLoading = true
      const data = {
        from_organization_id: this.selectedFrom[0]?.id,
        to_organization_ids: this.selectedTo.map((v) => v.id)
      }
      $ApiService.vacancyApproveService
        ._attach({ data })
        .then(() => {
          this.modalVisible = false
          this.resetForm()
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(id) {
      this.deleteLoading = true
      $ApiService.vacancyApproveService
        ._delete({ id })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    resetForm() {
      this.selectedFrom = []
      this.selectedTo = []
      this.structureCheckFrom = []
      this.structureCheckTo = []
    }
  }
})
