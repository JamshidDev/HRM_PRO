import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { useComponentStore } from '@/store/modules/index.js'

// Moddiy javobgarlik shartnomasi: ro'yxat, yaratish va tahrir (qayta imzolashga yuborish bilan).
export const useMaterialLiabilityStore = defineStore('materialLiabilityStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    visible: false,
    totalItems: 0,
    organization: [],
    structureCheck: [],
    payload: {
      worker_position_id: null,
      number: null,
      contract_date: null,
      director_id: null,
      work_description: null,
      assets: null,
      worker_obligations: null,
      employer_obligations: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      confirmation: null
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
      $ApiService.materialLiabilityService
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
        contract_date: Utils.timeToZone(this.payload.contract_date) || undefined,
        organization_id: this.organization?.[0]?.id ?? undefined
      }
      Utils.checkRequestBody(data)
      return data
    },
    _create() {
      this.saveLoading = true
      $ApiService.materialLiabilityService
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
      $ApiService.materialLiabilityService._delete({ id }).then(() => this._index())
    },
    openCreate() {
      this.resetForm()
      this.visible = true
    },
    // Tahrir: saqlangan qiymatlar tiklanadi; tasdiqlangan bo'lsa sababi ko'rsatiladi.
    _openEdit(id, onLocked) {
      $ApiService.materialLiabilityService._form({ id }).then((res) => {
        const form = res.data.data
        if (!form.editable) return onLocked?.(form.edit_block)
        this.resetForm()
        const compStore = useComponentStore()
        Object.assign(this.payload, {
          ...form.form,
          contract_date: form.form.contract_date ? new Date(form.form.contract_date).getTime() : null
        })
        this.organization = form.organization_option ? [form.organization_option] : []
        compStore.workerParams.organization_id = form.organization_option?.id ?? null
        compStore.workerList = form.worker_option ? [form.worker_option] : []
        // Saqlangan rahbar joriy ro'yxatda bo'lmasa (boshqa sahifa/korxona) — yorlig'i uchun qo'shiladi.
        const director = form.director_option
        if (director && !compStore.confirmationList.some((v) => v.id === director.id)) {
          compStore.confirmationList = [director, ...compStore.confirmationList]
        }
        this.editId = id
        this.visible = true
      })
    },
    _submitEdit() {
      this.saveLoading = true
      $ApiService.materialLiabilityService
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
      $ApiService.materialLiabilityService
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
    resetForm() {
      this.editId = null
      this.organization = []
      this.structureCheck = []
      this.payload = {
        worker_position_id: null,
        number: null,
        contract_date: new Date().getTime(),
        director_id: this.payload.director_id,
        work_description: null,
        assets: null,
        worker_obligations: null,
        employer_obligations: null
      }
    }
  }
})
