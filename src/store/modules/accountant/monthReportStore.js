import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { AppPaths } from '@/utils/index.js'
import router from '@/router/index.js'

export const useMonthReportStore = defineStore('monthReportStore', {
  state: () => ({
    list: [],
    loading: false,
    showLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    payload: {},
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      code: null,
      year: null,
      month: null,
      sort_by: null,
      sort_order: 1,
      start_hours:null,
      end_hours:null,
      sex: null,
    },
    structureCheck2: [],
    structureCheck: [],
    showList: [],
    showPrams: {
      year: null,
      month: null
    },
    codeList: [],
    enumLoading: false,
    workerPhotoUrl: null,
    downloadLoading: false,
    filteredExporting: false,
    cashedWorkerData: null,
    exportParams: {
      year: null,
      month: null,
      codes: [],
      organizations: [],
      positions: [],
      byOrganization: true,
      type:'code'
    },
    exportVisible: false,
    activeTab: 1,
    tabList: [1, 2],
    exportType: null,
    mainView: 'workers', // 'workers' | 'ved' — sahifadagi asosiy ko'rinish tabi

    // Ved oralig'i — chegara tahlili.
    thresholdVisible: false,
    thresholdLoading: false,
    thresholdExporting: false,
    thresholdResult: null,
    vedCodeList: [], // shablondagi barcha ved kodlari + nomlari (istisno uchun)
    vedCodesLoading: false,

    // Ved kesimida hisobot (oy oralig'i × tanlangan vedlar).
    vedReportParams: {
      page: 1,
      per_page: 20,
      year_from: null,
      month_from: null,
      year_to: null,
      month_to: null,
      codes: [],
      search: null
    },
    vedReportColumns: [],
    vedReportList: [],
    vedReportTotal: 0,
    vedReportLoading: false,
    vedReportExporting: false,
    thresholdParams: {
      from_code: 1,
      to_code: 999,
      exclude: [], // istisno kodlar (string massiv)
      thresholds: [null] // chegara summalar (min 1, max 5)
    },

    filterPosParams: {
      page: 1,
      per_page: 1000,
      search: null,
      key: null
    }
  }),
  actions: {
    _exportByPosition(params) {
      this.showLoading = true
      $ApiService.monthReportService
        ._exportByPosition({ params })
        .then(() => {
          this.exportVisible = false
          router.push(Utils.routeHrmPathMaker(AppPaths.Export))
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    _exportMultiple(params) {
      this.showLoading = true
      $ApiService.monthReportService
        ._exportMultiple({ params })
        .then(() => {
          this.exportVisible = false
          router.push(Utils.routeHrmPathMaker(AppPaths.Export))
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    _exportWithCode(data) {
      this.showLoading = true
      $ApiService.monthReportService
        ._exportWithCode({ data })
        .then(() => {
          this.exportVisible = false
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    _exportWithCodeByYear(data) {
      this.showLoading = true
      $ApiService.monthReportService
        ._exportWithCodeByYear({ data })
        .then(() => {
          this.exportVisible = false
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    // Shablondagi barcha ved kodlari + nomlari (istisno tanlash uchun).
    _vedCodes() {
      if (this.vedCodeList.length) return
      this.vedCodesLoading = true
      $ApiService.monthReportService
        ._vedCodes()
        .then((res) => {
          this.vedCodeList = res.data.data
        })
        .finally(() => {
          this.vedCodesLoading = false
        })
    },
    // Ved kesimida hisobot — umumiy so'rov parametrlari.
    _vedReportRequestParams() {
      return {
        year_from: this.vedReportParams.year_from,
        month_from: this.vedReportParams.month_from,
        year_to: this.vedReportParams.year_to,
        month_to: this.vedReportParams.month_to,
        codes: this.vedReportParams.codes.join(','),
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        search: this.vedReportParams.search || undefined
      }
    },
    _vedReport() {
      const p = this._vedReportRequestParams()
      if (!p.codes) {
        $Toast.warning(i18n.global.t('monthReport.vedReport.selectCodes'))
        return
      }
      this.vedReportLoading = true
      $ApiService.monthReportService
        ._vedReport({
          params: { ...p, page: this.vedReportParams.page, per_page: this.vedReportParams.per_page }
        })
        .then((res) => {
          this.vedReportColumns = res.data.data.columns
          this.vedReportList = res.data.data.data
          this.vedReportTotal = res.data.data.total
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? i18n.global.t('content.error'))
        })
        .finally(() => {
          this.vedReportLoading = false
        })
    },
    _onVedReportPage(p) {
      this.vedReportParams.page = p
      this._vedReport()
    },
    _vedReportExport() {
      const p = this._vedReportRequestParams()
      if (!p.codes) {
        $Toast.warning(i18n.global.t('monthReport.vedReport.selectCodes'))
        return false
      }
      this.vedReportExporting = true
      $ApiService.monthReportService
        ._vedReportExport({ params: p })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? i18n.global.t('content.error'))
        })
        .finally(() => {
          this.vedReportExporting = false
        })
      return true
    },
    // Ved oralig'i chegara tahlili — umumiy so'rov parametrlari.
    _thresholdRequestParams() {
      const thresholds = this.thresholdParams.thresholds
        .filter((v) => v !== null && v !== '' && Number(v) > 0)
        .join(',')
      return {
        year: this.params.year,
        month: this.params.month,
        from_code: this.thresholdParams.from_code,
        to_code: this.thresholdParams.to_code,
        exclude_codes:
          this.thresholdParams.exclude.filter((v) => v !== null && v !== '').join(',') || undefined,
        thresholds,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
    },
    _vedThresholdCompute() {
      const params = this._thresholdRequestParams()
      if (!params.thresholds) {
        $Toast.warning(i18n.global.t('monthReport.threshold.atLeastOneAmount'))
        return
      }
      this.thresholdLoading = true
      $ApiService.monthReportService
        ._vedThreshold({ params })
        .then((res) => {
          this.thresholdResult = res.data.data
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? i18n.global.t('content.error'))
        })
        .finally(() => {
          this.thresholdLoading = false
        })
    },
    // Export — fly animatsiyasi bilan (navigatsiyasiz). Muvaffaqiyat/xato toast.
    _vedThresholdExport() {
      const params = this._thresholdRequestParams()
      if (!params.thresholds) {
        $Toast.warning(i18n.global.t('monthReport.threshold.atLeastOneAmount'))
        return false
      }
      this.thresholdExporting = true
      $ApiService.monthReportService
        ._vedThresholdExport({ params })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? i18n.global.t('content.error'))
        })
        .finally(() => {
          this.thresholdExporting = false
        })
      return true
    },
    // Joriy filtr bo'yicha statements ro'yxatini Excel'ga (shablon + Korxona ustuni)
    // fonda yuklash. Filtrlar list (_index) bilan bir xil (sort/page'siz).
    _exportFiltered() {
      const params = {
        year: this.params.year,
        month: this.params.month,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        search: this.params.search || undefined,
        code: this.params.code || undefined,
        sex: this.params.sex ?? undefined,
        start_hours: this.params.start_hours ?? undefined,
        end_hours: this.params.end_hours ?? undefined
      }
      this.filteredExporting = true
      $ApiService.monthReportService
        ._exportFiltered({ params })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? i18n.global.t('content.error'))
        })
        .finally(() => {
          this.filteredExporting = false
        })
      return true
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        sort_order:
          this.params.sort_by === 'status' || this.params.sort_by === null
            ? undefined
            : this.params.sort_order === 1
              ? 'asc'
              : 'desc',
        status:
          this.params.sort_by === 'status'
            ? this.params.sort_order === 1
              ? 1
              : undefined
            : undefined,
        sort_by: this.params.sort_by === 'status' ? undefined : this.params.sort_by,
        // sex=0 (ayol) ham to'g'ri qiymat → faqat null bo'lsa yubormaymiz (?? undefined).
        sex: this.params.sex ?? undefined
      }
      $ApiService.monthReportService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _show() {
      this.showLoading = true
      let params = {
        year: this.showPrams.year,
        month: this.showPrams.month
      }
      let id = this.elementId
      $ApiService.monthReportService
        ._show({ params, id })
        .then(async (res) => {
          if (res.data.data.length > 0) {
            this.cashedWorkerData = res.data.data[0]?.worker
          }
          this.showList = []
          await nextTick()
          this.showList = res.data.data
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    _enum() {
      this.enumLoading = true
      $ApiService.accountantService
        ._enum()
        .then((res) => {
          this.codeList = Object.entries(res.data.data.codes)
            .map(([key, value]) => ({
              id: key,
              name: value,
              position: key
            }))
            .sort((a, b) => a.position - b.position)
        })
        .finally(() => {
          this.enumLoading = false
        })
    },
    _download() {
      this.downloadLoading = true
      $ApiService.monthReportService
        ._template()
        .then((res) => {
          Utils.downloadFileByUrl(res.data.data.url)
        })
        .finally(() => {
          this.downloadLoading = false
        })
    },
    _filterCol(key) {
      this.params.sort_by = key
      this.params.sort_order *= -1
      this._index()
    },
    _filterStatus(key) {
      this.params.sort_order =
        this.params.sort_by !== key ? 1 : this.params.sort_order === 1 ? -1 : 1
      this.params.sort_by = key
      this._index()
    },

    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.name = null
    }
  }
})
