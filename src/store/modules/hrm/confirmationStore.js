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
    allPermissionList: [],
    payload: {
      pin: null,
      position: null,
      level: null,
      // Faqat rahbar: ariza va bildirgilar sarlavhasidagi to'liq lavozim.
      full_position: null,
      // Faqat rahbar: korxonaning asosiy rahbari (arizalar shunga yoziladi).
      is_main: false
    },
    // Tahrirlanayotgan rahbar allaqachon asosiy — switch o'chirilmaydi (doim bitta asosiy bo'ladi).
    editingIsMain: false,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      created: null
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
    _makeMain(id) {
      $ApiService.confirmationService._makeMain({ id }).then(() => this._index())
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
      this.payload.level = null
      this.payload.full_position = null
      this.payload.is_main = false
      this.editingIsMain = false
    }
  }
})
