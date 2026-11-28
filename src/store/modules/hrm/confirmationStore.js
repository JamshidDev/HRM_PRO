import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global
export const useConfirmationStore = defineStore('confirmationStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    // Majburiy kelishuvchilari to'liq bo'lmagan korxonalar (sahifa ogohlantirishi).
    missing: [],
    allPermissionList: [],
    payload: {
      pin: null,
      position: null,
      // Turi: director (rahbar), approver, accountant, economist, lawyer, hr.
      kind: null,
      // Ariza va bildirgilardagi to'liq lavozim.
      full_position: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      created: null,
      kind: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        ...Utils.dateRangeParams(this.params.created),
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.confirmationService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
          this.missing = res.data.data.missing || []
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      let data = {
        ...this.payload,
        worker_id: this.payload.pin,
        position: this.payload.position
      }
      $ApiService.confirmationService
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
      let data = {
        ...this.payload,
        worker_id: this.payload.pin,
        position: this.payload.position
      }
      $ApiService.confirmationService
        ._update({ data, id: this.elementId })
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
      $ApiService.confirmationService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.pin = null
      this.payload.position = null
      this.payload.kind = null
      this.payload.full_position = null
    }
  }
})
