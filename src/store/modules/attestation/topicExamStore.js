import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import topicExamService from '@/service/v1/attestation/topicExamService.js'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global
export const useTopicExamStore = defineStore('topicExamStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    showLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    topicId: null,
    totalItems: 0,
    allPermissionList: [],
    structureCheck: [],
    payload: {
      language: null,
      whom: null,
      deadline: null,
      active: false,
      unlimited: false,
      minute: 45,
      variant: 4,
      tests_count: 36,
      chances: 2,
      description: null,
      whom_ids: [],
      questions: []
    },
    params: {
      page: 1,
      per_page: 15,
      search: null
    },
    positionList: [],
    positionLoading: false,

    workerParams: {
      page: 1,
      per_page: 200,
      search: null
    },
    workerLoading: false,
    totalWorker: 0,
    workerList: [],
    checkedWorkers: [],
    checkWorkerLoading: false,
    workerPin: null
  }),
  actions: {
    onOpenWorkerEv(v) {
      if (!v) return
      this.workerParams.search = null
      this.workerParams.page = 1
      this._workers()
    },
    _checkWorker(pin) {
      this.checkWorkerLoading = true
      $ApiService.workerService
        ._checkWorker({ params: { pin } })
        .then((res) => {
          if (!res.data.error) {
            this.checkedWorkers = this.checkedWorkers.filter((v) =>
              this.payload.whom_ids.includes(v.id)
            )
            let data = res.data.data
            this.checkedWorkers.unshift({
              id: data.id.toString(),
              name: Utils.combineFullName(data),
              position: `${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(data?.birthday)}`
            })
          } else {
            $Toast.info(t('content.notWorker'))
          }
        })
        .finally(() => {
          this.checkWorkerLoading = false
        })
    },
    _workers(infinity = false) {
      this.workerLoading = true
      let params = {
        ...this.workerParams
      }
      $ApiService.topicExamService
        ._worker({ params, id: this.topicId })
        .then((res) => {
          let data = res.data.data.data.map((v) => ({
            ...v,
            name: v.worker.last_name + ' ' + v.worker.first_name + ' ' + v.worker.middle_name,
            position: v.position?.name,
            id: v.id,
            photo: v.worker?.photo
          }))
          this.totalWorker = res.data.data.total
          const options = infinity ? [...data, ...this.workerList] : data
          this.workerList = Array.from(new Map([...options].map((v) => [v.id, v])).values())
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    onSearchWorker() {
      this.workerParams.page = 1
      this._workers()
    },
    onScrollWorker(e) {
      const currentTarget = e.currentTarget
      if (
        currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight &&
        !this.workerLoading &&
        this.totalWorker > this.workerList.length
      ) {
        this.workerParams.page += 1
        this._workers(true)
      }
    },
    _position() {
      this.positionLoading = true
      $ApiService.topicExamService
        ._position({ params: { page: 1, per_page: 1000 }, id: this.topicId })
        .then((res) => {
          this.positionList = res.data.data.map((v) => ({
            ...v,
            position: v.id
          }))
        })
        .finally(() => {
          this.positionLoading = false
        })
    },
    _index() {
      this.loading = true
      $ApiService.topicExamService
        ._index({ params: this.params, id: this.topicId })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      $ApiService.topicExamService
        ._create({
          data: this._body(),
          id: this.topicId
        })
        .then((res) => {
          this.visible = false
          this._index()
          this.resetForm()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.topicExamService
        ._update({
          data: this._body(),
          id: this.topicId,
          exam_id: this.elementId
        })
        .then((res) => {
          this.visible = false
          this._index()
          this.resetForm()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.topicExamService
        ._delete({ id: this.topicId, exam_id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    _show() {
      this.showLoading = true
      $ApiService.topicExamService
        ._show({ id: this.topicId, exam_id: this.elementId })
        .then((res) => {
          const data = res.data.data
          this.workerPin = null
          this.payload = {
            language: data.language ?? null,
            whom: data.whom.id,
            deadline: data.deadline ? new Date(data.deadline).getTime() : null,
            active: !!data.active,
            unlimited: data.minute == null,
            minute: data.minute ?? 45,
            variant: data.variant,
            tests_count: data.tests_count,
            chances: data.chances,
            description: data.description ?? null,
            whom_ids: data?.positions?.map((i) => i.id) || data?.workers?.map((i) => i.id) || [],
            questions: (data.questions ?? []).map((q) => ({
              exam_category_id: q.exam_category_id,
              count: q.count
            }))
          }
          if (res.data.data.whom.id === 2) {
            this._position()
          } else if (res.data.data.whom.id === 3) {
            this.workerList = res.data.data.workers.map((v) => ({
              ...v,
              name: Utils.combineFullName(v.worker),
              position: v.post_name,
              id: v.id
            }))
            this._workers()
          } else if (res.data.data.whom.id === 5) {
            this.checkedWorkers = res.data.data.workers.map((v) => ({
              name: Utils.combineFullName(v),
              position: `${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(v?.birthday)}`,
              id: v.id
            }))
          }
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    // Faol/nofaol — faqat active maydoni yuboriladi.
    _toggleActive(row) {
      $ApiService.topicExamService
        ._update({ data: { active: !row.active }, id: this.topicId, exam_id: row.id })
        .then(() => this._index())
    },
    // Muddat/kimlarga/urinish katta imtihondan; cheksiz vaqt — minute null.
    _body() {
      const p = this.payload
      return {
        language: p.language,
        minute: p.unlimited ? null : p.minute,
        variant: p.variant,
        tests_count: p.tests_count,
        questions: p.questions.filter((q) => q.exam_category_id && q.count)
      }
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.payload.language = null
      this.payload.whom = null
      this.payload.deadline = null
      this.payload.unlimited = false
      this.payload.minute = 45
      this.payload.variant = 4
      this.payload.active = false
      this.payload.whom_ids = []
      this.payload.chances = 2
      this.payload.tests_count = 36
      this.payload.description = null
      this.payload.questions = []
    }
  }
})
