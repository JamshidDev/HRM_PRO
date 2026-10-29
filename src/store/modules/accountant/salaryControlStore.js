import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { useAccountStore } from '@/store/modules/app/accountStore.js'
import { money } from '@/pages/accountant/salaryControl/helpers.js'
import {
  buildPeople,
  computeFindings,
  computeRisks
} from '@/pages/accountant/salaryControl/engine.js'

const { t } = i18n.global
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// Rich tab'lar (dashboard payloadga tayanadi).
const DASHBOARD_TABS = ['rules', 'who', 'vids', 'deductions', 'reports', 'employees']

// —— Modul darajasidagi kesh (reaktiv emas) — `year|month|org|code` kaliti bo'yicha.
// Tablar orasida qaytganda yoki oldingi filtrга qaytganda qayta so'rov ketmaydi.
const summaryCache = new Map()
const risksCache = new Map()
const dashCache = new Map()
// Race guard: har «kind» uchun oxirgi so'rov id'si — kech kelgan eski javob
// yangi tab/filtr holatini bosib ketmasin.
let summaryReq = 0
let risksReq = 0
let dashReq = 0
// Filtr/qidiruv debounce taymeri.
let filterTimer = null

// Oylik nazorati (salary-control) — 1C oylik hisoboti asosidagi nazorat dashboardi.
// «Umumiy» (summary) + «Xavflar» (risks) yengil endpointlardan; boy bo'limlar bitta
// `dashboard` payloaddan (kpi + emps + vids + F + rc + rules) client-side quriladi.
export const useSalaryControlStore = defineStore('salaryControl', {
  state: () => ({
    // Sahifadagi asosiy ko'rinish tabi (route.query.tab bilan sinxron).
    mainView: 'summary',
    // Sahifa filtri (davr + ko'p tashkilot + ko'p 1C kod).
    params: {
      organizations: [],
      ones_code: null,
      year: null,
      month: null
    },
    structureCheck2: [],
    summary: {},
    summaryLoading: false,
    summaryError: false,
    risks: [],
    norm: null,
    risksLoading: false,
    risksError: false,
    dashboard: {},
    dashboardLoading: false,
    dashboardError: false,
    exporting: ''
  }),
  getters: {
    emps: (s) => s.dashboard.emps ?? [],
    vids: (s) => s.dashboard.vids ?? [],
    findings: (s) => s.dashboard.F ?? [],
    rc: (s) => s.dashboard.rc ?? {},
    rules: (s) =>
      s.dashboard.rules ?? {
        kpi: { based_types: 0, check_types: 0, total_recipients: 0, total_sum: 0 },
        types: [],
        r11: [],
        registry: []
      },
    dashKpi: (s) => s.dashboard.kpi ?? {},
    dashNorm: (s) => s.dashboard.norm ?? null,
    // Xodimlar JSHSHIR (j) bo'yicha birlashtirilgan + boyitilgan (b004/b011/oth/g/cat).
    // Engine (maket) mantig'i — barcha bo'limlar shu yagona manbadan foydalanadi.
    people: (s) => buildPeople(s.dashboard.emps ?? []),
    // 14 avtomatik tekshiruv natijasi (D.F) — maketning `yigish()` ko'chirmasi.
    // Backend heuristikasi (store.findings) o'rniga dashboard ko'rinishi shuni ishlatadi.
    scFindings: (s) => computeFindings(s.dashboard.emps ?? [], { fmt: money }),
    // 14 risk kartalari + reestr — maketning `R` massivi ko'chirmasi.
    scRisks: (s) =>
      computeRisks(
        s.dashboard.emps ?? [],
        { ...(s.dashboard.kpi ?? {}), norm: s.dashboard.norm },
        { year: s.params.year, month: s.params.month, fmt: money }
      )
  },
  actions: {
    // Joriy filtr kaliti — kesh va race guard uchun.
    _key() {
      const orgs = this.params.organizations
        .map((v) => v.id)
        .sort()
        .join(',')
      return `${this.params.year}|${this.params.month}|${orgs}|${this.params.ones_code || ''}`
    },
    // API query paramlari (CSV id).
    _params() {
      return {
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        ones_code: this.params.ones_code || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined
      }
    },
    _canRead() {
      const accStore = useAccountStore()
      return accStore.checkPermission(accStore.pn.economistSalaryControlRead)
    },

    // «Umumiy» KPI xulosasi (kesh + race guard).
    _summary() {
      if (!this._canRead()) return
      const key = this._key()
      if (summaryCache.has(key)) {
        this.summary = summaryCache.get(key)
        this.summaryError = false
        this.summaryLoading = false
        return
      }
      const reqId = ++summaryReq
      this.summaryLoading = true
      this.summaryError = false
      $ApiService.salaryControlService
        ._salaryControlSummary({ params: this._params() })
        .then((res) => {
          const data = res.data.data ?? {}
          summaryCache.set(key, data)
          if (reqId === summaryReq && key === this._key()) this.summary = data
        })
        .catch(() => {
          if (reqId === summaryReq) this.summaryError = true
        })
        .finally(() => {
          if (reqId === summaryReq) this.summaryLoading = false
        })
    },

    // «Xavflar» risk ro'yxati + oy me'yori (kesh + race guard).
    _risks() {
      if (!this._canRead()) return
      const key = this._key()
      if (risksCache.has(key)) {
        const data = risksCache.get(key)
        this.risks = data.risks ?? []
        this.norm = data.norm ?? null
        this.risksError = false
        this.risksLoading = false
        return
      }
      const reqId = ++risksReq
      this.risksLoading = true
      this.risksError = false
      $ApiService.salaryControlService
        ._salaryControlRisks({ params: this._params() })
        .then((res) => {
          const data = res.data.data ?? {}
          risksCache.set(key, data)
          if (reqId === risksReq && key === this._key()) {
            this.risks = data.risks ?? []
            this.norm = data.norm ?? null
          }
        })
        .catch(() => {
          if (reqId === risksReq) this.risksError = true
        })
        .finally(() => {
          if (reqId === risksReq) this.risksLoading = false
        })
    },

    // To'liq dashboard payloadi (boy bo'limlar; kesh + race guard).
    _dashboard() {
      if (!this._canRead()) return
      const key = this._key()
      if (dashCache.has(key)) {
        this.dashboard = dashCache.get(key)
        this.dashboardError = false
        this.dashboardLoading = false
        return
      }
      const reqId = ++dashReq
      this.dashboardLoading = true
      this.dashboardError = false
      $ApiService.salaryControlService
        ._salaryControlDashboard({ params: this._params() })
        .then((res) => {
          const data = res.data.data ?? {}
          dashCache.set(key, data)
          if (reqId === dashReq && key === this._key()) this.dashboard = data
        })
        .catch(() => {
          if (reqId === dashReq) this.dashboardError = true
        })
        .finally(() => {
          if (reqId === dashReq) this.dashboardLoading = false
        })
    },

    // Reestr eksporti (.xlsx) — type: rules | findings | employees | all.
    _export(type = 'all') {
      const accStore = useAccountStore()
      if (!accStore.checkPermission(accStore.pn.economistSalaryControlExport)) return
      this.exporting = type
      const { year, month } = this.params
      const orgPart = this.params.organizations.length
        ? `-org${this.params.organizations.map((v) => v.id).join('_')}`
        : ''
      const name = year
        ? `oylik-nazorati-${type}-${year}-${String(month).padStart(2, '0')}${orgPart}.xlsx`
        : `oylik-nazorati-${type}.xlsx`
      $ApiService.salaryControlService
        ._salaryControlExport({ params: { ...this._params(), type } })
        .then((res) => {
          Utils.blobFileDownload(res.data, XLSX_MIME, name)
        })
        .catch(() => {
          if (typeof $Toast !== 'undefined') $Toast.error(t('content.error'))
        })
        .finally(() => {
          this.exporting = ''
        })
    },

    // Faqat aktiv tabga kerakli endpointni yuklaymiz (kesh dedup qiladi).
    //   summary → KPI (summary) + Overview holatlari (dashboard)
    //   risks   → risklar (risks) + grafiklar (dashboard)
    //   boshqa  → dashboard
    _loadForTab(tab) {
      if (tab === 'summary') {
        this._summary()
        this._dashboard()
      } else if (tab === 'risks') {
        this._risks()
        this._dashboard()
      } else if (DASHBOARD_TABS.includes(tab)) {
        this._dashboard()
      }
    },

    _tabNeedsDashboard(tab) {
      return tab === 'summary' || tab === 'risks' || DASHBOARD_TABS.includes(tab)
    },

    // «Qayta urinish» — joriy kalit keshini tozalab, aktiv tabni qayta yuklaymiz.
    _retryView(tab) {
      const key = this._key()
      summaryCache.delete(key)
      risksCache.delete(key)
      dashCache.delete(key)
      this._loadForTab(tab)
    },

    // Filtr/qidiruv o'zgarganda — 300ms debounce bilan faqat aktiv tabni yangilaymiz.
    // Kalit filtr tarkibidan quriladi — yangi filtr = yangi kalit = kesh miss (qayta
    // so'rov); eski filtrга qaytilsa kesh hit (so'rovsiz).
    _filter() {
      clearTimeout(filterTimer)
      filterTimer = setTimeout(() => this._loadForTab(this.mainView), 300)
    }
  }
})
