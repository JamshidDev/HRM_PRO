import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'

export const useWorkerImageStore = defineStore('workerImageStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    imageVisible: false,
    selectedImage: null,
    isConfirmModal: false,
    confirmLoading: false,
    elementId: null,
    totalItems: 0,
    photos: [],
    photosLoading: false,
    accessLevels: [],
    accessLevelsLoading: false,
    structureCheck: [],
    structureCheck2: [],
    personId: null,
    payload: {
      worker_id: null,
      photo: null,
      photo_id: null,
      photo_index: null,
      access_level_ids: [],
      end_time: null,
      comment: null
    },
    params: {
      page: 1,
      per_page: 10,
      search: null
    },
    showCommentArea: false
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.workerImageService
        ._index({ params: this.params })
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
      $ApiService.workerImageService
        ._create({ data: this.payload })
        .then(() => {
          this.visible = false
          this._index()
          this.resetForm()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.workerImageService
        ._update({ id: this.elementId, data: this.payload })
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
      this.deleteLoading = true
      $ApiService.workerImageService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
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
    _worker_photos(workerId = null) {
      this.photosLoading = true
      const id = workerId || this.payload.worker_id
      $ApiService.photoService
        ._index({ params: { worker_id: id } })
        .then((res) => {
          this.photos = res.data.data.data
        })
        .finally(() => {
          this.photosLoading = false
        })
    },
    updateStatus(data) {
      this.confirmLoading = true
      $ApiService.workerImageService
        ._confirm({ data })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    resetForm() {
      this.payload = {
        worker_id: null,
        worker_org_id: [],
        worker_wrapper_id: null,
        photo: null,
        photo_id: null,
        photo_index: null,
        level_org_id: [],
        access_level_ids: [],
        end_time: null
      }
      this.photos = []
      this.accessLevels = []
      this.elementId = null
      this.visible = false
      this.visibleType = true
      this.isConfirmModal = false
      this.selectedImage = null
      this.imageVisible = false
    }
  }
})
