import { defineStore } from 'pinia'
import router from '@/router/index.js'
import Utils from '@/utils/Utils.js'
import { AppPaths } from '@/utils/index.js'

export const useTopicExamResultStore = defineStore('topicExamResult', {
  state: () => ({
    list: [],
    loading: false,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    structureCheck2: [],
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      topics: [],
      exams: [],
      deleted_at: false
    },
    topicList: [],
    topicLoading: false,
    examList: [],
    examLoading: false,
    downloadLoading: false,
    downloadVisible: false,
    downloadStructureCheck: [],
    downloadExamList: [],
    downloadExamLoading: false,
    // Yuklash modali o'z filtriga ega — sahifa filtridan mustaqil.
    downloadParams: {
      type: 'results',
      organizations: [],
      topics: [],
      exams: []
    }
  }),
  actions: {
    _openDownload() {
      // Modal sahifa filtri bilan to'ldiriladi, keyin foydalanuvchi o'zgartiradi.
      this.downloadParams = {
        type: 'results',
        organizations: [...(this.params.organizations || [])],
        topics: [...this.params.topics],
        exams: [...this.params.exams]
      }
      this.downloadStructureCheck = [...this.structureCheck2]
      this.downloadExamList = []
      if (this.downloadParams.topics.length > 0) {
        this._downloadExamOptions(this.downloadParams.topics.toString())
      }
      this.downloadVisible = true
    },
    _downloadExamOptions(topics) {
      this.downloadExamLoading = true
      $ApiService.topicExamResultService
        ._exams({ params: { page: 1, per_page: 1000, topics } })
        .then((res) => {
          this.downloadExamList = res.data.data.data.map((v) => ({
            ...v,
            position: `${v.topic?.name}`
          }))
        })
        .finally(() => {
          this.downloadExamLoading = false
        })
    },
    _downloadSubmit() {
      this.downloadLoading = true
      const params = this._downloadParamToQuery()
      const service = $ApiService.topicExamResultService
      const request =
        this.downloadParams.type === 'notPassed'
          ? service._downloadNoPassedWorker({ params })
          : service._downloadExam({ params })

      request
        .then(() => {
          this.downloadVisible = false
        })
        .finally(() => {
          this.downloadLoading = false
        })
    },
    _downloadParamToQuery() {
      return {
        organizations: this.downloadParams.organizations?.map((v) => v.id).toString() || undefined,
        topics: this.downloadParams.topics?.toString() || undefined,
        exams: this.downloadParams.exams?.toString() || undefined
      }
    },
    _delete() {
      this.loading = true
      $ApiService.topicExamResultService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _exam(topics) {
      this.examLoading = true
      $ApiService.topicExamResultService
        ._exams({ params: { page: 1, per_page: 1000, topics } })
        .then((res) => {
          this.examList = res.data.data.data.map((v) => ({ ...v, position: `${v.topic?.name}` }))
        })
        .finally(() => {
          this.examLoading = false
        })
    },
    _topic() {
      this.topicLoading = true
      $ApiService.topicExamResultService
        ._topics({ params: { page: 1, per_page: 1000 } })
        .then((res) => {
          this.topicList = res.data.data.data.map((v) => ({ ...v, position: v.type?.name }))
        })
        .finally(() => {
          this.topicLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = this._paramToQuery()
      $ApiService.topicExamResultService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _paramToQuery() {
      return {
        ...this.params,
        organizations: this.params.organizations?.map((v) => v.id).toString() || undefined,
        // Checkbox belgilansa — FAQAT o'chirilganlar. Ilgari mantiq teskari edi
        // (belgilansa parametr YUBORILMAS edi) — Laravel'dan qolgan chalkashlik.
        deleted_at: this.params.deleted_at ? true : undefined,
        exams: this.params.exams?.toString() || undefined,
        topics: this.params.topics?.toString() || undefined
      }
    }
  }
})
