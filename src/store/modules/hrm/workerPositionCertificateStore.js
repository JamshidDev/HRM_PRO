import { defineStore } from 'pinia'

export const useWorkerPositionCertificateStore = defineStore('workerPositionCertificateStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true, // true = create, false = edit
    elementId: null,
    payload: {
      // post_name — faqat ko'rsatish uchun (read-only). Backend create'da joriy
      // lavozimdan generate qiladi; forma unga TEGMAYDI (yuborilmaydi).
      post_name: null,
      number: null,
      issue_date: null,
      expiry_date: null,
      extended_date: null,
      // verify/returned hozircha formada YO'Q — backend default false qo'yadi.
      file: null
    },
    uuid: null
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.workerPositionCertificateService
        ._index({ params: { uuid: this.uuid } })
        .then((res) => {
          this.list = res.data.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.workerPositionCertificateService
        ._create({ data })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update(data) {
      this.saveLoading = true
      const params = { _method: 'PUT' }
      $ApiService.workerPositionCertificateService
        ._update({ data, id: this.elementId, params })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.workerPositionCertificateService
        ._delete({ id: this.elementId })
        .then(() => {
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
      this.payload.number = null
      this.payload.issue_date = null
      this.payload.expiry_date = null
      this.payload.extended_date = null
      this.payload.post_name = null
      this.payload.file = null
    }
  }
})
