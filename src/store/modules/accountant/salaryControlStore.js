import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { useAccountStore } from '@/store/modules/app/accountStore.js'

const { t } = i18n.global
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// Rich tab'lar (dashboard payloadga tayanadi) — birinchi ochilganda `_dashboard()`
// chaqiriladi.
const DASHBOARD_TABS = ['rules', 'who', 'vids', 'deductions', 'reports', 'employees']

// Oylik nazorati (salary-control) — 1C oylik hisoboti asosida umumiy nazorat
// dashboardi. «Umumiy» + «Xavflar» tab'lari alohida yengil endpointlardan
// (summary/risks) keladi; qolgan boy bo'limlar bitta `dashboard` payloaddan
// (kpi + emps + vids + F + rc) client-side quriladi.
export const useSalaryControlStore = defineStore('salaryControl', {
  state: () => ({
    // Sahifadagi asosiy ko'rinish tabi.
    mainView: 'summary',
    // Sahifa filtri (davr + tashkilot).
    params: {
      organization_id: null,
      year: null,
      month: null
    },
    // «Umumiy» tab KPI xulosasi.
    summary: {},
    summaryLoading: false,
    // «Xavflar» tab — 14 ta risk ro'yxati va oy me'yori (soat).
    risks: [],
    norm: null,
    risksLoading: false,
    risksLoaded: false,
    // Boy bo'limlar uchun to'liq payload: { kpi, emps, vids, F, rc, norm }.
    dashboard: {},
    dashboardLoading: false,
    dashboardLoaded: false,
    // Excel eksport holati (tur bo'yicha yuklanish indikatori).
    exporting: ''
  }),
  getters: {
    // Xom massivlar (bo'lim komponentlari shulardan analitika quradi).
    emps: (s) => s.dashboard.emps ?? [],
    vids: (s) => s.dashboard.vids ?? [],
    findings: (s) => s.dashboard.F ?? [],
    rc: (s) => s.dashboard.rc ?? {},
    // To'lov turlari mezonlari — server tomonda baholangan (9 tur + reestr + r11).
    rules: (s) =>
      s.dashboard.rules ?? {
        kpi: { based_types: 0, check_types: 0, total_recipients: 0, total_sum: 0 },
        types: [],
        r11: [],
        registry: []
      },
    dashKpi: (s) => s.dashboard.kpi ?? {},
    dashNorm: (s) => s.dashboard.norm ?? null,
    // Xodimlar JSHSHIR (j) bo'yicha guruhlangan — bir shaxsning bir necha qatori
    // (masalan 2 lavozim) birlashtiriladi. Maketdagi `people` ekvivalenti.
    people: (s) => {
      const emps = s.dashboard.emps ?? []
      const byPin = new Map()
      const solo = []
      for (const e of emps) {
        if (!e.j) {
          solo.push({ ...e, lavs: [e.lav], v: { ...e.v } })
          continue
        }
        const p = byPin.get(e.j)
        if (!p) {
          byPin.set(e.j, { ...e, lavs: [e.lav], v: { ...e.v } })
        } else {
          p.tot += e.tot
          p.fot += e.fot
          p.card += e.card
          p.tax += e.tax
          p.inps += e.inps
          p.kas += e.kas
          p.t += e.t
          p.ok = Math.max(p.ok, e.ok)
          p.lavs.push(e.lav)
          for (const k in e.v) p.v[k] = (p.v[k] || 0) + e.v[k]
        }
      }
      return [...byPin.values(), ...solo]
    }
  },
  actions: {
    // Umumiy KPI xulosasini yuklaymiz (org + davr bo'yicha).
    _summary() {
      const accStore = useAccountStore()
      if (!accStore.checkPermission(accStore.pn.economistSalaryControlRead)) return
      this.summaryLoading = true
      const params = {
        organization_id: this.params.organization_id || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined
      }
      $ApiService.salaryControlService
        ._salaryControlSummary({ params })
        .then((res) => {
          this.summary = res.data.data ?? {}
        })
        .finally(() => {
          this.summaryLoading = false
        })
    },
    // 14 ta riskni yuklaymiz (org + davr bo'yicha).
    _risks() {
      const accStore = useAccountStore()
      if (!accStore.checkPermission(accStore.pn.economistSalaryControlRead)) return
      this.risksLoading = true
      const params = {
        organization_id: this.params.organization_id || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined
      }
      $ApiService.salaryControlService
        ._salaryControlRisks({ params })
        .then((res) => {
          const data = res.data.data ?? {}
          this.risks = data.risks ?? []
          this.norm = data.norm ?? null
          this.risksLoaded = true
        })
        .finally(() => {
          this.risksLoading = false
        })
    },
    // To'liq dashboard payloadini yuklaymiz (boy bo'limlar uchun; bir marta).
    _dashboard() {
      const accStore = useAccountStore()
      if (!accStore.checkPermission(accStore.pn.economistSalaryControlRead)) return
      this.dashboardLoading = true
      const params = {
        organization_id: this.params.organization_id || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined
      }
      $ApiService.salaryControlService
        ._salaryControlDashboard({ params })
        .then((res) => {
          this.dashboard = res.data.data ?? {}
          this.dashboardLoaded = true
        })
        .finally(() => {
          this.dashboardLoading = false
        })
    },
    // Reestrni haqiqiy .xlsx qilib yuklab olamiz (type: rules|findings|employees|all).
    _export(type = 'all') {
      const accStore = useAccountStore()
      if (!accStore.checkPermission(accStore.pn.economistSalaryControlExport)) return
      this.exporting = type
      const { year, month } = this.params
      const name = year
        ? `oylik-nazorati-${type}-${year}-${String(month).padStart(2, '0')}.xlsx`
        : `oylik-nazorati-${type}.xlsx`
      $ApiService.salaryControlService
        ._salaryControlExport({
          params: {
            organization_id: this.params.organization_id || undefined,
            year: year || undefined,
            month: month || undefined,
            type
          }
        })
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
    // Faol tab birinchi marta ochilganda tegishli ma'lumotni yuklaymiz.
    // «Xavflar» tab: risk ro'yxati (/risks) + emps (dashboard — risk grafiklari uchun).
    _loadForTab(tab) {
      if (tab === 'risks' && !this.risksLoaded) this._risks()
      const needsDashboard = tab === 'risks' || DASHBOARD_TABS.includes(tab)
      if (needsDashboard && !this.dashboardLoaded) this._dashboard()
    },
    // Filtr o'zgarganda — faol tabga qarab tegishli ma'lumotni qayta yuklaymiz.
    _filter() {
      this._summary()
      if (this.mainView === 'risks') this._risks()
      // Boy bo'limlar (yoki risk grafiklari) ochiq bo'lsa — dashboardni yangilaymiz.
      if (this.mainView === 'risks' || DASHBOARD_TABS.includes(this.mainView)) {
        this._dashboard()
      }
    }
  }
})
