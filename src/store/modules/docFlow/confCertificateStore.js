import { defineStore } from 'pinia'

export const useConfCertificateStore = defineStore('confCertificateStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    structureCheck2: false,
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organization_id: [],
      status: null,
      group_id: null,
      edu_plan_id: null,
      direction_id: null,
      specialization_id: null,
      year: null,
      month: null
    }
  }),
  actions: {
    _resetParams() {
      Object.assign(this.params, {
        search: null,
        organization_id: [],
        status: null,
        group_id: null,
        edu_plan_id: null,
        direction_id: null,
        specialization_id: null,
        year: null,
        month: null
      })
    },
    _index() {
      const params = {
        ...this.params,
        organization_id: this.params.organization_id?.[0]?.id || undefined
      }
      this.loading = true
      $ApiService.confCertificateService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.certificateService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    }
  }
})
