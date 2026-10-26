import { defineStore } from 'pinia'
import { useAccountStore } from '@/store/modules/index.js'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
const { t } = i18n.global

const fmt = (d) => (d ? d.slice(8, 10) + '.' + d.slice(5, 7) : '')
// Xodim shu oyda qaysi grafikda — ro'yxat ostidagi izoh.
export const scheduleLabel = (ranges, groupId) => {
  if (!ranges?.length) return t('shiftType.groupView.noSchedule')
  return ranges
    .map((r) =>
      r.group_id === Number(groupId)
        ? t('shiftType.groupView.inThisSchedule')
        : t('shiftType.groupView.otherSchedule', { name: r.type_name, from: fmt(r.date_from), to: fmt(r.date_to) })
    )
    .join(' · ')
}

export const useScheduleGroupWorkerStore = defineStore('scheduleGroupWorkerStore', {
  state: () => ({
    list: [],
    loading: false,
    visible: false,

    elementId: null,
    totalItems: 0,

    params: {
      page: 1,
      // Guruh odatda bir necha o'nlab xodimdan iborat — butun guruh bitta sahifada
      // keladi, shunda brauzerdagi qidiruv hamma xodimni qamraydi.
      per_page: 100,
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
    dayEdit: { choice: null, start: null, end: null },

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
    addSlot: { visible: false, phase: null, fam: 0 },
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
        free_on: this.replacePayload.date ? Utils.timeToZone(this.replacePayload.date) : undefined
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
            position: scheduleLabel(v.rangeSchedules, this.params.group),
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
