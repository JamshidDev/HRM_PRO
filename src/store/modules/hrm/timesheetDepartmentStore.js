import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import dayjs from 'dayjs'
const { t } = i18n.global
export const useTimesheetDepartmentStore = defineStore('timesheetDepartmentStore', {
  state: () => ({
    list: [],
    days: [],
    totalItems: 0,
    loading: false,
    saveLoading: false,
    visible: false,
    elementId: null,
    deleteLoading: false,
    tabs: [
      {
        type: 'organization',
        label: t('timesheet.type.organization')
      },
      {
        type: 'department',
        label: t('timesheet.type.department')
      }
    ],
    allPermissionList: [],
    structureCheck: [],
    departmentCheck: [],
    department: null,
    month: null,
    year: null,
    payload: {
      type: 'organization',
      organizations: [],
      departments: [],
      worker_position_id: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: []
    },
    listVisible: false,
    previewList: [],
    previewWorkerId: null,

    departmentParams: {
      page: 1,
      per_page: 100,
      search: null
    },
    departmentList: [],
    departmentLoading: false,
    totalDepartmentCount: 0,

    // Formani ochish rejimi: 'create' (tabelchi tanlanadi) | 'attach' (tabelchi ma'lum).
    formMode: 'create',
    editWorker: null,

    // Tabelchi (xodim) select'i — «Qo'shish» formasi uchun.
    workerList: [],
    workerLoading: false,
    workerReqId: 0,
    totalWorker: 0,
    workerParams: {
      page: 1,
      per_page: 50,
      search: null,
      organization_id: null
    }
  }),
  actions: {
    // Bo'lim select'i: FAQAT hech kimga biriktirilmagan bo'limlar.
    // 🔴 `worker_position_id` ATAYLAB yuborilmaydi: u tabelchining O'Z bo'limlarini
    // ham ro'yxatda qoldirardi va endi qo'shilgan bo'lim selectda qayta chiqib
    // ketardi. Tahrirlash modalida biriktirilganlar pastdagi ro'yxatda ko'rinadi.
    _department(infinity = false) {
      this.departmentLoading = true
      let params = {
        ...this.departmentParams,
        organizations: this.payload.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.timesheetDepartmentService
        ._availableDepartments({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: v.name,
            position: v.organization?.name
          }))

          this.totalDepartmentCount = res.data.data.total
          const options = infinity ? [...this.departmentList, ...data] : data
          this.departmentList = Array.from(new Map([...options].map((v) => [v.id, v])).values())
        })
        .finally(() => {
          this.departmentLoading = false
        })
    },
    // Tabelchi tanlash uchun xodimlar — FAQAT TimesheetHR roli borlar
    // (rol eksklyuziv: bir odam yo HR, yo tabelchi; rolsiz odam «Tabellar»
    // menyusini ko'rmaydi, ya'ni biriktirish foydasiz bo'lardi).
    _workers(infinity = false) {
      this.workerLoading = true
      const reqId = ++this.workerReqId
      $ApiService.timesheetDepartmentService
        ._availableWorkers({ params: { ...this.workerParams } })
        .then((res) => {
          if (reqId !== this.workerReqId) return
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: `${v.worker?.last_name ?? ''} ${v.worker?.first_name ?? ''} ${v.worker?.middle_name ?? ''}`.trim(),
            position: v.position_name,
            photo: v.worker?.photo
          }))
          this.totalWorker = res.data.data.total
          this.workerList = infinity
            ? Array.from(new Map([...this.workerList, ...data].map((v) => [v.id, v])).values())
            : data
        })
        .finally(() => {
          if (reqId === this.workerReqId) this.workerLoading = false
        })
    },
    // Tahrirlash: tabelchining bo'limlari ro'yxati + yuqorida qo'shish select'i.
    openEdit(row) {
      this.resetForm()
      this.formMode = 'edit'
      this.editWorker = row
      this.payload.worker_position_id = row.id
      this.previewWorkerId = row.id
      this.previewList = row.departments ?? []
      const org = row?.departments?.[0]?.organization
      if (org?.id) {
        this.payload.organizations = [{ id: org.id, name: org.name }]
        this._department()
      }
      this.listVisible = true
    },

    // Tahrirlash modalidan tanlangan bo'limlarni biriktirish.
    _attachSelected() {
      if (!this.payload.worker_position_id || this.payload.departments.length === 0) return
      this.saveLoading = true
      const data = {
        worker_position_id: this.payload.worker_position_id,
        departments: this.payload.departments
      }
      $ApiService.timesheetDepartmentService
        ._create({ data })
        .then(() => {
          this.payload.departments = []
          this._department()
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    openCreate() {
      this.resetForm()
      this.formMode = 'create'
      this.editWorker = null
      this.visible = true
    },
    _index() {
      this.loading = true
      let params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.timesheetDepartmentService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
          // Tahrirlash modali ochiq bo'lsa — undagi ro'yxat ham yangilanadi.
          if (this.previewWorkerId) {
            const row = this.list.find((x) => x.id === this.previewWorkerId)
            this.previewList = row?.departments ?? []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      let data = {
        worker_position_id: this.payload.worker_position_id,
        organization_id: this.payload.organizations.map((i) => i.id),
        departments: this.payload.departments
      }
      $ApiService.timesheetDepartmentService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this.resetForm()
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(data, callback = null) {
      this.deleteLoading = true
      $ApiService.timesheetDepartmentService
        ._delete({ data })
        .then((res) => {
          this._index()
          callback?.()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    resetDefaults() {
      this.payload.organizations = []
      this.payload.departments = []
    },
    resetForm() {
      this.payload.organizations = []
      this.payload.departments = []
      this.payload.type = 'organization'
      this.payload.worker_position_id = null
      this.departmentList = []
      this.departmentParams.page = 1
      this.departmentParams.search = null
      this.workerList = []
      this.workerParams.page = 1
      this.workerParams.search = null
      this.workerParams.organization_id = null
      this.formMode = 'create'
      this.editWorker = null
    }
  }
})
