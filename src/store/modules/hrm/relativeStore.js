import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global
export const useRelativeStore = defineStore('relativeStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allRegionList: [],
    allLoading: false,
    payload: {
      uuid: null,
      relative: null,
      pin: null,
      sort: null,
      birthday: null,
      last_name: null,
      first_name: null,
      middle_name: null,
      birth_place: null,
      post_name: null,
      address: null,
      worker_id: null
    },
    params: {
      page: 1,
      per_page: 10,
      search: null
    },
    uuid: null,
    tabList: [
      {
        name: 'relativePage.tab.notWorker',
        id: 1
      },
      {
        name: 'relativePage.tab.worker',
        id: 2
      }
    ],
    activeTab: 1,
    sortableLoading: false,

    disabilityVisible: false,
    disabilityVisibleType: true,
    disabilityElementId: null,
    disabilitySaveLoading: false,
    disabilityDeleteLoading: false,
    disabilityPayload: {
      worker_relative_id: null,
      number: null,
      from: null,
      to: null,
      comment: null,
      level: null,
      is_lifelong: false
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.relativeService
        ._index({ params: { uuid: this.uuid } })
        .then((res) => {
          this.list = res.data.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      let data = {
        ...this.payload,
        uuid: this.uuid,
        birthday: Utils.timeToZone(this.payload.birthday),
        sort: 1
      }
      $ApiService.relativeService
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
        uuid: this.uuid,
        birthday: Utils.timeToZone(this.payload.birthday)
      }
      $ApiService.relativeService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _sortable(data) {
      this.sortableLoading = true
      $ApiService.relativeService
        ._sortable({ data })
        .then((res) => {})
        .finally(() => {
          this.sortableLoading = false
        })
    },

    _delete() {
      this.deleteLoading = true
      $ApiService.relativeService
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
      this.payload.relative = null
      this.payload.pin = null
      this.payload.sort = null
      this.payload.birthday = null
      this.payload.last_name = null
      this.payload.first_name = null
      this.payload.middle_name = null
      this.payload.birth_place = null
      this.payload.post_name = null
      this.payload.address = null
      this.payload.marital_status = null
    },

    resetDisabilityForm() {
      this.disabilityElementId = null
      this.disabilityPayload.worker_relative_id = null
      this.disabilityPayload.number = null
      this.disabilityPayload.from = new Date().setHours(0, 0, 0, 0)
      this.disabilityPayload.to = null
      this.disabilityPayload.comment = null
      this.disabilityPayload.level = 1
      this.disabilityPayload.is_lifelong = false
    },

    _createDisability() {
      this.disabilitySaveLoading = true
      const { is_lifelong, ...payload } = this.disabilityPayload
      const data = {
        ...payload,
        from: Utils.timeToZone(this.disabilityPayload.from),
        to: is_lifelong ? null : Utils.timeToZone(this.disabilityPayload.to)
      }
      $ApiService.relativeService
        ._createDisability({ data })
        .then((res) => {
          this.disabilityVisible = false
          this._index()
        })
        .finally(() => {
          this.disabilitySaveLoading = false
        })
    },

    _updateDisability() {
      this.disabilitySaveLoading = true
      const { is_lifelong, ...payload } = this.disabilityPayload
      const data = {
        ...payload,
        from: Utils.timeToZone(this.disabilityPayload.from),
        to: is_lifelong ? null : Utils.timeToZone(this.disabilityPayload.to)
      }
      $ApiService.relativeService
        ._updateDisability({ data, id: this.disabilityElementId })
        .then((res) => {
          this.disabilityVisible = false
          this._index()
        })
        .finally(() => {
          this.disabilitySaveLoading = false
        })
    },

    _deleteDisability() {
      this.disabilityDeleteLoading = true
      $ApiService.relativeService
        ._deleteDisability({ id: this.disabilityElementId })
        .then((res) => {
          if (res.status === 200) {
            this.disabilityVisible = false
            this._index()
          }
        })
        .finally(() => {
          this.disabilityDeleteLoading = false
        })
    }
  }
})
