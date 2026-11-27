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
    // Filter uchun TO'LIQ tashkilotlar daraxti (qidiruvsiz, bir marta yuklanadi) — tanlangan
    // tugunning barcha ichki tashkilotlarini shundan olamiz. Select'dagi daraxt qidiruv bilan
    // qisqargan bo'lishi mumkin (faqat topilgan shoxlar qoladi).
    orgTree: null,
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
    async _loadOrgTree() {
      if (this.orgTree) return
      const res = await $ApiService.componentService._structure({
        params: { page: 1, per_page: 1000 }
      })
      this.orgTree = res.data.data || []
    },
    async _index() {
      this.loading = true
      // Eskirgan javob yangisini bosib ketmasin (filtr tez-tez bosilganda)
      const reqId = ++this.indexReqId
      // BACKEND: `organizations` faqat aynan berilgan tashkilotni filtrlaydi (ichidagilarni emas) —
      // shu bois tanlangan tugunning barcha ichki tashkilotlari ham yuboriladi
      // (docs/api/organization-leaders.md). Ichki tashkilotlar TO'LIQ daraxtdan olinadi.
      if (this.params.organizations.length) {
        await this._loadOrgTree().catch(() => {})
      }
      if (reqId !== this.indexReqId) return
      const byId = new Map()
      const index = (nodes) =>
        (nodes || []).forEach((n) => {
          byId.set(n.id, n)
          index(n.children)
        })
      index(this.orgTree)
      const ids = new Set()
      const collect = (node) => {
        if (!node || ids.has(node.id)) return
        ids.add(node.id)
        ;((byId.get(node.id) || node).children || []).forEach(collect)
      }
      this.params.organizations.forEach(collect)
      const params = {
        ...this.params,
        organizations: [...ids].toString() || undefined
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
      // BACKEND: yuborilgan `organization_id` saqlanmayapti — yozuv xodimning o'z tashkilotiga
      // tushadi (docs/api/organization-leaders.md, 2-bo'lim)
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
