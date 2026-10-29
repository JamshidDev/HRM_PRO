import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { useComponentStore } from '@/store/modules/index.js'

// Hujjat drawer'idagi «Ma'lumotlar» tabi alohida nusxa bilan ishlaydi — yaratish modaliga tegmaydi.
const storeOptions = {
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
    structureCheck2: [],
    departmentCheck: [],
    confirmationVisible: false,
    number: null,
    payload: {
      pin: null,
      organization_id: [],
      contract_date: null,
      number: null,
      table_number: null,
      type: null,
      director_id: null,
      finance_id: null,
      department_id: [],
      department_position_id: null,
      position_status: true,
      salary: null,
      position_id: null,
      group: null,
      rank: null,
      rate: null,
      // post_name:null,
      contract_to_date: null,
      probation: null,
      position_date: null,
      vacation_main_day: null,
      additional_vacation_day: null,
      schedule_id: null,
      // files:[],
      command_type: null,
      command_status: false,

      command_date: null,
      command_number: null,
      confirmations: [],
      temporary_worker_id: null,
      // Ishga qabul turlari (contract 1): 4 Tanlov / 9 To'liqsiz kun / 10 hafta.
      competition_decision_date: null,
      competition_decision_number: null,
      work_day: null,
      week_days: null,
      start_time: null,
      end_time: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      confirmation: null,
      status: null,
      type: null,
      created: null
    },
    tabList: [
      {
        id: 1,
        name: 'contractType'
      },
      {
        id: 2,
        name: 'contractData'
      },
      {
        id: 3,
        name: 'commandDate'
      },
      {
        id: 4,
        name: 'result'
      }
    ],
    activeTab: 1,
    stepStatus: 'process',
    stepNumber: 1,
    vacationWorkers: [],
    vacationLoading: false,

    sortableConfirmations: [],
    // Yangi hujjatda kelishuvchilar sukut bo'yicha parallel imzolaydi.
    oneByOne: false,
    // Tahrir rejimi: shartnoma id, tiklangan buyruq turi va qayta yuborish modali.
    editId: null,
    editCommandType: null,
    resendVisible: false,
    resendRows: [],
    resendLoading: false
  }),
  actions: {
    _vacationWorkers(id) {
      this.vacationLoading = true
      $ApiService.applicationService
        ._vacationWorker({ params: { organizations: id, page: 1, per_page: 1000 } })
        .then((res) => {
          this.vacationWorkers = res.data.data.data.map((v) => ({
            ...v,
            name: Utils.combineFullName(v.worker),
            position: v.post_short_name
          }))
        })
        .finally(() => {
          this.vacationLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString(),
        created: Utils.timeToZone(this.params.created)
      }
      $ApiService.contractService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Yaratish va tahrir uchun bir xil so'rov ma'lumoti.
    buildData() {
      const compStore = useComponentStore()
      const data = {
        ...this.payload,
        ...{
          command_date: Utils.timeToZone(this.payload.command_date),
          contract_date: Utils.timeToZone(this.payload.contract_date),
          contract_to_date: Utils.timeToZone(this.payload.contract_to_date),
          position_date: Utils.timeToZone(this.payload.position_date),
          competition_decision_date: Utils.timeToZone(
            this.payload.competition_decision_date
          ),
          organization_id: this.payload.organization_id[0].id,
          worker_id: compStore.isSelectedWorker ? Number(compStore.worker.pin) : this.payload.pin,
          director_id: this.payload.director_id,
          finance_id: this.payload.finance_id || undefined,
          department_id:
            this.payload.department_id.length > 0 ? this.payload.department_id[0].id : null,
          vacation_main_day: this.payload.vacation_main_day || 0,
          additional_vacation_day: this.payload.additional_vacation_day || 0,
          confirmations: this.sortableConfirmations.map((v, idx) => ({
            id: v.id,
            order: this.oneByOne ? idx + 1 : 1
          }))
        }
      }
      delete data.pin
      return data
    },
    _create(callback) {
      this.saveLoading = true
      const data = { ...this.buildData(), form_state: this.snapshotFormState() }
      $ApiService.contractService
        ._create({ data })
        .then(() => {
          this.activeTab = 4
          this.stepNumber = 4
          this._index()
          callback?.()
        })
        // 400 (validatsiya) xabarini interceptor toast qiladi — bu yerda faqat
        // "Uncaught (in promise)" chiqmasligi uchun ushlab qo'yamiz.
        .catch(() => {})
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.nationalityService
        ._update({ data: this.payload, id: this.elementId })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.contractService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    _finishContract(id) {
      this.loading = true

      const data = {
        model: Utils.documentModels.contract,
        command_status: false,
        contract_id: id
      }
      $ApiService.commandService
        ._create({ data })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _attachFile(id, callback) {
      this.saveLoading = true
      const formData = new FormData()
      formData.append('document_id', id)
      formData.append('model', 'contracts')
      this.payload.files.forEach((v) => {
        formData.append('file', v.file)
      })
      $ApiService.documentFileService
        ._create({ data: formData })
        .then((res) => {
          this.activeTab = 4
          this.stepNumber = 4
          callback?.()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    // Forma holati — tahrirda ustani aynan shu holatda tiklash uchun backend'da saqlanadi.
    snapshotFormState() {
      const compStore = useComponentStore()
      const clone = (v) => JSON.parse(JSON.stringify(v ?? null))
      const strip = (list) => (list || []).map(({ children: _c, ...v }) => v)
      return {
        payload: { ...clone(this.payload), organization_id: strip(this.payload.organization_id), department_id: strip(this.payload.department_id) },
        structureCheck: clone(this.structureCheck),
        departmentCheck: clone(this.departmentCheck),
        sortableConfirmations: clone(this.sortableConfirmations),
        oneByOne: this.oneByOne,
        worker: clone(compStore.worker)
      }
    },
    restoreFormState(state) {
      const compStore = useComponentStore()
      Object.assign(this.payload, state.payload || {})
      this.structureCheck = state.structureCheck || []
      this.departmentCheck = state.departmentCheck || []
      this.sortableConfirmations = state.sortableConfirmations || []
      this.oneByOne = state.oneByOne ?? true
      compStore.worker = state.worker || null
      compStore.isSelectedWorker = Boolean(state.worker)
      // Tanlangan bo'lim/lavozim yorliqlari uchun ro'yxatlar qayta yuklanadi.
      const orgId = this.payload.organization_id?.[0]?.id
      if (orgId) {
        compStore.depParams.organizations = orgId
        compStore._departmentTree()
      }
      const depId = this.payload.department_id?.[0]?.id
      if (depId) compStore._departmentPosition(depId)
    },
    // Ro'yxatdan «Tahrirlash»: saqlangan forma tiklanib, usta tahrir rejimida ochiladi.
    _openEdit(id, onLocked) {
      $ApiService.contractService._form({ id }).then((res) => {
        const form = res.data.data
        if (!form.editable) return onLocked?.(form.edit_block)
        this.resetForm()
        this.restoreFormState(form.form_state)
        this.editCommandType = this.payload.command_type
        this.editId = id
        this.visibleType = false
        this.activeTab = 1
        this.stepNumber = 1
        this.visible = true
      })
    },
    // Oxirgi qadam: yakuniy imzolovchilar → qayta yuborish modali.
    _submitEdit() {
      this.saveLoading = true
      $ApiService.contractService
        ._signersPreview({ id: this.editId, data: this.buildData() })
        .then((res) => {
          this.resendRows = res.data.data || []
          this.resendVisible = true
        })
        .catch(() => {})
        .finally(() => {
          this.saveLoading = false
        })
    },
    _confirmEdit(resend, callback) {
      this.resendLoading = true
      $ApiService.contractService
        ._update({
          id: this.editId,
          data: { ...this.buildData(), form_state: this.snapshotFormState(), ...resend }
        })
        .then(() => {
          this.resendVisible = false
          this.visible = false
          this.editId = null
          this._index()
          callback?.()
        })
        .catch(() => {})
        .finally(() => {
          this.resendLoading = false
        })
    },
    resetForm() {
      // Tahrirdan keyin yangi shartnoma ochilsa — tahrir rejimi va tiklangan xodim qolmasin.
      if (this.editId) {
        const compStore = useComponentStore()
        compStore.worker = null
        compStore.isSelectedWorker = false
      }
      // Oldingi shartnomaning kelishuvchilari, tartib turi va tanlangan bo'limlari
      // yangi shartnomaga o'tmasin (bekor qilingan, saqlangan yoki tahrirlangan bo'lsa ham).
      this.sortableConfirmations = []
      this.structureCheck = []
      this.departmentCheck = []
      this.oneByOne = false
      this.editId = null
      this.editCommandType = null
      const now = new Date().getTime()
      this.payload.pin = null
      this.payload.organization_id = []
      this.payload.contract_date = now
      this.payload.number = null
      this.payload.table_number = null
      this.payload.type = null
      // this.payload.director_id = null
      this.payload.department_id = []
      this.payload.department_position_id = null
      this.payload.position_status = true
      this.payload.salary = null
      this.payload.position_id = null
      this.payload.group = 1
      this.payload.rank = null
      this.payload.rate = 1
      this.payload.command_status = true
      this.payload.probation = null
      this.payload.position_date = now
      this.payload.vacation_main_day = '21'
      this.payload.additional_vacation_day = '4'
      this.payload.schedule_id = null
      this.payload.command_type = null
      // this.payload.files = []
      this.payload.contract_to_date = null

      // Buyruq sanasi sukut bo'yicha shartnoma sanasi bilan bir xil.
      this.payload.command_date = now
      this.payload.command_number = null
      this.payload.temporary_worker_id = null
      this.payload.confirmations = []
      this.payload.competition_decision_date = null
      this.payload.competition_decision_number = null
      this.payload.work_day = null
      this.payload.week_days = null
      this.payload.start_time = null
      this.payload.end_time = null
    }
  }
}

export const useContractStore = defineStore('contractStore', storeOptions)
export const useContractEditStore = defineStore('contractEditStore', storeOptions)
