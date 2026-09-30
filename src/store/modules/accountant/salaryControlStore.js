import { defineStore } from 'pinia'
import { useAccountStore } from '@/store/modules/app/accountStore.js'

// Oylik nazorati (salary-control) — 1C oylik hisoboti asosida umumiy nazorat
// dashboardi. Phase 0: «Umumiy» tab (KPI ko'rsatkichlar). Keyingi bosqich:
// «Xavflar» tabi — 14 ta riskning holati (risk xaritasi).
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
    risksLoaded: false
  }),
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
    // Filtr o'zgarganda — faol tabga qarab tegishli ma'lumotni qayta yuklaymiz.
    _filter() {
      this._summary()
      if (this.mainView === 'risks') this._risks()
    }
  }
})
