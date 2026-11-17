import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import i18n from '@/i18n/index.js'

// Arxiv «Hujjatlar» tablari — korxona nomidan tuzilgan tasdiqlangan hujjatlar.
const emptyCounts = () => ({ applications: 0, commands: 0, contracts: 0, contract_additional: 0 })

export const useArchiveDocumentStore = defineStore('archiveDocumentStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    counts: emptyCounts(),
    types: {},
    countsLoading: false,
    downloadId: null,
    params: {
      kind: 'commands',
      page: 1,
      per_page: 24,
      search: null,
      organizations: [],
      type: null,
      number: null,
      date_from: null,
      date_to: null
    }
  }),
  getters: {
    typeOptions: (state) => state.types[state.params.kind] || []
  },
  actions: {
    // Barcha tablar uchun umumiy filtrlar (tur — faqat ro'yxatda).
    commonParams() {
      return {
        search: this.params.search || undefined,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        number: this.params.number || undefined,
        date_from: this.params.date_from ? Utils.timeToZone(this.params.date_from) : undefined,
        date_to: this.params.date_to ? Utils.timeToZone(this.params.date_to) : undefined
      }
    },
    _counts() {
      this.countsLoading = true
      $ApiService.archiveService
        ._documentCounts({ params: this.commonParams() })
        .then((res) => {
          this.counts = res.data?.data?.counts || emptyCounts()
          this.types = res.data?.data?.types || {}
        })
        .finally(() => {
          this.countsLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.commonParams(),
        kind: this.params.kind,
        type: this.params.type || undefined,
        page: this.params.page,
        per_page: this.params.per_page
      }
      $ApiService.archiveService
        ._documents({ params })
        .then((res) => {
          this.list = res.data?.data?.data || []
          this.totalItems = res.data?.data?.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Filtr o'zgarsa — ro'yxat ham, badge sonlari ham yangilanadi.
    _filterEvent() {
      this.params.page = 1
      this._index()
      this._counts()
    },
    setKind(kind) {
      this.params.kind = kind
      this.params.type = null
      this.params.page = 1
      this._index()
    },
    // PDF'ni ko'rish oynasisiz yuklab olish (havola document/show dan).
    async _download(doc) {
      if (this.downloadId) return
      this.downloadId = `${doc.kind}-${doc.id}`
      const name = `${doc.type?.name || 'hujjat'} ${doc.number ? '№' + doc.number : ''}`.trim()
      try {
        const res = await $ApiService.documentService._openDocument({
          params: { model: doc.model, document_id: doc.id }
        })
        const url = res.data?.data?.document?.url
        if (!url) {
          window.$message?.warning(i18n.global.t('archive.documents.noFile'))
          return
        }
        let resp
        try {
          resp = await fetch(url)
        } catch {
          // CORS yoki tarmoq xatosida — yangi oynada ochiladi.
          window.open(url, '_blank')
          return
        }
        if (!resp.ok) {
          window.$message?.warning(i18n.global.t('archive.documents.noFile'))
          return
        }
        Utils.blobFileDownload(await resp.blob(), 'application/pdf', `${name}.pdf`)
      } finally {
        this.downloadId = null
      }
    },
    resetFilter() {
      this.params.search = null
      this.params.organizations = []
      this.params.type = null
      this.params.number = null
      this.params.date_from = null
      this.params.date_to = null
    }
  }
})
