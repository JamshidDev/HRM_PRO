import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import { Utils } from '@utils'

const { t } = i18n.global

const initialPayload = () => ({
  year: null,
  director_id: null,
  trade_union_id: null,
  creator_id: null,
  date: null,
  worker_position_ids: [
    {
      id: 1,
      table_number: null,
      period_from: null,
      period_to: null,
      plan_date: null,
      all_days: 0
    }
  ]
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
    allRegionList: [],
    allLoading: false,
    structureCheck: [],
    payload: initialPayload(),
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: []
    },
    othersList: [],
    otherLoading: false,
    otherVisible: false,
    otherParam: {
      page: 1,
      per_page: 30,
      search: null,
      organizations: []
    },
    otherTotal: 0,
    structureCheck2: [],
    worker: {
      list: [],
      loading: false,
      total: 0,
      params: {
        page: 1,
        per_page: 15,
        search: null,
        year: null,
        organizations: [],
        departments: []
      }
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
    department: {
      list: [],
      loading: false,
      total: 0,
      params: {
        page: 1,
        per_page: 15,
        search: null
      }
    }
  }),
  actions: {
    _fetchDepartment(infinity = false) {
      const params = {
        ...this.department.params,
        organizations: this.worker.params.organizations.map((v) => v.id).toString() || undefined
      }
      this.department.loading = true
      $ApiService.componentService
        ._departmentByOrganizations({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: v.name,
            position: v.organization.name
          }))

          this.department.list = infinity
            ? Array.from(new Map([...this.department.list, ...data].map((v) => [v.id, v])).values())
            : Array.from(new Map([...data].map((v) => [v.id, v])).values())
          this.department.total = res.data.data.total
        })
        .finally(() => {
          this.department.loading = false
        })
    },

    _fetchCreator(infinity = false) {
      this.creator.loading = true
      let params = {
        ...this.creator.params
      }
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
    _fetchAutoGenerate() {
      // Tashkilotsiz hisoblash butun tizim bo'yicha ketadi — tugma ham o'chiq (DAS-14225).
      if (!this.worker.params.organizations.length) return
      const params = {
        ...this.worker.params,
        organizations: this.worker.params.organizations.map((v) => v.id).toString() || undefined
      }
      this.worker.loading = true
      $ApiService.vacationScheduleService
        ._autoGenerate({ params })
        .then((res) => {
          const data = res.data?.data
          // BACKEND: GET /v1/hr/vacation-schedule/1/auto-generate faqat `{ generated: true }`
          // qaytaradi — hisoblangan sanalar yo'q, `/v1/hr/vacation-schedule-workers` ham
          // `vacation_schedule` / `lastVacation` / `all_days` bermaydi. Natija ro'yxat
          // (`[{ id, plan_date, period_from, period_to, all_days }]`) ko'rinishida kelishi kerak
          // yoki workers endpointi saqlangan grafikni qaytarishi kerak (DAS-14225).
          // Swagger'da bu endpoint faqat `{id}` (grafik id) oladi — tashkilot/yil yo'q, frontend esa
          // `1` ni qattiq yozib yuboradi. Yangi grafik uchun qaysi id/parametrlar kerakligi aniqlanishi kerak.
          if (Array.isArray(data)) {
            this.applyGenerated(data)
            return
          }
          return this._fetchWorkers().then(() => this.notifyGenerated())
        })
        .finally(() => {
          this.worker.loading = false
        })
    },
    applyGenerated(data) {
      data.forEach((v) => {
        const row = this.worker.list.find((w) => w.id === v.id)
        if (!row) return
        row.plan_date = Utils.datePickerFormatter(v.plan_date)
        if (v.period_from) row.period_from = Utils.datePickerFormatter(v.period_from)
        if (v.period_to) row.period_to = Utils.datePickerFormatter(v.period_to)
        if (v.all_days != null) row.all_days = v.all_days
      })
      this.notifyGenerated()
    },
    notifyGenerated() {
      const filled = this.worker.list.some((v) => v.plan_date)
      if (filled) $Toast.success(t('vacationSchedule.autoGenerateDone'))
      else $Toast.warning(t('vacationSchedule.autoGenerateEmpty'))
    },
    _fetchWorkers() {
      // Tashkilot tanlanmaguncha ro'yxat bo'sh: aks holda butun tizimdagi ~63 000 xodim
      // 4000+ sahifada chiqadi (DAS-14225).
      // BACKEND: GET /v1/hr/vacation-schedule-workers tashkilot filtrini e'tiborsiz qoldiradi —
      // `organizations=188`, `organization_id=188` bilan ham total 63 725 (2026-11-12 tekshirildi).
      // Swagger'da ikkala parametr bor; tanlangan tashkilot (va `departments`) bo'yicha filtrlash kerak.
      if (!this.worker.params.organizations.length) {
        this.worker.list = []
        this.worker.total = 0
        return Promise.resolve()
      }
      const params = {
        ...this.worker.params,
        organizations: this.worker.params.organizations.map((v) => v.id).toString() || undefined,
        departments: this.worker.params.departments.toString() || undefined
      }
      this.worker.loading = true
      return $ApiService.vacationScheduleService
        ._workers({ params })
        .then((res) => {
          this.worker.list = res.data.data.data.map((v) => ({
            id: v.id,
            worker: v.worker,
            position: v.position,
            table_number: v.vacation_schedule?.table_number?.toString(),
            period_from: Utils.datePickerFormatter(
              v?.[v.vacation_schedule ? 'vacation_schedule' : 'lastVacation']?.period_from
            ),
            period_to: Utils.datePickerFormatter(
              v?.[v.vacation_schedule ? 'vacation_schedule' : 'lastVacation']?.period_to
            ),
            plan_date: Utils.datePickerFormatter(v.vacation_schedule?.plan_date),
            all_days: v.vacation_schedule ? v.vacation_schedule?.all_days : v?.all_days || 0
          }))
          this.worker.total = res.data.data.total
        })
        .finally(() => {
          this.worker.loading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.vacationScheduleService._create({ data }).finally(() => {
        this.saveLoading = false
      })
    },
    _update() {
      this.saveLoading = true
      const data = {
        ...this.payload,
        organization_id: undefined,
        worker_position_id: undefined
      }
      $ApiService.vacationScheduleService
        ._update({ data, id: this.elementId })
        .then((res) => {
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
        .then((res) => {
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
      const today = new Date().getTime()
      this.elementId = null
      this.payload = initialPayload()
      this.payload.year = 2026
      this.payload.date = today
      this.worker.params.year = 2026
      this.worker.params.page = 1
    }
  }
})
