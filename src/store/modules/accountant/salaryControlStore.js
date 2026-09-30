import { defineStore } from 'pinia'
import { useAccountStore } from '@/store/modules/app/accountStore.js'

// Oylik nazorati (salary-control) — 1C oylik hisoboti asosida umumiy nazorat
// dashboardi. Phase 0: faqat «Umumiy» tab (KPI ko'rsatkichlar) yig'iladi.
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
    summaryLoading: false
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
    // Filtr o'zgarganda — xulosani qayta yuklaymiz.
    _filter() {
      this._summary()
    }
  }
})
