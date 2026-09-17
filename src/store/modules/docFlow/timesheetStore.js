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
      search: null,
      organizations: []
    },
    // Filtr uchun korxonalar — men biriktirilgan korxonalar (odatda bitta).
    organizationOptions: [],
    organizationLoading: false
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
    // Ro'yxat: men TABELCHI bo'lgan yoki menda IMZO qatori bor tabellar
    // (`GET /v1/timesheet/assigned`). Ilgari bu sahifa faqat imzo pochtasi edi
    // (`/v1/confirmation/timesheet`) — endi tabelchi to'ldiradigan hujjatlar ham
    // shu ro'yxatda, `can_fill` bayrog'i bilan.
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.join(',') || undefined
      }
      $ApiService.timesheetService
        ._assigned({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _organizations() {
      if (this.organizationOptions.length) return
      this.organizationLoading = true
      $ApiService.timesheetService
        ._index_departments()
        .then((res) => {
          this.organizationOptions = (res.data.data.organizations ?? []).map((v) => ({
            id: v.id,
            name: v.name
          }))
        })
        .finally(() => {
          this.organizationLoading = false
        })
    }
  }
})
