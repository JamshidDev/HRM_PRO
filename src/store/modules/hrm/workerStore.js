import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useWorkerStore = defineStore('workerStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    // Parolni yangilash modali (Qo'shimchalar → Foydalanuvchilar bilan bir xil).
    passwordVisible: false,
    passwordLoading: false,
    passwordWorkerUuid: null,
    // Rollar modali: biriktirish (header) + joriy rollar ro'yxati (delete bilan).
    rolesVisible: false,
    rolesLoading: false,
    rolesSaving: false,
    rolesWorkerUuid: null,
    rolesUserUuid: null,
    rolesList: [],
    rolePayload: { role: null, organization_id: [] },
    roleStructureCheck: [],
    payload: {
      pin: null,
      position: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      departments: [],
      birthday: null,
      contract_type: null,
      position_type: null,
      // Hisoblash kesimi: 'position' (standart) — lavozim bo'yicha; 'worker' — xodim bo'yicha.
      count_by: 'position',
      ages: [1, 100],
      positions: [],
      sex: null,
      nationalities: [],
      educations: [],
      country_id: null,
      region_id: null,
      city_id: null,
      current_region_id: null,
      current_city_id: null,
      marital_status: null,
      first_name: null,
      last_name: null,
      middle_name: null,
      multiple_position: false,
      pension_age: false
    },
    structureCheck: [],
    workerVisible: false,

    districtLoading: false,
    districtList: [],

    currentDistrictLoading: false,
    currentDistrictList: [],
    userRoleVisible: false,

    filterPosParams: {
      page: 1,
      per_page: 500,
      search: null
    },
    filterPositionList: [],
    filterPositionLoading: false,
    filterPositionTotal: 0,

    filterDepParams: {
      page: 1,
      per_page: 500,
      search: null
    },
    filterDepartmentList: [],
    filterDepartmentLoading: false,
    filterDepartmentTotal: 0
  }),
  actions: {
    _workerRoles() {
      this.rolesLoading = true
      $ApiService.workerService
        ._workerRoles({ uuid: this.rolesWorkerUuid })
        .then((res) => {
          const data = res.data.data || {}
          this.rolesUserUuid = data.user_uuid || null
          this.rolesList = data.roles || []
        })
        .finally(() => {
          this.rolesLoading = false
        })
    },
    // Rol biriktirish — «Qo'shimchalar → Foydalanuvchilar» dagi AYNAN o'sha
    // endpoint (`/extra/users/attach-role`, USER uuid bilan): u rollarni JAMLAB
    // boradi. `worker-positions/edit/attach-role` esa boshqa semantikada —
    // korxonadagi mavjud rolni almashtiradi, shu sabab ro'yxat o'smasdi.
    // ⚠️ `componentStore.roles` da `id` — rolning NOMI ('Finance'), `name` —
    // tarjima ('Buxgalter'); shuning uchun `role` (nom) yuboriladi.
    _attachWorkerRole() {
      this.rolesSaving = true
      const data = {
        uuid: this.rolesUserUuid,
        role: this.rolePayload.role,
        organization_id: Number(this.rolePayload.organization_id?.[0]?.id)
      }
      $ApiService.workerService
        ._attachUserRole({ data })
        .then(() => {
          this.rolePayload.role = null
          this._workerRoles()
          this._index()
        })
        .finally(() => {
          this.rolesSaving = false
        })
    },
    // Rolni olib tashlash — `edit/detach-role`, (rol + korxona) juftligi bo'yicha.
    _detachWorkerRole(row) {
      this.rolesSaving = true
      // Attach bilan bir juft: `/extra/users/detach-role` (USER uuid).
      // `row.name` — rolning XOM nomi (`roles.name`), backend shu bo'yicha topadi.
      const data = {
        uuid: this.rolesUserUuid,
        role: row.name,
        organization_id: row.organization?.id
      }
      $ApiService.workerService
        ._detachUserRole({ data })
        .then(() => {
          this._workerRoles()
          this._index()
        })
        .finally(() => {
          this.rolesSaving = false
        })
    },
    // «Parolni yangilash» — modal `PasswordUpdateModal` dan tayyor parol beradi.
    // Backend `hr-workers-password` bilan gate qiladi va parol talablarini
    // qayta tekshiradi (frontend tekshiruvi faqat qulaylik uchun).
    _updateWorkerPassword(password) {
      this.passwordLoading = true
      $ApiService.workerService
        ._updateWorkerPassword({
          uuid: this.passwordWorkerUuid,
          data: { password }
        })
        .then((res) => {
          window.$message?.success(res.data?.message)
          this.passwordVisible = false
          this.passwordWorkerUuid = null
        })
        .finally(() => {
          this.passwordLoading = false
        })
    },
    _getFilterDepartments() {
      const params = {
        ...this.filterDepParams,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      this.filterDepartmentLoading = true
      $ApiService.componentService
        ._departmentByOrganizations({ params })
        .then((res) => {
          const values = this.params.departments
          const selectedItems = this.filterDepartmentList.filter((v) => values.includes(v.id))
          const data = res.data.data.data.map((v) => ({
            ...v,
            position: v?.organization?.name
          }))
          this.filterDepartmentTotal = res.data.data.total
          this.filterDepartmentList = [
            ...new Map([...selectedItems, ...data].map((v) => [v.id, v])).values()
          ]
        })
        .finally(() => {
          this.filterDepartmentLoading = false
        })
    },
    _getFilterPositions() {
      const params = {
        ...this.filterPosParams,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        departments: this.params.departments.toString() || undefined
      }
      this.filterPositionLoading = true
      $ApiService.positionService
        ._filterIndex({ params })
        .then((res) => {
          const values = this.params.positions
          const selectedItems = this.filterPositionList.filter((v) => values.includes(v.id))
          const data = res.data.data.data
          this.filterPositionTotal = res.data.data.total
          this.filterPositionList = [
            ...new Map([...selectedItems, ...data].map((v) => [v.id, v])).values()
          ]
        })
        .finally(() => {
          this.filterPositionLoading = false
        })
    },
    // `workerIds` — jadvalda checkbox bilan tanlangan qatorlar (`worker_positions.id`).
    // Bo'sh bo'lsa filtrlangan ro'yxatning HAMMASI yuklanadi (boshqa eksportlar bilan
    // bir xil qoida). Eksport fonda navbatga qo'yiladi — foydalanuvchi shu sahifada
    // qoladi (ilgari majburan «Eksportlar» sahifasiga o'tkazardi).
    _downloadRelative(workerIds = []) {
      this.loading = true
      const ids = Array.isArray(workerIds) ? workerIds : []
      const data = {
        query: {
          ...this._params(),
          ...(ids.length > 0 ? { worker_ids: ids } : {})
        }
      }
      $ApiService.workerService
        ._downloadRelative({ data })
        .finally(() => {
          this.loading = false
        })
    },
    _index() {
      this.loading = true
      let params = this._params()
      $ApiService.workerService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _show() {
      this.loading = true
      $ApiService.workerService
        ._index({ id: this.elementId })
        .then((res) => {})
        .finally(() => {
          this.loading = false
        })
    },
    changeRegion(v) {
      this.districtLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id: v } })
        .then((res) => {
          this.districtList = res.data.data.data
        })
        .finally(() => {
          this.districtLoading = false
        })
    },
    changeCurrentRegion(v) {
      this.currentDistrictLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id: v } })
        .then((res) => {
          this.currentDistrictList = res.data.data.data
        })
        .finally(() => {
          this.currentDistrictLoading = false
        })
    },

    _create() {
      this.saveLoading = true
      let data = {
        uuid: this.payload.pin,
        position: this.payload.position
      }
      $ApiService.confirmationService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      let data = {
        uuid: this.payload.pin,
        position: this.payload.position
      }
      $ApiService.confirmationService
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
      $ApiService.confirmationService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    _params() {
      function cleanParams(params) {
        const cleaned = {}

        Object.entries(params).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0) &&
            !(typeof value === 'boolean' && value === false)
          ) {
            cleaned[key] = value
          }
        })

        return cleaned
      }

      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        nationalities: this.params.nationalities?.toString() || undefined,
        educations: this.params.educations?.toString() || undefined,
        departments: this.params.departments.toString() || undefined,
        positions: this.params.positions.toString() || undefined,
        ages: undefined,
        first_name: this.params.first_name || undefined,
        last_name: this.params.last_name || undefined,
        middle_name: this.params.middle_name || undefined,
        multiple_position: this.params.multiple_position || undefined,
        // Belgilansa `pension_age=1`, aks holda umuman yuborilmaydi (cleanParams
        // `undefined`ni tashlab yuboradi). Boolean `false` ham tozalanadi.
        pension_age: this.params.pension_age ? 1 : undefined
      }

      return cleanParams(params)
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.pin = null
      this.payload.position = null
    }
  }
})
