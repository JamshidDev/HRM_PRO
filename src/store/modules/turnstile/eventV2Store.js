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
      per_page: 10,
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
      per_page: 10,
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
      per_page: 10,
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
      payload: {
        from: null,
        to: null
      }
    }
  }),
  actions: {
    _download() {
      this.download.loading = true
      const params = {
        ...this._params(),
        download: true,
        from: Utils.timeToZone(this.download.payload.from),
        to: Utils.timeToZone(this.download.payload.to)
      }
      $ApiService.eventV2Service._index({ params }).finally(() => {
        this.download.loading = false
        this.download.visible = false
      })
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
