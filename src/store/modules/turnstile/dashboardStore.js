import { defineStore } from 'pinia'
// KPI ikonkalari ma'noga mos: kelgan — odam ✓, kelmagan — odam ✗, ishxonada — bino, chiqib ketgan — eshikdan chiqish.
import {
  PersonAvailable20Regular,
  PersonDelete20Regular,
  Building20Regular,
  DoorArrowRight20Regular
} from '@vicons/fluent'
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
  seven: '/v1/turnstile/schedule/stats-seven',
  six: '/v1/turnstile/schedule/stats-six',
  preview: '/v1/turnstile/schedule/stats-preview'
}
const ATTENDANCE_WORKERS_URL = '/v1/turnstile/dashboard/attendance/workers'

// `_dashboard` ichida eskirgan yoki tashlangan javob belgisi (xato emas).
const STALE = Symbol('stale')

// Preview turi → yangi API `status` qiymati.
export const ATTENDANCE_PREVIEW = {
  att_came: 'came',
  att_absent: 'absent',
  att_in_office: 'in_office',
  att_left_office: 'left_office',
  att_came_mobile: 'came_mobile',
  att_came_turnstile: 'came_turnstile',
  att_plan_came: 'plan_came',
  att_plan_absent: 'plan_absent',
  att_plan_excused: 'plan_excused',
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
      att_left_office: { name: 'turnStileDashboard.form.leftWorkplace', key: 'att_left_office' },
      att_came_mobile: { name: 'turnStileDashboard.cards.mobileFace', key: 'att_came_mobile' },
      att_came_turnstile: {
        name: 'turnStileDashboard.cards.turnstileFace',
        key: 'att_came_turnstile'
      },
      att_vacation: { name: 'turnStileDashboard.cards.vacations', key: 'att_vacation' },
      att_day_off: { name: 'turnStileDashboard.cards.casual_workers', key: 'att_day_off' },
      att_excused: { name: 'turnStileDashboard.attendance.excused', key: 'att_excused' },
      att_plan_came: { name: 'turnStileDashboard.plan.cameTitle', key: 'att_plan_came' },
      att_plan_absent: { name: 'turnStileDashboard.plan.absentTitle', key: 'att_plan_absent' },
      att_plan_excused: { name: 'turnStileDashboard.plan.excused', key: 'att_plan_excused' },
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
        // Oyna sarlavhasi karta nomi bilan bir xil.
        name: 'turnStileDashboard.privilegeCard.title',
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
        name: 'turnStileDashboard.compare.withoutSchedule',
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
    // «Davomat» tabi: xodimlar kesimida oy bo'yicha keldi/kelmadi.
    activeTab: 'report',
    month: { list: [], total: 0, daysInMonth: 31, today: null, loading: false },
    monthParams: { page: 1, per_page: 20, search: null, month: null },
    privilegeCount: 0,
    privilegeTop: [],
    privilegeLoading: false,

    monthlyList: [],
    monthlyWorkers: [],
    monthlyTotalWorkerCount: 0,
    monthlyLoading: false,

    grandWorkerData: null,
    // `_dashboard` chaqiruvlari raqami — eskirgan javoblarni tashlash uchun.
    dashboardRequestId: 0,
    // `true` — foydalanuvchi bugungi sanani ko'ryapti: sahifaga qaytganda va yarim tunda sana o'zi bugunga suriladi.
    // O'tgan kun tanlansa `false` — sana joyida qoladi.
    followToday: true,
    monthRequestId: 0,
    previewRequestId: 0,
    grandLoading: false,
    faceIdData: null
  }),

  actions: {
    _attendanceMonth() {
      // Oy / sahifa / qidiruv tez almashsa — eskiroq javob yangisining ustiga yozilmasin.
      const requestId = ++this.monthRequestId
      this.month.loading = true
      // Oy tanlagichi bo'lmasa — dashboard sanasining oyi.
      const date = new Date(this.monthParams.month ?? this.dashboardParams.date ?? Date.now())
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const params = {
        page: this.monthParams.page,
        per_page: this.monthParams.per_page,
        search: this.monthParams.search || undefined,
        month,
        organizations: this.dashboardParams.organizations.map((v) => v.id).toString() || undefined,
        departments: this.dashboardParams.departments.toString() || undefined
      }
      $ApiService.eventService
        ._allDashboard({ url: '/v1/turnstile/dashboard/attendance/month', params })
        .then((res) => {
          if (requestId !== this.monthRequestId) return
          const data = res.data.data
          this.month.list = data.data.map((v) => ({
            ...v,
            user: this._userContructor(v, v.position_name),
            cameSet: new Set(v.came_days)
          }))
          this.month.total = data.total
          this.month.daysInMonth = data.days_in_month
          this.month.today = data.today
          this.month.monthKey = data.month
        })
        .finally(() => {
          if (requestId === this.monthRequestId) this.month.loading = false
        })
    },

    async _dashboard() {
      // Filtr (tashkilot / bo'lim / sana) yoki tab almashganda «Davomat» birinchi sahifadan —
      // eski sahifa raqami kichik tashkilotda bo'sh ro'yxat berardi. Sahifalash `_attendanceMonth` ni o'zi chaqiradi.
      if (this.activeTab === 'attendance') {
        this.monthParams.page = 1
        return this._attendanceMonth()
      }
      this.dashboardLoading = true
      this.dailyAttendanceLoading = true
      this.workerStatsLoading = true
      this.devicesLoading = true
      this.monthlyLoading = true
      this.workTimeLoading = true
      this.privilegeLoading = true
      this.grandLoading = true
      this.mainChartLoading = true

      // Faqat dashboard filtrlari (tashkilot, bo'lim, sana). Ilgari `_previewQueryParams()` yoyilardi —
      // ro'yxat oynasida yozilgan qidiruv / sahifa / holat yopilgandan keyin ham dashboard so'rovlariga
      // tushib qolardi (masalan, «Ali» qidirilgach keyingi yangilanishda kartalar shu bo'yicha kelishi mumkin edi).
      const params = {
        organizations: this.dashboardParams.organizations.map((v) => v.id).toString() || undefined,
        departments: this.dashboardParams.departments.toString() || undefined,
        start_time: this.dashboardParams.start_time,
        end_time: this.dashboardParams.end_time,
        date: Utils.timeToZone(this.dashboardParams.date)
      }
      // Har yuklash o'z raqamini oladi: eskiroq so'rov (masalan, filtr tez-tez o'zgarganda
      // oldingi yuklash) keyinroq qaytsa — javobi tashlanadi, yangi filtr ma'lumoti ustiga yozilmaydi.
      const requestId = ++this.dashboardRequestId
      const isStale = () => requestId !== this.dashboardRequestId
      const load = (url, extra = {}) =>
        $ApiService.eventService
          ._allDashboard({ url, params: { ...params, ...extra } })
          .then((res) => res.data.data)
          .catch(() => null)
          .then((data) => {
            if (isStale()) throw STALE
            return data
          })

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
          // «Ishxonada yo'q» kartasidagi «Erta ketgan» qatori shu javobdan olinadi.
          if (this.attendance) this._buildAttendanceCards()
        }),
        // Turniket imtiyozi (kelish/ketish daqiqasi) berilganlar: soni va dastlabki 5 tasi.
        load(STATS_URLS.six).then((data) => {
          this.privilegeCount = data?.privilege_turnstile_workers_count || 0
        }),
        load(STATS_URLS.preview, {
          type: 'privilege_turnstile_workers',
          page: 1,
          per_page: 10
        }).then((data) => {
          this.privilegeTop = (data?.data || []).map((v) => ({
            ...v,
            user: this._userContructor(v, v.organization_name)
          }))
          this.privilegeLoading = false
        })
      ]

      try {
        // Eskirgan javoblar `STALE` bilan rad etiladi — bu xato emas.
        await Promise.allSettled(tasks)
      } finally {
        // Eskirgan so'rov yangi yuklashning skeletonlarini o'chirib yubormasin.
        if (!isStale()) {
          this.dashboardLoading = false
          this.dailyAttendanceLoading = false
          this.workerStatsLoading = false
          this.devicesLoading = false
          this.monthlyLoading = false
          this.workTimeLoading = false
          this.privilegeLoading = false
          this.grandLoading = false
          this.mainChartLoading = false
        }
      }
    },

    // Yuqoridagi 4 karta. Hisob (dev javobi bo'yicha tekshirilgan, 2026-11-21):
    //   total = came + absent + vacation + day_off + excused
    //   absent = absent_by_reason.no_event (grafik bo'yicha kelishi kerak edi) + .no_schedule (grafigi yo'q)
    //   came = in_office (oxirgi o'tishi «kirish») + left_office (oxirgi o'tishi «chiqish»)
    // Har kartaning ostidagi 2 qator shu hisobni ko'rsatadi va bosilsa ro'yxat ochiladi.
    // Ranglar — dashboard palitrasi rollari (ui/palette.js).
    _buildAttendanceCards() {
      const a = this.attendance
      this.totalWorkerCount = a?.total || 0
      const earlyGo = this.countForDate(this.workTime?.late_and_early?.early)
      const noEvent = a?.absent_by_reason?.no_event ?? a?.plan?.absent ?? 0
      const noSchedule = a?.absent_by_reason?.no_schedule ?? Math.max((a?.absent || 0) - noEvent, 0)
      const row = (key, value, previewType = null) => ({
        label: t(`turnStileDashboard.kpi.${key}`),
        value: value || 0,
        previewType
      })
      this.mainCards = [
        {
          title: t('turnStileDashboard.cards.come'),
          hint: t('turnStileDashboard.kpi.cameHint'),
          count: a?.came || 0,
          icon: markRaw(PersonAvailable20Regular),
          tint: 'main',
          previewType: 'att_came',
          rows: [
            row('turnstile', a?.came_turnstile, 'att_came_turnstile'),
            row('mobile', a?.came_mobile, 'att_came_mobile')
          ]
        },
        {
          title: t('turnStileDashboard.cards.not_come'),
          hint: t('turnStileDashboard.kpi.absentHint'),
          count: a?.absent || 0,
          icon: markRaw(PersonDelete20Regular),
          tint: 'bad',
          previewType: 'att_absent',
          rows: [
            row('noEvent', noEvent, 'att_plan_absent'),
            // BACKEND: `/v1/turnstile/dashboard/attendance/workers` da `status=no_schedule` yo'q
            // (422 «Holati noto'g'ri tanlangan»). Qo'shilsa — shu qator ham bosiladigan bo'ladi.
            row('noSchedule', noSchedule)
          ]
        }
      ]
      this.currentWorkers = [
        {
          title: t('turnStileDashboard.form.current_in'),
          hint: t('turnStileDashboard.kpi.inOfficeHint'),
          count: a?.in_office || 0,
          icon: markRaw(Building20Regular),
          tint: 'second',
          listMore: a?.in_office || 0,
          list: this.officeTop.in_office,
          previewType: 'att_in_office',
          rows: [row('came', a?.came, 'att_came'), row('left', a?.left_office, 'att_left_office')]
        },
        {
          // «Ishxonada yo'q» emas — bu faqat kelib, keyin chiqib ketganlar (kelmaganlar bu songa kirmaydi).
          title: t('turnStileDashboard.form.leftWorkplace'),
          hint: t('turnStileDashboard.kpi.leftOfficeHint'),
          count: a?.left_office || 0,
          icon: markRaw(DoorArrowRight20Regular),
          tint: 'warn',
          listMore: a?.left_office || 0,
          list: this.officeTop.left_office,
          previewType: 'att_left_office',
          rows: [row('came', a?.came, 'att_came'), row('early', earlyGo, 'early_leave')]
        }
      ]
    },

    // stats-seven ro'yxatidan TANLANGAN sana soni (ro'yxat bosilganda ham shu sana ochiladi).
    // Sana ro'yxatda bo'lmasa — 0 (boshqa kunning soni ko'rsatilmasin).
    countForDate(list) {
      if (!Array.isArray(list)) return 0
      const date = Utils.timeToZone(this.dashboardParams.date)
      return list.find((v) => v.date === date)?.count || 0
    },

    _preview(isPagination = false) {
      if (!isPagination) {
        this.previewList = []
        // Oldingi ro'yxatning jami soni yangi ro'yxat yuklanguncha ko'rinib turmasin.
        this.previewTotal = 0
      }
      const params = this._previewQueryParams()
      this.previewLoading = true
      // Qidiruv / sahifa / karta tez almashsa — eskiroq javob yangisining ustiga yozilmasin.
      const requestId = ++this.previewRequestId
      const cardType = this.previewParams.type

      const status = ATTENDANCE_PREVIEW[this.previewParams.type]
      const request = status
        ? $ApiService.eventService._allDashboard({
            url: ATTENDANCE_WORKERS_URL,
            params: { ...params, type: undefined, status }
          })
        : $ApiService.eventService._preview({ params })
      request
        .then((res) => {
          if (requestId !== this.previewRequestId) return
          let rawData = res.data.data.data
          this.previewTotal = res.data.data.total
          this.previewList = this._formatPreviewResponse(rawData, cardType)
        })
        .finally(() => {
          if (requestId === this.previewRequestId) this.previewLoading = false
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

      // Imtiyoz daqiqasi: «10 daqiqa» yoki «yo'q» (kartadagi kabi; xom «10» / «0» tushunarsiz edi).
      const minutesText = (m) =>
        m
          ? t('turnStileDashboard.privilegeCard.minutes', { n: m })
          : t('turnStileDashboard.privilegeCard.none')

      const data = responseDate.map((v, index) => {
        if (cardType === 'privilege_turnstile_workers') {
          return {
            ...v,
            user: this._userContructor(v, v.position_name),
            start_minute_text: minutesText(v.start_minute),
            end_minute_text: minutesText(v.end_minute)
          }
        } else if (cardType === 'late_come') {
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
            // Buyruqqa asoslangan sabab: «Ta'til: Mehnat ta'tili berish (№15, 01.08.2026)».
            reasons: (v.reasons || [])
              .map((r) => {
                const label = t(`turnStileDashboard.attendanceReason.${r}`)
                const doc = (v.documents || []).find((d) => d.reason === r)
                if (!doc) return label
                const meta = [doc.number ? `№${doc.number}` : null, doc.date].filter(Boolean)
                return `${label}: ${doc.name || ''}${meta.length ? ` (${meta.join(', ')})` : ''}`
              })
              .join(', '),
            first_event: v.first_event ? Utils.timeWithMonth(v.first_event) : null,
            last_event: v.last_event ? Utils.timeWithMonth(v.last_event) : null,
            last_direction: v.last_direction
              ? t(`turnStileDashboard.attendance.direction_${v.last_direction}`)
              : null
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
            // Eksport — butun ro'yxat: sahifa parametrlari yuborilmaydi.
            params: {
              ...params,
              type: undefined,
              download: undefined,
              page: undefined,
              per_page: undefined,
              status
            }
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
