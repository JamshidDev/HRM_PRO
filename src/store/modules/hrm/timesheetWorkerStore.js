import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import dayjs from 'dayjs'
// Tabel turi id → harf. Backenddagi TIMESHEET_TYPE_KEY bilan bir xil.
const TIMESHEET_KEY_BY_ID = {
  1: 'K', 2: 'T', 3: 'РП', 5: 'С', 10: 'К', 14: 'MT', 15: 'ОД', 16: 'У',
  17: 'УВ', 18: 'УД', 19: 'Р', 20: 'ОЧ', 21: 'ОЖ', 22: 'ДО', 24: 'ОЗ',
  25: 'Б', 26: 'Т', 27: 'ЛЧ', 28: 'ВП', 29: 'Г', 31: 'ПР', 32: 'НС',
  33: 'D', 34: 'ЗБ', 35: 'НН'
}
// Soat yuritiladigan turlar (backend TIMESHEET_TYPE_HOURS).
const TIMESHEET_TYPES_WITH_HOURS = new Set([1, 2, 3, 5, 17, 27, 32])
const { t } = i18n.global
export const useTimesheetWorkerStore = defineStore('timesheetWorkerStore', {
  state: () => ({
    list: [],
    days: [],
    totalItems: 0,
    loading: false,
    saveLoading: false,
    pinLoading: false,
    pinWorkers: [],
    visible: false,
    elementId: null,
    allPermissionList: [],
    structureCheck: [],
    department: null,
    month: null,
    year: null,
    payload: {
      status: null,
      hours: null,
      status2: null,
      hours2: null,
      start: null,
      end: null,
      isClearing: false
    },
    params: {
      page: 1,
      per_page: 20,
      search: null,
      department_id: null
    },
    // Modal ichidagi bo'lim filtri uchun (tabel korxonasi bo'yicha).
    organizationId: null,
    organization: null,
    departmentOptions: [],
    departmentLoading: false,
    // Tabelchi rejimi — hujjat aylanishidagi «Tabellar» sahifasidan ochilganda.
    // Bo'lim filtri korxonaning HAMMA bo'limi emas, faqat biriktirilganlari.
    timekeeperMode: false,
    autoLoading: false,
    autoRules: null,
    // «Tabelchilar» tabi — tabel korxonasiga biriktirilgan mas'ul xodimlar.
    timekeeperList: [],
    timekeeperLoading: false,
    timekeeperTotal: 0,
    timekeeperParams: { page: 1, per_page: 20, search: null },
    // Ruxsat qulflari: `worker_position_id` → true (qulflangan). Yo'q = OCHIQ,
    // ya'ni default holatda hamma tabelchi shu oy tabelini o'zgartira oladi.
    // Manba — `time_sheet_timekeeper_locks` (tabel + lavozim juftligi).
    timekeeperLocks: {},
    timekeeperLockSaving: false,
    // Tasdiqlovchilar zanjiri — har birining joriy holati bilan.
    confirmationList: [],
    confirmationLoading: false,
    historyList: [],
    historyLoading: false,
    // Ro'yxatdan kelgan qulf holati: yakunlangan / yuborilgan tabel yozilmaydi.
    lock: { status: false, sent_at: null, confirmation: null }
  }),
  actions: {
    _confirmations() {
      this.confirmationLoading = true
      $ApiService.timesheetConfirmService
        ._index({ id: this.elementId })
        .then((res) => {
          this.confirmationList = res.data.data.confirmations ?? []
        })
        .finally(() => {
          this.confirmationLoading = false
        })
    },
    // Kelishuvchini ro'yxatdan olib tashlash. Tasdiqlaganini backend bermaydi.
    _deleteConfirmation(confirmationId) {
      return $ApiService.timesheetConfirmService
        ._delete({ id: this.elementId, elementId: confirmationId })
        .then(() => this._confirmations())
    },
    _confirmationHistory() {
      this.historyLoading = true
      $ApiService.timesheetConfirmService
        ._history({ id: this.elementId })
        .then((res) => {
          this.historyList = res.data.data.history ?? []
        })
        .finally(() => {
          this.historyLoading = false
        })
    },
    // Tabelchilar — TABELGA bog'langan endpoint: doira tabel korxonasiga
    // biriktirilganlar bo'yicha (xodimning lavozimi qaysi korxonada ekani emas).
    // Qulf holati ham shu javobda keladi — alohida so'rov shart emas.
    _timekeepers() {
      this.timekeeperLoading = true
      $ApiService.timesheetWorkerService
        ._timekeepers({ id: this.elementId, params: { ...this.timekeeperParams } })
        .then((res) => {
          const rows = res.data.data.data
          this.timekeeperList = rows
          this.timekeeperTotal = res.data.data.total
          this.timekeeperLocks = Object.fromEntries(
            rows.filter((v) => v.locked).map((v) => [v.id, true])
          )
        })
        .finally(() => {
          this.timekeeperLoading = false
        })
    },
    // Optimistik: switch darhol o'zgaradi, so'rov yiqilsa holat qaytariladi.
    // Boshqa tabel ochilganda filtrlarni tozalaydi. Ilgari `department_id` va
    // `departmentOptions` eski korxonanikidan qolib ketardi — natijada yangi
    // tabel begona bo'lim bo'yicha filtrlanardi.
    resetForTimesheet() {
      this.params.page = 1
      this.params.search = null
      this.params.department_id = null
      this.departmentOptions = []
      this.organizationId = null
      this.organization = null
      this.list = []
      this.days = []
      this.totalItems = 0
      this.timekeeperList = []
      this.timekeeperLocks = {}
      this.timekeeperTotal = 0
      this.timekeeperParams.page = 1
      this.confirmationList = []
      this.historyList = []
    },
    setTimekeeperLock(workerPositionId, locked) {
      const prev = Boolean(this.timekeeperLocks[workerPositionId])
      if (locked) this.timekeeperLocks[workerPositionId] = true
      else delete this.timekeeperLocks[workerPositionId]

      this.timekeeperLockSaving = true
      $ApiService.timesheetWorkerService
        ._set_timekeeper_lock({
          id: this.elementId,
          data: { worker_position_id: workerPositionId, locked }
        })
        .catch(() => {
          if (prev) this.timekeeperLocks[workerPositionId] = true
          else delete this.timekeeperLocks[workerPositionId]
        })
        .finally(() => {
          this.timekeeperLockSaving = false
        })
    },
    _index() {
      this.loading = true
      let promises = []
      let params = {
        ...this.params
      }
      promises.push(
        $ApiService.timesheetWorkerService._index({ id: this.elementId, params }).then((res) => {
          this.list = res.data.data.data.map((i) => ({
            ...i,
            days: Object.fromEntries(i.days.map((i) => [i.day, i.details])),
            halfMonth: {
              days: i.days.filter((i) => i.day <= 15).length,
              hours: i.days
                .filter((i) => i.day <= 15)
                .reduce((sum, day) => {
                  const dayHours = day.details.reduce((daySum, detail) => {
                    return daySum + detail.hours
                  }, 0)
                  return sum + dayHours
                }, 0)
            },
            allMonth: {
              days: i.days.length,
              hours: i.days.reduce((sum, day) => {
                const dayHours = day.details.reduce((daySum, detail) => {
                  return daySum + detail.hours
                }, 0)

                return sum + dayHours
              }, 0)
            }
          }))
          this.totalItems = res.data.data.total
        })
      )
      promises.push(
        $ApiService.timesheetWorkerService._get_days({ id: this.elementId }).then((res) => {
          this.days = res.data.data.days
          this.month = res.data.data.month - 1
          this.year = res.data.data.year
          this.department = res.data.data.department
          this.organization = res.data.data.organization ?? null
          if (
            res.data.data.organization_id &&
            this.organizationId !== res.data.data.organization_id
          ) {
            this.organizationId = res.data.data.organization_id
            this._departments()
          }
        })
      )
      Promise.all(promises).then(() => {
        this.loading = false
      })
    },
    _index_workers() {
      this.loading = true
      let params = {
        ...this.params
      }
      $ApiService.timesheetWorkerService
        ._index({ id: this.elementId, params })
        .then((res) => {
          this.list = res.data.data.data.map((i) => ({
            ...i,
            days: Object.fromEntries(i.days.map((i) => [i.day, i.details])),
            halfMonth: {
              days: i.days.filter((i) => i.day <= 15).length,
              hours: i.days
                .filter((i) => i.day <= 15)
                .reduce((sum, day) => {
                  const dayHours = day.details.reduce((daySum, detail) => {
                    return daySum + detail.hours
                  }, 0)
                  return sum + dayHours
                }, 0)
            },
            allMonth: {
              days: i.days.length,
              hours: i.days.reduce((sum, day) => {
                const dayHours = day.details.reduce((daySum, detail) => {
                  return daySum + detail.hours
                }, 0)

                return sum + dayHours
              }, 0)
            }
          }))
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Bo'lim filtri select'i — tabel korxonasining bo'limlari.
    // Tabelchi rejimida faqat O'ZIGA biriktirilgan bo'limlar (backend doirasi
    // bilan bir xil, aks holda tanlagan bo'limi bo'sh chiqardi).
    _departments() {
      if (this.timekeeperMode) return this._assignedDepartments()
      if (!this.organizationId) return
      this.departmentLoading = true
      $ApiService.componentService
        ._departmentByOrganizations({
          params: { page: 1, per_page: 200, organizations: String(this.organizationId) }
        })
        .then((res) => {
          this.departmentOptions = res.data.data.data.map((v) => ({ id: v.id, name: v.name }))
        })
        .finally(() => {
          this.departmentLoading = false
        })
    },
    _assignedDepartments() {
      this.departmentLoading = true
      return $ApiService.timesheetService
        ._index_departments()
        .then((res) => {
          this.departmentOptions = (res.data.data.departments ?? []).map((v) => ({
            id: v.id,
            name: v.name
          }))
        })
        .finally(() => {
          this.departmentLoading = false
        })
    },
    // Filtr o'zgarganda ro'yxat birinchi sahifadan qayta yuklanadi.
    applyFilters() {
      this.params.page = 1
      this._index_workers()
    },
    // Lokal ko'rinish: tanlangan katakcha darhol qiymat bilan to'ladi (yoki
    // tozalash rejimida bo'shaydi). Serverga esa «Saqlash» bosilganda ketadi —
    // navbatchilik grafigidagi bilan bir xil yondashuv.
    applyLocalCell(row, col, details) {
      const worker = this.list[row]
      if (!worker) return
      const day = col + 1
      if (!details?.length) delete worker.days[day]
      else {
        // `status_id` SHART — rang shu bo'yicha tanlanadi (har tur o'z rangida).
        // Soat qo'yilmaydigan turda `null` qoladi — katakchada `0` chiqmasin
        // («Natija» namunasidagi bilan bir xil ko'rinish).
        worker.days[day] = details.map((d) => ({
          status: d.status,
          status_id: d.status_id,
          hours: d.hours ?? null
        }))
      }
      this.recalcWorker(row)
    },

    recalcWorker(row) {
      const worker = this.list[row]
      if (!worker) return
      const entries = Object.entries(worker.days || {})
      const sum = (list) =>
        list.reduce((total, [, details]) => total + details.reduce((a, d) => a + (d.hours || 0), 0), 0)
      const half = entries.filter(([day]) => Number(day) <= 15)
      worker.allMonth = { days: entries.length, hours: sum(entries) }
      worker.halfMonth = { days: half.length, hours: sum(half) }
    },

    // `cells` — [{ row, col, wasOccupied }]. To'ldirilgan katak ustidan yozilsa
    // avval eski yozuv o'chiriladi (aks holda bazada ikkita yozuv qolib,
    // katakda `РП/РП 5/5` ko'rinishida chiqardi).
    async _save(cells) {
      if (!cells?.length) return
      const dayOf = (col) =>
        dayjs()
          .year(this.year)
          .month(this.month)
          .date(col + 1)
          .format('YYYY-MM-DD')
      const toCell = (c) => ({ id: this.list[c.row]?.id, day: dayOf(c.col) })

      const all = cells.map(toCell).filter((c) => c.id)
      const occupied = cells
        .filter((c) => c.wasOccupied)
        .map(toCell)
        .filter((c) => c.id)
      if (!all.length) return

      const service = $ApiService.timesheetWorkerService
      this.saveLoading = true
      try {
        const toClear = this.payload.isClearing ? all : occupied
        if (toClear.length) {
          await service._create({
            data: { status: 0, hours: 0, workers: toClear },
            id: this.elementId
          })
        }
        if (!this.payload.isClearing) {
          await service._create({
            data: { status: this.payload.status, hours: this.payload.hours || 0, workers: all },
            id: this.elementId
          })
          if (this.payload.status2) {
            await service._create({
              data: {
                status: this.payload.status2,
                hours: this.payload.hours2 || 0,
                workers: all
              },
              id: this.elementId
            })
          }
        }
        this._index_workers()
        // Ikkinchi tur saqlangach tozalanadi — aks holda u keyingi
        // to'ldirishlarga ham ergashib, katakchada ikkita yozuv hosil qilardi.
        this.payload.status2 = null
        this.payload.hours2 = null
      } finally {
        this.saveLoading = false
      }
    },
    // Auto hisoblash — JORIY SAHIFADAGI xodimlar uchun. Natija lokal
    // qo'yiladi (katakchalar to'ladi), bazaga «Saqlash» bosilganda ketadi.
    // `workerPositionIds` berilsa faqat o'shalar hisoblanadi (qator menyusidagi
    // «Qayta hisoblash»); berilmasa — joriy sahifadagi hamma xodim («Auto»).
    async autoCalc(workerPositionIds = null) {
      const ids = (workerPositionIds ?? this.list.map((w) => w.id)).filter(Boolean)
      if (!ids.length) return null
      this.autoLoading = true
      try {
        const res = await $ApiService.timesheetWorkerService._auto_calc({
          id: this.elementId,
          data: { worker_position_ids: ids }
        })
        const items = res.data.data ?? []
        let filled = 0
        for (const item of items) {
          const row = this.list.findIndex((w) => w.id === item.id)
          if (row < 0) continue
          for (const d of item.days ?? []) {
            this.applyLocalCell(row, d.day - 1, [
              {
                status: TIMESHEET_KEY_BY_ID[d.status] ?? null,
                status_id: d.status,
                hours: TIMESHEET_TYPES_WITH_HOURS.has(d.status) ? (d.hours ?? 0) : null
              }
            ])
            filled++
          }
        }
        return { workers: items.length, cells: filled }
      } finally {
        this.autoLoading = false
      }
    },

    async dayDetail(workerPositionId, date) {
      const res = await $ApiService.timesheetWorkerService._day_detail({
        id: this.elementId,
        params: { worker_position_id: workerPositionId, date }
      })
      return res.data.data
    },

    async autoCalcRules() {
      if (this.autoRules) return this.autoRules
      const res = await $ApiService.timesheetWorkerService._auto_calc_rules()
      this.autoRules = res.data.data
      return this.autoRules
    },

    _check_pin(v) {
      this.pinLoading = true
      $ApiService.timesheetWorkerService
        ._check_worker(v)
        .then((res) => {
          this.pinWorkers = res.data.data.map((i) => ({
            ...i,
            disabled: !!this.list.find((j) => j.id === i.id)
          }))
        })
        .finally(() => {
          this.pinLoading = false
        })
    },
    _prepend_workers(v) {
      this.list.unshift({
        days: {},
        allMonth: {},
        halfMonth: {},
        id: v.id,
        name: `${v.worker.last_name[0]}.${v.worker.middle_name[0]}.${v.worker.first_name}`,
        photo: v.worker?.photo,
        position: v.post_name
      })
      this.pinWorkers = []
    },
    openVisible(data) {
      this.visible = data
    },
    resetSelection() {
      this.payload.start = null
      this.payload.end = null
    },
    resetStatuses() {
      this.payload.status = null
      this.payload.hours = null
      this.payload.status2 = null
      this.payload.hours2 = null
    },
    resetAll() {
      this.payload.status = null
      this.payload.hours = null
      this.payload.status2 = null
      this.payload.hours2 = null
      this.payload.start = null
      this.payload.end = null
      this.payload.isClearing = false
    }
  }
})
