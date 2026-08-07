import { defineStore } from 'pinia'

// Guvohnomalar ro'yxati sahifasi (HR moduli).
// Backend: `GET /v1/hr/worker-certificates` — shtatdagi (FXSH emas) faol xodimlar,
// org-scope ichida; har xodimga OXIRGI guvohnoma (`id DESC`), yo'q bo'lsa `null`.
// Qidiruv F.I.Sh (PIN/tabel ham) YOKI guvohnoma raqami bo'yicha ishlaydi.

const initialParams = () => ({
  page: 1,
  per_page: 15,
  search: null,
  organizations: [],
  // 'verify' | 'returned' | null — OXIRGI guvohnoma holati bo'yicha filtr.
  certificate_status: null
})

export const useWorkerCertificateStore = defineStore('workerCertificateStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: initialParams(),
    structureCheck: [],
    // "Ko'rish" modali — xodimning BARCHA guvohnomalari (ro'yxatda faqat oxirgisi).
    showVisible: false,
    showLoading: false,
    showList: [],
    showWorker: null
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        certificate_status: this.params.certificate_status || undefined
      }
      $ApiService.workerCertificateService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Guvohnoma raqamiga bosilganda — mavjud `worker-position-certificates?uuid=`
    // endpointi (xodim profilidagi tab ham shuni ishlatadi), yangi endpoint kerak emas.
    _show(row) {
      this.showWorker = row
      this.showList = []
      this.showVisible = true
      if (!row?.uuid) return
      this.showLoading = true
      $ApiService.workerPositionCertificateService
        ._index({ params: { uuid: row.uuid } })
        .then((res) => {
          this.showList = res.data.data
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    resetFilter() {
      this.params = initialParams()
      this.structureCheck = []
    }
  }
})
