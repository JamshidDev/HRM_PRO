import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

const today = new Date().getTime()

const addDayToDate = (date, days)=>{
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return new Date(result).getTime()
}

const initialPayload46 = ()=> ({
  period_from: null,
  period_to: null,
  from: null,
  to: null,
  work_day: null,
  all_day: null,
  main_day: null,
  second_day: null,
  half_one_day: null,
  half_two_day: null,
  half_two_base: null,
  half_two_date: null,
  additional:null,
  result:{
    to:null,
    work_day:null,
    period_from:null,
    period_to:null,
    all_day:null,
    experience:null,
  },
  addList:[],
})
const initialPayload34 = () => ( {
  contract_to_date: null,
  command_additional: [],
  pension_count: {
    year: 1,
    count: 1
  },
  pension_coefficient: {
    year: 1,
    coefficient: 1
  },
  salary_withholding: {
    period1: null,
    period2: null,
    all_day: 0,
    rest_day: 0,
    month: null
  },
  compensation: {
    period1: null,
    period2: null,
    rest_day: 0
  },
  reason: null,
  base: null,
  reasonId: null,
  warning_date: null,
  warning_number: null
})
const initialPayload32 = () => ({
  contract_to_date: null,
  command_additional: [],
  pension_count: {
    year: 1,
    count: 1
  },
  pension_coefficient: {
    year: 1,
    coefficient: 1
  },
  salary_withholding: {
    period1: null,
    period2: null,
    all_day: 0,
    rest_day: 0,
    month: null
  },
  compensation: {
    period1: null,
    period2: null,
    rest_day: 0
  },
  warning_date: null,
  warning_number: null
})


export const useCommandStore = defineStore('commandStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    structureCheck: [],

    payload: {
      workers: [],
      worker: null,
      organization_id: [],
      command_date: null,
      command_number: null,
      command_type: null,
      confirmations: [],
      director_id: null,
      finance_id: null,
    },
    form_32: initialPayload32(),
    form_34: initialPayload34(),
    form_46: initialPayload46(),
    vacation: {
      from: null,
      main_day: null,
      second_day: null,
      additional: null
    },
    form_43: {
      new_date: null,
      work_day: null,
      reason: null
    },
    form_44: {
      new_date: null,
      rest_day: null,
      reason: null
    },
    form_47: {
          work_day:null,
          to:null,
          vacation_reason_type:null,
          vacation_reason_day:null,
        type:null,
        base:null,
    },
    form_50: {
        work_day:null,
        to:null,
        vacation_status:null,
        vacation_id:null,
      vacation_finish_status: null,
      child_age: null,

    },
    form_45: {
      from: null,
      to: null,
      work_day: null
    },
    form_48: {
      from: null,
      to: null,
      work_day: null,
      all_day: null,
      reason: null
    },
    form_49: {
      from: null,
      to: null,
      work_day: null
    },
    form_51: {
      from: null,
      to: null,
      work_day: null,
      reason: null
    },
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      confirmation: null,
      created: null
    },
    vacations: [],
    vacations55: [],
    vacations62: [],
    workerData: [],
    calculateLoading: false,
    vacationLoading: false,
    vacationId: null,
    structureCheck2: [],
    viewLoading: false,

    workerLoading: false,
    workerList: [],
    workerParams: {
      organization_id: null,
      page: 1,
      per_page: 100,
      search: null
    },
    totalWorker: 0,

    isSingleSelect: false,
    sortableConfirmations: [],
    oneByOne: true,
    workerVacations:[],
    workerVacationLoading:false,


  }),
  actions: {
    _getWorkerVacation(){
        const params = {
            page:1,
            per_page:100,
            worker_position_id:this.payload.worker,
        }
        this.workerVacationLoading = true
        $ApiService.vacationService._index({params}).then((res)=>{
            this.workerVacations = res.data.data.data.map(v=>({
                id:v.id,
                name:`${v.type.name} (${Utils.timeOnlyDate(v.from)}  ${Utils.timeOnlyDate(v.to)})`,
                to:v.to,
            }))

        }).finally(()=>{
            this.workerVacationLoading = false
        })
    },
    _additionalData(params, callback) {
      const id = this.payload.worker
      $ApiService.commandService._additionalData({ id, params }).then((res) => {
        callback?.(res.data)
      })
    },
    _workers(infinity = false) {
      this.workerLoading = true
      let params = {
        ...this.workerParams
      }
      $ApiService.workerService
        ._search({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            ...v,
            name: v.worker.last_name + ' ' + v.worker.first_name + ' ' + v.worker.middle_name,
            position: v.position?.name || v?.post_name,
            id: v.id,
            typeId: v.contract?.type?.id,
            photo: v.worker?.photo
          }))
          this.totalWorker = res.data.data.total
          this.workerList = infinity
            ? Array.from(new Map([...this.workerList, ...data].map((v) => [v.id, v])).values())
            : Array.from(new Map([...data].map((v) => [v.id, v])).values())
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        created: Utils.timeToZone(this.params.created),
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.commandService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create(data) {
      this.saveLoading = true

      $ApiService.commandService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _viewCommand(data) {
      this.viewLoading = true
      $ApiService.commandService
        ._viewFile({ data: { ...data, status: 'view' } })
        .then((response) => {
          const url = window.URL.createObjectURL(
            new Blob([response.data], { type: 'application/pdf' })
          )
          window.open(url, '_blank')
          setTimeout(() => window.URL.revokeObjectURL(url), 20000)
        })
        .finally(() => {
          this.viewLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.nationalityService
        ._update({ data: this.payload, id: this.elementId })
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
      $ApiService.commandService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    _calculateVacation(data, idx) {
      this.calculateLoading = true
      $ApiService.vacationService
        ._vacationCalculate({ data: { worker_positions: [data] } })
        .then((res) => {
          const data = res.data.data[0]
          this.vacations[idx].result = {
            ...data,
            all_day: data.all_day.toString(),
            period_from: new Date(data.period_from).getTime(),
            period_to: new Date(data.period_to).getTime(),
            to: new Date(data.to).getTime(),
            work_day: new Date(data.work_day).getTime()
          }
        })
        .finally(() => {
          this.calculateLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },

    resetForm() {
      this.resetPayload()
      this.resetPayload46()
      this.resetPayload34()
      this.resetPayload32()

      this.vacations = []


      this.form_44.new_date = null
      this.form_44.rest_day = null
      this.form_44.reason = null
      this.form_50.to = null
      this.form_50.work_day = null
      this.form_50.vacation_status = 1
      this.form_50.vacation_finish_status = 1
      this.form_50.child_age = 2
      this.form_50.vacation_id = null

      this.form_47.vacation_reason_day = '4'
      this.form_47.vacation_reason_type = null
      this.form_47.to = today
      this.form_47.work_day = addDayToDate(today,4)
      this.form_47.type = null
      this.form_47.base = null
    },
    resetPayload(){
      this.payload.workers = []
      this.payload.worker = null
      this.payload.organization_id = []
      this.payload.command_number = null
      this.payload.command_type = null
      this.payload.command_date = today
    },
    resetPayload46(){
      this.form_46 = initialPayload46()
      this.form_46.from = today
      this.form_46.main_day = 21
      this.form_46.second_day = 0
      this.form_46.half_two_base = 1
    },
    resetPayload34(){
      this.form_34 = initialPayload34()
      this.form_34.contract_to_date = today
      this.form_34.pension_count.year = 1
      this.form_34.pension_count.count = 1
      this.form_34.pension_coefficient.year = 1
      this.form_34.pension_coefficient.coefficient = 10
      this.form_34.warning_date = today
    },
    resetPayload32(){
      this.form_32 = initialPayload32()
      this.form_32.contract_to_date = today
      this.form_32.pension_count.year = 1
      this.form_32.pension_count.count = 1
      this.form_32.pension_coefficient.year = 1
      this.form_32.pension_coefficient.coefficient = 10
      this.form_32.warning_date = today
    },
    lastVacation(callback) {
      let data = {
        worker_positions: [this.vacationId]
      }
      this.vacationLoading = true
      $ApiService.vacationService
        ._lastOne({ data })
        .then((res) => {
          callback?.(res.data.data)
        })
        .finally(() => {
          this.vacationLoading = false
        })
    }
  }
})
