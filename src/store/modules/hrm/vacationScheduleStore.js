import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import { Utils } from '@utils'

const { t } = i18n.global

const initialPayload = () => ({
  year: new Date().getFullYear() + 1,
  director_id: null,
  trade_union_id: null,
  creator_id: null,
  date: new Date().getTime()
})

const initialGrid = () => ({
  visible: false,
  id: null,
  summary: null,
  rows: [],
  total: 0,
  loading: false,
  savingIds: [],
  checked: [],
  params: {
    page: 1,
    per_page: 50,
    search: null,
    department_id: null,
    state: null,
    month: null
  }
})

export const useVacationScheduleStore = defineStore('vacationScheduleStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    structureCheck: [],
    structureCheck2: [],
    payload: initialPayload(),
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: []
    },
    creator: {
      list: [],
      loading: false,
      total: 0,
      params: {
        page: 1,
        per_page: 15,
        search: null
      }
    },
    // Grafik ichi (to'liq ekranli drawer).
    grid: initialGrid()
  }),
  actions: {
    _fetchCreator(infinity = false) {
      this.creator.loading = true
      const params = { ...this.creator.params }
      $ApiService.workerService
        ._index({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            name: v.worker.last_name + ' ' + v.worker.first_name + ' ' + v.worker.middle_name,
            position: v.position?.name || v?.post_name,
            id: v.id,
            photo: v.worker?.photo
          }))
          this.creator.total = res.data.data.total
          this.creator.list = infinity
            ? Array.from(new Map([...this.creator.list, ...data].map((v) => [v.id, v])).values())
            : Array.from(new Map([...data].map((v) => [v.id, v])).values())
        })
        .finally(() => {
          this.creator.loading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.vacationScheduleService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    headerData() {
      return {
        director_id: this.payload.director_id,
        trade_union_id: this.payload.trade_union_id,
        creator_id: this.payload.creator_id,
        date: Utils.timeToZone(this.payload.date)
      }
    },
    // Yaratilgach grafik ichi darhol ochiladi.
    _createSchedule() {
      this.saveLoading = true
      $ApiService.vacationScheduleService
        ._createSchedule({ data: { ...this.headerData(), year: this.payload.year } })
        .then((res) => {
          this.visible = false
          this._index()
          const id = res.data?.data?.id
          if (id) this.openGrid(id)
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _updateHeader() {
      this.saveLoading = true
      $ApiService.vacationScheduleService
        ._updateHeader({ id: this.elementId, data: this.headerData() })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.vacationScheduleService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload = initialPayload()
    },

    // ---- Grafik ichi ----
    openGrid(id) {
      this.grid = initialGrid()
      this.grid.id = id
      this.grid.visible = true
      this._gridSummary()
      this._gridRows()
    },
    closeGrid() {
      this.grid.visible = false
      this._index()
    },
    _gridSummary() {
      return $ApiService.vacationScheduleService._summary({ id: this.grid.id }).then((res) => {
        this.grid.summary = res.data.data
      })
    },
    _gridRows() {
      this.grid.loading = true
      const params = Object.fromEntries(
        Object.entries(this.grid.params).filter(([, v]) => v !== null && v !== '')
      )
      return $ApiService.vacationScheduleService
        ._rows({ id: this.grid.id, params })
        .then((res) => {
          this.grid.rows = res.data.data.data.map((v) => ({
            ...v,
            plan_date: Utils.datePickerFormatter(v.plan_date),
            period_from: Utils.datePickerFormatter(v.period_from),
            period_to: Utils.datePickerFormatter(v.period_to),
            table_number: v.table_number ?? ''
          }))
          this.grid.total = res.data.data.total
          this.grid.checked = []
        })
        .finally(() => {
          this.grid.loading = false
        })
    },
    refreshCounters() {
      this._gridSummary()
    },
    // Bitta qator saqlanadi; xatoda qator qayta yuklanadi.
    _saveRow(row, data) {
      this.grid.savingIds.push(row.id)
      return $ApiService.vacationScheduleService
        ._updateRow({ id: row.id, data })
        .then((res) => {
          const d = res.data.data
          if (d.all_days !== undefined) row.all_days = d.all_days
          if (d.additional !== undefined) row.additional = d.additional
          if (d.main_day !== undefined) row.main_day = d.main_day
          if ('plan_date' in data) row.month = d.month ?? null
          this.refreshCounters()
        })
        .catch(() => this._gridRows())
        .finally(() => {
          this.grid.savingIds = this.grid.savingIds.filter((id) => id !== row.id)
        })
    },
    _bulkPlanDate(planDate) {
      if (!this.grid.checked.length || !planDate) return
      this.grid.loading = true
      return $ApiService.vacationScheduleService
        ._bulkPlanDate({
          id: this.grid.id,
          data: { ids: this.grid.checked, plan_date: Utils.timeToZone(planDate) }
        })
        .then((res) => {
          $Toast.success(t('vacationSchedule.grid.bulkDone', { n: res.data.data.updated }))
          this.refreshCounters()
          return this._gridRows()
        })
        .finally(() => {
          this.grid.loading = false
        })
    },
    _sync() {
      return $ApiService.vacationScheduleService._sync({ id: this.grid.id }).then((res) => {
        $Toast.success(t('vacationSchedule.grid.syncDone', { n: res.data.data.added }))
        this.refreshCounters()
        return this._gridRows()
      })
    }
  }
})
