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
    existFile: false
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
    _getDocument(callback) {
      this.loading = true
      $ApiService.publicService
        ._getDocument({ model: this.selectedModel, id: this.elementId })
        .then((res) => {
          this.existFile = true
          this.confirmations = res.data.data?.confirmations ?? []
          callback?.(res.data.data.file)
        })
        .finally(() => {
          this.loading = false
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
