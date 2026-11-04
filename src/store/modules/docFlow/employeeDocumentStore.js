import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { useComponentStore } from '@/store/modules/index.js'
import { DOCUMENT_TYPES } from '@/pages/docFlow/document/employeeDocuments/documentTypes.js'

const DEFAULT_TYPE = 'material-liability'

const emptyPayload = (type, directorId = null) => ({
  type,
  worker_position_id: null,
  number: null,
  document_date: new Date().getTime(),
  director_id: directorId,
  confirmations: [],
  data: DOCUMENT_TYPES[type]?.emptyData() ?? {}
})

// Xodim hujjatlari: ro'yxat, tur tanlab yaratish va tahrir (qayta imzolashga yuborish bilan).
export const useEmployeeDocumentStore = defineStore('employeeDocumentStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    visible: false,
    totalItems: 0,
    organization: [],
    structureCheck: [],
    payload: emptyPayload(DEFAULT_TYPE),
    // Kelishuvchilar tartibi (UISignerList) va yuborish rejimi.
    sortableConfirmations: [],
    oneByOne: false,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      confirmation: null,
      type: null
    },
    editId: null,
    resendVisible: false,
    resendRows: [],
    resendLoading: false
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString()
      }
      $ApiService.employeeDocumentService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    buildData() {
      const data = {
        ...this.payload,
        number: this.payload.number?.trim() || undefined,
        document_date: Utils.timeToZone(this.payload.document_date) || undefined,
        organization_id: this.organization?.[0]?.id ?? undefined,
        data: DOCUMENT_TYPES[this.payload.type]?.toPayload?.(this.payload.data) ?? this.payload.data,
        confirmations: this.sortableConfirmations.map((v, idx) => ({
          id: v.id,
          order: this.oneByOne ? idx + 1 : 1
        }))
      }
      Utils.checkRequestBody(data)
      return data
    },
    _create() {
      this.saveLoading = true
      $ApiService.employeeDocumentService
        ._create({ data: this.buildData() })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(id) {
      $ApiService.employeeDocumentService._delete({ id }).then(() => this._index())
    },
    openCreate() {
      this.resetForm(this.payload.type)
      this.visible = true
    },
    // Tur almashsa faqat turga xos maydonlar tozalanadi.
    changeType(type) {
      this.payload.type = type
      this.payload.data = DOCUMENT_TYPES[type]?.emptyData() ?? {}
    },
    // Tahrir: saqlangan qiymatlar tiklanadi; tasdiqlangan bo'lsa sababi ko'rsatiladi.
    _openEdit(id, onLocked) {
      $ApiService.employeeDocumentService._form({ id }).then((res) => {
        const form = res.data.data
        if (!form.editable) return onLocked?.(form.edit_block)
        this.resetForm(form.type)
        const compStore = useComponentStore()
        const f = form.form
        Object.assign(this.payload, {
          type: f.type,
          worker_position_id: f.worker_position_id,
          number: f.number,
          director_id: f.director_id,
          document_date: f.document_date ? new Date(f.document_date).getTime() : null,
          data: (DOCUMENT_TYPES[f.type]?.fromForm ?? ((d) => d))({
            ...(DOCUMENT_TYPES[f.type]?.emptyData() ?? {}),
            ...(f.data ?? {})
          })
        })
        this.organization = form.organization_option ? [form.organization_option] : []
        compStore.workerParams.organization_id = form.organization_option?.id ?? null
        compStore.workerList = form.worker_option ? [form.worker_option] : []
        // Saqlangan rahbar/kelishuvchilar joriy ro'yxatda bo'lmasa — yorlig'i uchun qo'shiladi.
        const extra = [form.director_option, ...(form.approver_options ?? [])].filter(
          (o) => o && !compStore.confirmationList.some((v) => v.id === o.id)
        )
        if (extra.length) compStore.confirmationList = [...extra, ...compStore.confirmationList]
        this.payload.confirmations = (form.approver_options ?? []).map((o) => o.id)
        this.sortableConfirmations = (form.approver_options ?? []).map((o) => ({
          id: o.id,
          data: {
            firstName: o.first_name,
            lastName: o.last_name,
            middleName: o.middle_name,
            photo: o.photo,
            position: o.position || ''
          }
        }))
        this.oneByOne = Boolean(form.one_by_one)
        this.editId = id
        this.visible = true
      })
    },
    _submitEdit() {
      this.saveLoading = true
      $ApiService.employeeDocumentService
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
      $ApiService.employeeDocumentService
        ._update({ id: this.editId, data: { ...this.buildData(), ...resend } })
        .then(() => {
          this.resendVisible = false
          this.visible = false
          this.editId = null
          this._index()
        })
        .catch(() => {})
        .finally(() => {
          this.resendLoading = false
        })
    },
    resetForm(type = DEFAULT_TYPE) {
      this.editId = null
      this.organization = []
      this.structureCheck = []
      this.sortableConfirmations = []
      this.oneByOne = false
      this.payload = emptyPayload(type, this.payload.director_id)
    }
  }
})
