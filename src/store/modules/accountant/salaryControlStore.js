import { defineStore } from 'pinia'
import { toRaw, markRaw } from 'vue'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { useAccountStore } from '@/store/modules/app/accountStore.js'
import { computeDashboard } from '@/pages/accountant/salaryControl/engine-client.js'
import { getOneMonthAgoYearMonth } from '@utils'

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
// Oxirgi DERIVE qilingan filtr kaliti — tab almashishda (kalit o'zgarmaganda) og'ir
// derivatsiya + state reassign QAYTA bajarilmasin (aks holda keep-alive grafiklar
// qayta render bo'lib, har tabda qotish jamg'ariladi).
let derivedKey = null
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
      month: null,
      // Yil boshidan joriy oygacha (kumulyativ): butun dashboard shu yil 1-oydan
      // `month`gacha jamlanadi. false — faqat tanlangan oy.
      cumulative: false
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
    exporting: '',
    // Og'ir engine derivatsiyasi — getter EMAS, state (Web Worker'da hisoblanadi,
    // asosiy thread qotmasin). _deriveDashboard to'ldiradi.
    people: [],
    scFindings: [],
    scRisks: { cards: [], registry: [], derived: {} }
  }),
  getters: {
    emps: (s) => s.dashboard.emps ?? [],
    // GIBRID: audit (Xavflar/Mezonlar) uchun TANLANGAN OY emps — kumulyativда backend
    // alohida `emps_month` qaytaradi; oddiy rejimda `emps` (= oylik).
    empsMonth: (s) => s.dashboard.emps_month ?? s.dashboard.emps ?? [],
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
    dashNorm: (s) => s.dashboard.norm ?? null
    // people / scFindings / scRisks — endi STATE (Web Worker'da hisoblanadi,
    // _deriveDashboard orqali). Sinxron getter emas — UI qotmaydi.
  },
  actions: {
    // Joriy filtr kaliti — kesh va race guard uchun.
    _key() {
      const orgs = this.params.organizations
        .map((v) => v.id)
        .sort()
        .join(',')
      return `${this.params.year}|${this.params.month}|${orgs}|${this.params.ones_code || ''}|${this.params.cumulative ? 'cum' : ''}`
    },
    // API query paramlari (CSV id).
    _params() {
      return {
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        ones_code: this.params.ones_code || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined,
        cumulative: this.params.cumulative ? 1 : undefined
      }
    },
    _canRead() {
      const accStore = useAccountStore()
      return accStore.checkPermission(accStore.pn.economistSalaryControlRead)
    },

    // Default davr — ma'lumot bor OXIRGI oy (backenddan). Topilmasa — bir oy oldin
    // (fallback). Allaqachon o'rnatilgan bo'lsa tegmaydi. Sahifa yuklashdan OLDIN
    // chaqiriladi (aks holda default oyда ma'lumot bo'lmay, bo'sh ko'rinardi).
    async _initPeriod() {
      if (this.params.year && this.params.month) return
      if (this._canRead()) {
        try {
          const res = await $ApiService.salaryControlService._salaryControlLatestPeriod()
          const d = res.data?.data
          if (d?.year && d?.month) {
            this.params.year = d.year
            this.params.month = d.month
            return
          }
        } catch {
          /* fallback pastda */
        }
      }
      const ago = getOneMonthAgoYearMonth()
      this.params.year = ago.year
      this.params.month = ago.month
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
        // markRaw: minglab xodimli `emps` arrayni chuqur-reaktiv qilmaymiz (yuklash + har
        // render iteratsiyasi tez bo'ladi). Qayta tayinlash baribir reaktivlikni uyg'otadi.
        this.dashboard = markRaw(dashCache.get(key))
        this.dashboardError = false
        // Shu kalit uchun derive allaqachon bajarilган (tab almashish) — qayta hisob
        // va state reassign QILMAYMIZ (keep-alive grafiklar qayta render bo'lmasin).
        if (derivedKey === key) {
          this.dashboardLoading = false
          return
        }
        // Yangi kalit (filtr/davr) — og'ir derivatsiya worker'da; skeleton ko'rinib turadi.
        this.dashboardLoading = true
        this._deriveDashboard(++dashReq, key)
        return
      }
      const reqId = ++dashReq
      this.dashboardLoading = true
      this.dashboardError = false
      this._loadDashboardPaged(reqId, key)
    },

    // Dashboard'ni BO'LAK-BO'LAK (progressiv paginatsiya) yuklaydi — katta payload
    // bitta bo'lib kelmaydi (parse bloki kichik), har yangi yuklash eng so'nggi
    // ma'lumot (kesh-eskiligi yo'q). 1-sahifa: agregatlar (kpi/vids/rc/norm/rules) +
    // total + birinchi emps bo'lagi (backend fresh rebuild). 2..N sahifalar: faqat
    // emps/emps_month bo'laklari — PARALLEL (concurrency cheklangan), backend snapshot'dan
    // tez keladi. Hammasi yig'ilgach — bir marta engine derive (findings/risks butun
    // ma'lumotga tayanadi, shuning uchun oxirida).
    async _loadDashboardPaged(reqId, key) {
      const PER = 1200
      const POOL = 6 // bir vaqtda ochiladigan maksimal sahifa so'rovi
      const svc = $ApiService.salaryControlService
      const fetchPage = (p) =>
        svc._salaryControlDashboard({
          params: { ...this._params(), emps_page: p, emps_per_page: PER }
        })
      try {
        const r1 = await fetchPage(1)
        if (reqId !== dashReq) return
        const d1 = r1.data.data ?? {}
        const total = Number(d1.total) || 0
        const acc = {
          kpi: d1.kpi ?? {},
          vids: d1.vids ?? [],
          rc: d1.rc ?? {},
          norm: d1.norm ?? null,
          rules: d1.rules,
          emps: Array.isArray(d1.emps) ? d1.emps.slice() : [],
          // emps_month faqat kumulyativда keladi; undefined bo'lsa getter emps'ga tushadi.
          emps_month: Array.isArray(d1.emps_month) ? d1.emps_month.slice() : undefined
        }
        const pages = PER > 0 ? Math.ceil(total / PER) : 1
        if (pages > 1 && !d1.done) {
          // 2..N sahifalarni POOL concurrency bilan yuklaymiz (tartibsiz — yig'ish
          // tartib talab qilmaydi; findings/risks butun to'plamdan hisoblanadi).
          const queue = []
          for (let p = 2; p <= pages; p++) queue.push(p)
          const appendPage = (d) => {
            const es = Array.isArray(d.emps) ? d.emps : []
            for (let i = 0; i < es.length; i++) acc.emps.push(es[i])
            if (acc.emps_month && Array.isArray(d.emps_month)) {
              for (let i = 0; i < d.emps_month.length; i++) acc.emps_month.push(d.emps_month[i])
            }
          }
          let qi = 0
          const worker = async () => {
            while (qi < queue.length) {
              const p = queue[qi++]
              const r = await fetchPage(p)
              if (reqId !== dashReq) return
              appendPage(r.data.data ?? {})
            }
          }
          await Promise.all(Array.from({ length: Math.min(POOL, queue.length) }, worker))
          if (reqId !== dashReq) return
        }
        if (key !== this._key()) {
          this.dashboardLoading = false
          return
        }
        dashCache.set(key, acc)
        this.dashboard = markRaw(acc)
        this._deriveDashboard(reqId, key)
      } catch {
        if (reqId === dashReq) {
          this.dashboardError = true
          this.dashboardLoading = false
        }
      }
    },

    // Og'ir derivatsiya (buildPeople / computeFindings / computeRisks — minglab
    // xodim ustida) WEB WORKER'da bajariladi → ASOSIY THREAD QOTMAYDI. Natija
    // tayyor bo'lgach state'ga yoziladi va loading o'chadi (shu paytgacha skeleton
    // ko'rinadi). Worker ishlamasa — klient sinxron fallback'ga o'tadi.
    _deriveDashboard(reqId, key) {
      // Worker'ga XOM (plain) ma'lumot uzatamiz: Pinia reactive proxy'si strukturaviy
      // klon bo'lmaydi (postMessage DataCloneError → sync fallback). dashCache plain
      // (axios javobi); toRaw qo'shimcha kafolat.
      const raw = toRaw(dashCache.get(key) || this.dashboard) || {}
      // GIBRID: people (pul tablari) KUMULYATIV `emps`'dan; risk/findings (audit) esa
      // OYLIK `emps_month`'dan (kumulyativда). Oddiy rejimda ikkisi bir xil.
      computeDashboard({
        emps: toRaw(raw.emps) ?? [],
        empsAudit: toRaw(raw.emps_month ?? raw.emps) ?? [],
        kpi: { ...(raw.kpi ?? {}), norm: raw.norm },
        year: this.params.year,
        month: this.params.month
      })
        .then((d) => {
          if (reqId !== dashReq) return
          // markRaw: derive natijalari ham yirik arraylar — chuqur-reaktivlik shart emas
          // (faqat o'qiladi). Qayta tayinlash reaktivlikni uyg'otib, render yangilanadi.
          this.people = markRaw(d.people)
          this.scFindings = markRaw(d.findings)
          this.scRisks = markRaw(d.risks)
          derivedKey = key // shu kalit uchun derive bajarildi — tab almashishda takror yo'q
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
