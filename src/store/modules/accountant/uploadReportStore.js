import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
import { getOneMonthAgoYearMonth } from '@utils'
import Utils from '@/utils/Utils.js'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

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
    // Korxonalar daraxtini nomi bo'yicha (klientda) filtrlash
    orgSearch: '',
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
    // bulkType — qaysi hisobot ommaviy tortiladi (1=Oylik, 2=INPS4, 3=INPS5, 4=to'lovlar).
    // Oylik → org ro'yxati salary_reports'dan; INPS → 1C kodli barcha korxonalar.
    bulkType: 1,
    bulkVisible: false,
    bulkLoading: false, // korxonalar ro'yxatini yuklash
    bulkOrgs: [], // { organization_id, organization, employee_count?, net_total?, ones_org_code? }
    bulkSelected: [], // tanlangan organization_id lar
    bulkSearch: '',
    bulkRunning: false, // yuklash jarayoni ketyaptimi
    bulkErrorExportLoading: false, // xatolarni Excel'ga yuklab olish jarayoni
    bulkProgress: { done: 0, total: 0 },
    // organization_id -> { status: 'uploading'|'done'|'failed', message?, at? }
    bulkResults: {},
    // To'xtatish so'ralganda true — worker'lar yangi korxona OLMAYDI.
    bulkCancelRequested: false,
    // Hisobot holati modali (tanlangan oy uchun korxonalar kesimida yuklagan/yuklamagan).
    reportStatusVisible: false,
    reportStatusLoading: false,
    reportStatusExporting: false,
    reportStatusRows: [],
    reportStatusSummary: [],
    reportStatusTotalOrgs: 0,
    reportStatusSearch: '',
    // Modal ichidagi davr — sahifa filtridan mustaqil (modalni yopmasdan almashtirish).
    reportStatusPeriod: { year: null, month: null },
    // Ko'p korxonani birdan tasdiqlash/bekor qilish (checkbox multi-select).
    confirmSelected: [], // belgilangan organization_id lar
    bulkConfirmType: 1, // tanlangan tur (1=Oylik,2=INPS4,3=INPS5,4=to'lovlar)
    bulkConfirmLoading: false,
    // «Hammasini ochish/yopish» — tanlangan korxonalar davrini ommaviy ochish/yopish.
    bulkOpenLoading: false,
    // Ko'p-oylik ZIP yuklab olish (bitta korxona, oy oralig'i).
    reportZipVisible: false,
    reportZipLoading: false,
    reportZip: { year: null, from_month: 1, to_month: 12 },
    // Tortish tarixi (pull-log) modal — barcha davrlar bo'yicha yuklamalar (server paginatsiyasi).
    pullHistoryVisible: false,
    pullHistoryLoading: false,
    pullHistoryRows: [],
    pullHistoryTotal: 0,
    pullHistoryParams: {
      type: null, // shakl (1..4); null = hammasi
      year: null,
      month: null,
      organization_id: null,
      source: null, // 1=Excel, 2=1C
      done: null, // 1=xato, 2=jarayonda, 3=bajarildi
      search: null,
      page: 1,
      per_page: 20
    },
    // Tortish tarixi ichidagi tab: 'pulls' (tortishlar) | 'downloads' (ZIP yuklab olishlar).
    pullHistoryTab: 'pulls',
    downloadsRows: [],
    downloadsTotal: 0,
    downloadsLoading: false,
    downloadsParams: {
      organization_id: null,
      year: null,
      search: null,
      page: 1,
      per_page: 20
    }
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
    // --- Ko'p korxonani birdan tasdiqlash/bekor qilish ---
    toggleConfirmSelect(id) {
      const i = this.confirmSelected.indexOf(id)
      if (i >= 0) this.confirmSelected.splice(i, 1)
      else this.confirmSelected.push(id)
    },
    setConfirmSelected(ids) {
      this.confirmSelected = [...ids]
    },
    clearConfirmSelected() {
      this.confirmSelected = []
    },
    // cancel=false → tasdiqlash, true → tasdiqni bekor qilish. Bitta so'rov
    // (organization_ids). Javobdagi skipped bo'yicha ogohlantirish beramiz.
    _confirmMany(cancel = false) {
      if (!this.confirmSelected.length || !this.params.year || !this.params.month) return
      this.bulkConfirmLoading = true
      const data = {
        organization_ids: [...this.confirmSelected],
        type: this.bulkConfirmType,
        year: this.params.year,
        month: this.params.month
      }
      const req = cancel
        ? $ApiService.accountantService._cancelConfirm({ data })
        : $ApiService.accountantService._confirm({ data })
      req
        .then((res) => {
          const skipped = res?.data?.data?.skipped ?? []
          if (skipped.length) {
            $Toast.warning(t('uploadReport.bulkSkipped', { n: skipped.length }))
          }
          this.clearConfirmSelected()
          this._structures()
          // Kartalar faqat tanlangan korxona uchun — checkbox-bulk (org tanlanmagan)
          // da org_id null bo'lib, _index "organization_id shart" xatosini bermasin.
          if (this.params.organization_id) this._cards()
        })
        .catch(() => {})
        .finally(() => {
          this.bulkConfirmLoading = false
        })
    },
    // «Hammasini ochish/yopish» — tanlangan korxonalar davrini birdan ochadi
    // (open=true) yoki yopadi (open=false). Tasdiqlash bulk naqshi bilan bir xil;
    // type kerak emas (davr darajasi). Javobdagi skipped bo'yicha ogohlantiramiz.
    _openMany(open = true) {
      if (!this.confirmSelected.length || !this.params.year || !this.params.month) return
      this.bulkOpenLoading = true
      const data = {
        organization_ids: [...this.confirmSelected],
        year: this.params.year,
        month: this.params.month,
        status: open
      }
      $ApiService.accountantService
        ._updateStatus({ data })
        .then((res) => {
          const skipped = res?.data?.data?.skipped ?? []
          if (skipped.length) {
            $Toast.warning(t('uploadReport.bulkSkipped', { n: skipped.length }))
          }
          this.clearConfirmSelected()
          this._structures()
          // Kartalar faqat tanlangan korxona uchun — checkbox-bulk (org tanlanmagan)
          // da org_id null bo'lib, _index "organization_id shart" xatosini bermasin.
          if (this.params.organization_id) this._cards()
        })
        .catch(() => {})
        .finally(() => {
          this.bulkOpenLoading = false
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
            const only = list[0]
            // Avtomatik tanlash faqat org hali tanlanmaganda. Agar allaqachon
            // tanlangan bo'lsa (masalan tasdiqlash/bekor qilishdan keyingi refresh),
            // onChangeStructure TOGGLE qilib org_id'ni null'ga aylantirib panelni
            // yopib qo'yardi. Shu holatda faqat holatni yangilaymiz — panel ochiq qoladi.
            if (this.params.organization_id === only.id) {
              this.orgStatus = only.uploadStatus
              this.isBlocked = !only.uploadStatus
            } else {
              this.onChangeStructure(only)
            }
          }
        })
        .finally(() => {
          this.structuresLoading = false
        })
    },
    // Yuklama backendda `done=2` (jarayonda) bo'lib qaytadi, so'ng fonda `done=3`
    // (muvaffaqiyat) bo'ladi. Polling o'rniga bir marta kechiktirilgan qayta
    // yuklash — kartochka/tree yakuniy holatni «Yangilash»siz ko'rsatadi.
    _refreshSoon() {
      // Fonда 1C tortish 6-30s davom etadi — bir necha marta yangilaymiz, done=2→3
      // «Yangilash»siz ko'rinadi (Excel/Oylik uchun ham zararsiz — arzon so'rov).
      ;[4000, 12000, 25000].forEach((ms) =>
        setTimeout(() => {
          this._cards()
          this._structures()
        }, ms)
      )
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
          this._structures()
          this._refreshSoon()
        })
        .catch(() => {
          // Xato (masalan 422 — fayl shablonga mos emas) interceptor'da toast
          // qilinadi; modal OCHIQ qoladi (foydalanuvchi tuzatib qayta yuklashi uchun).
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // Hisobotni 1C dan yuklash (fayl yo'q). type=1 (Oylik) salary-1c dan,
    // type=2/3/4 (INPS 4/5/to'lovlar) 1c-zup (NDFL4/NDFL5/INPS) dan quriladi.
    _createFromOnes() {
      this.saveLoading = true
      const data = {
        organization_id: this.params.organization_id,
        type: this.payload.type,
        year: this.payload.year,
        month: this.payload.month,
        // INPS 4/5-ilova va to'lovlar (2/3/4) — 1C sekin (6-30s) → FONДА: so'rov
        // darhol qaytadi, yuklama done=2→3 fonda yangilanadi (tree pollingi bilan).
        // Oylik (1) tez (lokal salary) — background ta'sir qilmaydi.
        background: [2, 3, 4].includes(Number(this.payload.type))
      }
      $ApiService.accountantService
        ._createFromOnes({ data })
        .then(() => {
          this.visible = false
          this._cards()
          this._structures()
          this._refreshSoon()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // 1C dan ommaviy yuklash modalini ochish + korxonalar ro'yxatini olish.
    // year/month berilmasa — upload-report filtridagi davr olinadi (salary-1c dan
    // chaqirilganda o'sha sahifaning davri uzatiladi).
    openBulk(year, month, type = 1) {
      // Yuklash allaqachon ketayotgan bo'lsa — holatni RESET qilmasdan modalni
      // qayta ochamiz (fonda ketayotgan jonli progressni ko'rsatish uchun).
      if (this.bulkRunning) {
        this.bulkVisible = true
        return
      }
      this.bulkPeriod = {
        year: year ?? this.params.year,
        month: month ?? this.params.month
      }
      this.bulkType = type
      this.bulkVisible = true
      this.bulkOrgs = []
      this.bulkSelected = []
      this.bulkSearch = ''
      this.bulkResults = {}
      this.bulkProgress = { done: 0, total: 0 }
      this.bulkRunning = false
      this.bulkCancelRequested = false
      this._loadBulkOrgs()
    },
    // Ketayotgan ommaviy yuklashni to'xtatish — worker'lar yangi korxona OLMAYDI
    // (jarayondagi ≤6 so'rov tugaydi). Progress qolgan joyida to'xtaydi.
    stopBulk() {
      if (!this.bulkRunning) return
      this.bulkCancelRequested = true
    },
    // Korxonalar ro'yxati. Oylik (type=1) → shu davrda 1C da tortilgan korxonalar
    // (salary_reports). INPS (2/3/4) → 1C kodi bor barcha korxonalar (1c-zup to'g'ridan).
    // Javob: { data: { total, data: [...] } } → massiv = res.data.data.data.
    _loadBulkOrgs() {
      this.bulkLoading = true
      const svc = $ApiService.accountantService
      const req =
        Number(this.bulkType) === 1
          ? svc._onesOrgs({
              params: { year: this.bulkPeriod.year, month: this.bulkPeriod.month }
            })
          : svc._reportOrgs()
      req
        .then((res) => {
          this.bulkOrgs = res.data.data?.data ?? []
        })
        .finally(() => {
          this.bulkLoading = false
        })
    },
    // Modal ichida davr yoki hisobot turi o'zgarganda — tanlovni tozalab, ro'yxatni qayta yuklaymiz.
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
      this.bulkCancelRequested = false
      this.bulkResults = {}
      this.bulkProgress = { done: 0, total: ids.length }
      const CONC = 6
      let idx = 0
      const worker = async () => {
        while (idx < ids.length) {
          // To'xtatish so'ralgan bo'lsa — yangi korxona OLINMAYDI (jarayondagi tugaydi).
          if (this.bulkCancelRequested) break
          const orgId = ids[idx++]
          this.bulkResults = { ...this.bulkResults, [orgId]: { status: 'uploading' } }
          try {
            const res = await $ApiService.accountantService._createFromOnes({
              data: {
                organization_id: orgId,
                type: this.bulkType,
                year: this.bulkPeriod.year,
                month: this.bulkPeriod.month
              },
              config: { silentError: true }
            })
            const failed = res?.data?.error === true
            this.bulkResults = {
              ...this.bulkResults,
              [orgId]: failed
                ? { status: 'failed', message: res?.data?.message, at: new Date().toISOString() }
                : { status: 'done' }
            }
          } catch (e) {
            this.bulkResults = {
              ...this.bulkResults,
              [orgId]: {
                status: 'failed',
                message: e?.response?.data?.message ?? e?.message,
                at: new Date().toISOString()
              }
            }
          } finally {
            this.bulkProgress = { ...this.bulkProgress, done: this.bulkProgress.done + 1 }
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(CONC, ids.length) }, () => worker()))
      this.bulkRunning = false
      const wasCancelled = this.bulkCancelRequested
      this.bulkCancelRequested = false
      if (wasCancelled) $Toast.info(t('uploadReport.bulkOnes.stopped'))
      // Qisman yuklangan bo'lsa ham (to'xtatilgan ham) daraxt/kartalarni yangilaymiz —
      // faqat upload-report konteksti (davr tanlangan) bo'lsa; salary-1c dan chaqirilganda bu holat yo'q.
      if (this.params.year && this.params.month) {
        this._structures()
        if (this.params.organization_id) this._cards()
      }
    },
    // «1C dan ommaviy yuklash» XATOlarini Excel (.xlsx) qilib yuklab olish:
    // korxona, 1C ID, davr, tortilgan vaqt, xato. Backend 1C ID (ones_org_code) ni
    // har org uchun aniqlaydi; bu yerda faqat xato natijalarni yuboramiz.
    _exportBulkErrors() {
      const errors = Object.entries(this.bulkResults)
        .filter(([, r]) => r?.status === 'failed')
        .map(([orgId, r]) => {
          const org = this.bulkOrgs.find(
            (o) => String(o.organization_id) === String(orgId)
          )
          return {
            organization_id: Number(orgId),
            organization_name: org?.organization ?? '',
            error: r.message ?? '',
            pulled_at: r.at ?? ''
          }
        })
      if (!errors.length) {
        $Toast.info(t('uploadReport.bulkOnes.noErrors'))
        return
      }
      this.bulkErrorExportLoading = true
      const data = {
        year: this.bulkPeriod.year,
        month: this.bulkPeriod.month,
        type: this.bulkType,
        errors
      }
      $ApiService.accountantService
        ._onesErrorsExport({ data })
        .then((res) => {
          Utils.blobFileDownload(
            res.data,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            `1c-yuklash-xatolari-${this.bulkPeriod.year}-${String(this.bulkPeriod.month).padStart(2, '0')}.xlsx`
          )
        })
        .finally(() => {
          this.bulkErrorExportLoading = false
        })
    },
    // Yuklangan hisobotni (economist_upload) o'chirish — ma'lumot satrlari + soft-delete.
    // So'ng tanlangan korxona kartalari (list = latest/older) qayta yuklanadi.
    _deleteUpload(id) {
      if (!id) return
      this.deleteLoading = true
      $ApiService.accountantService
        ._deleteUpload({ id })
        .then(() => {
          $Toast.success(t('content.deleted'))
          this._cards()
        })
        .catch((e) => {
          // Backend xabari (mas. tasdiqlangan hisobotni o'chirib bo'lmaydi — avval
          // bekor qiling) bo'lsa — aynan o'shani ko'rsatamiz.
          $Toast.error(e?.response?.data?.message || t('content.error'))
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      // Modal davri = asosiy filtr davri (params) — «bir oy oldin» EMAS. Aks holda
      // asosiy filtrda Iyul turса ham modalda Avgust chiqib, nomuvofiqlik bo'lardi.
      const fallback = getOneMonthAgoYearMonth()
      this.elementId = null
      this.payload.file = []
      this.payload.type = null
      this.payload.year = this.params.year ?? fallback.year
      this.payload.month = this.params.month ?? fallback.month
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
    },
    // Ko'p-oylik ZIP modalini ochish (tanlangan korxona, sahifa filtridagi yil).
    openReportZip() {
      this.reportZip = {
        year: this.params.year,
        from_month: 1,
        to_month: this.params.month || 12
      }
      this.reportZipVisible = true
    },
    // Bitta korxonaning yil + oy oralig'idagi 4 turdagi hisobotlarini .zip yuklab olish.
    _downloadReportsZip() {
      const orgId = this.params.organization_id
      const { year, from_month, to_month } = this.reportZip
      if (!orgId || !year || !from_month || !to_month) return
      this.reportZipLoading = true
      // Yuklab olinadigan ZIP nomi: «korxona nomi _ yil _ oy oralig'i» (fayl-xavfsiz).
      const safeOrg = String(this.selectedOrgName || 'hisobotlar')
        .replace(/[\\/:*?"<>|]+/g, '')
        .trim()
      const name = `${safeOrg}_${year}_${String(from_month).padStart(2, '0')}-${String(
        to_month
      ).padStart(2, '0')}.zip`
      $ApiService.accountantService
        ._reportsZip({
          params: { organization_id: orgId, year, from_month, to_month }
        })
        .then(async (res) => {
          // Biznes-xato HTTP 200 + JSON qaytaradi (Laravel parity). Blob JSON bo'lsa —
          // bu ZIP emas, xato; uni fayl qilib yuklamaymiz, xabarini ko'rsatamiz.
          const blob = res?.data
          if (blob && blob.type && blob.type.includes('application/json')) {
            let msg = t('content.error')
            try {
              const parsed = JSON.parse(await blob.text())
              if (typeof parsed?.message === 'string') msg = parsed.message
            } catch (e) {}
            $Toast.error(msg)
            return
          }
          Utils.blobFileDownload(blob, 'application/zip', name)
          this.reportZipVisible = false
        })
        .catch(() => {
          $Toast.error(t('content.error'))
        })
        .finally(() => {
          this.reportZipLoading = false
        })
    },
    // Hisobot holati modalini ochish + tanlangan oy uchun ma'lumotni yuklash.
    // Davr argumentsiz — upload-report sahifa filtridan; berilsa (masalan dashboarddan)
    // o'sha yil/oy bilan ochiladi. Modal ichida keyin o'zgartirilishi mumkin.
    openReportStatus(year = this.params.year, month = this.params.month) {
      this.reportStatusVisible = true
      this.reportStatusSearch = ''
      this.reportStatusRows = []
      this.reportStatusSummary = []
      this.reportStatusTotalOrgs = 0
      this.reportStatusPeriod = { year, month }
      this._loadReportStatus()
    },
    // Modal ichida davr o'zgarganda — qidiruvni tozalab, ma'lumotni qayta yuklaymiz.
    _changeReportPeriod() {
      this.reportStatusSearch = ''
      this._loadReportStatus()
    },
    // Modal davri (reportStatusPeriod) uchun korxonalar kesimida yuklash holati.
    _loadReportStatus() {
      this.reportStatusLoading = true
      const params = {
        year: this.reportStatusPeriod.year,
        month: this.reportStatusPeriod.month
      }
      $ApiService.accountantService
        ._reportStatus({ params })
        .then((res) => {
          const data = res.data.data ?? {}
          this.reportStatusRows = data.rows ?? []
          this.reportStatusSummary = data.summary ?? []
          this.reportStatusTotalOrgs = data.total_orgs ?? 0
        })
        .finally(() => {
          this.reportStatusLoading = false
        })
    },
    // Hisobot holatini Excel'ga yuklab olish (modal davri).
    _exportReportStatus() {
      this.reportStatusExporting = true
      const y = this.reportStatusPeriod.year
      const m = this.reportStatusPeriod.month
      const params = { year: y || undefined, month: m || undefined }
      const name = y && m ? `hisobot-holati-${y}-${m}.xlsx` : 'hisobot-holati.xlsx'
      $ApiService.accountantService
        ._reportStatusExport({ params })
        .then((res) => {
          Utils.blobFileDownload(res.data, XLSX_MIME, name)
        })
        .catch(() => {
          $Toast.error(t('content.error'))
        })
        .finally(() => {
          this.reportStatusExporting = false
        })
    },
    // --- Tortish tarixi (pull-log) ---
    openPullHistory() {
      this.pullHistoryVisible = true
      this.pullHistoryTab = 'pulls'
      this.pullHistoryParams = {
        type: null,
        year: null,
        month: null,
        organization_id: null,
        source: null,
        done: null,
        search: null,
        page: 1,
        per_page: 20
      }
      this.downloadsParams = {
        organization_id: null,
        year: null,
        search: null,
        page: 1,
        per_page: 20
      }
      this.downloadsRows = []
      this.downloadsTotal = 0
      this._loadPullHistory()
    },
    _loadPullHistory() {
      this.pullHistoryLoading = true
      const p = this.pullHistoryParams
      const params = {
        type: p.type || undefined,
        year: p.year || undefined,
        month: p.month || undefined,
        organization_id: p.organization_id || undefined,
        source: p.source || undefined,
        done: p.done || undefined,
        search: p.search?.trim() || undefined,
        page: p.page,
        per_page: p.per_page
      }
      $ApiService.accountantService
        ._pullHistory({ params })
        .then((res) => {
          const d = res.data.data ?? {}
          this.pullHistoryRows = d.data ?? []
          this.pullHistoryTotal = d.total ?? 0
        })
        .catch(() => {})
        .finally(() => {
          this.pullHistoryLoading = false
        })
    },
    // Sahifa o'zgarganda — o'sha sahifani yuklaymiz.
    _onPullHistoryPage(page) {
      this.pullHistoryParams.page = page
      this._loadPullHistory()
    },
    // Filtr o'zgarganda — 1-sahifadan qayta yuklaymiz.
    _changePullFilter() {
      this.pullHistoryParams.page = 1
      this._loadPullHistory()
    },
    // --- «ZIP yuklab olishlar» tab (Tortish tarixi ichida) ---
    _loadDownloads() {
      this.downloadsLoading = true
      const p = this.downloadsParams
      const params = {
        organization_id: p.organization_id || undefined,
        year: p.year || undefined,
        search: p.search?.trim() || undefined,
        page: p.page,
        per_page: p.per_page
      }
      $ApiService.accountantService
        ._reportDownloads({ params })
        .then((res) => {
          const d = res.data.data ?? {}
          this.downloadsRows = d.data ?? []
          this.downloadsTotal = d.total ?? 0
        })
        .catch(() => {})
        .finally(() => {
          this.downloadsLoading = false
        })
    },
    _onDownloadsPage(page) {
      this.downloadsParams.page = page
      this._loadDownloads()
    },
    _changeDownloadsFilter() {
      this.downloadsParams.page = 1
      this._loadDownloads()
    },
    // Tab almashganda — «ZIP yuklab olishlar» birinchi marta yuklanadi.
    _setHistoryTab(tab) {
      this.pullHistoryTab = tab
      if (tab === 'downloads' && !this.downloadsRows.length) this._loadDownloads()
    }
  }
})
