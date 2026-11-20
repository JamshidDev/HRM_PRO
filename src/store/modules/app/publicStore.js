import { defineStore } from 'pinia'
import { useAppSetting } from '@/utils/index.js'

export const usePublicStore = defineStore('usePublicStore', {
  state: () => ({
    loading: false,
    visible: false,
    list: [],
    elementId: null,
    selectedModel: null,
    loginVisible: false,
    loginPayload: {
      phone: '+998',
      password: null
    },
    loginLoading: false,
    detailLoading: false,
    confirmations: [],
    existFile: false,
    // Javob keldi (topildi yoki yo'q) — «topilmadi» kartasi faqat shundan keyin ko'rinadi
    loaded: false
  }),
  actions: {
    _loginToSystem() {
      this.loginLoading = true
      let data = {
        phone: this.loginPayload.phone.slice(4).replace('(', '').replace(')', ''),
        password: this.loginPayload.password
      }
      $ApiService.publicService
        ._loginToSystem({ data })
        .then((res) => {
          localStorage.setItem(useAppSetting.tokenKey, res.data.access_token)
          this.loginVisible = false
          this._getDetailExam()
        })
        .finally(() => {
          this.loginLoading = false
        })
        .catch((error) => {
          $Toast.error(error.response?.data?.message)
        })
    },
    // BACKEND: `POST /v1/document/view/{model}/{uuid}` (QR-kod ochadigan ommaviy sahifa) hozir faqat
    // `uuid`, `file`, `confirmations`, `files` qaytaradi. Sahifada hujjatni aniqlash uchun quyidagilar kerak:
    //   - `electronic_number` — «UTY-768425» (ro'yxatdagi kabi)
    //   - `number` — hujjat raqami («№123», buyruqda `command_number`)
    //   - `date` — hujjat sanasi (`YYYY-MM-DD`), `type: { id, name }` — hujjat turi
    //   - `organization: { id, name }`
    //   - `status: { id, name }` — hujjatning umumiy holati (Tasdiqlangan / Jarayonda / Rad etilgan)
    //   - `is_cancelled` + `cancelled_by: { number, date }` — boshqa buyruq bilan bekor qilingan bo'lsa
    // Shuningdek: dev'da Tasdiqlangan buyruqda (id 92685) barcha `confirmations[].status` hali «Jarayonda» —
    // imzolagan kelishuvchi uchun haqiqiy holat (va `histories` da imzo sanasi) kelishi kerak.
    _getDocument(callback) {
      this.loading = true
      $ApiService.publicService
        ._getDocument({ model: this.selectedModel, id: this.elementId })
        .then((res) => {
          const file = res.data.data?.file
          if (!file) {
            this.existFile = false
            return
          }
          this.existFile = true
          this.confirmations = res.data.data?.confirmations ?? []
          callback?.(file)
        })
        .catch(() => {
          this.existFile = false
        })
        .finally(() => {
          this.loading = false
          this.loaded = true
        })
    },
    _getDetailExam() {
      const token = localStorage.getItem(useAppSetting.tokenKey) || null
      if (!token) {
        this.loginVisible = true
        return
      }
      this.detailLoading = true
      $ApiService.publicService
        ._getDetailExam({ id: this.elementId, token })
        .then((res) => {
          this.list = res.data.data
        })
        .finally(() => {
          this.detailLoading = false
        })
    }
  }
})
