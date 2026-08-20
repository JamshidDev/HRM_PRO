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
      matched: null, // null=barchasi | 'out'=faqat tizimda yo'q | 'in'=faqat tizimda bor
      // Oylik hisobot (month-report) filtri bilan parity — qo'shimcha maydonlar.
      code: null, // 1C to'lov kodi (paying_code)
      sex: null, // 1=erkak | 0=ayol
      start_hours: null, // ishlagan soat (dan)
      end_hours: null, // ishlagan soat (gacha)
      // Saralash — ustun kaliti + yo'nalish (1=asc, -1=desc). null = default (fio asc).
      sort_by: null,
      sort_order: 1
    },

    // «Kod» filtri uchun 1C to'lov kodlari (economist/enums — month-report bilan bir xil).
    codeList: [],
    enumLoading: false,

    // Joriy tab (page bilan sinxron) — org filtri o'zgarganда to'g'ri ro'yxatni yangilash uchun
    activeTab: 'workers', // 'workers' | 'orgs' | 'veds'

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

    // Bitta xodimni 1C dan qayta tortish — qaysi pinfl hozir tortilyapti (tugma spinner/disable).
    repullPinfl: null,

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
    pullCancelling: false,
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

    // Ved kesimida — vedlar ro'yxati + tanlash + korxona×ved matritsasi
    vedList: [],
    vedTotal: 0,
    vedLoading: false,
    vedParams: { page: 1, per_page: 20, search: null },
    selectedVedCodes: [], // tanlangan paying_code lar
    vedMatrix: null, // { columns, data, column_totals, grand_total, total }
    vedMatrixLoading: false,
    vedMatrixVisible: false, // natija modali
    vedMatrixParams: { page: 1, per_page: 20 },

    // Solishtirish (1C AccruedByType ↔ bizning hisob) — bitta korxona
    reconcile: null, // { organization, ones_org_code, totals, rows, has_diff }
    reconcileLoading: false,
    reconcileOnlyDiff: false, // faqat farqli qatorlar

    // Ved drill-down: bir ved summasi qaysi xodimlardan (modal)
    vedWorkersVisible: false,
    vedWorkersLoading: false,
    vedWorkers: null, // { current_page, total, total_summa, data }
    vedWorkersRow: null, // tanlangan ved qatori {type, code, name}
    vedWorkersParams: { page: 1, per_page: 20, search: null },

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
      // Joriy tabga qarab mos ro'yxatni yangilaymiz (org filtri hammasiga ta'sir qiladi).
      if (this.activeTab === 'veds') {
        this.vedParams.page = 1
        this._veds()
      } else if (this.activeTab === 'orgs') {
        this.orgTotalsParams.page = 1
        this._orgTotals()
      } else if (this.activeTab === 'reconcile') {
        // Solishtirish — foydalanuvchi «Solishtirish» tugmasini bosadi (avtomatik emas).
        this.reconcile = null
      } else {
        this._index()
      }
    },
    // Tanlangan korxonalar CSV (bo'sh bo'lsa — barcha korxona / umumiy).
    _orgCsv() {
      return (this.selectedOrgs || []).map((o) => o.id).join(',') || undefined
    },
    _index() {
      const ids = (this.selectedOrgs || []).map((o) => o.id)
      this.loading = true
      // Korxona tanlangan bo'lsa CSV; TANLANMAGAN bo'lsa yubormaymiz → backend
      // BARCHA korxona xodimlarini qaytaradi (sahifa ochilishida default).
      const params = { ...this.params }
      if (ids.length) params.organizations = ids.join(',')
      else delete params.organizations
      delete params.organization_id
      if (!params.matched) delete params.matched
      // month-report parity filtrlari — bo'sh bo'lsa yubormaymiz.
      // sex=0 (ayol) ham to'g'ri qiymat → faqat null/undefined bo'lsa olib tashlaymiz.
      if (params.code == null || params.code === '') delete params.code
      if (params.sex == null) delete params.sex
      if (params.start_hours == null) delete params.start_hours
      if (params.end_hours == null) delete params.end_hours
      // Saralash — faqat ustun tanlangan bo'lsa yuboramiz; order 1→asc, -1→desc.
      if (params.sort_by) {
        params.sort_order = params.sort_order === 1 ? 'asc' : 'desc'
      } else {
        delete params.sort_by
        delete params.sort_order
      }
      $ApiService.salary1cService
        ._index({ params })
        .then((res) => {
          const d = res.data.data
          this.list = d.data
          this.total = d.total
          this.report = d.report
        })
        .catch((err) => {
          // Ilgari .catch yo'q edi — so'rov 400 (validatsiya) qaytarsa ro'yxat JIMGINA
          // eski holatda qolardi (sort/filtr «ishlamayapti» ko'rinardi). Endi xato ko'rinadi.
          console.error('[salary1c._index] error:', err?.response?.data ?? err?.message, params)
          $Toast.error(err?.response?.data?.message ?? t('content.error'))
        })
        .finally(() => {
          this.loading = false
        })
    },
    // «Kod» filtri ro'yxati — economist/enums (month-report bilan bir xil manba).
    _loadEnum() {
      if (this.codeList.length) return
      this.enumLoading = true
      $ApiService.accountantService
        ._enum()
        .then((res) => {
          // Backend `codes` — [code, name] juftliklari MASSIVI (obyekt emas —
          // JS obyekt '001' leading-zero kalitlarni qayta saralaydi). Kod bo'yicha
          // raqamli tartiblaymiz (dropdown uchun barqaror ko'rinish).
          const codes = res.data.data.codes ?? []
          const pairs = Array.isArray(codes) ? codes : Object.entries(codes)
          this.codeList = pairs
            .map(([code, name]) => ({ id: code, name, position: Number(code) }))
            .sort((a, b) => a.position - b.position)
        })
        .finally(() => {
          this.enumLoading = false
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
        // 'finished' yoki 'cancelled' — ikkalasida ham to'xtaymiz.
        if (job.status !== 'running') {
          this.pullCancelling = false
          this._stopPolling()
          this._onJobFinished()
        }
      })
    },
    // Batch tortishni bekor qilish — in-flight 1C so'rovlari darhol uziladi.
    _cancelJob() {
      const id = this.pullJob?.id
      if (!id || this.pullCancelling) return
      this.pullCancelling = true
      $ApiService.salary1cService
        ._cancelBatch(id)
        .then((res) => {
          if (res.data?.data) this.pullJob = res.data.data
          // Poll davom etadi — job 'cancelled' bo'lgach o'zi to'xtaydi.
        })
        .catch((e) => {
          this.pullCancelling = false
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
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
    // Bitta xodimni (pinfl) 1C dan qayta tortish. `row` — ro'yxat qatori yoki payslip
    // (ikkalasida ham organization_id, pinfl bor). Payslip modal ochiq bo'lsa uni yangilaydi.
    _pullOne(row) {
      const pinfl = row?.pinfl
      const organization_id = row?.organization_id ?? this.params.organization_id
      if (!pinfl || !organization_id) {
        $Toast.warning(t('salary1c.selectOrg'))
        return
      }
      this.repullPinfl = pinfl
      $ApiService.salary1cService
        ._pullOne({
          data: { organization_id, year: this.params.year, month: this.params.month, pinfl }
        })
        .then((res) => {
          const p = res.data.data
          // Payslip modal ochiq va shu xodim bo'lsa — yangilangan kareshotni ko'rsatamiz.
          if (p && this.payslipVisible && this.payslip?.pinfl === pinfl) {
            this.payslip = p
          }
          $Toast.success(t('salary1c.repullDone'))
          this._index()
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
        .finally(() => {
          this.repullPinfl = null
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

    // --- Ved kesimida ---
    _veds() {
      this.vedLoading = true
      $ApiService.salary1cService
        ._veds({
          params: {
            year: this.params.year,
            month: this.params.month,
            organizations: this._orgCsv(),
            page: this.vedParams.page,
            per_page: this.vedParams.per_page,
            search: this.vedParams.search || undefined
          }
        })
        .then((res) => {
          this.vedList = res.data.data.data
          this.vedTotal = res.data.data.total
        })
        .finally(() => {
          this.vedLoading = false
        })
    },
    onVedsPage(v) {
      this.vedParams.page = v.page
      this.vedParams.per_page = v.per_page
      this._veds()
    },
    onVedsSearch() {
      this.vedParams.page = 1
      this._veds()
    },
    toggleVed(code) {
      const i = this.selectedVedCodes.indexOf(code)
      if (i >= 0) this.selectedVedCodes.splice(i, 1)
      else this.selectedVedCodes.push(code)
    },
    toggleAllVeds() {
      // Joriy sahifadagi (kodli) vedlarni tanlash/bekor qilish.
      const codes = this.vedList.map((v) => v.paying_code).filter((c) => c != null)
      const allSel = codes.length > 0 && codes.every((c) => this.selectedVedCodes.includes(c))
      if (allSel) {
        this.selectedVedCodes = this.selectedVedCodes.filter((c) => !codes.includes(c))
      } else {
        for (const c of codes) if (!this.selectedVedCodes.includes(c)) this.selectedVedCodes.push(c)
      }
    },
    // «Hisoblash» — natija modalini ochib, matritsani yuklaydi.
    openVedMatrix() {
      if (!this.selectedVedCodes.length) {
        $Toast.warning(t('salary1c.veds.selectFirst'))
        return
      }
      this.vedMatrixParams.page = 1
      this.vedMatrix = null
      this.vedMatrixVisible = true
      this._vedMatrix()
    },
    // Tanlangan vedlar bo'yicha korxona×ved matritsasini hisoblaydi.
    _vedMatrix() {
      if (!this.selectedVedCodes.length) {
        $Toast.warning(t('salary1c.veds.selectFirst'))
        return
      }
      this.vedMatrixLoading = true
      $ApiService.salary1cService
        ._vedMatrix({
          params: {
            year: this.params.year,
            month: this.params.month,
            paying_codes: this.selectedVedCodes.join(','),
            organizations: this._orgCsv(),
            page: this.vedMatrixParams.page,
            per_page: this.vedMatrixParams.per_page
          }
        })
        .then((res) => {
          this.vedMatrix = res.data.data
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
        .finally(() => {
          this.vedMatrixLoading = false
        })
    },
    onVedMatrixPage(v) {
      this.vedMatrixParams.page = v.page
      this.vedMatrixParams.per_page = v.per_page
      this._vedMatrix()
    },

    // --- Ved drill-down: bir ved summasi qaysi xodimlardan (modal) ---
    openVedWorkers(row) {
      if (!this._orgCsv()) {
        $Toast.warning(t('salary1c.reconcile.selectOneOrg'))
        return
      }
      this.vedWorkersRow = { type: row.type, code: row.code, name: row.name }
      this.vedWorkersParams = { page: 1, per_page: 20, search: null }
      this.vedWorkers = null
      this.vedWorkersVisible = true
      this._vedWorkers()
    },
    _vedWorkers() {
      const orgs = this._orgCsv()
      const row = this.vedWorkersRow
      if (!orgs || !row) return
      this.vedWorkersLoading = true
      $ApiService.salary1cService
        ._vedWorkers({
          params: {
            year: this.params.year,
            month: this.params.month,
            organizations: orgs,
            type: row.type,
            code: row.code || undefined,
            name: row.code ? undefined : row.name || undefined,
            page: this.vedWorkersParams.page,
            per_page: this.vedWorkersParams.per_page,
            search: this.vedWorkersParams.search || undefined
          }
        })
        .then((res) => {
          this.vedWorkers = res.data.data
        })
        .finally(() => {
          this.vedWorkersLoading = false
        })
    },
    onVedWorkersPage(v) {
      this.vedWorkersParams.page = v.page
      this.vedWorkersParams.per_page = v.per_page
      this._vedWorkers()
    },
    onVedWorkersSearch() {
      this.vedWorkersParams.page = 1
      this._vedWorkers()
    },

    // --- Solishtirish (1C bilan) — tanlangan barcha korxonalar (jamlab) ---
    _reconcile() {
      const orgs = this._orgCsv()
      if (!orgs) {
        $Toast.warning(t('salary1c.reconcile.selectOneOrg'))
        return
      }
      this.reconcileLoading = true
      $ApiService.salary1cService
        ._reconcile({
          params: {
            year: this.params.year,
            month: this.params.month,
            organizations: orgs
          }
        })
        .then((res) => {
          this.reconcile = res.data.data
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
        .finally(() => {
          this.reconcileLoading = false
        })
    },
    onChangePage(v) {
      this.params.page = v.page
      this.params.per_page = v.per_page
      this._index()
    },
    // Ustun sarlavhasi bosilganda saralash (month-report `_filterCol` bilan bir xil).
    _filterCol(key) {
      this.params.sort_by = key
      this.params.sort_order *= -1
      this.params.page = 1
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
