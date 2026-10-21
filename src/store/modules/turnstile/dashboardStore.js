import { defineStore } from 'pinia'
import TurnstileIcon1 from '@/assets/icons/turnstileIcon1.svg'
import TurnstileIcon2 from '@/assets/icons/turnstileIcon2.svg'
import TurnstileIcon3 from '@/assets/icons/turnstileIcon3.svg'
import TurnstileIcon4 from '@/assets/icons/turnstileIcon4.svg'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import router from '@/router/index.js'
import { AppPaths } from '@/utils/index.js'

const { t } = i18n.global

// Davomat kartalari yangi API'dan; qolgan kartalar schedule/stats-* dan.
const STATS_URLS = {
  attendance: '/v1/turnstile/dashboard/attendance',
  two: '/v1/turnstile/schedule/stats-two',
  four: '/v1/turnstile/schedule/stats-four',
  seven: '/v1/turnstile/schedule/stats-seven'
}
const ATTENDANCE_WORKERS_URL = '/v1/turnstile/dashboard/attendance/workers'

// Preview turi → yangi API `status` qiymati.
export const ATTENDANCE_PREVIEW = {
  att_came: 'came',
  att_absent: 'absent',
  att_in_office: 'in_office',
  att_left_office: 'left_office',
  att_came_mobile: 'came_mobile',
  att_came_turnstile: 'came_turnstile',
  att_vacation: 'vacation',
  att_day_off: 'day_off',
  att_excused: 'excused'
}

export const useTurnstileDashboardStore = defineStore('turnstileDashboardStore', {
  state: () => ({
    dashboardLoading: false,

    dashboardMainLoading: false,
    dailyAttendanceLoading: false,
    workerStatsLoading: false,
    devicesLoading: false,
    sixLoading: false,

    dashboardObj: {},
    topOfflineDeviceList: [],
    dailyEvents: [],
    totalOfflineDeviceCount: 0,
    deviceData: null,
    workerStatuses: [],
    workDuration: null,

    dashboardParams: {
      organizations: [],
      departments: [],
      date: null
    },
    structureCheck2: [],

    previewList: [],
    previewTotal: 0,
    previewLoading: false,
    previewVisible: false,
    previewParams: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      access_levels: [],

      type: null,
      hours: null,
      date: null,
      norm_hours: null,
      status: null,
      auth_type: null
    },
    timeRange: null,
    tableColumns: [],
    filterVisible: {
      start_time: false,
      end_time: false,
      hours: false,
      start_date_and_time: false,
      end_date_and_time: false
    },
    yesterday: false,
    isOnlineDevice: null,
    cardTypes: {
      att_came: { name: 'turnStileDashboard.cards.come', key: 'att_came' },
      att_absent: { name: 'turnStileDashboard.cards.not_come', key: 'att_absent' },
      att_in_office: { name: 'turnStileDashboard.form.current_in', key: 'att_in_office' },
      att_left_office: { name: 'turnStileDashboard.form.current_out', key: 'att_left_office' },
      att_came_mobile: { name: 'turnStileDashboard.cards.mobileFace', key: 'att_came_mobile' },
      att_came_turnstile: {
        name: 'turnStileDashboard.cards.turnstileFace',
        key: 'att_came_turnstile'
      },
      att_vacation: { name: 'turnStileDashboard.attendance.vacation', key: 'att_vacation' },
      att_day_off: { name: 'turnStileDashboard.attendance.day_off', key: 'att_day_off' },
      att_excused: { name: 'turnStileDashboard.attendance.excused', key: 'att_excused' },
      late_come: {
        name: 'turnStileDashboard.cards.late_come',
        key: 'late_come'
      },
      come: {
        name: 'turnStileDashboard.cards.come',
        key: 'come'
      },
      not_come: {
        name: 'turnStileDashboard.cards.not_come',
        key: 'not_come',
        uiKey: 'not_come_yesterday'
      },
      early_leave: {
        name: 'turnStileDashboard.cards.early_leave_yesterday',
        key: 'early_leave',
        uiKey: 'early_leave_yesterday'
      },
      work_hours: {
        name: 'turnStileDashboard.cards.work_hours',
        key: 'work_hours'
      },
      current_in: {
        name: 'turnStileDashboard.cards.current_in',
        key: 'current_in'
      },
      current_out: {
        name: 'turnStileDashboard.cards.current_out',
        key: 'current_out'
      },
      daily_attendance: {
        name: 'turnStileDashboard.cards.daily_attendance',
        key: 'daily_attendance'
      },
      devices: {
        name: 'turnStileDashboard.cards.devices',
        key: 'devices'
      },
      lesson_worked: {
        name: 'turnStileDashboard.cards.lesson_worked',
        key: 'lesson_worked'
      },
      online_devices: {
        name: 'turnStileDashboard.cards.device_status_online',
        key: 'online_devices'
      },
      offline_devices: {
        name: 'turnStileDashboard.cards.device_status_offline',
        key: 'offline_devices'
      },
      privilege_turnstile_workers: {
        name: 'turnStileDashboard.cards.privilege_turnstile_workers',
        key: 'privilege_turnstile_workers'
      },
      not_passed_turnstile_workers: {
        name: 'turnStileDashboard.cards.not_passed_turnstile_workers',
        key: 'not_passed_turnstile_workers'
      },
      vacations: {
        name: 'turnStileDashboard.cards.vacations',
        key: 'vacations'
      },
      casual_workers: {
        name: 'turnStileDashboard.cards.casual_workers',
        key: 'casual_workers'
      },

      early_leave_yesterday: {
        name: 'turnStileDashboard.cards.early_leave_yesterday'
      },
      not_come_yesterday: {
        name: 'turnStileDashboard.cards.not_come_yesterday'
      },
      notIncludedSchedule: {
        name: 'turnStileDashboard.cards.notIncludedSchedule',
        key: 'notIncludedSchedule'
      },
      ACSEventFaceVerifyPass: {
        name: 'turnStileDashboard.cards.ACSEventFaceVerifyPass',
        key: 'ACSEventFaceVerifyPass'
      },
      MobileFaceEvent: {
        name: 'turnStileDashboard.cards.MobileFaceEvent',
        key: 'MobileFaceEvent'
      }
    },
    filterDepParams: {
      page: 1,
      per_page: 100,
      search: null,
      key: null
    },

    statDashboardLoading: false,
    workerInOut: [],
    workerDataWithSchedule: null,

    turnStileWorkers: [],
    onVacationWorkers: [],
    currentWorkers: [],
    workerStatsData: null,
    mainCards: [],
    attendance: null,
    officeTop: { in_office: [], left_office: [] },
    mainChartLoading: false,
    totalWorkerCount: 0,

    workTime: null,
    workTimeLoading: false,

    monthlyList: [],
    monthlyWorkers: [],
    monthlyTotalWorkerCount: 0,
    monthlyLoading: false,

    grandWorkerData: null,
    grandLoading: false,
    faceIdData: null
  }),

  actions: {
    async _dashboard() {
      this.dashboardLoading = true
      this.dailyAttendanceLoading = true
      this.workerStatsLoading = true
      this.devicesLoading = true
      this.monthlyLoading = true
      this.workTimeLoading = true
      this.grandLoading = true
      this.mainChartLoading = true

      const params = {
        ...this._previewQueryParams(),
        start_time: this.dashboardParams.start_time,
        end_time: this.dashboardParams.end_time,
        date: Utils.timeToZone(this.dashboardParams.date),
        type: undefined
      }
      const load = (url, extra = {}) =>
        $ApiService.eventService
          ._allDashboard({ url, params: { ...params, ...extra } })
          .then((res) => res.data.data)
          .catch(() => null)

      // Har karta o'z javobi kelishi bilan chiziladi — sekin so'rov boshqalarini kutdirmaydi.
      const tasks = [
        load(STATS_URLS.attendance).then((data) => {
          this.attendance = data
          this._buildAttendanceCards()
          this.mainChartLoading = false
          this.workerStatsLoading = false
          this.grandLoading = false
        }),
        ...['in_office', 'left_office'].map((status) =>
          load(ATTENDANCE_WORKERS_URL, { status, per_page: 3, page: 1 }).then((data) => {
            this.officeTop[status] = (data?.data || []).map((v) => ({
              ...v,
              fullName: Utils.combineFullName(v)
            }))
            this._buildAttendanceCards()
          })
        ),
        load(STATS_URLS.two).then((data) => {
          this.workerDataWithSchedule = data
          this.monthlyList = data?.stats
          this.monthlyTotalWorkerCount = data?.count
          this.monthlyWorkers = (data?.workerList || []).map((v) => ({
            ...v,
            fullName: Utils.combineFullName(v)
          }))
          this.monthlyLoading = false
        }),
        load(STATS_URLS.four).then((data) => {
          this.dailyEvents = data?.daily_attendance_chart || []
          this.faceIdData = data?.auth_type || null
          this.deviceData = data?.devices || null
          this.dailyAttendanceLoading = false
          this.devicesLoading = false
        }),
        load(STATS_URLS.seven).then((data) => {
          this.workTime = data
          this.workTimeLoading = false
        })
      ]

      try {
        await Promise.all(tasks)
      } finally {
        this.dashboardLoading = false
        this.dailyAttendanceLoading = false
        this.workerStatsLoading = false
        this.devicesLoading = false
        this.monthlyLoading = false
        this.workTimeLoading = false
        this.grandLoading = false
        this.mainChartLoading = false
      }
    },

    // Yuqoridagi 4 karta — kelgan/kelmagan va ishxonada/ishxonada yo'q (kelgan = ikkalasining yig'indisi).
    _buildAttendanceCards() {
      const a = this.attendance
      this.totalWorkerCount = a?.total || 0
      this.mainCards = [
        {
          title: t('turnStileDashboard.cards.come'),
          count: a?.came || 0,
          icon: markRaw(TurnstileIcon1),
          tint: 'green',
          previewType: 'att_came',
          decor: 1
        },
        {
          title: t('turnStileDashboard.cards.not_come'),
          count: a?.absent || 0,
          icon: markRaw(TurnstileIcon2),
          tint: 'orange',
          previewType: 'att_absent',
          decor: 2
        }
      ]
      this.currentWorkers = [
        {
          title: t('turnStileDashboard.form.current_in'),
          count: a?.in_office || 0,
          icon: markRaw(TurnstileIcon3),
          tint: 'yellow',
          listMore: a?.in_office || 0,
          list: this.officeTop.in_office,
          previewType: 'att_in_office',
          decor: 3
        },
        {
          title: t('turnStileDashboard.form.current_out'),
          count: a?.left_office || 0,
          icon: markRaw(TurnstileIcon4),
          tint: 'red',
          listMore: a?.left_office || 0,
          list: this.officeTop.left_office,
          previewType: 'att_left_office',
          decor: 4
        }
      ]
    },

    _preview(isPagination = false) {
      if (!isPagination) {
        this.previewList = []
      }
      const params = this._previewQueryParams()
      this.previewLoading = true

      const status = ATTENDANCE_PREVIEW[this.previewParams.type]
      const request = status
        ? $ApiService.eventService._allDashboard({
            url: ATTENDANCE_WORKERS_URL,
            params: { ...params, type: undefined, status }
          })
        : $ApiService.eventService._preview({ params })
      request
        .then((res) => {
          let rawData = res.data.data.data
          this.previewTotal = res.data.data.total
          this.previewList = this._formatPreviewResponse(rawData, this.previewParams.type)
        })
        .finally(() => {
          this.previewLoading = false
        })
    },

    _previewQueryParams() {
      return {
        ...this.previewParams,
        organizations: this.dashboardParams.organizations.map((v) => v.id).toString() || undefined,
        departments: this.dashboardParams.departments.toString() || undefined,
        date: Utils.timeToZone(this.previewParams.date),
        type: ['ACSEventFaceVerifyPass', 'MobileFaceEvent'].includes(this.previewParams.type)
          ? 'come'
          : this.previewParams.type
      }
    },

    _formatPreviewResponse(rawData, cardType) {
      let responseDate = []
      responseDate = rawData
      if (!responseDate || !Array.isArray(responseDate)) return []

      const data = responseDate.map((v, index) => {
        if (cardType === 'late_come') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name),
            time: Utils.timeWithMonth(v.first_entry_time),
            minutes: `${v.minutes} ${t('date.minute')}`
          }
        } else if (cardType === 'early_leave') {
          return {
            ...v,
            user: this._userContructor(v, v?.position_name),
            minutes: `${v.early_minutes} ${t('date.minute')}`,
            time: Utils.timeWithMonth(v.last_exit_time)
          }
        } else if (['come', 'ACSEventFaceVerifyPass', 'MobileFaceEvent'].includes(cardType)) {
          return {
            ...v,
            user: this._userContructor(v, v.position_name)
          }
        } else if (cardType === 'current_in') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name)
          }
        } else if (cardType === 'current_out') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name)
          }
        } else if (cardType === 'daily_attendance') {
          return {
            ...v,
            user: this._userContructor(v.worker, v.worker.id)
          }
        } else if (ATTENDANCE_PREVIEW[cardType]) {
          return {
            ...v,
            user: this._userContructor(v, v.position_name),
            reasons: (v.reasons || [])
              .map((r) => t(`turnStileDashboard.attendanceReason.${r}`))
              .join(', '),
            first_event: v.first_event ? Utils.timeWithMonth(v.first_event) : null,
            last_event: v.last_event ? Utils.timeWithMonth(v.last_event) : null
          }
        } else if (cardType === 'not_come') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name)
          }
        } else if (cardType === 'notIncludedSchedule') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name)
          }
        } else if (cardType === 'lesson_worked') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name),
            total_minutes: v.total_minutes + ' ' + t('date.minute'),
            hours: v.hours + ' ' + t('date.hour')
          }
        } else if (cardType === 'vacations') {
          return {
            ...v,
            user: this._userContructor(
              v?.worker_position?.worker,
              v?.worker_position?.post_short_name
            )
          }
        } else if (['not_passed_turnstile_workers', 'casual_workers'].includes(cardType)) {
          return {
            ...v,
            user: this._userContructor(v, v?.position_name)
          }
        } else if (cardType === 'privilege_turnstile_workers') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name),
            start_minute: v.start_minute + ' ' + t('date.minute'),
            end_minute: v.end_minute + ' ' + t('date.minute')
          }
        } else return v
      })

      // if(cardType === 'devices'){
      //
      //     return data.sort((a, b) => new Date(a.last_sync) - new Date(b.last_sync))
      // }else if(cardType === 'device_status' && this.isOnlineDevice !== null){
      //     const status = this.isOnlineDevice ? 1 : 2
      //     return data.filter(v => v.status === status)
      // }

      return data
    },

    _userContructor(v, position) {
      return {
        photo: v?.photo,
        firstName: v.first_name,
        middleName: v.middle_name,
        lastName: v.last_name,
        position: position
      }
    },

    _download() {
      this.previewLoading = true
      const params = {
        ...this._previewQueryParams(),
        download: 1
      }

      const status = ATTENDANCE_PREVIEW[this.previewParams.type]
      const request = status
        ? $ApiService.eventService._allDashboard({
            url: `${ATTENDANCE_WORKERS_URL}/export`,
            params: { ...params, type: undefined, download: undefined, status }
          })
        : $ApiService.eventService._download({ params })
      request
        .then(() => {
          this.previewVisible = false
          // You can add router navigation here if needed
          // router.push(Utils.routeHrmPathMaker(AppPaths.Export))
        })
        .finally(() => {
          this.previewLoading = false
        })
    },
    resetPreviewParams() {
      this.previewParams.organizations = []
      this.previewParams.page = 1
      this.previewParams.hours = null
      this.previewParams.search = null
      this.previewParams.status = null
      this.previewParams.auth_type = null
    },

    openPreview(cardType) {
      this.resetPreviewParams()
      this.previewParams.type = cardType
      this.previewParams.organizations = [...this.dashboardParams.organizations]
      this.previewVisible = true
      this._preview()
    }
  }
})
