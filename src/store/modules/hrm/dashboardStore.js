import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
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
    dashboard: {
      contractTypes: [],
      mainCard: [],
      genders: null,
      ageCard: [],
      eduCard: [],
      passwordCard: null,
      pensionCard: null,
      medicalCard: null,
      contracts: [],
      birthdays: null,
      vacations: [],
      disabilityCard: null
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
      this._responseOneAttach(responseOne)
      this._responseTwoAttach(responseTwo)
      this._responseThreeAttach(responseThree)
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
    _responseOneAttach(res) {
      const formatMonth = (date) => {
        let day = date.split('-')[1]
        let month = Utils.getMonthNameByKey(date.split('-')[0])
        return `${day} - ${month}`
      }

      const v = res.data.data
      this.dashboard.contractTypes = v.contract_types
      this.dashboard.genders = { man: v.mans_count, woman: v.woman_count }
      // `variant` — Figma v3 KPI kartasidagi chip/suv belgisi to'plamini tanlaydi.
      this.dashboard.mainCard = [
        {
          variant: 'users',
          total: {
            title: 'dashboardPage.mainCard.totalWorker',
            count: v.workers_count
          },
          data1: {
            title: 'dashboardPage.mainCard.man',
            count: v.mans_count
          },
          data2: {
            title: 'dashboardPage.mainCard.woman',
            count: v.woman_count
          }
        },
        {
          variant: 'pension',
          total: {
            title: 'dashboardPage.pension.title',
            count: v.retired_men_count + v.retired_women_count
          },
          data1: {
            title: 'dashboardPage.pension.men',
            count: v.retired_men_count
          },
          data2: {
            title: 'dashboardPage.pension.women',
            count: v.retired_women_count
          }
        },
        {
          variant: 'positions',
          total: {
            title: 'dashboardPage.position.title',
            count: v.positions_rate
          },
          data1: {
            title: 'dashboardPage.position.vakant',
            count: parseFloat(Math.max(v.positions_rate - v.worker_positions_rate, 0).toFixed(2))
          },
          data2: {
            title: 'dashboardPage.position.sverx',
            count: parseFloat(Math.max(v.worker_positions_rate - v.positions_rate, 0).toFixed(2))
          }
        },
        {
          variant: 'fxsh',
          total: {
            title: 'dashboardPage.mainCard.fxsh',
            count: v.fxsh_count
          },
          data1: {
            title: 'dashboardPage.mainCard.man',
            count: v.fxsh_mans_count
          },
          data2: {
            title: 'dashboardPage.mainCard.woman',
            count: v.fxsh_woman_count
          }
        }
      ]
      this.dashboard.ageCard = [
        {
          title: 'dashboardPage.age.age31',
          count: v.age_30_and_younger
        },
        {
          title: 'dashboardPage.age.age32_45',
          count: v.age_31_to_45
        },
        {
          title: 'dashboardPage.age.age46',
          count: v.age_46_and_older
        }
      ]
      this.dashboard.eduCard = [
        {
          title: 'dashboardPage.edu.higher',
          count: v.higher_edu_count
        },
        {
          title: 'dashboardPage.edu.middle',
          count: v.middle_edu_count
        },
        {
          title: 'dashboardPage.edu.special',
          count: v.special_edu_count
        }
      ]
      this.dashboard.passwordCard = {
        title: 'dashboardPage.password.title',
        data: [
          {
            title: 'dashboardPage.password.deadline',
            count: v.passports_count
          },
          {
            title: 'dashboardPage.password.expired',
            count: v.passports_more_count
          }
        ]
      }
      this.dashboard.pensionCard = {
        title: 'dashboardPage.pension.title',
        data: [
          {
            title: 'dashboardPage.pension.men',
            count: v.retired_men_count
          },
          {
            title: 'dashboardPage.pension.women',
            count: v.retired_women_count
          }
        ]
      }
      this.dashboard.contracts = v.contracts
      this.dashboard.vacations = v.vacation_types
      // Maketda (node 2966:68947) har bir qator "sana + izoh + soni + avatarlar"
      // ko'rinishida: birinchi ikkitasida izoh bor, qolganlarida faqat sana.
      const labels = [t('dashboardPage.birthday.today'), t('dashboardPage.birthday.tomorrow')]
      this.dashboard.birthdays = {
        title: 'dashboardPage.birthday.title',
        data: (v.birthdays?.result || []).map((item, idx) => ({
          day: formatMonth(item.day),
          label: labels[idx] || null,
          total: item.count,
          // `UIUserGroup` "+N" ni faqat ro'yxat `max` dan uzun bo'lsagina chizadi,
          // shuning uchun qoldiq bor paytda ro'yxat sun'iy uzaytiriladi.
          workers: item.count > 3 ? [...item.workers, ...item.workers] : item.workers,
          has_more: item.has_more
        }))
      }
    },
    _responseTwoAttach(res) {
      const v = res.data.data
      this.dashboard.incentivesCount = v.incentives
      this.dashboard.incentivesGiftCount = v.incentive_actions_gift_type
      this.dashboard.disciplinaryCount = v.disciplinary_actions
      this.dashboard.disciplinaryFineCount = v.disciplinary_actions_fine_type
      this.dashboard.medFinishedCound = v.meds_finished
      this.dashboard.medApproachCount = v.meds_approaching

      this.dashboard.medicalCard = {
        title: 'dashboardPage.medical.title',
        data: [
          {
            title: 'dashboardPage.medical.deadline',
            count: v.meds_approaching || 0
          },
          {
            title: 'dashboardPage.medical.expired',
            count: v.meds_finished || 0
          }
        ]
      }
    },
    _responseThreeAttach(res) {
      const v = res.data.data
      this.dashboard.disabilityCard = {
        workerDisability: v.worker_disabilities,
        relativeDisability: v.worker_relative_disabilities,
        sickLeave: v.worker_sick_leaves
      }
    },
    _index_detail() {
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
