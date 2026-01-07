import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import i18n from '@/i18n/index.js'
import { compressImage } from '@/utils/index.js'

const { t } = i18n.global

export const useTurnstileHikCentralWorkerStore = defineStore('turnstileHikCentralWorkerStore', {
  state: () => ({
    list: [],
    loading: false,
    accessLevels: [],
    accessLevelsLoading: false,
    saveLoading: false,
    deleteLoading: false,
    accessLevelModalVisible: false,
    selectedWorker: null,
    totalItems: 0,
    elementId: null,
    allPermissionList: [],
    structureCheck2: [],
    photos: [],
    photosLoading: false,
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      departments: [],
      access_level_id: null,
      added: 'all',
      status: null
    },
    payload: {
      level_org_id: [],
      worker_org_id: [],
      worker_wrapper_id: null,
      worker_id: null,
      photo_id: null,
      photo_index: null,
      access_level_ids: [],
      photo: null,
      end_time: null,
      isWorker: 1,
      blob: null
    },
    editPayload: {
      id: null,
      photo_id: null,
      photo: null,
      to: null,
      access_level_ids: [],
      worker_id: null,
      blob: null
    },
    editVisible: false,
    editLoading: false,
    levelLoading: false,
    levelList: [],
    selectedRowId: null,
    userVisible: false,
    pin: null,
    freeWorkerList: [],
    freeWorkerLoading: false,
    errorVisible: false,
    errorLoading: false,
    errorList: [],
    moreAccessLevels: [],
    moreAccessLevelsLoading: false
  }),
  actions: {
    _workerAccessLevels(worker_id, callback) {
      this.moreAccessLevelsLoading = true
      const params = {
        worker_id
      }
      $ApiService.turnstileHikCentralWorkerService
        ._workerAccessLevels({ params })
        .then((res) => {
          const type = {
            1: 'warning',
            2: 'success',
            3: 'error'
          }
          this.moreAccessLevels = res.data.data.map((v) => ({
            ...v,
            type: type[v.status]
          }))

          callback?.(res.data.data)
        })
        .finally(() => {
          this.moreAccessLevelsLoading = false
        })
    },
    _levels() {
      this.levelLoading = true
      $ApiService.hcServerService
        ._accessLevels()
        .then((res) => {
          this.levelList = res.data.data
        })
        .finally(() => {
          this.levelLoading = false
        })
    },
    _getErrors(params) {
      this.errorList = []
      this.errorLoading = true
      $ApiService.turnstileHikCentralWorkerService
        ._error({ params })
        .then((res) => {
          this.errorList = res.data.data
        })
        .finally(() => {
          this.errorLoading = false
        })
    },
    autoFillWorkerField(pin) {
      this._searchWorkerByPin(pin, (id) => {
        this.payload.worker_id = id
        this._worker_photos()
      })
    },
    _searchWorkerByPin(pin, callback = undefined) {
      this.freeWorkerLoading = true
      $ApiService.workerService
        ._checkWorker({ params: { pin } })
        .then((res) => {
          if (!res.data.error) {
            let data = res.data.data
            this.freeWorkerList = [
              {
                id: data.id,
                name: Utils.combineFullName(data),
                position: `${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(data?.birthday)}`
              }
            ]
            callback?.(data.id)
          } else {
            $Toast.info(t('content.notWorker'))
          }
        })
        .finally(() => {
          this.freeWorkerLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        departments: this.params.departments.toString() || undefined,
        added: this.params.added === 'all' ? undefined : this.params.added
      }
      $ApiService.turnstileHikCentralWorkerService
        ._index({ params })
        .then((res) => {
          const type = {
            1: 'warning',
            2: 'success',
            3: 'error'
          }
          this.list = res.data.data.data.map((v) => {
            if (!v?.hcpPerson) return v
            v.errorMessage = v?.hcpPerson?.access_levels?.some((s) => s.status === 3) || false
            v.hcpPerson.access_levels = v?.hcpPerson?.access_levels?.map((x) => ({
              ...x,
              type: type[x.status]
            }))
            return v
          })
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    async _updateFace() {
      this.editLoading = true
      let data = this.editPayload
      if (data.blob) {
        data.photo = await compressImage(this.editPayload.blob)
      }
      data.blob = undefined
      $ApiService.turnstileHikCentralWorkerService
        ._updateFace({ data })
        .then((res) => {
          this.editVisible = false
          this._index()
        })
        .finally(() => {
          this.editLoading = false
        })
    },
    async _add_worker() {
      this.saveLoading = true
      let payload = {
        access_level_ids: this.payload.access_level_ids,
        worker_id: this.payload.worker_id,
        end_time: Utils.timeToZone(this.payload.end_time)
      }

      if (this.payload.photo) {
        payload.photo = await compressImage(this.payload.blob)
      }
      if (this.payload.photo_id) {
        payload.photo_id = this.payload.photo_id
      }
      $ApiService.turnstileHikCentralWorkerService
        ._add_worker(payload)
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _worker_photos(callback) {
      this.photosLoading = true
      this.photos = []
      $ApiService.turnstileTerminalUserService
        ._worker_photos({ params: { worker_id: this.payload.worker_id } })
        .then((res) => {
          this.photos = res.data.data
          if (typeof callback === 'function') {
            callback?.()
          }
        })
        .finally(() => {
          this.photosLoading = false
        })
    },
    _access_levels() {
      this.accessLevelsLoading = true
      const params = {
        organization_id: this.payload.level_org_id.map((v) => v.id).toString() || undefined,
      }
      $ApiService.turnstileHikCentralWorkerService
        ._access_levels({params})
        .then((res) => {
          this.accessLevels = res.data.data
        })
        .finally(() => {
          this.accessLevelsLoading = false
        })
    },
    _delete() {
      this.loading = true
      $ApiService.turnstileHikCentralWorkerService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _onRefreshAcessLeves(id) {
      this.loading = true
      $ApiService.turnstileHikCentralWorkerService
        ._refresh_worker({ data: { access_level_id: id } })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetForm() {
      this.payload.level_org_id = []
      this.payload.worker_org_id = []
      this.payload.worker_wrapper_id = null
      this.payload.worker_id = null
      this.payload.photo_id = null
      this.payload.photo_index = null
      this.payload.access_level_ids = []
      this.payload.photo = null
      this.payload.end_time = null
      this.photos = []
    },
    resetEditPayload() {
      this.editPayload.id = null
      this.editPayload.photo_id = null
      this.editPayload.photo = null
    }
  }
})
