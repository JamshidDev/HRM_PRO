import { defineStore } from 'pinia'

// KPI ko'rsatgichlar sahifasi (HR moduli).
// Backend: `GET /v1/hr/kpi/workers` — shtatdagi (FXSH emas) faol xodimlar, org-scope
// ichida. Qidiruv F.I.Sh/PIN bo'yicha.
//
// `show*` holati — "ko'rish" modali. Ko'rsatkichlar BOSHQA TIZIMDAN olinadi;
// integratsiya endpointi tayyor bo'lgach `_show` ichida chaqiriladi.

const initialParams = () => ({
  page: 1,
  per_page: 15,
  search: null
})

export const useKpiStore = defineStore('kpiStore', {
  state: () => ({
    list: [],
    loading: false,
    totalItems: 0,
    params: initialParams(),
    showVisible: false,
    showLoading: false,
    showWorker: null,
    // KPI tizimidan kelgan `data` (employee/score/indicators) yoki null.
    showData: null,
    // Xodim KPI tizimiga ulanganmi — `false` bo'lsa bu XATO emas, "ma'lumot yo'q".
    showOnboarded: true,
    // Jadval qaysi davr bo'yicha chizilyapti (masalan "3-2026").
    selectedPeriod: null
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.kpiService
        ._index({ params: { ...this.params } })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Xodim qatoridagi "ko'rish" — KPI ma'lumotini yuklaydi.
    _show(row) {
      this.showWorker = row
      this.showData = null
      this.showOnboarded = true
      this.selectedPeriod = null
      this.showVisible = true
      this.showLoading = true
      // 🔑 KPI tizimi lavozim id'sini kutadi (`eUserId` = worker_positions.id).
      $ApiService.kpiService
        ._employee({ id: row.worker_position_id })
        .then((res) => {
          const d = res.data.data
          this.showOnboarded = d.onboarded
          this.showData = d.kpi
          this.selectedPeriod = this.pickInitialPeriod(d.kpi)
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    /**
     * Modal qaysi chorakni ochadi.
     *
     * KPI tizimi `score.periodName` da JORIY davrni beradi, lekin u ko'pincha hali
     * to'ldirilmagan bo'ladi (`actual`/`%` = null, status `initial`) — o'shanda modal
     * bo'sh ochilib, "ishlamayapti"day ko'rinardi. Shu bois: joriy davrda qiymat
     * bo'lsa — o'sha, aks holda qiymati bor OXIRGI davr; umuman bo'lmasa — joriy.
     */
    pickInitialPeriod(kpi) {
      const current = kpi?.score?.periodName ?? null
      const indicators = kpi?.indicators ?? []
      const filled = new Set()
      for (const ind of indicators) {
        for (const d of ind.indicatorData ?? []) {
          const name = d?.indicatorGroup?.periodName
          if (name && d?.userIndicatorDataValue?.actual != null) filled.add(name)
        }
      }
      if (!filled.size || (current && filled.has(current))) return current
      // "1-2026" ko'rinishidagi nomlar — davr raqami bo'yicha eng kattasi.
      return [...filled].sort(
        (a, b) => Number(a.split('-')[0]) - Number(b.split('-')[0])
      ).pop()
    },
    resetFilter() {
      this.params = initialParams()
    }
  }
})
