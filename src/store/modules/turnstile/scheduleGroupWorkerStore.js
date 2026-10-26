import { defineStore } from 'pinia'
import { useAccountStore } from '@/store/modules/index.js'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global

// Xodim shu oyda qaysi grafikda — ro'yxat ostidagi izoh: faqat grafik nomi yoki «Grafiksiz».
export const scheduleLabel = (ranges) => {
  const names = [...new Set((ranges ?? []).map((r) => r.type_name).filter(Boolean))]
  return names.length ? names.join(' · ') : t('shiftType.groupView.noSchedule')
}

export const useScheduleGroupWorkerStore = defineStore('scheduleGroupWorkerStore', {
  state: () => ({
    list: [],
    // Saqlangan o'rinlar: [{worker_position_id, crew, navbat, owner_worker_position_id}].
    slots: [],
    // Shu oyda guruhdagi barcha lavozimlar va brigada chegarasidagi sahifalash.
    monthWps: [],
    // Guruhdagi eng katta brigada raqami (tabelchi ko'rmaydiganlari ham) — yangi brigada to'qnashmasin.
    maxCrew: 0,
    paging: { last_page: 1, from: 0, to: 0 },
    loading: false,
    visible: false,

    elementId: null,
    totalItems: 0,

    params: {
      page: 1,
      // Guruh odatda bir necha o'nlab xodimdan iborat — butun guruh bitta sahifada
      // keladi, shunda brauzerdagi qidiruv hamma xodimni qamraydi.
      per_page: 50,
      search: null,
      group: null,
      startDate: null,
      endDate: null,
      // Guruhdagi rejalashtirilgan o'rinlar soni (generatsiyada).
      slots: 0
    },
    uiParams: {
      year: null,
      month: null
    },
    scheduleList: [],
    dayOfMonth: [],
    dayOfMonthLoading: false,
    shortNameOfWeek: {
      1: t('shortWeek.Mon'),
      2: t('shortWeek.Tue'),
      3: t('shortWeek.Wed'),
      4: t('shortWeek.Thu'),
      5: t('shortWeek.Fri'),
      6: t('shortWeek.Sat'),
      0: t('shortWeek.Sun')
    },
    selectedWorker: null,
    // Xodim qaysi guruhda (jadvaldan) — almashishda kesishma ogohlantirishi uchun.
    crewMap: {},
    // O'zgartirilgan kun ma'lumoti oynasi.
    changeInfo: { visible: false },
    replaceVisible: false,
    replacePayload: {
      positonId: null,
      date: null
    },
    replaceLoading: false,
    // Katakdan ochilganda: 'edit' — kunni o'zgartirish, 'swap' — xodim bilan almashtirish.
    replaceMode: 'swap',
    // Almashtirishda: true — tanlangan kundan oy oxirigacha o'ringa boshqa xodim.
    transferMode: false,
    // breakStart/breakEnd — «Boshqa vaqt» uchun tushlik (HH:mm), backendga break_start_time/break_end_time;
    // hasBreak — tushlik belgisi (olinsa tushliksiz kun).
    dayEdit: { choice: null, start: null, end: null, breakStart: null, breakEnd: null, hasBreak: false },

    workerParams: {
      page: 1,
      per_page: 50,
      search: null
    },
    workerList: [],
    totalWorker: 0,
    workerLoading: false,
    monthsList: [],
    selectedDate: null,
    // Guruh smena turi (nom + naqsh) — sahifa kartochkasi va navbat hisobi uchun.
    shiftType: null,
    // Bo'sh navbatga xodim qo'shish oynasi.
    addSlot: { visible: false, phase: null, fam: 0, from: null, crew: null, pos: null },
    // Xodim grafigini navbati bo'yicha qayta yaratish oynasi.
    regen: { visible: false, worker: null },
    // Xodimni guruhdan chiqarish oynasi.
    remove: { visible: false, worker: null, loading: false }
  }),
  getters: {
    calculateWorkTime: (state) => (workerIndex) => {
      state.scheduleList
      return 0
    },
    // Tanlangan oy oralig'i (YYYY-MM-DD).
    monthRange: (state) => {
      if (!state.selectedDate) return { from: null, to: null }
      const [y, m] = state.selectedDate.split('-').map(Number)
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
      const mm = String(m).padStart(2, '0')
      return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, '0')}` }
    },
    // O'tgan oy grafigi faqat ko'rish uchun (`turnstile-sheets-groups-past-write` ruxsati bo'lmasa).
    isPastMonth: (state) => {
      if (!state.selectedDate) return false
      const [y, m] = state.selectedDate.split('-').map(Number)
      const now = new Date()
      if (y * 12 + m >= now.getFullYear() * 12 + now.getMonth() + 1) return false
      const accStore = useAccountStore()
      return !accStore.checkPermission(accStore.pn.turnstileSheetsGroupsPastWrite)
    },
    // Standart sana: bugun shu oyda bo'lsa — bugun, aks holda oy boshi.
    defaultDate() {
      const { from, to } = this.monthRange
      const today = Utils.timeToZone(Date.now())
      return from && today >= from && today <= to ? today : from
    }
  },
  actions: {
    _shiftType(id) {
      this.shiftType = null
      if (!id) return
      $ApiService.shiftTypeService._types({ params: { page: 1, per_page: 200 } }).then((res) => {
        const list = res.data.data?.data ?? res.data.data ?? []
        this.shiftType = list.find((v) => v.id === Number(id)) ?? null
      })
    },
    _editDay(data) {
      this.replaceLoading = true
      $ApiService.shiftTypeService
        ._editDay({ data })
        .then(() => {
          this.replaceVisible = false
          this._index()
        })
        .finally(() => {
          this.replaceLoading = false
        })
    },
    _replaceWorker(data) {
      this.replaceLoading = true
      $ApiService.shiftTypeService
        ._replaceWorker({ data })
        .then(() => {
          this.replaceVisible = false
          // Oy o'zgarmaydi — faqat jadval yangilanadi.
          this._index()
        })
        .finally(() => {
          this.replaceLoading = false
        })
    },
    _removeWorker(data) {
      this.remove.loading = true
      $ApiService.shiftTypeService
        ._removeWorker({ data })
        .then(() => {
          this.remove.visible = false
          this._index()
        })
        .finally(() => {
          this.remove.loading = false
        })
    },
    _transferSlot(data) {
      this.replaceLoading = true
      $ApiService.shiftTypeService
        ._transferSlot({ data })
        .then(() => {
          this.replaceVisible = false
          this._index()
        })
        .finally(() => {
          this.replaceLoading = false
        })
    },
    // overwrite=false — faqat yangi o'rinlar yoziladi (jim, xatoni ko'rsatmaydi).
    _saveSlots(slots, overwrite = false) {
      if (!slots.length || !this.params.group) return Promise.resolve()
      return $ApiService.shiftTypeService
        ._saveSlots({ data: { group_id: Number(this.params.group), slots, overwrite } })
        .then(() => {
          const byWp = new Map(this.slots.map((v) => [v.worker_position_id, v]))
          slots.forEach(
            (v) =>
              (overwrite || !byWp.has(v.worker_position_id)) && byWp.set(v.worker_position_id, v)
          )
          this.slots = [...byWp.values()]
        })
        .catch(() => {})
    },
    // Xodimsiz brigadani o'chirish (rejadagi bo'sh brigada — o'rinlar soni kamayadi).
    _deleteCrew(crew, crewSize) {
      $ApiService.shiftTypeService
        ._deleteCrew({ data: { group_id: Number(this.params.group), crew, crew_size: crewSize } })
        .then(() => {
          if (!this.slots.some((v) => v.crew === crew)) this.params.slots = Math.max((this.params.slots || 0) - crewSize, 0)
          this._index()
        })
    },
    _cancelSubstitution(id) {
      this.replaceLoading = true
      $ApiService.shiftTypeService
        ._cancelSubstitution({ id })
        .then(() => {
          this.changeInfo.visible = false
          this._index()
        })
        .finally(() => {
          this.replaceLoading = false
        })
    },
    // append=true — skrolda keyingi sahifa qo'shiladi.
    _workers(append = false) {
      this.workerParams.page = append ? this.workerParams.page + 1 : 1
      const params = {
        ...this.workerParams,
        start_date: this.monthRange.from,
        end_date: this.monthRange.to,
        priority_group: this.params.group,
        // O'rinbosar — faqat shu kuni dam bo'lganlar.
        free_on: !this.transferMode && this.replacePayload.date ? Utils.timeToZone(this.replacePayload.date) : undefined
      }
      this.workerLoading = true
      $ApiService.shiftTypeService
        ._getWorkers({ params })
        .then((res) => {
          const selectedData = this.workerList.filter(
            (v) => v.positionId === this.replacePayload.positonId
          )

          const data = res.data.data.data.map((v) => ({
            name: Utils.combineFullName(v.worker),
            id: v.worker.id,
            positionId: v.id,
            position: scheduleLabel(v.rangeSchedules),
            ranges: v.rangeSchedules ?? [],
            group: v.scheduleGroup,
            type: v.scheduleType
          }))
            .filter((v) => v.positionId !== this.selectedWorker?.workerPositionId)
          const base = append ? this.workerList : selectedData
          this.workerList = [
            ...new Map([...base, ...data].map((v) => [v.positionId, v])).values()
          ]
          this.totalWorker = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _index() {
      const month = this.selectedDate.split('-')[1]
      const year = this.selectedDate.split('-')[0]
      const params = {
        page: this.params.page,
        per_page: this.params.per_page,
        year: year,
        month: month,
        group: this.params.group
      }
      this.loading = true
      $ApiService.shiftTypeService
        ._groupWorker({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.slots = res.data.data.slots ?? []
          this.monthWps = res.data.data.month_wps ?? []
          this.maxCrew = res.data.data.max_crew ?? 0
          const { last_page = 1, from = 0, to = 0 } = res.data.data
          this.paging = { last_page, from, to }
          this.totalItems = res.data.data.total
          // Havolada `type` bo'lmasa — smena turi javobdan olinadi.
          const typeId = res.data.data.schedule_type_id
          if (typeId && this.shiftType?.id !== typeId) this._shiftType(typeId)
        })
        .finally(() => {
          this.loading = false
        })
    },
    _dayOfMonth(callback) {
      this.dayOfMonthLoading = true
      // Yil ham tanlangan oydan olinadi: ilgari `params.year1` faqat oy almashtirilganda
      // to'ldirilardi va birinchi ochilishda yil umuman yuborilmasdi.
      const [year, month] = this.selectedDate.split('-')
      const params = { year, month }
      $ApiService.workerScheduleService
        ._daysOfMonth({ params })
        .then((res) => {
          this.dayOfMonth = res.data.data.days
          callback?.()
        })
        .finally(() => {
          this.dayOfMonthLoading = false
        })
    }
  }
})
