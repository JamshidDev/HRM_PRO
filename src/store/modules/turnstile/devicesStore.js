import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
export const useDevicesStore = defineStore('devicesStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    structureCheck2: [],
    downloading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    payload: {
      name: null,
      organization_id: [],
      device_id: null,
      device_code: null,
      ip_address: null,
      mac_address: null,
      config: false,
      log: false,
      upload_workers: false,
      contract_number: null,
      contract_date: null,
      price: '0'
    },
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      attached: null,
      status: null,
      org_status: null
    },
    accessLevels: [],
    isAdmin: false,
    deviceList: [],
    deviceLoading: false
  }),
  actions: {
    _access_levels() {
      this.accessLevels = []
      this.accessLevelsLoading = true
      $ApiService.turnstileHikCentralWorkerService
        ._access_levels()
        .then((res) => {
          this.accessLevels = res.data.data
        })
        .finally(() => {
          this.accessLevelsLoading = false
        })
    },
    _deviceList() {
      this.deviceLoading = true
      $ApiService.devicesService
        ._index({ params: { page: 1, per_page: 2000 } })
        .then((res) => {
          this.deviceList = res.data.data.data.map((v) => ({
            id: v.device_id,
            name: v.name
          }))
        })
        .finally(() => {
          this.deviceLoading = false
        })
    },

    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.devicesService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.devicesService
        ._create({ data })
        .then(() => {
          this.visible = false
          this._index()
          this.resetForm()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.loading = true
      $ApiService.devicesService._delete({ id: this.elementId }).then(() => {
        this._index()
      })
    },

    _update(data) {
      this.saveLoading = true
      $ApiService.devicesService
        ._update({ id: this.elementId, data })
        .then(() => {
          this.visible = false
          this._index()
          this.resetForm()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _refreshDevice() {
      this.loading = true
      $ApiService.turnstileHikCentralAccessService
        ._refreshDevices()
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _downloadDevices() {
      this.downloading = true
      $ApiService.turnstileHikCentralAccessService
        ._downloadDevices({ params: { download: true } })
        .then((res) => {
          Utils.blobFileDownload(
            res.data,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'download.xlsx'
          )
        })
        .finally(() => {
          this.downloading = false
        })
    },
    _downloadReport() {
      this.downloading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.turnstileHikCentralAccessService
        ._downloadReport({ params })
        .then((res) => {
          Utils.blobFileDownload(
            res.data,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'download.xlsx'
          )
        })
        .finally(() => {
          this.downloading = false
        })
    },
    resetForm() {
      this.payload.name = null
      this.payload.organization_id = []
      this.payload.device_id = null
      this.payload.device_code = null
      this.payload.ip_address = null
      this.payload.mac_address = null
      this.payload.config = false
      this.payload.log = false
      this.payload.upload_workers = false
      this.payload.contract_number = null
      this.payload.contract_date = null
      this.payload.price = '0'
    }
  }
})
