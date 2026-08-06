import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global

const now = new Date()

export const useSalary1cStore = defineStore('salary1cStore', {
  state: () => ({
    // Filter
    params: {
      organization_id: null,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      page: 1,
      per_page: 20,
      search: null,
      matched: null // null=barchasi | 'out'=faqat tizimda yo'q | 'in'=faqat tizimda bor
    },

    // UISelect (org tree) uchun: tanlangan korxona(lar) va yoyilgan tugunlar
    selectedOrgs: [],
    structureCheck: [],

    // List (Oylik hisobot)
    list: [],
    total: 0,
    report: null,
    loading: false,
    pullLoading: false,

    // Payslip modal
    payslipVisible: false,
    payslip: null,
    payslipLoading: false,

    // Tarix modal
    historyVisible: false,
    history: [],
    historyLoading: false,
    historyEmp: null,

    // Versiya solishtirish (compare)
    compareSelection: [], // tanlangan versiya id'lari (max 2)
    compareVisible: false,
    compareLoading: false,
    compareData: null,

    // 1C kodi bor korxona id'lari (daraxtda belgi ko'rsatish uchun)
    pullCodeIds: [],

    // Ko'p korxonadan tortish (background job) modal
    pullModalVisible: false,
    pullPeriod: { year: null, month: null }, // modal ichida tanlanadigan davr
    pullSelectOrgs: [], // tanlash ro'yxati: [{ organization_id, name, ones_org_code, selected }]
    pullSelectLoading: false,
    pullJob: null, // serverdan: { id, status, total, processed, items:[{organization_id,name,status,added,changed,unchanged,error}] }
    _pullTimer: null,

    // Tortish tarixi (pull-log) modal
    pullLogModalVisible: false,
    pullLogRows: [],
    pullLogLoading: false,
    pullLogExporting: false,
    pullLogStatus: null, // null=hammasi | 'done' | 'error'
    pullLogSearch: null,
    pullLogParams: { page: 1, per_page: 20 },
    pullLogTotal: 0,

    // Korxonalar kesimida
    orgTotals: null,
    orgTotalsLoading: false,
    orgTotalsParams: { page: 1, per_page: 20 },

    // Tanlangan korxona 1C kodi (biriktirish)
    orgCode: null,
    orgCodeInput: '',
    orgCodeSaving: false
  }),

  actions: {
    // UISelect'dan tanlov (KO'P TANLASH — /hrm/worker kabi). Bir nechta korxona.
    onChangeStructure(v) {
      this.selectedOrgs = v
      this.params.matched = null
      this.params.page = 1
      this._index()
    },
    _index() {
      const ids = (this.selectedOrgs || []).map((o) => o.id)
      if (!ids.length) {
        this.list = []
        this.total = 0
        this.report = null
        return
      }
      this.loading = true
      // organizations = CSV; matched bo'sh bo'lsa yubormaymiz (IsIn(['in','out'])).
      const params = { ...this.params, organizations: ids.join(',') }
      delete params.organization_id
      if (!params.matched) delete params.matched
      $ApiService.salary1cService
        ._index({ params })
        .then((res) => {
          const d = res.data.data
          this.list = d.data
          this.total = d.total
          this.report = d.report
        })
        .finally(() => {
          this.loading = false
        })
    },
    _pull() {
      if (!this.params.organization_id) {
        $Toast.warning(t('salary1c.selectOrg'))
        return
      }
      this.pullLoading = true
      $ApiService.salary1cService
        ._pull({
          data: {
            organization_id: this.params.organization_id,
            year: this.params.year,
            month: this.params.month
          }
        })
        .then((res) => {
          const d = res.data.data ?? {}
          $Toast.success(
            `${t('salary1c.added')}: ${d.added ?? 0} · ${t('salary1c.changed')}: ${d.changed ?? 0} · ${t('salary1c.unchanged')}: ${d.unchanged ?? 0}`
          )
          this.params.page = 1
          this._index()
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
        .finally(() => {
          this.pullLoading = false
        })
    },

    // Daraxtda «1C kodi bor» belgisini ko'rsatish uchun id'lar (yengil).
    _loadPullCodes() {
      $ApiService.salary1cService._pullableOrgs().then((res) => {
        this.pullCodeIds = (res.data.data ?? []).map((o) => o.organization_id)
      })
    },
    // Faol/oxirgi batch jobni tekshirib ulash (mount va modal ochilishda).
    _checkActiveJob() {
      $ApiService.salary1cService._activeBatchJob().then((res) => {
        const job = res.data.data
        if (job) {
          this.pullJob = job
          if (job.status === 'running') this._startPolling()
        }
      })
    },
    // Modalni ochish: faol jobni ulaydi, aks holda tanlash ro'yxatini yuklaydi.
    _openPullModal() {
      this.pullModalVisible = true
      // Modal davri — joriy filtrdan boshlanadi (modal ichida o'zgartirilishi mumkin).
      this.pullPeriod = { year: this.params.year, month: this.params.month }
      this._checkActiveJob()
      if (!this.pullSelectOrgs.length) {
        this.pullSelectLoading = true
        $ApiService.salary1cService
          ._pullableOrgs()
          .then((res) => {
            this.pullSelectOrgs = (res.data.data ?? []).map((o) => ({
              organization_id: o.organization_id,
              name: o.name,
              ones_org_code: o.ones_org_code,
              selected: true
            }))
          })
          .finally(() => {
            this.pullSelectLoading = false
          })
      }
    },
    togglePullAll(val) {
      this.pullSelectOrgs.forEach((o) => (o.selected = val))
    },
    // Fon (background) tortishni boshlaydi — server job, modal yopilsa ham davom etadi.
    _runBatchPull() {
      const ids = this.pullSelectOrgs.filter((o) => o.selected).map((o) => o.organization_id)
      if (!ids.length) {
        $Toast.warning(t('salary1c.selectOrg'))
        return
      }
      $ApiService.salary1cService
        ._startBatchPull({
          data: {
            organization_ids: ids,
            year: this.pullPeriod.year,
            month: this.pullPeriod.month
          }
        })
        .then((res) => {
          this.pullJob = res.data.data
          if (this.pullJob?.status === 'running') this._startPolling()
          else this._onJobFinished()
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
    },
    _startPolling() {
      if (this._pullTimer) return
      this._pullTimer = setInterval(() => this._pollJob(), 1500)
    },
    _stopPolling() {
      if (this._pullTimer) {
        clearInterval(this._pullTimer)
        this._pullTimer = null
      }
    },
    _pollJob() {
      const id = this.pullJob?.id
      if (!id) {
        this._stopPolling()
        return
      }
      $ApiService.salary1cService._batchJob(id).then((res) => {
        const job = res.data.data
        if (!job) {
          this._stopPolling()
          return
        }
        this.pullJob = job
        if (job.status === 'finished') {
          this._stopPolling()
          this._onJobFinished()
        }
      })
    },
    _onJobFinished() {
      // Tugagach joriy ko'rinishni yangilaymiz.
      this.params.page = 1
      this._index()
    },
    // Tugagan jobdan keyin yangi tortishga qaytish (tanlash ko'rinishi).
    _resetPullJob() {
      this.pullJob = null
    },

    // Tortish tarixi — modalni ochish (barcha davrlar, Davr ustuni bilan).
    _openPullLog() {
      this.pullLogModalVisible = true
      this.pullLogParams.page = 1
      this._loadPullLog()
    },
    _loadPullLog() {
      this.pullLogLoading = true
      this.pullLogRows = []
      $ApiService.salary1cService
        ._pullHistory({
          params: {
            status: this.pullLogStatus || undefined,
            search: this.pullLogSearch || undefined,
            page: this.pullLogParams.page,
            per_page: this.pullLogParams.per_page
          }
        })
        .then((res) => {
          this.pullLogRows = res.data.data?.data ?? []
          this.pullLogTotal = res.data.data?.total ?? 0
        })
        .finally(() => {
          this.pullLogLoading = false
        })
    },
    // Holat/qidiruv o'zgarsa 1-sahifaga qaytadi.
    _reloadPullLog() {
      this.pullLogParams.page = 1
      this._loadPullLog()
    },
    onPullLogPage(v) {
      this.pullLogParams.page = v.page
      this.pullLogParams.per_page = v.per_page
      this._loadPullLog()
    },
    // Tarixni Excel'ga yuklab olish. year/month berilmasa — barcha davrlar
    // (modal); berilsa — o'sha davr (batch tugagach xatoliklar). status ixtiyoriy.
    _exportPullLog(year = null, month = null, status = undefined) {
      const st = status !== undefined ? status : this.pullLogStatus
      const name = year ? `salary-1c-tarix-${year}-${month}.xlsx` : 'salary-1c-tarix.xlsx'
      this.pullLogExporting = true
      $ApiService.salary1cService
        ._pullHistoryExport({
          params: {
            year: year || undefined,
            month: month || undefined,
            status: st || undefined
          }
        })
        .then((res) => {
          Utils.blobFileDownload(
            res.data,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            name
          )
        })
        .catch(() => {
          $Toast.error(t('content.error'))
        })
        .finally(() => {
          this.pullLogExporting = false
        })
    },
    _payslip(id) {
      this.payslipVisible = true
      this.payslipLoading = true
      this.payslip = null
      $ApiService.salary1cService
        ._payslip({ id })
        .then((res) => {
          this.payslip = res.data.data
        })
        .finally(() => {
          this.payslipLoading = false
        })
    },
    _history(row) {
      this.historyVisible = true
      this.historyLoading = true
      this.history = []
      this.historyEmp = row
      this.compareSelection = []
      this.compareData = null
      $ApiService.salary1cService
        ._history({
          params: {
            organization_id: row.organization_id ?? this.params.organization_id,
            year: this.params.year,
            month: this.params.month,
            pinfl: row.pinfl
          }
        })
        .then((res) => {
          this.history = res.data.data?.versions ?? []
        })
        .finally(() => {
          this.historyLoading = false
        })
    },
    // Solishtirish uchun versiya tanlash — ko'pi bilan 2 ta (3-chisi eng eskisini siqib chiqaradi).
    _toggleCompareSelect(id) {
      const i = this.compareSelection.indexOf(id)
      if (i >= 0) {
        this.compareSelection.splice(i, 1)
      } else {
        if (this.compareSelection.length >= 2) this.compareSelection.shift()
        this.compareSelection.push(id)
      }
    },
    // Tanlangan 2 versiyani solishtirish. from = eski (kichik version), to = yangi.
    _compareHistory() {
      if (this.compareSelection.length !== 2) return
      const rows = this.history
        .filter((v) => this.compareSelection.includes(v.id))
        .sort((a, b) => a.version - b.version)
      if (rows.length !== 2) return
      this.compareVisible = true
      this.compareLoading = true
      this.compareData = null
      $ApiService.salary1cService
        ._compareHistory({ params: { from_id: rows[0].id, to_id: rows[1].id } })
        .then((res) => {
          this.compareData = res.data.data
        })
        .finally(() => {
          this.compareLoading = false
        })
    },
    _orgTotals() {
      this.orgTotalsLoading = true
      $ApiService.salary1cService
        ._orgTotals({
          params: {
            year: this.params.year,
            month: this.params.month,
            page: this.orgTotalsParams.page,
            per_page: this.orgTotalsParams.per_page
          }
        })
        .then((res) => {
          this.orgTotals = res.data.data
        })
        .finally(() => {
          this.orgTotalsLoading = false
        })
    },
    onOrgTotalsPage(v) {
      this.orgTotalsParams.page = v.page
      this.orgTotalsParams.per_page = v.per_page
      this._orgTotals()
    },
    onChangePage(v) {
      this.params.page = v.page
      this.params.per_page = v.per_page
      this._index()
    },
    // «Tizimda yo'q» filtrini yoqish/o'chirish.
    toggleUnmatched() {
      this.params.matched = this.params.matched === 'out' ? null : 'out'
      this.params.page = 1
      this._index()
    },
    // Tanlangan korxonaning 1C kodi (biriktirish uchun).
    _getOrgCode() {
      this.orgCode = null
      this.orgCodeInput = ''
      if (!this.params.organization_id) return
      $ApiService.salary1cService
        ._getOrgCode({ params: { organization_id: this.params.organization_id } })
        .then((res) => {
          this.orgCode = res.data.data
          this.orgCodeInput = res.data.data?.ones_org_code ?? ''
        })
    },
    _setOrgCode() {
      if (!this.params.organization_id) return
      this.orgCodeSaving = true
      $ApiService.salary1cService
        ._setOrgCode({
          data: {
            organization_id: this.params.organization_id,
            ones_org_code: this.orgCodeInput
          }
        })
        .then(() => {
          $Toast.success(t('salary1c.codeSaved'))
          this._getOrgCode()
        })
        .catch((e) => $Toast.error(e?.response?.data?.message ?? t('content.error')))
        .finally(() => {
          this.orgCodeSaving = false
        })
    }
  }
})
