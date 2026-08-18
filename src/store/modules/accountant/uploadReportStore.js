import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
import { getOneMonthAgoYearMonth } from '@utils'

export const useUploadReportStore = defineStore('uploadReport', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    payload: {
      file: [],
      type: null,
      year: null,
      month: null,
      // Oylik hisobot (type=1) manbasi: 1 = Excel, 2 = 1C dan.
      source: 1
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organization_id: null,
      year: null,
      month: null
    },
    structureCache: [],
    structuresLoading: false,
    structuresList: [],
    cards: [],
    cardLoading: false,
    selectedIndex: null,
    selectedId: null,
    selectedOrgName: null,
    commentVisible: false,
    commentContent: null,
    confirmLoading: false,
    expandSet: new Set(),
    flattenData: [],
    isBlocked: false,
    orgStatus: true,
    // 1C dan ommaviy yuklash (Oylik hisobot) — modal holati.
    // bulkPeriod — modal davri: upload-report yoki salary-1c sahifasidan uzatiladi.
    bulkPeriod: { year: null, month: null },
    bulkVisible: false,
    bulkLoading: false, // korxonalar ro'yxatini yuklash
    bulkOrgs: [], // org-totals: { organization_id, organization, employee_count, net_total }
    bulkSelected: [], // tanlangan organization_id lar
    bulkSearch: '',
    bulkRunning: false, // yuklash jarayoni ketyaptimi
    bulkProgress: { done: 0, total: 0 },
    // organization_id -> { status: 'uploading'|'done'|'failed', message? }
    bulkResults: {}
  }),
  actions: {
    _confirm(v) {
      if (v.status) return
      this.confirmLoading = true
      const data = {
        ...this.params,
        type: v.id,
        search: undefined,
        page: undefined,
        per_page: undefined
      }
      $ApiService.accountantService
        ._confirm({ data })
        .then(() => {
          this._structures()
          this._cards()
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // Tasdiqni bekor qilish — SUCCESS → PROCESS, qayta yuklash ochiladi.
    _cancelConfirm(v) {
      if (!v.status) return
      this.confirmLoading = true
      const data = {
        ...this.params,
        type: v.id,
        search: undefined,
        page: undefined,
        per_page: undefined
      }
      $ApiService.accountantService
        ._cancelConfirm({ data })
        .then(() => {
          this._structures()
          this._cards()
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    _structures() {
      this.structuresLoading = true
      const params = {
        ...this.params,
        organization_id: undefined,
        search: undefined,
        page: undefined,
        per_page: undefined
      }
      $ApiService.accountantService
        ._structure({ params })
        .then((res) => {
          const list = res.data.data
          this.structuresList = list
          if (list.length === 1 && list[0]?.children?.length === 0) {
            this.onChangeStructure(list[0])
          }
        })
        .finally(() => {
          this.structuresLoading = false
        })
    },
    _cards() {
      this.cardLoading = true
      const params = {
        ...this.params
      }
      $ApiService.accountantService
        ._index({ params })
        .then((res) => {
          this.cards = res.data.data
          this.list = this.selectedIndex === null ? [] : this.cards[this.selectedIndex].data
        })
        .finally(() => {
          this.cardLoading = false
        })
    },
    _create() {
      this.saveLoading = true
      const data = new FormData()
      data.append('file', this.payload.file[0].file)
      data.append('type', this.payload.type)
      data.append('year', this.payload.year)
      data.append('month', this.payload.month)
      data.append('organization_id', this.params.organization_id)
      $ApiService.accountantService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._cards()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // Oylik hisobotni 1C dan yuklash (fayl yo'q — backend salary-1c ma'lumotidan quradi).
    _createFromOnes() {
      this.saveLoading = true
      const data = {
        organization_id: this.params.organization_id,
        year: this.payload.year,
        month: this.payload.month
      }
      $ApiService.accountantService
        ._createFromOnes({ data })
        .then(() => {
          this.visible = false
          this._cards()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // 1C dan ommaviy yuklash modalini ochish + korxonalar ro'yxatini olish.
    // year/month berilmasa — upload-report filtridagi davr olinadi (salary-1c dan
    // chaqirilganda o'sha sahifaning davri uzatiladi).
    openBulk(year, month) {
      this.bulkPeriod = {
        year: year ?? this.params.year,
        month: month ?? this.params.month
      }
      this.bulkVisible = true
      this.bulkOrgs = []
      this.bulkSelected = []
      this.bulkSearch = ''
      this.bulkResults = {}
      this.bulkProgress = { done: 0, total: 0 }
      this.bulkRunning = false
      this._loadBulkOrgs()
    },
    // Shu davr (bulkPeriod) uchun 1C da tortilgan korxonalar.
    // Javob: { message, error, data: { total, data: [...] } } → massiv = res.data.data.data
    _loadBulkOrgs() {
      this.bulkLoading = true
      const params = {
        year: this.bulkPeriod.year,
        month: this.bulkPeriod.month
      }
      $ApiService.accountantService
        ._onesOrgs({ params })
        .then((res) => {
          this.bulkOrgs = res.data.data?.data ?? []
        })
        .finally(() => {
          this.bulkLoading = false
        })
    },
    // Modal ichida davr (yil/oy) o'zgarganda — tanlovni tozalab, ro'yxatni qayta yuklaymiz.
    _changeBulkPeriod() {
      this.bulkSelected = []
      this.bulkResults = {}
      this.bulkProgress = { done: 0, total: 0 }
      this._loadBulkOrgs()
    },
    // Tanlangan korxonalar uchun Oylik hisobotni 1C dan ommaviy quradi (concurrency = 3).
    async _bulkUploadFromOnes() {
      const ids = [...this.bulkSelected]
      if (ids.length === 0) return
      this.bulkRunning = true
      this.bulkResults = {}
      this.bulkProgress = { done: 0, total: ids.length }
      const CONC = 6
      let idx = 0
      const worker = async () => {
        while (idx < ids.length) {
          const orgId = ids[idx++]
          this.bulkResults = { ...this.bulkResults, [orgId]: { status: 'uploading' } }
          try {
            const res = await $ApiService.accountantService._createFromOnes({
              data: {
                organization_id: orgId,
                year: this.bulkPeriod.year,
                month: this.bulkPeriod.month
              },
              config: { silentError: true }
            })
            const failed = res?.data?.error === true
            this.bulkResults = {
              ...this.bulkResults,
              [orgId]: failed
                ? { status: 'failed', message: res?.data?.message }
                : { status: 'done' }
            }
          } catch (e) {
            this.bulkResults = {
              ...this.bulkResults,
              [orgId]: {
                status: 'failed',
                message: e?.response?.data?.message ?? e?.message
              }
            }
          } finally {
            this.bulkProgress = { ...this.bulkProgress, done: this.bulkProgress.done + 1 }
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(CONC, ids.length) }, () => worker()))
      this.bulkRunning = false
      // Faqat upload-report konteksti (davr tanlangan) bo'lsa daraxt/kartalarni
      // yangilaymiz — salary-1c dan chaqirilganda bu holat bo'lmaydi.
      if (this.params.year && this.params.month) {
        this._structures()
        if (this.params.organization_id) this._cards()
      }
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.countryService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      const oneMonthAgo = getOneMonthAgoYearMonth()
      this.elementId = null
      this.payload.file = []
      this.payload.type = null
      this.payload.year = oneMonthAgo.year
      this.payload.month = oneMonthAgo.month
      this.payload.source = 1
    },
    onChangeStructure(v) {
      this.resetCards()
      this.orgStatus = v.uploadStatus
      this.isBlocked = !v.uploadStatus
      this.params.organization_id = this.params.organization_id === v.id ? null : v.id
      if (this.params.organization_id) {
        this.selectedOrgName = v.name
        this._cards()
      }
    },
    resetCards() {
      this.isBlocked = false
      this.cards = []
      this.list = []
    },
    changePage(v) {},
    _uploadStatus() {
      this.structuresLoading = true
      const data = {
        ...this.params,
        search: undefined,
        page: undefined,
        per_page: undefined,
        status: !this.orgStatus
      }
      $ApiService.accountantService._updateStatus({ data }).then((res) => {
        this.resetCards()
        this.params.organization_id = null
        this._structures()
      })
    }
  }
})
