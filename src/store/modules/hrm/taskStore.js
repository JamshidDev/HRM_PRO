import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global

const emptyPayload = () => ({
  organization_id: [], // UISelect node massivi ([{id,name,...}])
  worker_ids: [], // workers.id massivi
  title: null,
  description: null,
  deadline: null, // 'YYYY-MM-DD HH:mm:ss' string (n-date-picker formatted-value)
  status: 1 // boshlang'ich holat (1=yaratildi)
})

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      status: null,
      organization_id: null // filtr (bitta korxona) — hozircha ishlatilmaydi
    },
    // Create / edit
    visible: false,
    visibleType: true, // true = create, false = edit
    saveLoading: false,
    elementId: null,
    structureCheck: [],
    editAssignees: [], // edit'da tanlangan ijrochilarni ko'rsatish uchun [{value,label}]
    orgLabel: null, // edit'da korxona nomi (disabled select uchun)
    payload: emptyPayload(),
    // Detail (ko'rish)
    detailVisible: false,
    detailLoading: false,
    detail: null,
    detailTab: 'info', // 'info' | 'history' | 'comments' (modal header tablari)
    statusPayload: { status: null, comment: null },
    statusSaving: false,
    commentText: null,
    commentSaving: false
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        search: this.params.search || undefined,
        status: this.params.status || undefined,
        organization_id: this.params.organization_id || undefined
      }
      $ApiService.taskService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },

    openVisible(v) {
      this.visible = v
    },
    resetForm() {
      this.payload = emptyPayload()
      this.structureCheck = []
      this.editAssignees = []
      this.orgLabel = null
      this.elementId = null
    },

    _buildBody() {
      return {
        organization_id: this.payload.organization_id?.[0]?.id,
        worker_ids: this.payload.worker_ids,
        title: this.payload.title,
        description: this.payload.description || undefined,
        deadline: this.payload.deadline || undefined,
        status: this.payload.status || 1
      }
    },

    _create() {
      this.saveLoading = true
      $ApiService.taskService
        ._create({ data: this._buildBody() })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },

    _update() {
      this.saveLoading = true
      // Update'da organization_id o'zgarmaydi (backend UpdateTaskDto qabul qilmaydi).
      const data = {
        worker_ids: this.payload.worker_ids,
        title: this.payload.title,
        description: this.payload.description || undefined,
        deadline: this.payload.deadline || undefined
      }
      $ApiService.taskService
        ._update({ id: this.elementId, data })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },

    // Tahrirlash — to'liq ma'lumotni olib (description ro'yxatda yo'q) formani to'ldiradi.
    _edit(row) {
      this.saveLoading = true
      $ApiService.taskService
        ._show({ id: row.id })
        .then((res) => {
          const d = res.data.data
          this.elementId = d.id
          this.orgLabel = null
          this.editAssignees = (d.assignees || []).map((a) => ({
            value: a.worker_id,
            label: a.full_name
          }))
          this.payload = {
            organization_id: d.organization_id
              ? [{ id: d.organization_id, name: '' }]
              : [],
            worker_ids: (d.assignees || []).map((a) => a.worker_id),
            title: d.title,
            description: d.description,
            deadline: d.deadline || null
          }
          this.visibleType = false
          this.visible = true
        })
        .finally(() => {
          this.saveLoading = false
        })
    },

    _delete(id) {
      this.loading = true
      $ApiService.taskService
        ._delete({ id })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },

    // Ko'rish (detail).
    // Detailни qayta yuklaydi — tab/visible tegilmaydi (status/izohdan keyin joriy tabда qoladi).
    _fetchDetail(id) {
      this.detailLoading = true
      return $ApiService.taskService
        ._show({ id })
        .then((res) => {
          this.detail = res.data.data
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    _show(id) {
      this.detailVisible = true
      this.detailTab = 'info'
      this.statusPayload = { status: null, comment: null }
      this.commentText = null
      this._fetchDetail(id)
    },

    _updateStatus() {
      this.statusSaving = true
      $ApiService.taskService
        ._status({
          id: this.detail.id,
          data: {
            status: this.statusPayload.status,
            comment: this.statusPayload.comment || undefined
          }
        })
        .then(() => {
          this._fetchDetail(this.detail.id)
          this._index()
        })
        .finally(() => {
          this.statusSaving = false
        })
    },

    _addComment() {
      this.commentSaving = true
      $ApiService.taskService
        ._comment({ id: this.detail.id, data: { comment: this.commentText } })
        .then(() => {
          this.commentText = null
          this._fetchDetail(this.detail.id)
        })
        .finally(() => {
          this.commentSaving = false
        })
    }
  }
})
