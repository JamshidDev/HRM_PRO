import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

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
      director_id: null
    },
    vacation: {
      from: null,
      main_day: null,
      second_day: null,
      additional: null
    },
    form_32: {
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
    },
    form_34: {
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
            console.log(res.data.data.data)
            this.workerVacations = res.data.data.data.map(v=>({
                id:v.id,
                name:`${v.type.name} (${Utils.timeOnlyDate(v.from)}  ${Utils.timeOnlyDate(v.to)})`,
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
      const today = new Date().getTime()

      const addDayToDate = (date, days)=>{
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return new Date(result).getTime()
      }

      this.payload.command_date = today
      this.payload.command_type = null
      this.payload.command_number = null
      this.payload.confirmations = []
      this.payload.director_id = null
      this.payload.workers = []
      this.payload.worker = null
      this.payload.organization_id = []
      this.vacations = []

      this.form_32.contract_to_date = today
      this.form_32.pension_count.year = 1
      this.form_32.pension_count.count = 1
      this.form_32.pension_coefficient.year = 1
      this.form_32.pension_coefficient.coefficient = 10

      this.form_32.salary_withholding.period1 = null
      this.form_32.salary_withholding.period2 = null
      this.form_32.salary_withholding.all_day = null
      this.form_32.salary_withholding.rest_day = null
      this.form_32.salary_withholding.month = null
      this.form_32.compensation.period1 = null
      this.form_32.compensation.period2 = null
      this.form_32.compensation.rest_day = null
      this.form_32.compensation.command_additional = []

      this.form_32.contract_to_date = today
      this.form_32.pension_count.year = 1
      this.form_32.pension_count.count = 1
      this.form_32.pension_coefficient.year = 1
      this.form_32.pension_coefficient.coefficient = 10
      this.form_32.warning_number = null
      this.form_32.warning_date = today

      this.form_34.salary_withholding.period1 = null
      this.form_34.salary_withholding.period2 = null
      this.form_34.salary_withholding.all_day = null
      this.form_34.salary_withholding.rest_day = null
      this.form_34.salary_withholding.month = null
      this.form_34.compensation.period1 = null
      this.form_34.compensation.period2 = null
      this.form_34.compensation.rest_day = null
      this.form_34.compensation.command_additional = []

      this.form_34.contract_to_date = today
      this.form_34.pension_count.year = 1
      this.form_34.pension_count.count = 1
      this.form_34.pension_coefficient.year = 1
      this.form_34.pension_coefficient.coefficient = 10
      this.form_34.warning_number = null
      this.form_34.reason = null
      this.form_34.reasonId = null
      this.form_34.warning_date = today
      this.form_34.base = null

      this.form_44.new_date = null
      this.form_44.rest_day = null
      this.form_44.reason = null
      this.form_50.to = today
      this.form_50.work_day = today
        this.form_50.vacation_status = 1
      this.form_50.vacation_id = null

      this.form_47.vacation_reason_day = '4'
      this.form_47.vacation_reason_type = null
      this.form_47.to = today
      this.form_47.work_day = addDayToDate(today,4)
      this.form_47.type = null
      this.form_47.base = null
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
