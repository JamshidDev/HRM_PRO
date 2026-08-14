import {
  CellularWarning24Filled,
  CellularData120Filled,
  DataUsage20Regular,
  DoorArrowLeft24Regular
} from '@vicons/fluent'
import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import router from '@/router/index.js'
import { AppPaths } from '@/utils/index.js'

const { t } = i18n.global
export const useEventV2Store = defineStore('eventV2Store', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    structureCheck2: [],
    structureCheck3: [],

    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      departments: [],
      direction: null,
      date: null,
      access_levels: [],
      event: 'yes'
    },
    department: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        page: 1,
        per_page: 100,
        search: null,
        organizations: []
      }
    },
    cardList: [
      {
        name: t('hcEvent.cards.cardOne'),
        id: 1
      },
      {
        name: t('hcEvent.cards.cardTwo'),
        id: 2
      },
      {
        name: t('hcEvent.cards.cardThree'),
        id: 3
      },
      {
        name: t('hcEvent.cards.cardFour'),
        id: 4
      }
    ],
    detailShow: false,
    dashboardLoading: false,
    dashboardMainLoading: false, // '/v1/turnstile/hik-central/dashboard'
    dailyAttendanceLoading: false, // '/v1/turnstile/hik-central/dashboard/daily-attendance'
    workerStatsLoading: false, // '/v1/turnstile/hik-central/dashboard/worker-stats'
    devicesLoading: false, // '/v1/turnstile/hik-central/dashboard/devices'
    workDurationsLoading: false, // '/v1/turnstile/hik-central/dashboard/work-durations'

    dashboardObj: null,
    levelLoading: false,
    levelList: [],
    previewList: [],
    previewTotal: 0,
    previewParams: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      access_levels: [],
      type: null,
      hours: null,
      end_time: null,
      start_time: null,
      start_date_and_time: null,
      end_date_and_time: null
    },
    dashboardParams: {
      organizations: [],
      access_levels: [],
      type: null,
      hours: null,
      end_time: null,
      start_time: null,
      start_date_and_time: null,
      end_date_and_time: null
    },
    previewLoading: false,
    previewVisible: false,
    temperatureStatus: {
      1: {
        name: t('hcEvent.form.normal'),
        id: 3
      },
      2: {
        name: t('hcEvent.form.noNormal'),
        id: 4
      },
      3: {
        name: t('hcEvent.form.unknown'),
        id: 2
      }
    },
    typeList: [
      {
        name: t('hcEvent.cards.cardOne'),
        id: 'late_come'
      },
      {
        name: t('hcEvent.cards.cardTwo'),
        id: 'not_come'
      },
      {
        name: t('hcEvent.cards.cardThree'),
        id: 'early_leave'
      },
      {
        name: t('hcEvent.cards.cardFour'),
        id: 'work_hours'
      }
    ],
    jobList: [],
    jobItems: 0,
    jobLoading: false,
    jobPayload: {
      f_date: null
    },
    jobParams: {
      page: 1,
      per_page: 15,
      search: null
    },
    syncPayload: {
      from_date: null,
      access_level_ids: []
    },
    syncLoading: false,

    topOfflineDeviceList: [],
    dailyEvents: [],
    totalOfflineDeviceCount: 0,
    devices: null,
    workerStatuses: [],
    deviceStatusList: [],

    workDuration: null,
    selectedList: [],
    selectedWorker: null,
    calendarParams: {
      year: null,
      month: null
    },
    calendarList: [],
    calendarLoading: false,
    currentTime: null,
    calendarVisible: false,
    activeTab: 1,
    tabs: [1, 2],
    eventInDayList: [],
    download: {
      loading: false,
      visible: false,
      activeTab: 'download',
      structureCheck: [],
      payload: {
        from: null,
        to: null,
        organizations: [], // UISelect (daraxt) — {id, name} obyektlari
        departments: [], // SuperSelect — id'lar
        workers: [] // SuperSelect — workers.id
      },
      // Bo'lim/xodim dropdownlari modalning O'Z ro'yxatlari: sahifa filtri
      // o'zgarsa yuklash oynasidagi tanlov buzilmasin.
      department: {
        list: [],
        loading: false,
        totalItems: 0,
        params: { page: 1, per_page: 100, search: null }
      },
      worker: {
        list: [],
        loading: false,
        totalItems: 0,
        params: { page: 1, per_page: 50, search: null }
      }
    },
    // Kelmaganlar tabi — korxona/bo'lim/xodim filtrlari `download.payload` dan
    // olinadi (modal oynada bitta umumiy blok), bu yerda faqat o'z sanalari.
    absent: {
      loading: false,
      payload: {
        from_date: null,
        to_date: null
      }
    }
  }),
  actions: {
    // «Kelmaganlar» eksporti — «Yuklash» bilan AYNAN bir xil filtrlar
    // (korxona/bo'lim/xodim), faqat endpoint va sana kalitlari boshqa
    // (`from_date`/`to_date`). Backend ikkalasida ham filtrlarni org-scope
    // USTIGA AND qiladi.
    _downloadAbsent(onSuccess) {
      this.absent.loading = true
      const params = {
        from_date: Utils.timeToZone(this.absent.payload.from_date),
        to_date: Utils.timeToZone(this.absent.payload.to_date),
        ...this._downloadFilterParams()
      }
      $ApiService.eventV2Service
        ._absentScheduledWorkers({ params })
        .then((res) => {
          onSuccess?.()
          window.$message?.success(res.data?.message || 'Yuborildi')
          this.download.visible = false
        })
        .finally(() => {
          this.absent.loading = false
        })
    },
    // Yuklash oynasining o'z filtrlari (korxona/bo'lim/xodim) bilan eksport.
    // Backend `workers`ni org-scope USTIGA AND qilib qo'shadi — tanlov faqat
    // toraytiradi, ruxsatni kengaytirmaydi.
    // Ikkala eksport uchun umumiy filtr parametrlari (korxona/bo'lim/xodim).
    _downloadFilterParams() {
      const { organizations, departments, workers } = this.download.payload
      const orgs = organizations.map((v) => v.id)
      return {
        ...(orgs.length ? { organizations: orgs.toString() } : {}),
        ...(departments.length ? { departments: departments.toString() } : {}),
        ...(workers.length ? { workers: workers.toString() } : {})
      }
    },
    _download(onSuccess) {
      this.download.loading = true
      const params = {
        download: true,
        from: Utils.timeToZone(this.download.payload.from),
        to: Utils.timeToZone(this.download.payload.to),
        ...this._downloadFilterParams()
      }
      $ApiService.eventV2Service
        ._index({ params })
        .then((res) => {
          onSuccess?.()
          window.$message?.success(res.data?.message)
          this.download.visible = false
        })
        .finally(() => {
          this.download.loading = false
        })
    },
    // Yuklash oynasidagi bo'lim ro'yxati — tanlangan korxonalar bo'yicha.
    _downloadDepartments(infinity = false) {
      this.download.department.loading = true
      const orgs = this.download.payload.organizations.map((v) => v.id)
      const params = {
        ...this.download.department.params,
        ...(orgs.length ? { organizations: orgs.toString() } : {})
      }
      $ApiService.componentService
        ._departmentByOrganizations({ params })
        .then((res) => {
          this.download.department.totalItems = res.data.data.total
          const data = res.data.data.data.map((v) => ({
            ...v,
            position: v?.organization?.name
          }))
          this.download.department.list = infinity
            ? [...this.download.department.list, ...data]
            : data
        })
        .finally(() => {
          this.download.department.loading = false
        })
    },
    // Yuklash oynasidagi xodim ro'yxati — SHU sahifaning `events-new` endpointi.
    // Sabab: u allaqachon rol/org-scope ichida ishlaydi, sahifani ko'rish
    // ruxsatiga bog'langan va to'g'ridan-to'g'ri `workers.id` qaytaradi
    // (`/hr/search-workers` da org-scope YO'Q — ishlatilmaydi).
    // ⚠️ `event` yuborilMAYDI: aks holda faqat o'sha kuni hodisasi bor xodimlar chiqadi.
    _downloadWorkers(infinity = false) {
      this.download.worker.loading = true
      const orgs = this.download.payload.organizations.map((v) => v.id)
      const departments = this.download.payload.departments
      const params = {
        ...this.download.worker.params,
        ...(orgs.length ? { organizations: orgs.toString() } : {}),
        ...(departments.length ? { departments: departments.toString() } : {})
      }
      $ApiService.eventV2Service
        ._index({ params })
        .then((res) => {
          this.download.worker.totalItems = res.data.data.total
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: Utils.combineFullName(v),
            photo: v.photo
          }))
          this.download.worker.list = infinity
            ? [...this.download.worker.list, ...data]
            : data
        })
        .finally(() => {
          this.download.worker.loading = false
        })
    },
    // Korxona tanlovi o'zgarganda quyi tanlovlar (bo'lim/xodim) qayta yuklanadi.
    _onDownloadOrganizations(v) {
      this.download.payload.organizations = v
      this.download.payload.departments = []
      this.download.payload.workers = []
      this.download.department.list = []
      this.download.department.params.page = 1
      this.download.department.params.search = null
      this.download.worker.params.page = 1
      this.download.worker.params.search = null
      this._downloadWorkers()
      if (v.length) this._downloadDepartments()
    },
    // Yuklash oynasini ochish: sana defaultlari + sahifa filtrini bir marta
    // oldindan to'ldirish. Ilgari eksport sahifa filtrini o'zi olardi — o'sha
    // xulq saqlanadi, lekin endi foydalanuvchi uni modalda o'zgartira oladi.
    _openDownload({ organizations = [], departments = [] } = {}) {
      if (!this.download.payload.from) {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        this.download.payload.from = today.getTime()
        this.download.payload.to = tomorrow.getTime()
      }
      const isFirstOpen =
        this.download.payload.organizations.length === 0 &&
        this.download.payload.workers.length === 0
      if (isFirstOpen && organizations.length) {
        this.download.payload.organizations = [...organizations]
        this.download.payload.departments = [...departments]
        this.download.department.list = []
        this.download.department.params.page = 1
        this._downloadDepartments()
      }
      this.download.visible = true
    },
    _onDownloadDepartments() {
      this.download.payload.workers = []
      this.download.worker.params.page = 1
      this.download.worker.params.search = null
      this._downloadWorkers()
    },
    _showEventsInDay(date, id) {
      this.calendarLoading = true
      const params = {
        date
      }
      $ApiService.turnstileWorkDurationService
        ._HKShowEventsInDay({ params, id })
        .then((res) => {
          this.eventInDayList = res.data.data
          this.activeTab = 2
        })
        .finally(() => {
          this.calendarLoading = false
        })
    },
    _fetchPreview(id, date) {
      this.previewLoading = true
      const params = { date }
      $ApiService.turnstileWorkDurationService
        ._HKShowEventsInDay({ params, id })
        .then((res) => {
          this.selectedList = res.data.data
          this.visible = true
        })
        .finally(() => {
          this.previewLoading = false
        })
    },
    _calendar() {
      this.calendarLoading = true
      const params = {
        ...this.calendarParams
      }
      $ApiService.turnstileWorkDurationService
        ._HKShow({ params, id: this.elementId })
        .then((res) => {
          this.calendarList = res.data.data
        })
        .finally(() => {
          this.calendarLoading = false
        })
    },
    _department(infinity = false) {
      this.department.loading = true
      const params = {
        ...this.department.params,
        organizations: this.department.params.organizations?.toString()
      }
      $ApiService.componentService
        ._departmentByOrganizations({ params })
        .then((res) => {
          this.department.totalItems = res.data.data.total
          const data = res.data.data.data.map((v) => ({
            ...v,
            position: v?.organization?.name
          }))
          if (infinity) {
            this.department.list = [...this.department.list, ...data]
          } else {
            this.department.list = data
          }
        })
        .finally(() => {
          this.department.loading = false
        })
    },
    _params() {
      return {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        departments: this.params.departments.toString() || undefined,
        access_levels: this.params.access_levels.toString() || undefined,
        date: this.params.date ? Utils.timeToZone(this.params.date) : undefined
      }
    },
    _index() {
      this.loading = true
      const params = {
        ...this._params()
      }
      $ApiService.eventV2Service
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data.map((v) => {
            const workTime = Math.floor(v.total_minutes / 60)
            const color = workTime > 7 ? 'success' : workTime < 5 ? 'error' : 'warning'
            return {
              ...v,
              firstEnterTime: v.events?.filter((x) => x.direction)?.[0]?.event_date_and_time,
              firstExistTime: v.events?.filter((x) => !x.direction)?.[0]?.event_date_and_time,
              workTime,
              buttonType: color
            }
          })
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _levels() {
      this.levelLoading = true
      $ApiService.hcServerService
        ._accessLevels()
        .then((res) => {
          this.levelList = res.data.data
          if (res.data.data.length === 1) {
            this.syncPayload.access_level_ids = [res.data.data[0].id]
          }
        })
        .finally(() => {
          this.levelLoading = false
        })
    }
  }
})
