import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

// Imzo usullari va ularning chip ranglari.
export const SIGN_METHODS = [
  'eimzo_pc',
  'eimzo_mobile_qr',
  'eimzo_mobile_deeplink',
  'drawn',
  'face'
]
export const SIGN_METHOD_TONES = {
  eimzo_pc: 'brand',
  eimzo_mobile_qr: 'green',
  eimzo_mobile_deeplink: 'green',
  drawn: 'amber',
  face: 'info'
}
export const SIGN_VIA = ['system', 'link']
export const SIGN_KEY_TYPES = ['pfx', 'idcard', 'baikey', 'ckc']
export const SIGN_DOCUMENT_MODELS = [
  'commands',
  'contracts',
  'contract-additional',
  'documents',
  'timesheet',
  'vacation-schedule',
  'worker-application',
  'med',
  'staffing-approve',
  'lms-certificate',
  'report'
]

const defaultParams = () => ({
  page: 1,
  per_page: 15,
  search: null,
  method: null,
  via: null,
  document_model: null,
  document_id: null,
  date_range: null,
  organizations: []
})

export const useSignatureHistoryStore = defineStore('signatureHistory', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: defaultParams(),
    structureCheck: [],
    detailVisible: false,
    detailLoading: false,
    detail: null,
    pkcs7Loading: false,
    verifyLoading: false,
    verifyResult: null
  }),
  actions: {
    _index() {
      this.loading = true
      const [from, to] = this.params.date_range || []
      const params = {
        page: this.params.page,
        per_page: this.params.per_page,
        search: this.params.search || null,
        method: this.params.method,
        via: this.params.via,
        document_model: this.params.document_model,
        document_id: this.params.document_id || null,
        date_from: Utils.timeToZone(from),
        date_to: Utils.timeToZone(to),
        organizations: this.params.organizations.map((v) => v.id).toString() || null
      }
      $ApiService.logService
        ._signatureHistory({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _filterEvent() {
      this.params.page = 1
      this._index()
    },
    _clearFilters() {
      const { page, per_page, search } = this.params
      this.params = { ...defaultParams(), page, per_page, search }
      this.structureCheck = []
    },
    _show(id) {
      this.detailVisible = true
      this.detailLoading = true
      this.detail = null
      this.verifyResult = null
      $ApiService.logService
        ._signatureHistoryShow({ id })
        .then((res) => {
          this.detail = res.data.data
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    _downloadPkcs7(id) {
      this.pkcs7Loading = true
      $ApiService.logService
        ._signatureHistoryPkcs7({ id })
        .then((res) => {
          const { file_name, content } = res.data.data || {}
          if (!content) return
          // base64 -> binar .p7s fayl
          const bin = atob(content)
          const bytes = new Uint8Array(bin.length)
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
          const blob = new Blob([bytes], { type: 'application/pkcs7-signature' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = file_name || `signature-${id}.p7s`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        })
        .finally(() => {
          this.pkcs7Loading = false
        })
    },
    _verify(id) {
      this.verifyLoading = true
      this.verifyResult = null
      $ApiService.logService
        ._signatureHistoryVerify({ id })
        .then((res) => {
          this.verifyResult = res.data.data
        })
        .finally(() => {
          this.verifyLoading = false
        })
    }
  }
})
