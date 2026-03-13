import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { getMonthOfRage } from '@utils'
const { t } = i18n.global

export const useShiftTypeStore = defineStore('shiftTypeStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    scheduleVisible: false,
    visibleType: false,
    elementId: null,
    totalItems: 0,
    structureCheck2: [],

    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      departments: []
    },
    payload: {
      name: null,
      type: null,
      days: []
    },
    generatePayload: {
      name: null,
      start_date: null,
      end_date: null,
      work_date: null,
      count: 1
    },
    scheduleParams: {
      year: null,
      month: null
    },
    uiParams: {
      year: null,
      month: null
    },
    scheduleList: [],
    dayOfMonth: [],
    dayOfMonthLoading: false,
    shortNameOfWeek: {
      1: t('shortWeek.Mon'),
      2: t('shortWeek.Tue'),
      3: t('shortWeek.Wed'),
      4: t('shortWeek.Thu'),
      5: t('shortWeek.Fri'),
      6: t('shortWeek.Sat'),
      0: t('shortWeek.Sun')
    },
    workers: [],
    workerList: [],
    workerParams: {
      page: 1,
      per_page: 200,
      search: null
    },
    totalWorkerCount: 0,
    workerLoading: false,

    activeTab: 1,
    activeGroupTab: 1,

    groupList: [],
    groupParams: {
      page: 1,
      per_page: 10,
      search: null,
      schedule_type: null,
      organizations: [],
      departments: []
    },
    groupId: null,
    groupLoading: false,
    totalGroup: 0,

    groupWorkerLoading: false,
    groupWorkerList: [],
    totalGroupWorkerCount: 0,
    groupWorkerParams: {
      page: 1,
      per_page: 10,
      search: null,
      group: null
    },
    selectedDate: null,

    notScheduleParams: {
      page: 1,
      per_page: 100,
      search: null,
      start_date: null,
      end_date: null,
      has_schedule: 'No',
      organizations: [],
      department_id: null
    },
    notScheduleWorkerList: [],
    notScheduleWorkerCount: 0,
    notScheduleVisible: false,
    notScheduleLoading: false,
    isDailySchedule: false,
    selectedWorkers: [],

    departmentLoading: false,
    departmentList: [],

    departmentGroupLoading: false,
    departmentGroupList: [],
    showGroupCountField: false,
    showWorkDate: false,

    monthsList: []
  }),
  getters: {
    calculateWorkTime: (state) => (workerIndex) => {
      state.scheduleList
      return 0
    }
  },
  actions: {
    _departments() {
      this.departmentLoading = true
      const params = {
        page: 1,
        per_page: 1000,
        organizations: this.notScheduleParams.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.workerScheduleService
        ._department({ params })
        .then((res) => {
          this.departmentList = res.data.data.data.map((v) => ({
            id: v.id,
            name: v.name,
            position: v.organization.name
          }))
        })
        .finally(() => {
          this.departmentLoading = false
        })
    },
    _departmentGroup() {
      this.departmentGroupLoading = true
      const params = {
        page: 1,
        per_page: 1000,
        organizations: this.groupParams.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.workerScheduleService
        ._department({ params })
        .then((res) => {
          this.departmentGroupList = res.data.data.data.map((v) => ({
            id: v.id,
            name: v.name,
            position: v.organization.name
          }))
        })
        .finally(() => {
          this.departmentGroupLoading = false
        })
    },
    _notScheduleWorker() {
      const params = {
        ...this.notScheduleParams,
        start_date: Utils.timeToZone(this.notScheduleParams.start_date),
        end_date: Utils.timeToZone(this.notScheduleParams.end_date),
        organizations:
          this.notScheduleParams.organizations.map((v) => v.id).toString() || undefined,
        department_id: this.notScheduleParams.department_id
      }
      this.notScheduleLoading = true
      $ApiService.shiftTypeService
        ._getWorkers({ params })
        .then((res) => {
          this.notScheduleWorkerList = res.data.data.data.map((v) => ({
            name: Utils.combineFullName(v.worker),
            id: v.id,
            position: v.position,
            data: {
              firstName: v.worker.first_name,
              lastName: v.worker.last_name,
              middleName: v.worker.middle_name,
              photo: v.worker.photo,
              position: v.position
            }
          }))
          this.notScheduleWorkerCount = res.data.data.total
        })
        .finally(() => {
          this.notScheduleLoading = false
        })
    },
    _groupWorkers() {
      const params = {
        ...this.groupWorkerParams
      }
      this.groupWorkerLoading = true
      $ApiService.shiftTypeService
        ._groupWorker({ params })
        .then((res) => {
          this.groupWorkerList = res.data.data.data
          this.totalGroupWorkerCount = res.data.data.total
        })
        .finally(() => {
          this.groupWorkerLoading = false
        })
    },
    _group() {
      const params = {
        ...this.groupParams,
        organizations: this.groupParams.organizations?.map((v) => v.id).toString() || undefined,
        departments: this.groupParams.departments?.toString() || undefined
      }
      this.groupLoading = true
      $ApiService.shiftTypeService
        ._group({ params })
        .then((res) => {
          this.groupList = res.data.data.data
          this.totalGroup = res.data.data.total
        })
        .finally(() => {
          this.groupLoading = false
        })
    },
    _getWorkers() {
      const params = {
        ...this.workerParams
      }
      this.workerLoading = true
      $ApiService.shiftTypeService
        ._getWorkers({ params })
        .then((res) => {
          const selectedIds = this.workers.map((v) => v.id)
          const selectedItems = this.workerList.filter((v) => selectedIds.includes(v.id))
          const data = res.data.data.data.map((v) => ({
            name: Utils.combineFullName(v.worker),
            id: v.id,
            position: v.position
          }))

          this.workerList = [...new Map([...data, ...selectedItems].map((v) => [v.id, v])).values()]
          this.totalWorkerCount = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _dayOfMonth(callback) {
      this.dayOfMonthLoading = true
      const params = {
        ...this.scheduleParams
      }
      $ApiService.workerScheduleService
        ._daysOfMonth({ params })
        .then((res) => {
          this.dayOfMonth = res.data.data.days
          this.uiParams.year = this.scheduleParams.year
          this.uiParams.month = this.scheduleParams.month
          callback?.()
        })
        .finally(() => {
          this.dayOfMonthLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations?.map((v) => v.id).toString() || undefined,
        departments: this.params.departments?.toString() || undefined
      }
      $ApiService.shiftTypeService
        ._index({ params })
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
      let data = {
        ...this.payload
      }
      $ApiService.shiftTypeService
        ._generateSchedule({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _generateSchedule(data) {
      this._getWorkers()
      this.saveLoading = true
      this.monthsList = getMonthOfRage(
        this.generatePayload.start_date,
        this.generatePayload.end_date
      )
      this.selectedDate = this.monthsList[0].id
      $ApiService.shiftTypeService
        ._generateSchedule({ data })
        .then((res) => {
          this.scheduleList = res.data.data.work_days.map((v) => {
            console.log(v)
            return v.map((d) => ({
              ...d,
              isEmpty: d.work_status === null
            }))
          })
          this.workers = res.data.data.work_days.map((x) => ({ id: null }))

          const fromDate = new Date(this.generatePayload.start_date)
          const year1 = fromDate.getFullYear()
          const month1 = fromDate.getMonth() + 1
          this.scheduleParams.year = year1
          this.scheduleParams.month = month1
          this._dayOfMonth()
          this.visible = false
          this.scheduleVisible = true
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _generateWorkerSchedule(data) {
      this.saveLoading = true
      $ApiService.shiftTypeService
        ._generateWorkerSchedule({ data })
        .then((res) => {
          this.scheduleVisible = false
          this.notScheduleVisible = false
          ;(this.activeTab === 1 ? this._index : this._group).call()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _resetGenerateModal() {
      const today = new Date()
      const nextMonth = new Date(today)
      nextMonth.setMonth(today.getMonth() + 1)
      this.generatePayload.start_date = this.generatePayload.start_date ?? today.getTime()
      this.generatePayload.end_date = this.generatePayload.end_date ?? nextMonth.getTime()
      this.generatePayload.work_date = this.generatePayload.work_date ?? today.getTime()
      this.generatePayload.count = this.generatePayload.count ?? 1
    },
    _deleteGroup() {
      this.groupLoading = true
      $ApiService.shiftTypeService
        ._groupDelete({ id: this.elementId })
        .then((res) => {
          this._group()
        })
        .finally(() => {
          this.groupLoading = true
        })
    },
    _editGroup(data) {
      this.saveLoading = true
      $ApiService.shiftTypeService
        ._groupEdit({ id: this.elementId, data })
        .then((res) => {
          this.visible = false
          this._group()
        })
        .finally(() => {
          this.saveLoading = false
        })
    }
  }
})
