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
  exporting: false,
  // Saqlanmagan o'zgarishlar: { [rowId]: { month, period_from, period_to, table_number, main_day, additional } }.
  dirty: {},
  // O'zgargan qatorlarning to'liq holati (sahifa almashsa ham tekshirish uchun) va xato qatorlar.
  dirtyRows: {},
  invalidIds: [],
  params: {
    page: 1,
    per_page: 50,
    search: null,
    department_id: null,
    state: 'all',
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
    // Oxirgi so'rovda qidiruv yoki filtr bo'lganmi — bo'sh holat matni shunga qarab.
    searched: false,
    structureCheck: [],
    structureCheck2: [],
    payload: initialPayload(),
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: []
    },
    // Tahrirlashda grafikning o'z rahbari va kasaba raisi — ular joriy foydalanuvchining kelishuvchilar
    // ro'yxatida bo'lmasligi mumkin (boshqa tashkilot), aks holda select bo'sh ko'rinadi.
    headerPeople: [],
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
          // Tahrirlashda tanlangan tuzuvchi birinchi sahifada bo'lmasa ham nomi yo'qolmasin.
          const selected = this.creator.list.filter((v) => v.id === this.payload.creator_id)
          this.creator.list = infinity
            ? Array.from(new Map([...this.creator.list, ...data].map((v) => [v.id, v])).values())
            : Array.from(new Map([...selected, ...data].map((v) => [v.id, v])).values())
        })
        .finally(() => {
          this.creator.loading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
    // BACKEND: GET /v1/hr/vacation-schedule `search` ni e'tiborsiz qoldiradi (2026-11-17, dev: «zzzzqq» bilan ham
    // hamma 4 ta grafik qaytdi; `year` ham ishlamaydi). Faqat `organizations` filtri ishlaydi. Kerak: `search` —
    // tashkilot nomi / rahbar / tuzuvchi F.I.Sh. bo'yicha; `year` filtri (grafiklar yil bo'yicha qidiriladi).
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      this.searched = !!this.params.search?.trim() || this.params.organizations.length > 0
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
      this.headerPeople = []
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
        Object.entries(this.grid.params).filter(([, v]) => v !== null && v !== '' && v !== 'all')
      )
      return $ApiService.vacationScheduleService
        ._rows({ id: this.grid.id, params })
        .then((res) => {
          // Boshqa sahifada qilingan, hali saqlanmagan o'zgarishlar ham ko'rinadi.
          this.grid.rows = res.data.data.data.map((v) =>
            this.viewRow({ ...v, ...(this.grid.dirty[v.id] || {}) })
          )
          this.grid.total = res.data.data.total
        })
        .finally(() => {
          this.grid.loading = false
        })
    },
    refreshCounters() {
      this._gridSummary()
    },
    // API qiymatlari → jadval ko'rinishi (sana — timestamp, jami kun qayta hisoblanadi).
    viewRow(v) {
      const additional = v.additional || []
      return {
        ...v,
        period_from: Utils.datePickerFormatter(v.period_from),
        period_to: Utils.datePickerFormatter(v.period_to),
        table_number: v.table_number ?? '',
        month: v.month || null,
        all_days: Math.max(
          0,
          (Number(v.main_day) || 0) +
            (Number(v.rest_day) || 0) +
            additional.reduce((s, a) => s + (Number(a.value) || 0), 0)
        )
      }
    },
    // O'zgarish darhol yuborilmaydi — «Saqlash» bosilguncha to'planadi.
    setField(row, patch) {
      this.grid.dirty[row.id] = { ...(this.grid.dirty[row.id] || {}), ...patch }
      Object.assign(row, this.viewRow({ ...row, ...this.toApi(row), ...patch }))
      this.grid.dirtyRows[row.id] = { ...row }
      this.grid.invalidIds = this.grid.invalidIds.filter(
        (id) => id !== row.id || !this.isComplete(row)
      )
    },
    // Grafik qatori: davr (dan/gacha) va ta'til oyi majburiy.
    isComplete(row) {
      return Boolean(row.period_from && row.period_to && row.month)
    },
    toApi(row) {
      return {
        period_from: row.period_from ? Utils.timeToZone(row.period_from) : null,
        period_to: row.period_to ? Utils.timeToZone(row.period_to) : null
      }
    },
    // Faqat shu qator saqlanadi; davr va ta'til oyi majburiy.
    _saveRow(row) {
      const patch = this.grid.dirty[row.id]
      if (!patch) return Promise.resolve()
      // Davr/oy tegilmagan bo'lsa (faqat kunlar yoki tabel) — majburiylik tekshirilmaydi.
      const touchesSchedule = ['month', 'period_from', 'period_to'].some((k) => k in patch)
      if (touchesSchedule && !this.isComplete(row)) {
        if (!this.grid.invalidIds.includes(row.id)) this.grid.invalidIds.push(row.id)
        $Alert.validation(t('vacationSchedule.grid.requiredFields', { n: 1 }))
        return Promise.resolve()
      }
      this.grid.savingIds.push(row.id)
      return $ApiService.vacationScheduleService
        ._saveRows({ id: this.grid.id, data: { rows: [{ id: row.id, ...patch }] } })
        .then(() => {
          delete this.grid.dirty[row.id]
          delete this.grid.dirtyRows[row.id]
          this.grid.invalidIds = this.grid.invalidIds.filter((id) => id !== row.id)
          $Toast.success(t('vacationSchedule.grid.saved', { n: 1 }))
          this.refreshCounters()
        })
        .finally(() => {
          this.grid.savingIds = this.grid.savingIds.filter((id) => id !== row.id)
        })
    },
    gridParams() {
      return Object.fromEntries(
        Object.entries(this.grid.params).filter(
          ([k, v]) => v !== null && v !== '' && v !== 'all' && k !== 'page' && k !== 'per_page'
        )
      )
    },
    _export() {
      this.grid.exporting = true
      return $ApiService.vacationScheduleService
        ._export({ id: this.grid.id, params: this.gridParams() })
        .then((res) => {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          a.href = url
          a.download = `tatillar-grafigi-${this.grid.summary?.year ?? ''}.xlsx`
          a.click()
          URL.revokeObjectURL(url)
        })
        .finally(() => {
          this.grid.exporting = false
        })
    },
    discardChanges() {
      this.grid.dirty = {}
      this.grid.dirtyRows = {}
      this.grid.invalidIds = []
      return this._gridRows()
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
