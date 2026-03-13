import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global

export const useScheduleGroupWorkerStore = defineStore('scheduleGroupWorkerStore', {
  state: () => ({
    list: [],
    loading: false,
    visible: false,

    elementId: null,
    totalItems: 0,

    params: {
      page: 1,
      per_page: 20,
      search: null,
      group: null,
      startDate: null,
      endDate: null
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
    selectedWorker: null,
    replaceVisible: false,
    replacePayload: {
      positonId: null,
      date: null,
      status: false
    },
    replaceLoading: false,

    workerParams: {
      page: 1,
      per_page: 300,
      search: null
    },
    workerList: [],
    totalWorker: 0,
    workerLoading: false,
    monthsList: [],
    selectedDate: null
  }),
  getters: {
    calculateWorkTime: (state) => (workerIndex) => {
      state.scheduleList
      return 0
    }
  },
  actions: {
    _replaceWorker(data) {
      this.replaceLoading = true
      $ApiService.shiftTypeService
        ._replaceWorker({ data })
        .then((res) => {
          this.replaceVisible = false
          this._dayOfMonth(() => {
            this._index()
          })
        })
        .finally(() => {
          this.replaceLoading = false
        })
    },
    _workers() {
      const params = {
        ...this.workerParams,
        start_date: Utils.timeToZone(this.params.startDate),
        end_date: Utils.timeToZone(this.params.endDate)
      }
      this.workerLoading = true
      $ApiService.shiftTypeService
        ._getWorkers({ params })
        .then((res) => {
          const selectedData = this.workerList.filter(
            (v) => v.positionId === this.replacePayload.positonId
          )

          const data = res.data.data.data.map((v) => ({
            name: Utils.combineFullName(v.worker),
            id: v.worker.id,
            positionId: v.id,
            position: v.scheduleType?.name || t('shiftType.form.noGraphic'),
            group: v.scheduleGroup,
            type: v.scheduleType
          }))
          this.workerList = [
            ...new Map([...selectedData, ...data].map((v) => [v.positionId, v])).values()
          ]
          this.totalWorker = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _index() {
      const month = this.selectedDate.split('-')[1]
      const year = this.selectedDate.split('-')[0]
      const params = {
        page: this.params.page,
        per_page: this.params.per_page,
        year: year,
        month: month,
        group: this.params.group
      }
      this.loading = true
      $ApiService.shiftTypeService
        ._groupWorker({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _dayOfMonth(callback) {
      this.dayOfMonthLoading = true
      const month = this.selectedDate.split('-')[1]
      const params = {
        year: this.params.year1,
        month: month
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
    }
  }
})
