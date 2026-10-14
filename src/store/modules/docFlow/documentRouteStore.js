import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

// Shartnoma / qo'shimcha kelishuv marshruti — ForwardApplicationModal shu state bilan ishlaydi (Arizalar store'i kabi).
export const useDocumentRouteStore = defineStore('documentRouteStore', {
  state: () => ({
    model: null,
    documentId: null,
    forwardVisible: false,
    forwardLoading: false,
    forwardDirector: null,
    forwardMode: 'parallel',
    forwardIds: [],
    forwardViewerIds: [],
    // 'edit' — jarayonda o'zgartirish, 'resend' — rad etilgandan keyin qayta yuborish.
    forwardAction: 'edit',
    forwardPrefill: [],
    routeLoading: false,
    approverList: [],
    approverLoading: false
  }),
  getters: {
    // Buyruqda tanishuvchi roli yo'q — faqat kelishuvchilar.
    allowViewers: (state) => state.model !== Utils.documentModels.command,
    // Rahbar navbatsiz — istalgan paytda imzolaydi (Arizada esa oxirida).
    directorAnytime: () => true
  },
  actions: {
    // Xodim va rahbar marshrutda turmaydi — select'da ko'rinmaydi.
    fixedWorkerIds(confirmations) {
      return (confirmations || [])
        .filter((c) => c.type === 'w' || c.type === 'd')
        .map((c) => c.worker?.id)
    },
    _approvers() {
      this.approverLoading = true
      $ApiService.documentService
        ._documentRouteApprovers({ params: { model: this.model, document_id: this.documentId } })
        .then((res) => {
          this.approverList = (res.data.data || []).map((v) => ({
            ...v,
            name: Utils.combineFullName(v.worker)
          }))
        })
        .finally(() => {
          this.approverLoading = false
        })
    },
    // Joriy marshrut + rahbar → modal (rad etilgan hujjat — qayta yuborish).
    _openRoute(model, documentId, director) {
      this.model = model
      this.documentId = documentId
      this.routeLoading = true
      $ApiService.documentService
        ._documentRoute({ params: { model, document_id: documentId } })
        .then((res) => {
          const route = res.data.data
          this.forwardDirector = director
          this.forwardAction = route?.rejected ? 'resend' : 'edit'
          this.forwardPrefill = route?.items || []
          this.forwardMode = route?.mode || 'parallel'
          this.forwardIds = []
          this.forwardViewerIds = []
          this.approverList = []
          this.forwardVisible = true
          this._approvers()
        })
        .finally(() => {
          this.routeLoading = false
        })
    },
    _forward(_id, callback) {
      this.forwardLoading = true
      $ApiService.documentService
        ._updateDocumentRoute({
          data: {
            model: this.model,
            document_id: this.documentId,
            mode: this.forwardMode,
            confirmations: this.forwardIds,
            viewers: this.forwardViewerIds
          }
        })
        .then(() => {
          this.forwardVisible = false
          callback?.()
        })
        .finally(() => {
          this.forwardLoading = false
        })
    }
  }
})
