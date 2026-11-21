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
    // QR sahifa uchun hujjat rekvizitlari (raqam, sana, tur, korxona, holat, bekor qilinganlik)
    meta: null,
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
    // BACKEND: tasdiqlangan hujjatda ham confirmations[].status «Jarayonda» — imzolaganlar uchun haqiqiy holat kerak.
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
          const d = res.data.data ?? {}
          this.meta = {
            electronic_number: d.electronic_number ?? null,
            number: d.number ?? null,
            date: d.date ?? null,
            type: d.type ?? null,
            organization: d.organization ?? null,
            status: d.status ?? null,
            is_cancelled: !!d.is_cancelled,
            cancelled_by: d.cancelled_by ?? null
          }
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
