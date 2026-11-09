import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { loadLiveRouteSequential } from '@/utils/liveRouteMode.js'
import { useComponentStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'

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
    organization: [],
    number: null,
    payload: {
      worker_position_id: null,
      contract_date: null,
      number: null,
      command_status: false,
      command_type: null,
      type: null,
      director_id: null,
      organization_id: [],
      department_id: [],
      department_position_id: null,
      position_status: false,
      salary: null,
      position_id: null,
      group: null,
      rank: null,
      rate: null,
      // post_name:null,
      schedule_id: null,

      command_date: null,
      command_number: null,
      confirmations: [],
      finance_id: null,
      position_date: null,
      contract_to_date: null,
      // 1-tur: o'zgartirish bandlari (ixtiyoriy)
      changes: null,
      // 14-tur: FXSH shartnoma rekvizitlari, sabab; buyruq 80 uchun shartnoma turi va kadrlar mas'uli.
      civil_contract_number: null,
      civil_contract_date: null,
      cancel_reason: null,
      civil_contract_kind: null,
      hr_worker_position_id: null,
      hr_option: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      created: null,
      confirmation: null
    },
    structureList: [],
    structureLoading: false,
    structureParams: {
      page: 1,
      per_page: 1000,
      search: null
    },

    sortableConfirmations: [],
    // Yangi hujjatda kelishuvchilar sukut bo'yicha parallel imzolaydi.
    oneByOne: false,
    // Tahrir rejimi: kelishuv id, tiklangan buyruq turi va qayta yuborish modali.
    editId: null,
    editCommandType: null,
    resendVisible: false,
    resendRows: [],
    resendLoading: false
  }),
  actions: {
    _getStructures() {
      this.structureLoading = true
      $ApiService.componentService
        ._structure({ params: this.structureParams })
        .then((res) => {
          this.structureList = res.data.data
        })
        .finally(() => {
          this.structureLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString(),
        created: Utils.timeToZone(this.params.created)
      }
      $ApiService.adContractService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 14-tur maydonlari faqat shu turda yuboriladi; 80 maydonlari faqat buyruq bilan.
    civilCancelData() {
      const p = this.payload
      if (p.type !== 14) {
        return {
          civil_contract_number: undefined,
          civil_contract_date: undefined,
          cancel_reason: undefined,
          civil_contract_kind: undefined,
          hr_worker_position_id: undefined
        }
      }
      const withCommand = Boolean(p.command_status)
      return {
        civil_contract_number: p.civil_contract_number?.trim() || undefined,
        civil_contract_date: Utils.timeToZone(p.civil_contract_date) || undefined,
        cancel_reason: p.cancel_reason || undefined,
        civil_contract_kind: withCommand ? p.civil_contract_kind || undefined : undefined,
        hr_worker_position_id: withCommand ? p.hr_worker_position_id || undefined : undefined
      }
    },
    // Yaratish va tahrir uchun bir xil so'rov ma'lumoti.
    buildData() {
      const data = {
        ...this.payload,
        ...{
          position_date: Utils.timeToZone(this.payload.position_date) || undefined,
          command_date: Utils.timeToZone(this.payload.command_date) || undefined,
          contract_date: Utils.timeToZone(this.payload.contract_date) || undefined,
          contract_to_date: Utils.timeToZone(this.payload.contract_to_date) || undefined,
          changes: this.payload.type === 1 ? this.payload.changes?.trim() || undefined : undefined,
          ...this.civilCancelData(),
          hr_option: undefined,
          organization_id:
            this.payload.organization_id.length > 0
              ? this.payload.organization_id[0].id
              : undefined,
          worker_position_id: this.payload.worker_position_id,
          director_id: this.payload.director_id,
          finance_id: this.payload.finance_id || undefined,
          department_id:
            this.payload.department_id.length > 0 ? this.payload.department_id[0].id : undefined,
          confirmations: this.sortableConfirmations.map((v, idx) => ({
            id: v.id,
            order: this.oneByOne ? idx + 1 : 1
          }))
        }
      }

      Utils.checkRequestBody(data)
      return data
    },
    _create(callBack) {
      this.saveLoading = true
      const data = { ...this.buildData(), form_state: this.snapshotFormState() }
      $ApiService.adContractService
        ._create({ data })
        .then((res) => {
          this.visible = false
          if (callBack === null) {
            this._index()
          }
          callBack?.()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.adContractService
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
        model: Utils.documentModels.adContract,
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
      $ApiService.adContractService
        ._create({ data: formData })
        .then((res) => {
          this.visible = false
          callback?.()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    // Forma holati — tahrirda formani aynan shu holatda tiklash uchun backend'da saqlanadi.
    snapshotFormState() {
      const compStore = useComponentStore()
      const clone = (v) => JSON.parse(JSON.stringify(v ?? null))
      const strip = (list) => (list || []).map(({ children: _c, ...v }) => v)
      return {
        payload: {
          ...clone(this.payload),
          organization_id: strip(this.payload.organization_id),
          department_id: strip(this.payload.department_id),
          confirmations: this.sortableConfirmations.map((v) => v.id)
        },
        organization: strip(this.organization),
        structureCheck: clone(this.structureCheck),
        structureCheck2: clone(this.structureCheck2),
        departmentCheck: clone(this.departmentCheck),
        sortableConfirmations: clone(this.sortableConfirmations),
        oneByOne: this.oneByOne,
        workerOption: clone(
          compStore.workerList.find((v) => v.id === this.payload.worker_position_id) || null
        )
      }
    },
    restoreFormState(state) {
      const compStore = useComponentStore()
      Object.assign(this.payload, state.payload || {})
      this.organization = state.organization || []
      this.structureCheck = state.structureCheck || []
      this.structureCheck2 = state.structureCheck2 || []
      this.departmentCheck = state.departmentCheck || []
      // Backend tuzgan eski formalarda kelishuvchi maydonlari boshqa nomda (snake_case yoki `data`siz)
      // kelishi mumkin — ro'yxatda «undefined» chiqmasligi uchun bir xil shaklga keltiriladi.
      this.sortableConfirmations = (state.sortableConfirmations || []).map((v) => {
        const d = v?.data || v || {}
        return {
          ...v,
          data: {
            firstName: d.firstName ?? d.first_name ?? '',
            lastName: d.lastName ?? d.last_name ?? '',
            middleName: d.middleName ?? d.middle_name ?? '',
            photo: d.photo ?? null,
            position: (typeof d.position === 'object' ? d.position?.name : d.position) ?? d.post_name ?? ''
          }
        }
      })
      // Tartib saqlanmagan bo'lsa — yangi hujjatdagidek parallel (ilgari ketma-ket edi va parallel
      // hujjat tahrirdan keyin ketma-ketga aylanib qolardi). Joriy tartib keyin `_syncRouteMode` da olinadi.
      this.oneByOne = state.oneByOne ?? false
      // Xodim tanlovi yorlig'i va tur ro'yxati — saqlangan variantdan.
      const worker = state.workerOption
      compStore.workerList = worker ? [worker] : []
      compStore.workerParams.organization_id = this.organization?.[0]?.id ?? null
      if (worker) compStore._adContractType(worker.typeId ?? worker.contractTypeId)
      const orgId = this.payload.organization_id?.[0]?.id
      if (orgId) {
        compStore.depParams.organizations = orgId
        compStore._departmentTree()
      }
      const depId = this.payload.department_id?.[0]?.id
      if (depId) compStore._departmentPosition(depId)
    },
    // Tahrir ochilganda yuborish tartibi hujjatning joriy marshrutidan olinadi (aniqlansa).
    async _syncRouteMode(id) {
      const sequential = await loadLiveRouteSequential(Utils.documentModels.adContract, id)
      if (sequential !== null) this.oneByOne = sequential
    },
    // Ro'yxatdan «Tahrirlash»: saqlangan forma tiklanib, tahrir rejimida ochiladi.
    _openEdit(id, onLocked) {
      $ApiService.adContractService._form({ id }).then((res) => {
        const form = res.data.data
        if (!form.editable) return onLocked?.(form.edit_block)
        this.resetForm()
        this.restoreFormState(form.form_state)
        this._syncRouteMode(id)
        this.editCommandType = this.payload.command_type
        this.editId = id
        this.visibleType = false
        this.visible = true
      })
    },
    _submitEdit() {
      this.saveLoading = true
      $ApiService.adContractService
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
    _confirmEdit(resend) {
      this.resendLoading = true
      $ApiService.adContractService
        ._update({
          id: this.editId,
          data: { ...this.buildData(), form_state: this.snapshotFormState(), ...resend }
        })
        .then(() => {
          this.resendVisible = false
          this.visible = false
          // To'liq tozalash: tahrirlangan kelishuv ma'lumoti keyingi yangi kelishuvga o'tmasin.
          this.resetForm()
          this._index()
        })
        .catch(() => {})
        .finally(() => {
          this.resendLoading = false
        })
    },
    resetForm() {
      // Tahrirdan keyin yangi kelishuv ochilsa — tahrir rejimi qolmasin.
      if (this.editId) {
        this.sortableConfirmations = []
        // Tanlangan kelishuvchilar ro'yxati ham tozalanadi — aks holda select'da eski
        // kelishuvchilar qolib, ro'yxat bo'sh bo'lgani uchun saqlashda `confirmations: []` ketardi.
        this.payload.confirmations = []
        this.oneByOne = false
        this.organization = []
        this.structureCheck = []
        this.structureCheck2 = []
        this.departmentCheck = []
      }
      this.editId = null
      this.editCommandType = null
      // this.payload.director_id = null
      // this.payload.confirmations = []

      this.payload.worker_position_id = null
      this.payload.contract_date = new Date().getTime()
      this.payload.number = null
      this.payload.type = null
      this.payload.command_status = true
      this.payload.command_type = null
      this.payload.organization_id = []
      this.payload.department_id = []
      this.payload.department_position_id = null
      this.payload.position_status = true
      this.payload.salary = null
      this.payload.position_id = null
      this.payload.group = null
      this.payload.rank = null
      this.payload.rate = 1
      // this.payload.post_name = null
      this.payload.schedule_id = null

      this.payload.command_date = new Date().getTime()
      this.payload.command_number = null
      this.payload.position_date = null
      this.payload.contract_to_date = new Date().getTime()
      this.payload.changes = null
      this.payload.civil_contract_number = null
      this.payload.civil_contract_date = null
      this.payload.cancel_reason = null
      this.payload.civil_contract_kind = null
      this.payload.hr_worker_position_id = null
      this.payload.hr_option = null
    }
  }
}

export const useAdContractStore = defineStore('adContractStore', storeOptions)
export const useAdContractEditStore = defineStore('adContractEditStore', storeOptions)
