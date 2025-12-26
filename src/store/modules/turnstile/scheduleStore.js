import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
export const useScheduleTableStore = defineStore('scheduleStore', {
  state: () => ({
    params: {
      page: 1,
      per_page: 10,
      type: null,
      year: null,
      month: null
    },
    scheduleTypes: [],
    scheduleLoading: false,
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
    workerLoading: false,
    workerList: [],
    totalWorkerCount: 0,
    workerParams: {
      page: 1,
      per_page: 20,
      search: null,
      organization_id: [],
      department_id: null,
      has_schedule: 'all'
    },
    structureCheck2: [],
    workDays: [],
    generateLoading: false,
    nextTickKey: 0,
    workerIndex: null,
    dayIndex: null,
    contextOptions: [],
    defaultOptions: [
      {
        label: t('schedule.form.holiday'),
        workStatus: false,
        key: 0,
        icon: () => '🏖️'
      },
      {
        label: t('content.copy'),
        workStatus: false,
        key: 'copyTime',
        icon: () => '📑'
      },
      {
        label: t('content.clear'),
        workStatus: false,
        key: 'clearTime',
        icon: () => '🧨'
      },
      {
        type: 'divider',
        key: 'd1'
      },
      {
        workStatus: false,
        label: t('schedule.form.otherTime'),
        key: 'otherTime',
        icon: () => '✏️'
      }
    ],
    savedOption: {
      isWorkDay: false,
      startTime: null,
      endTime: null,
      empty: true,
      workTime: 0,
      dayTime: 0,
      eveningTime: 0
    },
    isSelectedContext: false,
    selectedOption: null,
    timePayload: {
      startTime: null,
      endTime: null,
      breakStartTime: null,
      breakEndTime: null,
      status: false
    },
    timeVisible: false,
    selectedCellSet: new Set(),
    savingVisible: false,
    readyToSaveCount: 0,
    savingLoading: false,
    savingPercent: 0,
    activeSearch: false,

    enumLoading: false,
    grandPayload: {
      is_turnstile: true,
      grandToReport: false,
      start_minute: null,
      end_minute: null,
      comment: null
    },
    grandVisible: false,
    elementId: null,

    departmentList: [],
    departmentLoading: false,

    multipleAttachVisible: false,
    selectedWorkers: [],
    attachWorkers: [],
    attachWorkerParams: {
      page: 1,
      per_page: 20,
      search: null
    },
    attachWorkerTotal: 0,
    attachWorkerLoading: false,
    selectedDays: [],
    selectedWorkerId: null
  }),

  getters: {
    calculateWorkTime: (state) => (workerIndex) => {
      if (state.workerList[workerIndex].days.length === 0) return 0
      const workTimeMinute = state.workerList[workerIndex].days.reduce((sum, day) => {
        return sum + (day?.workTime || 0)
      }, 0)

      return Math.floor(workTimeMinute / 60)
    }
  },

  actions: {
    _checkFactOfWorker(id) {
      this.workerLoading = true
      const data = {
        date: `${this.params.year}-${this.params.month}-01`,
        worker_position_id: id
      }
      $ApiService.workerScheduleService
        ._checkFactOfWorker({ data })
        .then(() => {
          this._allWorkers()
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _departments() {
      this.departmentLoading = true
      const params = {
        page: 1,
        per_page: 1000,
        organizations: this.workerParams.organization_id.map((v) => v.id).toString() || undefined
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
    _resetGrandpaPayload() {
      this.grandPayload.start_minute = 0
      this.grandPayload.end_minute = 0
      this.grandPayload.is_turnstile = true
      this.grandPayload.grandToReport = false
    },
    _searchWorker() {
      this.workerParams.page = 1
      this._allWorkers()
    },
    _updateTurnstile(data) {
      this.savingLoading = true
      $ApiService.workerScheduleService
        ._updateTurnstile({ id: this.elementId, data })
        .then((res) => {
          this._allWorkers()
          this.grandVisible = false
        })
        .finally(() => {
          this.savingLoading = false
        })
    },
    _enums() {
      this.enumLoading = true
      $ApiService.workerScheduleService
        ._enums()
        .then((res) => {
          const options = res.data.data.times.map((item, index) => ({
            label: `${item.start_time} - ${item.end_time} (${Math.floor(item.daily_minutes / 60)} - soat)`,
            startTime: item.start_time,
            endTime: item.end_time,
            dayTime: item.daytime,
            eveningTime: item.evening_time,
            workTime: item.daily_minutes,
            workStatus: true,
            key: index + 1,
            icon: () => '⏱️'
          }))

          this.contextOptions = [...options, ...this.defaultOptions]
        })
        .finally(() => {
          this.enumLoading = false
        })
    },
    _attachWorkers() {
      const has_schedule =
        this.workerParams.has_schedule === 'all' ? undefined : this.workerParams.has_schedule
      const params = {
        ...this.attachWorkerParams,
        type: undefined,
        has_schedule,
        date: `${this.params.year}-${this.params.month}-01`,
        schedule_type: this.params.type,
        organization_id:
          this.workerParams.organization_id?.map((v) => v.id).toString() || undefined,
        department_id: this.workerParams.department_id?.toString() || undefined
      }
      this.attachWorkerLoading = true
      $ApiService.workerScheduleService
        ._index({ params })
        .then((res) => {
          this.attachWorkers = res.data.data.data
          this.attachWorkerTotal = res.data.data.total
        })
        .finally(() => {
          this.attachWorkerLoading = false
        })
    },
    _allWorkers() {
      const has_schedule =
        this.workerParams.has_schedule === 'all' ? undefined : this.workerParams.has_schedule
      this.workerLoading = true
      const params = {
        ...this.workerParams,
        type: undefined,
        has_schedule,
        date: `${this.params.year}-${this.params.month}-01`,
        schedule_type: this.params.type,
        organization_id:
          this.workerParams.organization_id?.map((v) => v.id).toString() || undefined,
        department_id: this.workerParams.department_id?.toString() || undefined
      }
      $ApiService.workerScheduleService
        ._index({ params })
        .then((res) => {
          const defaultBox = {
            isWorkDay: false,
            startTime: null,
            endTime: null,
            workTime: 0,
            empty: true,
            dayTime: 0,
            eveningTime: 0
          }

          const formatSchedule = (day) => ({
            isWorkDay: !!day.work_status,
            startTime: day.start_time?.slice(0, 5) ?? null,
            endTime: day.end_time?.slice(0, 5) ?? null,
            workTime: day.daily_minutes,
            empty: day.id === null,
            dayTime: day.daytime || 0,
            eveningTime: day.evening_time || 0
          })

          this.workerList = res.data.data.data.map((v, index) => ({
            id: v.id,
            fullName: Utils.combineFullName(v.worker),
            position: v.position,
            index: index,
            workDay: null,
            type: v?.schedule_type?.type?.name || null,
            scheduleType: v?.schedule_type?.name || null,
            canRecognize: v?.is_turnstile,
            turnstileEndTime: v.turnstile_privilege_end_minute,
            turnstileStartTime: v.turnstile_privilege_start_minute,
            days: !v.schedules?.length
              ? Array.from({ length: this.dayOfMonth.length }, () => ({ ...defaultBox }))
              : v.schedules.map(formatSchedule),
            isEdit: false,
            number: (this.workerParams.page - 1) * this.workerParams.per_page + index + 1
          }))
          this.totalWorkerCount = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _generateSchedule(day, workerIndex) {
      this.generateLoading = true
      const data = {
        start_date: `${this.params.year}-${this.params.month}-01`,
        schedule_type: this.params.type,
        start_day_in_schedule_types: day
      }

      $ApiService.workerScheduleService
        ._generate({ data })
        .then(async (res) => {
          const days = res.data.data.work_days
          this.workerList[workerIndex].isEdit = true
          this.workerList[workerIndex].days = days.map((v) => ({
            isWorkDay: v.work_status,
            startTime: v.start_time || null,
            endTime: v.end_time || null,
            workTime: v.daily_minutes
          }))
          this.nextTickKey++
        })
        .finally(() => {
          this.generateLoading = false
        })
    },
    _scheduleType() {
      this.scheduleLoading = true
      const params = {
        ...this.params
      }
      $ApiService.shiftTypeService
        ._index({ params })
        .then((res) => {
          this.scheduleTypes = res.data.data.data
        })
        .finally(() => {
          this.scheduleLoading = false
        })
    },
    _dayOfMonth(callback) {
      this.dayOfMonthLoading = true
      const params = {
        ...this.params
      }
      $ApiService.workerScheduleService
        ._daysOfMonth({ params })
        .then((res) => {
          this.dayOfMonth = res.data.data.days
          callback?.()
        })
        .finally(() => {
          this.dayOfMonthLoading = false
        })
    },
    _initialData() {
      if (this.scheduleTypes.length > 0) return
      this.params.year = new Date().getFullYear()
      this.params.month = new Date().getMonth() + 1
      this._enums()
      this._dayOfMonth(() => {
        this._allWorkers()
      })
      this._scheduleType()
    },
    _calculateTimeIntervals: (startTime, endTime, breakStartTime = null, breakEndTime = null) => {
      const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
      }

      let start = timeToMinutes(startTime)
      let end = timeToMinutes(endTime)

      if (end <= start) {
        end += 24 * 60
      }

      const EVENING_START = 22 * 60
      const EVENING_END = 6 * 60

      let breakOverlapStart = null
      let breakOverlapEnd = null

      // Agar break vaqti berilgan bo'lsa
      if (breakStartTime && breakEndTime) {
        let breakStart = timeToMinutes(breakStartTime)
        let breakEnd = timeToMinutes(breakEndTime)

        if (breakEnd <= breakStart) {
          breakEnd += 24 * 60
        }

        // Break tungi smenaga tegishli bo'lsa
        if (breakStart < start) {
          breakStart += 24 * 60
        }
        if (breakEnd <= start) {
          breakEnd += 24 * 60
        }

        // Break to'liq ish vaqti ichida bo'lsagina hisobga ol
        if (breakStart >= start && breakEnd <= end) {
          breakOverlapStart = breakStart
          breakOverlapEnd = breakEnd
        }
      }

      let eveningMinutes = 0
      let dayMinutes = 0

      for (let time = start; time < end; time++) {
        if (breakOverlapStart !== null && time >= breakOverlapStart && time < breakOverlapEnd) {
          continue
        }

        let normalizedTime = time % (24 * 60)
        if (normalizedTime >= EVENING_START || normalizedTime < EVENING_END) {
          eveningMinutes++
        } else {
          dayMinutes++
        }
      }

      return {
        eveningTime: eveningMinutes,
        dayTime: dayMinutes
      }
    },
    _resetTimePayload() {
      this.timePayload.startTime = null
      this.timePayload.endTime = null
      this.timePayload.breakEndTime = null
      this.timePayload.breakStartTime = null
      this.timePayload.status = false
    },
    async _save() {
      const workers = this.workerList.filter((v) => v.days.length > 0 && v.isEdit)
      if (workers.length === 0) {
        $Toast.info(t('schedule.form.notExistChangeToSave'))
        return
      }

      const workerData = workers.map((w) => ({
        worker_position_id: w.id,
        work_days: w.days.map((day, idx) => ({
          status: day.empty ? 'delete' : 'create',
          date: `${this.params.year}-${this.params.month}-${(idx + 1).toString().padStart(2, '0')}`,
          work_status: day.isWorkDay,
          start_time: day.startTime,
          end_time: day.endTime,
          daily_minutes: day.workTime,
          daytime: day.dayTime,
          evening_time: day.eveningTime
        }))
      }))
      const data = {
        status: 'custom',
        schedule_workers: workerData
      }
      this.savingLoading = true
      $ApiService.workerScheduleService
        ._create({ data })
        .then((res) => {
          this.workerList = this.workerList.map((a) => ({
            ...a,
            isEdit: false
          }))
        })
        .finally(() => {
          this.savingLoading = false
        })
    }
  }
})
