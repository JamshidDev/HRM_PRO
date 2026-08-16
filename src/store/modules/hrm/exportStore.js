import { defineStore } from 'pinia'
import router from '@/router/index.js'
import Utils from '@/utils/Utils.js'
import { AppPaths } from '@/utils/index.js'

export const useExportStore = defineStore('exportStore', {
  state: () => ({
    loading: false,
    visible: false,
    resumeModalVisible: false,
    totalItems: 0,
    isExportingResume: false,
    exportResumeLoading: false,
    resumePayload: {
      organizations: null,
      passport: false,
      // Xorijga chiqish pasporti nusxalari (backend: `foreign_passport`).
      foreign_passport: false,
      all: false,
      worker_ids: []
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      created: null
    },
    payload: {
      columns: [],
      allChecked: false
    },
    // Modal tab'i: 'excel' | 'relatives' | 'reference'. Footer tugmalari
    // WorkerPage'da bo'lgani uchun bu ham store'da.
    tab: 'excel',
    // «Excel» tabi 2 bosqichli: 1 — ustunlarni tanlash, 2 — tartib va fayl
    // ko'rinishi. Pastdagi tugmalar modal footer'ida (WorkerPage) bo'lgani uchun
    // bosqich store'da turadi — forma bilan footer bitta manbadan o'qiydi.
    step: 1,
    columns: [],
    // Qarindoshlar eksporti ustunlari (faqat "fayl ko'rinishi" uchun).
    relativeColumns: [],
    tasks: [],
    saveLoading: false
  }),
  actions: {
    _columns() {
      this.loading = true
      $ApiService.exportService
        ._columns()
        .then((res) => {
          this.columns = res.data.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    _relative_columns() {
      if (this.relativeColumns.length) return
      $ApiService.exportService._relative_columns().then((res) => {
        this.relativeColumns = res.data.data
      })
    },
    _tasks() {
      this.loading = true
      const params = {
        ...this.params,
        created: Utils.timeToZone(this.params.created),
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.exportService
        ._tasks({ params })
        .then((res) => {
          this.tasks = res.data.data.data.map((i) => {
            let id
            if (i.status.id === 2) {
              id = 3
            } else if (i.status.id === 3) {
              id = 8
            } else if (i.status.id === 1) {
              id = 1
            }
            return {
              ...i,
              status: {
                ...i.status,
                id
              }
            }
          })
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _export_workers(params) {
      this.saveLoading = true
      // Jadvalda checkbox bilan tanlangan qatorlar ham yuboriladi: ilgari faqat
      // filtrlar ketardi va tanlov e'tiborsiz qolib, faylga hamma tushardi.
      // "Hammasi" belgilangan bo'lsa (`all`) ro'yxat bo'sh — filtr o'zi yetarli.
      const selected = this.resumePayload.worker_ids
      let data = {
        columns: this.payload.columns.map((i) => i.column),
        query: {
          ...params,
          ...(selected.length > 0 ? { worker_ids: selected } : {})
        }
      }
      $ApiService.exportService
        ._export_workers({ data })
        .then((res) => {
          this.visible = false
          this.isExportingResume = false
          this.resetResumePayload()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _export_resume(params) {
      this.exportResumeLoading = true
      let data = {
        query: { ...this.resumePayload, ...params }
      }
      $ApiService.exportService
        ._export_resume({ data })
        .then((res) => {
          this.resumeModalVisible = false
          this.isExportingResume = false
          this.resetResumePayload()
          // router.push(Utils.routeHrmPathMaker(AppPaths.Export))
        })
        .finally(() => {
          this.exportResumeLoading = false
        })
    },
    resetPayload() {
      this.payload.columns = []
      this.allChecked = false
      this.step = 1
    },
    resetResumePayload() {
      this.resumePayload = {
        organizations: null,
        passport: false,
        foreign_passport: false,
        all: false,
        worker_ids: []
      }
    },
    toggleAll() {
      this.resumePayload.worker_ids = []
      this.resumePayload.all = !this.resumePayload.all
    },
    toggleResumeWorker(v) {
      if (this.resumePayload.worker_ids.includes(v.id)) {
        this.resumePayload.worker_ids = this.resumePayload.worker_ids.filter((i) => i != v.id)
      } else {
        this.resumePayload.worker_ids.push(v.id)
      }
    }
  }
})
