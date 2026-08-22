import { defineStore } from 'pinia'
import { dashboardMock, detailMock } from '@/pages/hrm/dashboard/mock.js'
import { mergeMock, hasApiValue } from '@/pages/hrm/dashboard/merge.js'
import {
  combine,
  fromLegacyOne,
  fromLegacyTwo,
  fromLegacyThree
} from '@/pages/hrm/dashboard/adapter.js'

/**
 * Bob (tab) nomlari va kontrakt bo'limlari nomlari bir xil emas: Umumiy bobning
 * id'si `general`, `dashboard-api.md` dagi bo'lim esa `overview`. `tabData` va
 * `isMock` ikkalasini ham qabul qilishi uchun kalit shu jadval orqali o'giriladi.
 */
const DATA_KEY = {
  general: 'overview',
  movement: 'movement',
  attendance: 'attendance'
}

const dataKey = (tab) => DATA_KEY[tab] || tab

export const useDashboardStore = defineStore('dashboardStore', {
  state: () => ({
    structureModel: [],
    structureCheck: [],
    loading: false,
    loadingTwo: false,
    activeDetail: null,
    payload: {
      pin: null,
      position: null
    },
    defaultParams: {
      page: 1,
      per_page: 15,
      search: null,
      age_start: 1,
      age_end: 100,
      ages: [1, 100],
      sex: null,
      type: null,
      year: new Date().getFullYear(),
      month: null,
      birth_day: new Date().getDate(),
      birth_month: new Date().getMonth() + 1,
      // Passport state filter possible values were: expired, approaching, not_included
      filter: null
    },
    params: {
      organizations: [],
      page: 1,
      per_page: 15,
      search: null,
      year: new Date().getFullYear(),
      month: null,
      age_start: 1,
      age_end: 100,
      ages: [1, 100],
      sex: null,
      type: null,
      birth_day: null,
      birth_month: null,
      filter: null
    },
    detailData: null,
    detailDataTotal: 0,
    detailLoading: false,
    /**
     * Backenddan kelgan ma'lumot `dashboard-api.md` kontrakt shaklida
     * (`adapter.js` o'giradi). Kartalar bunga to'g'ridan-to'g'ri emas,
     * `overview` / `movement` / `attendance` getterlari orqali murojaat
     * qiladi — ular mock ustiga real qiymatlarni yozib beradi.
     */
    api: {
      overview: null,
      movement: null,
      attendance: null,
      // Kontraktga kirmagan, ammo hozircha kartalarga kerak bo'lgan maydonlar
      // (pasport/tibbiy ko'rik muddatlari, oylik shartnoma dinamikasi).
      legacy: null
    },
    skipReset: true,
    passportPayload: {
      worker_id: null,
      serial_number: null,
      from_date: null,
      to_date: null,
      address: null,
      file: null
    },
    visible: false,
    elementId: null,
    selectedFile: null,
    workerId: null,
    loadingPassport: false,
    typeNames: ['med_type', 'disc_type', 'inc_type', 'contract_type'],
    // HR audit tab — data-quality counts + tur bo'yicha sahifa ichidagi detal ko'rinishi.
    activeTab: 'general',
    audit: {
      counts: null,
      loading: false,
      detail: {
        type: null,
        list: [],
        total: 0,
        page: 1,
        per_page: 15,
        loading: false
      }
    }
  }),
  getters: {
    // Mock ustiga API qiymatlari yozilgan, kontrakt shaklidagi bob ma'lumoti.
    overview: (state) => mergeMock(dashboardMock.overview, state.api.overview),
    movement: (state) => mergeMock(dashboardMock.movement, state.api.movement),
    attendance: (state) => mergeMock(dashboardMock.attendance, state.api.attendance),

    // Kontraktga kirmagan legacy maydonlar (pasport/tibbiy ko'rik, oylik dinamika).
    legacy: (state) => state.api.legacy || {},

    /** Bob nomi bo'yicha birlashtirilgan ma'lumot (`general` ham, `overview` ham). */
    tabData() {
      return (tab) => this[dataKey(tab)] || {}
    },

    /**
     * Vidjet ma'lumoti mock'dan olinganmi? Kartadagi "mock" chipini shu
     * boshqaradi: backend maydonni bergan zahoti chip o'zi yo'qoladi.
     * `path` — kartaning haqiqatan o'qiydigan yo'li, masalan `education.levels`.
     */
    isMock: (state) => (tab, path) => !hasApiValue(state.api[dataKey(tab)], path)
  },
  actions: {
    _updatePassport(data) {
      this.loadingPassport = true
      $ApiService.passportService
        ._update({ data, id: this.elementId, params: { _method: 'PUT' } })
        .then((res) => {
          this._index_detail()
          this.visible = false
        })
        .finally(() => {
          this.loadingPassport = false
        })
    },
    async _dashboard(isUpdateCache) {
      this.loading = true
      let params = {}
      if (isUpdateCache) {
        params.cache = 'update'
      }
      params = this.appendParams(params)

      const [responseOne, responseTwo, responseThree] = await Promise.all([
        $ApiService.dashboardService._index({ params }),
        $ApiService.dashboardService._indexTwo({ params }),
        $ApiService.dashboardService._indexThree({ params })
      ])
      this.api = combine(
        fromLegacyOne(responseOne),
        fromLegacyTwo(responseTwo),
        fromLegacyThree(responseThree)
      )
      this.loading = false
    },
    // Audit tab — data-quality counts (5 cards). Org filter (top Filter) reused.
    async _getAuditCounts() {
      this.audit.loading = true
      try {
        const params = this.appendParams({})
        const res = await $ApiService.dashboardService._auditCounts({ params })
        this.audit.counts = res.data.data
      } finally {
        this.audit.loading = false
      }
    },
    async _getAuditPreview() {
      const d = this.audit.detail
      d.loading = true
      try {
        const params = this.appendParams({
          type: d.type,
          page: d.page,
          per_page: d.per_page,
          search: this.params.search
        })
        const res = await $ApiService.dashboardService._auditPreview({ params })
        d.list = res.data.data.data
        d.total = res.data.data.total
      } finally {
        d.loading = false
      }
    },
    // Audit tab qatorida tur almashganda chaqiriladi.
    selectAuditType(type) {
      // Qidiruv har safar toza boshlanadi; tashkilot filtri (params.organizations) saqlanadi.
      this.params.search = null
      this.audit.detail.type = type
      this.audit.detail.page = 1
      this.audit.detail.list = []
      this.audit.detail.total = 0
      this._getAuditPreview()
    },
    resetAuditDetail() {
      this.audit.detail.type = null
      this.audit.detail.list = []
      this.audit.detail.total = 0
      this.audit.detail.page = 1
    },
    /**
     * Backend endpointi hali yo'q kartalar `mockKey` bilan ro'yxatga olinadi —
     * ularning "Batafsil" jadvali `mock.js` dagi qatorlardan mijoz tomonida
     * sahifalanadi. Endpoint paydo bo'lgach `constants.js` da `mockKey` o'rniga
     * `filterCallback` beriladi va bu tarmoq ishlamay qoladi.
     */
    _mockDetail() {
      const source = detailMock[this.activeDetail.mockKey]
      const rows = source?.rows || []
      const page = this.params.page || 1
      const perPage = this.params.per_page || 15
      const search = (this.params.search || '').trim().toLowerCase()

      const filtered = search
        ? rows.filter((row) =>
            `${row.worker?.last_name || ''} ${row.worker?.first_name || ''} ${row.organization?.name || ''}`
              .toLowerCase()
              .includes(search)
          )
        : rows

      this.detailData = filtered.slice((page - 1) * perPage, page * perPage)
      this.detailDataTotal = filtered.length
      this.detailLoading = false
    },
    _index_detail() {
      if (this.activeDetail?.mockKey) {
        this._mockDetail()
        return
      }
      if (!this.activeDetail?.filterCallback) throw new Error('No detail filter callback set')
      this.detailLoading = true
      let params = {
        search: this.params.search,
        page: this.params.page,
        per_page: this.params.per_page
      }
      this.activeDetail.filters.map((i) => {
        if (i === 'ages') {
          params.age_start = this.params.age_start
          params.age_end = this.params.age_end
        } else if (this.typeNames.includes(i)) {
          params.type = this.params.type
        } else {
          params[i] = this.params[i]
        }
      })
      params = this.appendParams(params)
      this.activeDetail
        ?.filterCallback({ params })
        .then((res) => {
          this.detailData = res.data.data.data
          this.detailDataTotal = res.data.data.total
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    _birthdayDetail() {},
    _ageDetail() {},

    _show() {
      this.loading = true
      $ApiService.workerService
        ._index({ id: this.elementId })
        .then((res) => {})
        .finally(() => {
          this.loading = false
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
    // Helper for appending parent params to other children
    appendParams(params) {
      return {
        ...params,
        organizations: this.params.organizations.length
          ? this.params.organizations.map((i) => i.id).join(',')
          : undefined
      }
    },
    resetDetailData() {
      this.params = {
        ...this.params,
        ...this.defaultParams
      }

      this.detailData = null
      this.detailDataTotal = 0
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.pin = null
      this.payload.position = null
    },
    resetPassportForm() {
      this.selectedFile = null
      this.passportPayload.file = null
      this.passportPayload.serial_number = null
      this.passportPayload.from_date = null
      this.passportPayload.to_date = null
      this.passportPayload.address = null
    }
  }
})
