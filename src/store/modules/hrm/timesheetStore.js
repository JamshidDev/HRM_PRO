import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import dayjs from 'dayjs'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global
export const useTimesheetStore = defineStore('timesheetStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    closeLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    visibleLoading: false,
    warningVisible: false,
    sendVisible: false,
    totalItems: 0,
    allPermissionList: [],
    structureCheck: [],
    detail: null,
    // Korxona `UISelect` (struktura daraxti) bilan tanlanadi — buyruq formasidagi kabi.
    selectedOrganizations: [],
    payload: {
      work_place_id: undefined,
      year: dayjs().year(),
      month: dayjs().month() + 1
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: []
    },
    structureCheck2: []
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.timesheetService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      $ApiService.timesheetService
        ._create({ data: { ...this.payload } })
        .then((res) => {
          this.visible = false
          this._index()
          this.resetForm()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.timesheetService
        ._update({ data: { ...this.payload }, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
          this.resetForm()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // Tasdiqlashga yuborish: shundan keyin tabel to'ldirish uchun yopiladi.
    _send() {
      this.saveLoading = true
      $ApiService.timesheetService
        ._send({ id: this.elementId })
        .then(() => {
          this.sendVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // Tabel o'chirilsa oyning to'ldirilgan kunlari ham o'chadi (backend cascade).
    _delete() {
      this.deleteLoading = true
      $ApiService.timesheetService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    _closeTimesheet() {
      this.saveLoading = true
      $ApiService.timesheetService
        ._accept({ data: { active: false }, id: this.elementId })
        .then((res) => {
          this.warningVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    setOrganization(list) {
      this.selectedOrganizations = list ?? []
      this.payload.work_place_id = list?.[0]?.id
      this.structureCheck = list?.[0]?.id ? [list[0].id] : []
    },
    // Yangi tabel odatda joriy oyga ochiladi — default shu.
    resetForm() {
      this.selectedOrganizations = []
      this.structureCheck = []
      this.payload.work_place_id = undefined
      this.payload.year = dayjs().year()
      this.payload.month = dayjs().month() + 1
    }
  }
})
