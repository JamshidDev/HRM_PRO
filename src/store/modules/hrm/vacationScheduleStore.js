import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import {Utils} from "@utils"

const { t } = i18n.global

const initialPayload = () => ({
  year:null,
  director_id:null,
  trade_union_id:null,
  creator_id:null,
  date:null,
  worker_position_ids: [
    {
      id:1,
      table_number:null,
      period_from:null,
      period_to:null,
      plan_date:null,
      all_days:0,
    }
  ],
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
    payload:initialPayload(),
    params: {
      page: 1,
      per_page: 10,
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
    worker:{
      list:[],
      loading:false,
      total:0,
      params:{
        page:1,
        per_page:10,
        search:null,
        year:null,
      }
    }
  }),
  actions: {
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
    _fetchWorkers(){
      const params = {
        ...this.worker.params,
      }
      this.worker.loading = true
      $ApiService.vacationScheduleService._workers({params}).then((res)=>{
        this.worker.list = res.data.data.data.map(v =>({
          id:v.id,
          worker:v.worker,
          position:v.position,

          table_number:v.vacation_schedule?.table_number,
          period_from:Utils.datePickerFormatter(v.vacation_schedule?.period_from),
          period_to:Utils.datePickerFormatter(v.vacation_schedule?.period_to),
          plan_date:Utils.datePickerFormatter(v.vacation_schedule?.plan_date),
          all_days:v.vacation_schedule?.all_days || 0,
        }))
        this.worker.total = res.data.data.total
      }).finally(()=>{
        this.worker.loading = false
      })

    },
    _otherWorkers() {
      const params = {
        ...this.otherParam
      }
      this.otherLoading = true
      $ApiService.vacationScheduleService
        ._notIncludes({ params })
        .then((res) => {
          this.othersList = res.data.data.data.map((v) => ({ ...v, month: null }))
          this.otherTotal = res.data.data.total
        })
        .finally(() => {
          this.otherLoading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.vacationScheduleService
        ._create({ data })
        .finally(() => {
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
