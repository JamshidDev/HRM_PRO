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

// stats-five hozircha ishlatilmaydi. Tartib muhim: `_fetchStats()` javoblarni shu
// indekslar bo'yicha `{one, two, three, four, six, seven}` ga joylaydi.
const STATS_URLS = [
  '/v1/turnstile/schedule/stats-one',
  '/v1/turnstile/schedule/stats-two',
  '/v1/turnstile/schedule/stats-three',
  '/v1/turnstile/schedule/stats-four',
  '/v1/turnstile/schedule/stats-six',
  '/v1/turnstile/schedule/stats-seven'
]

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
    mainChart: null,
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
    faceIdData: null,

    // Oldingi kun ko'rsatkichlari — "o'tgan kunga nisbatan" farqini hisoblash uchun.
    prevStats: null,
    compareLoading: false
  }),

  getters: {
    /**
     * Har bir metrika uchun `{diff, percent, dir}` yoki `null` (oldingi kun ma'lumoti yo'q).
     * Manba yo'llari `_dashboard()` dagi mapping bilan bir xil.
     */
    deltas(state) {
      const p = state.prevStats
      const d = (cur, prev) => Utils.compareDelta(cur, prev)
      // Indeks emas, eng oxirgi sana bo'yicha — backend tartibiga bog'liq bo'lmasin.
      const lateCount = (v) =>
        v?.late_and_early?.late ? Utils.latestByDate(v.late_and_early.late) : null
      const earlyCount = (v) =>
        v?.late_and_early?.early ? Utils.latestByDate(v.late_and_early.early) : null

      return {
        totalWorkers: d(state.totalWorkerCount, p?.one?.totalWorkers),
        planned: d(state.mainChart?.scheduled_workers_today, p?.one?.scheduled_workers_today),
        come: d(state.mainChart?.attended_workers_today, p?.one?.attended_workers_today),
        notCome: d(state.mainChart?.absent_workers_today, p?.one?.absent_workers_today),

        currentIn: d(state.workerStatsData?.current_in, p?.three?.worker_stats?.current_in),
        currentOut: d(state.workerStatsData?.current_out, p?.three?.worker_stats?.current_out),

        late: d(lateCount(state.workTime), lateCount(p?.seven)),
        early: d(earlyCount(state.workTime), earlyCount(p?.seven)),

        devicesAll: d(state.deviceData?.all, p?.four?.devices?.all),
        devicesOnline: d(state.deviceData?.online, p?.four?.devices?.online),
        devicesOffline: d(state.deviceData?.offline, p?.four?.devices?.offline),

        faceTotal: d(
          (state.faceIdData?.other || 0) + (state.faceIdData?.mobile_face || 0),
          p?.four?.auth_type
            ? (p.four.auth_type.other || 0) + (p.four.auth_type.mobile_face || 0)
            : null
        ),
        faceTurnstile: d(state.faceIdData?.other, p?.four?.auth_type?.other),
        faceMobile: d(state.faceIdData?.mobile_face, p?.four?.auth_type?.mobile_face),

        privilege: d(
          state.grandWorkerData?.privilege_turnstile_workers_count,
          p?.six?.privilege_turnstile_workers_count
        ),
        notPassed: d(
          state.grandWorkerData?.not_passed_turnstile_workers_count,
          p?.six?.not_passed_turnstile_workers_count
        ),
        vacation: d(
          state.grandWorkerData?.vacation_workers?.total,
          p?.six?.vacation_workers?.total
        ),
        casual: d(state.grandWorkerData?.casual_workers, p?.six?.casual_workers),

        withoutSchedule: d(state.monthlyTotalWorkerCount, p?.two?.count)
      }
    }
  },

  actions: {
    /**
     * Dashboard statistikasining 6 ta endpointini berilgan sana uchun yuklaydi.
     * Xato bo'lgan so'rov `null` bo'lib qaytadi — qolganlari to'xtamaydi.
     */
    async _fetchStats(dateMs) {
      const params = {
        ...this._previewQueryParams(),
        start_time: this.dashboardParams.start_time,
        end_time: this.dashboardParams.end_time,
        date: Utils.timeToZone(dateMs),
        type: undefined
      }

      const responses = await Promise.all(
        STATS_URLS.map((url) =>
          $ApiService.eventService
            ._allDashboard({ url, params })
            .then((res) => res.data.data)
            .catch(() => null)
        )
      )

      return {
        one: responses[0],
        two: responses[1],
        three: responses[2],
        four: responses[3],
        six: responses[4],
        seven: responses[5]
      }
    },

    /** Oldingi kun ko'rsatkichlarini fonda yuklaydi (asosiy renderni bloklamaydi). */
    _compareStats() {
      if (!this.dashboardParams.date) return
      this.compareLoading = true
      const prevDate = new Date(this.dashboardParams.date)
      prevDate.setDate(prevDate.getDate() - 1)

      this._fetchStats(prevDate.getTime())
        .then((data) => {
          this.prevStats = data
        })
        .finally(() => {
          this.compareLoading = false
        })
    },

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
      const urls = STATS_URLS

      // Oldingi kun so'rovlari asosiy kartalar bilan raqobatlashmasligi uchun
      // `prevStats` faqat joriy kun yuklanib bo'lgach tozalanadi/qayta olinadi.
      this.prevStats = null

      const requests = urls.map(async (url) => {
        try {
          const res = await $ApiService.eventService._allDashboard({ url, params })
          const data = res.data.data
          return { url, data, error: null }
        } catch (error) {
          return { url, data: null, error: error?.message || 'Unknown error' }
        }
      })

      try {
        for await (const result of requests) {
          const data = result.data
          if (result.url === urls[0]) {
            if (!result.error) {
              this.mainChart = data
              this.mainCards = [
                {
                  type: 'primary',
                  title: t('turnStileDashboard.cards.come'),
                  badgeText: t('content.now'),
                  count: data?.attended_workers_today || 0,
                  icon: markRaw(TurnstileIcon1),
                  tint: 'green',
                  previewType: 'come',
                  deltaKey: 'come',
                  decor: 1
                },
                {
                  type: 'danger',
                  title: t('turnStileDashboard.cards.not_come'),
                  badgeText: t('content.now'),
                  count: data?.absent_workers_today || 0,
                  icon: markRaw(TurnstileIcon2),
                  tint: 'orange',
                  previewType: 'not_come',
                  deltaKey: 'notCome',
                  invert: true,
                  decor: 2
                }
              ]
              this.totalWorkerCount = data?.totalWorkers
              this.mainChartLoading = false
            }
          } else if (result.url === urls[1]) {
            if (!result.error) {
              this.workerDataWithSchedule = data

              this.monthlyList = data?.stats
              this.monthlyTotalWorkerCount = data?.count
              this.monthlyWorkers = data?.workerList.map((v) => ({
                ...v,
                fullName: Utils.combineFullName(v)
              }))
            }

            this.monthlyLoading = false
          } else if (result.url === urls[2]) {
            // In - Out
            if (!result.error) {
              this.workerStatsData = data?.worker_stats || null
              this.currentWorkers = [
                {
                  type: 'success',
                  title: t('turnStileDashboard.form.current_in'),
                  badgeText: t('content.now'),
                  count: data?.worker_stats?.current_in || 0,
                  icon: markRaw(TurnstileIcon3),
                  tint: 'yellow',
                  listMore: data?.worker_stats?.current_in,
                  list: data?.worker_stats.top_in_workers?.map((v) => ({
                    ...v,
                    fullName: Utils.combineFullName(v)
                  })),
                  previewType: 'current_in',
                  deltaKey: 'currentIn',
                  decor: 3
                },
                {
                  type: 'warning',
                  title: t('turnStileDashboard.form.current_out'),
                  badgeText: t('content.now'),
                  count: data?.worker_stats?.current_out || 0,
                  icon: markRaw(TurnstileIcon4),
                  tint: 'red',
                  listMore: data?.worker_stats?.current_out,
                  list: data?.worker_stats?.top_out_workers?.map((v) => ({
                    ...v,
                    fullName: Utils.combineFullName(v)
                  })),
                  previewType: 'current_out',
                  deltaKey: 'currentOut',
                  invert: true,
                  decor: 4
                }
              ]
            }
            this.workerStatsLoading = false
          } else if (result.url === urls[3]) {
            // daily chart
            if (!result.error) {
              this.dailyEvents = data.daily_attendance_chart
              this.faceIdData = data.auth_type
              this.deviceData = data.devices
            }
            this.dailyAttendanceLoading = false
          }
          // else if (result.url === urls[4]) {
          //     if (!result.error) {
          //         this.deviceData = data
          //         this.devicesLoading = false
          //     }
          // }
          else if (result.url === urls[4]) {
            if (!result.error) {
              this.grandWorkerData = data
              this.grandLoading = false
            }
          } else if (result.url === urls[5]) {
            if (!result.error) {
              this.workTime = data
              this.workTimeLoading = false
            }
          }
        }
      } finally {
        this.dashboardLoading = false
        this.dailyAttendanceLoading = false
        this.workerStatsLoading = false
        this.devicesLoading = false
        this.monthlyLoading = false
        this.workTimeLoading = false
        this.grandLoading = false
        this.mainChartLoading = false

        this._compareStats()
      }
    },

    _preview(isPagination = false) {
      if (!isPagination) {
        this.previewList = []
      }
      const params = this._previewQueryParams()
      this.previewLoading = true

      $ApiService.eventService
        ._preview({ params })
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

      $ApiService.eventService
        ._download({ params })
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
