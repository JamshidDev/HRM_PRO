import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { useAppSetting } from '@/utils/index.js'

// Arxiv — shu korxonada ishlab bo'shab ketgan xodimlar (GET /hr/archive).
export const useArchiveStore = defineStore('archiveStore', {
  state: () => ({
    list: [],
    loading: false,
    resumeLoading: null,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      contract_type: null,
      date_from: null,
      date_to: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        contract_type: this.params.contract_type || undefined,
        date_from: this.params.date_from ? Utils.timeToZone(this.params.date_from) : undefined,
        date_to: this.params.date_to ? Utils.timeToZone(this.params.date_to) : undefined
      }
      $ApiService.archiveService
        ._index({ params })
        .then((res) => {
          this.list = res.data?.data?.data || []
          this.totalItems = res.data?.data?.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Rezyume DOCX — arxiv lavozimi uuid'si bo'yicha (backend status filtrlamaydi).
    _resume(row) {
      this.resumeLoading = row.uuid
      const lang = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
      const fileName = Utils.combineFullName(row.worker) || 'resume'
      $ApiService.workerService
        ._resume({ id: row.uuid, params: { lang } })
        .then((res) => {
          Utils.blobFileDownload(res.data, res.headers['content-type'], fileName)
        })
        .finally(() => {
          this.resumeLoading = null
        })
    },
    resetFilter() {
      this.params.organizations = []
      this.params.contract_type = null
      this.params.date_from = null
      this.params.date_to = null
    }
  }
})
