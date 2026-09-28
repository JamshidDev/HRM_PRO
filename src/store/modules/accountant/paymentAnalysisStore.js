import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { getOneMonthAgoYearMonth } from '@utils'

const { t } = i18n.global
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// To'lov turlari bo'yicha asossiz to'lovlarni aniqlash — natijalar ro'yxati,
// НН blanka yuklash, whitelist yuklash, qayta tahlil va Excel eksport.
export const usePaymentAnalysisStore = defineStore('paymentAnalysis', {
  state: () => ({
    // Sahifadagi asosiy ko'rinish tabi: 'analysis' (to'lov tahlili) | 'whitelist'
    // (imtiyozli xodimlar ro'yxati — to'liq sahifa).
    mainView: 'analysis',
    list: [],
    loading: false,
    totalItems: 0,
    // Sahifa filtri.
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organization_id: null,
      year: null,
      month: null,
      paying_code: null
    },
    // Excelga eksportda faqat asossiz/qo'shimcha tekshiruvlarni chiqarish.
    onlyFlagged: false,
    exportLoading: false,
    analyzeLoading: false,
    // НН blanka yuklash modali.
    blankaVisible: false,
    blankaLoading: false,
    blankaPayload: {
      file: [],
      organization_id: null,
      year: null,
      month: null
    },
    // Whitelist yuklash modali.
    whitelistVisible: false,
    whitelistLoading: false,
    whitelistPayload: {
      file: [],
      organization_id: null,
      year: null,
      month: null,
      paying_code: null
    },
    // Yuklangan whitelist (imtiyozli xodimlar) ro'yxati — to'liq sahifa (tab).
    whitelistList: [],
    whitelistListLoading: false,
    whitelistListTotal: 0,
    whitelistListParams: {
      page: 1,
      per_page: 15,
      search: null,
      paying_code: null
    },
    // Xodim qo'shish modali (qo'lda bitta qator).
    addRowVisible: false,
    addRowLoading: false,
    addRowPayload: {
      worker_id: null,
      paying_code: null,
      summa: 0
    }
  }),
  actions: {
    // Natijalar ro'yxati (server paginatsiyasi).
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        search: this.params.search?.trim() || undefined,
        organization_id: this.params.organization_id || undefined,
        paying_code: this.params.paying_code || undefined,
        only_flagged: this.onlyFlagged || undefined
      }
      $ApiService.accountantService
        ._paymentAnalysisIndex({ params })
        .then((res) => {
          const d = res.data.data ?? {}
          this.list = d.data ?? []
          this.totalItems = d.total ?? 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Filtr o'zgarganda — 1-sahifadan qayta yuklaymiz.
    _filter() {
      this.params.page = 1
      this._index()
    },
    // --- НН blanka yuklash ---
    openBlanka() {
      const fallback = getOneMonthAgoYearMonth()
      this.blankaPayload = {
        file: [],
        organization_id: this.params.organization_id ?? null,
        year: this.params.year ?? fallback.year,
        month: this.params.month ?? fallback.month
      }
      this.blankaVisible = true
    },
    _uploadBlanka() {
      this.blankaLoading = true
      const data = new FormData()
      data.append('file', this.blankaPayload.file[0].file)
      data.append('organization_id', this.blankaPayload.organization_id)
      data.append('year', this.blankaPayload.year)
      data.append('month', this.blankaPayload.month)
      $ApiService.accountantService
        ._paymentAnalysisUpload({ data })
        .then(() => {
          $Toast.success(t('paymentAnalysis.toast.uploaded'))
          this.blankaVisible = false
          this._index()
        })
        .catch(() => {
          // Xato interceptor'da toast qilinadi; modal OCHIQ qoladi.
        })
        .finally(() => {
          this.blankaLoading = false
        })
    },
    // --- Whitelist yuklash (tasdiqlangan xodimlar) ---
    openWhitelist() {
      const fallback = getOneMonthAgoYearMonth()
      this.whitelistPayload = {
        file: [],
        organization_id: this.params.organization_id ?? null,
        year: this.params.year ?? fallback.year,
        month: this.params.month ?? fallback.month,
        paying_code: null
      }
      this.whitelistVisible = true
    },
    _uploadWhitelist() {
      this.whitelistLoading = true
      const data = new FormData()
      data.append('file', this.whitelistPayload.file[0].file)
      data.append('organization_id', this.whitelistPayload.organization_id)
      data.append('year', this.whitelistPayload.year)
      data.append('month', this.whitelistPayload.month)
      data.append('paying_code', this.whitelistPayload.paying_code)
      $ApiService.accountantService
        ._paymentWhitelistUpload({ data })
        .then(() => {
          $Toast.success(t('paymentAnalysis.toast.whitelistUploaded'))
          this.whitelistVisible = false
          this._index()
        })
        .catch(() => {})
        .finally(() => {
          this.whitelistLoading = false
        })
    },
    // --- Yuklangan whitelist (imtiyozli xodimlar) ro'yxati ---
    _whitelistIndex() {
      this.whitelistListLoading = true
      const params = {
        ...this.whitelistListParams,
        search: this.whitelistListParams.search?.trim() || undefined,
        paying_code: this.whitelistListParams.paying_code || undefined,
        organization_id: this.params.organization_id || undefined,
        year: this.params.year || undefined,
        month: this.params.month || undefined
      }
      $ApiService.accountantService
        ._paymentWhitelistIndex({ params })
        .then((res) => {
          const d = res.data.data ?? {}
          this.whitelistList = d.data ?? []
          this.whitelistListTotal = d.total ?? 0
        })
        .finally(() => {
          this.whitelistListLoading = false
        })
    },
    // Whitelist filtri o'zgarganda — 1-sahifadan qayta yuklaymiz.
    _whitelistFilter() {
      this.whitelistListParams.page = 1
      this._whitelistIndex()
    },
    // --- Xodimni qo'lda qo'shish (bitta qator + avtomatik tahlil) ---
    openAddRow() {
      if (!this.params.organization_id || !this.params.year || !this.params.month) {
        $Toast.warning(t('paymentAnalysis.toast.requiredFilters'))
        return
      }
      this.addRowPayload = {
        worker_id: null,
        paying_code: null,
        summa: 0
      }
      this.addRowVisible = true
    },
    _addRow() {
      if (!this.params.organization_id || !this.params.year || !this.params.month) {
        $Toast.warning(t('paymentAnalysis.toast.requiredFilters'))
        return
      }
      if (!this.addRowPayload.worker_id) {
        $Toast.warning(t('paymentAnalysis.toast.requiredWorker'))
        return
      }
      if (!this.addRowPayload.paying_code) {
        $Toast.warning(t('paymentAnalysis.toast.requiredPayingCode'))
        return
      }
      this.addRowLoading = true
      const data = {
        organization_id: this.params.organization_id,
        year: this.params.year,
        month: this.params.month,
        worker_id: this.addRowPayload.worker_id,
        paying_code: this.addRowPayload.paying_code,
        summa: this.addRowPayload.summa
      }
      $ApiService.accountantService
        ._paymentAnalysisAddRow({ data })
        .then(() => {
          $Toast.success(t('paymentAnalysis.toast.added'))
          this.addRowVisible = false
          this._index()
        })
        .catch(() => {})
        .finally(() => {
          this.addRowLoading = false
        })
    },
    // --- Qoidalar dvigatelini qayta ishga tushirish ---
    _analyze() {
      if (!this.params.organization_id || !this.params.year || !this.params.month) {
        $Toast.warning(t('paymentAnalysis.toast.requiredFilters'))
        return
      }
      this.analyzeLoading = true
      const data = {
        organization_id: this.params.organization_id,
        year: this.params.year,
        month: this.params.month
      }
      $ApiService.accountantService
        ._paymentAnalysisAnalyze({ data })
        .then(() => {
          $Toast.success(t('paymentAnalysis.toast.analyzed'))
          this._index()
        })
        .catch(() => {})
        .finally(() => {
          this.analyzeLoading = false
        })
    },
    // --- Excelga yuklash (blob) ---
    _export() {
      this.exportLoading = true
      const y = this.params.year
      const m = this.params.month
      const params = {
        organization_id: this.params.organization_id || undefined,
        year: y || undefined,
        month: m || undefined,
        only_flagged: this.onlyFlagged || undefined
      }
      const name = y && m ? `tolov-tahlili-${y}-${m}.xlsx` : 'tolov-tahlili.xlsx'
      $ApiService.accountantService
        ._paymentAnalysisExport({ params })
        .then((res) => {
          Utils.blobFileDownload(res.data, XLSX_MIME, name)
        })
        .catch(() => {
          $Toast.error(t('content.error'))
        })
        .finally(() => {
          this.exportLoading = false
        })
    }
  }
})
