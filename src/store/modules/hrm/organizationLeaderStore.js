import { defineStore } from 'pinia'

export const useOrganizationLeaderStore = defineStore('organizationLeaderStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    showLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    // Tahrirlanayotgan qator — oynada kim ekanligini ko'rsatish uchun (ism + tashkilot)
    editRow: null,
    indexReqId: 0,
    totalItems: 0,
    structureCheck: [],
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: []
    },
    payload: {
      organization_id: [],
      worker_position_id: null,
      phones: ['']
    },
    structureCheck2: []
  }),
  actions: {
    _index() {
      this.loading = true
      // Eskirgan javob yangisini bosib ketmasin (filtr tez-tez bosilganda)
      const reqId = ++this.indexReqId
      // Backend tanlangan tashkilotlarning ichkilarini o'zi qamrab oladi.
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((o) => o?.id ?? o).toString() || undefined
      }
      $ApiService.organizationLeaderService
        ._index({ params })
        .then((res) => {
          if (reqId !== this.indexReqId) return
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          if (reqId === this.indexReqId) this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      const data = {
        ...this.payload,
        organization_id: this.payload.organization_id[0].id
      }
      $ApiService.organizationLeaderService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      const data = { phones: this.payload.phones }
      $ApiService.organizationLeaderService
        ._update({
          data,
          id: this.elementId
        })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.organizationLeaderService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    resetForm() {
      this.editRow = null
      this.payload = {
        organization_id: [],
        worker_position_id: null,
        phones: ['']
      }
    },
    openVisible(v) {
      this.visible = v
    }
  }
})
