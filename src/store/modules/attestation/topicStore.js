import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useTopicStore = defineStore('topicStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    showLoading: false,
    visible: false,
    visibleType: true,
    detailVisible: false,
    activeTab: 'list',
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    structureCheck: [],
    payload: {
      name: null,
      type: null,
      organizations: [],
      scope: null,
      department_ids: [],
      mobile_allowed: false,
      camera_required: false,
      screen_share_required: false,
      strict_mode: false,
      deadline: null,
      chances: 2,
      whom: 1,
      whom_ids: [],
      active: false
    },
    // Tahrirlanayotgan katta imtihonda tayyor imtihonlar soni (faollashtirish sharti).
    examsCount: 0,
    // «Kimlarga» ro'yxatlari — doira (scope, department_ids) bo'yicha.
    positionList: [],
    positionLoading: false,
    workerList: [],
    workerLoading: false,
    workerTotal: 0,
    workerParams: { page: 1, per_page: 50, search: null },
    // whom=5 — JSHSHIR bo'yicha topilgan (ishlamayotgan) xodimlar.
    checkedWorkers: [],
    checkWorkerLoading: false,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: []
    },
    // Filtr daraxtida belgilangan tugunlar (UISelect).
    filterStructureCheck: []
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.topicService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _show() {
      this.showLoading = true
      $ApiService.topicService
        ._show({ id: this.elementId })
        .then((res) => {
          const d = res.data.data
          this.payload.type = d.type.id
          this.payload.organizations = d.organizations
          this.payload.name = d.name
          this.payload.scope = d.scope ?? null
          this.payload.department_ids = (d.departments ?? []).map((v) => v.id)
          this.payload.mobile_allowed = !!d.mobile_allowed
          this.payload.camera_required = !!d.camera_required
          this.payload.screen_share_required = !!d.screen_share_required
          this.payload.strict_mode = !!d.strict_mode
          this.payload.deadline = d.deadline ?? null
          this.payload.chances = d.chances ?? 2
          // Auditoriya faqat «Doira» bo'yicha — «Kimlarga» olib tashlangan.
          this.payload.whom = 1
          this.payload.whom_ids = []
          this.payload.active = !!d.active
          this.examsCount = this.list.find((v) => v.id === this.elementId)?.exams_count ?? 0
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    _create() {
      this.saveLoading = true
      const data = this._body()
      $ApiService.topicService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      const data = this._body()
      $ApiService.topicService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // Jadvaldagi switch: ichida imtihon bo'lmasa backend rad etadi va qiymat qaytariladi.
    _setActive(row, active) {
      row.activeLoading = true
      $ApiService.topicService
        ._setActive({ id: row.id, active })
        .then(() => {
          row.active = active
        })
        .finally(() => {
          row.activeLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.topicService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
          $Toast.success(t('message.successDone'))
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    // Doira tanlangan mavzu — korxonalar ro'yxatisiz; bo'linmalar faqat «Bo'linmalar uchun» da.
    _body() {
      const p = this.payload
      return {
        name: p.name,
        type: p.type,
        scope: p.scope,
        department_ids: p.scope === 'department' ? p.department_ids : [],
        mobile_allowed: p.mobile_allowed && !p.screen_share_required && !p.strict_mode,
        camera_required: p.camera_required,
        screen_share_required: p.screen_share_required,
        strict_mode: p.strict_mode,
        deadline: p.deadline || null,
        chances: p.chances,
        whom: p.whom,
        whom_ids: p.whom === 1 ? [] : p.whom_ids,
        // Yangi katta imtihon doim nofaol yaratiladi.
        active: this.visibleType ? false : p.active
      }
    },
    _checkWorker(pin) {
      this.checkWorkerLoading = true
      $ApiService.workerService
        ._checkWorker({ params: { pin } })
        .then((res) => {
          if (res.data.error) return $Toast.info(t('content.notWorker'))
          const d = res.data.data
          this.checkedWorkers = [
            {
              id: d.id.toString(),
              name: [d.last_name, d.first_name, d.middle_name].filter(Boolean).join(' ')
            },
            ...this.checkedWorkers.filter((v) => this.payload.whom_ids.includes(v.id))
          ]
        })
        .finally(() => {
          this.checkWorkerLoading = false
        })
    },
    _audienceParams() {
      const p = this.payload
      return {
        scope: p.scope,
        department_ids: p.scope === 'department' ? p.department_ids.join(',') : undefined
      }
    },
    _audiencePositions() {
      if (!this.payload.scope) return
      this.positionLoading = true
      $ApiService.topicService
        ._audiencePositions({ params: this._audienceParams() })
        .then((res) => {
          this.positionList = res.data.data
        })
        .finally(() => {
          this.positionLoading = false
        })
    },
    _audienceWorkers(append = false) {
      if (!this.payload.scope) return
      this.workerLoading = true
      $ApiService.topicService
        ._audienceWorkers({ params: { ...this.workerParams, ...this._audienceParams() } })
        .then((res) => {
          const rows = res.data.data.data.map((v) => ({
            id: v.id,
            name: [v.worker?.last_name, v.worker?.first_name, v.worker?.middle_name]
              .filter(Boolean)
              .join(' '),
            position: v.position?.name,
            photo: v.worker?.photo
          }))
          this.workerTotal = res.data.data.total
          const merged = append ? [...this.workerList, ...rows] : rows
          this.workerList = Array.from(new Map(merged.map((v) => [v.id, v])).values())
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.name = null
      this.payload.type = null
      this.payload.organizations = []
      this.payload.scope = null
      this.payload.department_ids = []
      this.payload.mobile_allowed = false
      this.payload.camera_required = false
      this.payload.screen_share_required = false
      this.payload.strict_mode = false
      this.payload.deadline = null
      this.payload.chances = 2
      this.payload.whom = 1
      this.payload.whom_ids = []
      this.payload.active = false
      this.examsCount = 0
      this.positionList = []
      this.workerList = []
      // aks holda tahrirlashdan keyin ochilgan formada oldingi mavzuning
      // tashkilot daraxtidagi belgilari qolib ketadi
      this.structureCheck = []
    }
  }
})
