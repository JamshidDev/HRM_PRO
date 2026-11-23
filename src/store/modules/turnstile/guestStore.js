import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import i18n from '@/i18n/index.js'
const { t } = i18n.global

// Shtatdan tashqari mehmonlar ro'yxati, biriktirish va hodisalar.
export const useGuestStore = defineStore('guestStore', {
  state: () => ({
    list: [],
    total: 0,
    loading: false,
    params: { page: 1, per_page: 15, search: null, date: dayjs().format('YYYY-MM-DD') },
    visible: false,
    editId: null,
    saveLoading: false,
    payload: { pin: '', work_start: '09:00', work_end: '18:00', note: '' },
    eventsVisible: false,
    eventsGuest: null,
    events: [],
    eventsLoading: false,
    eventsRange: null
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.guestService
        ._index({ params: { ...this.params, search: this.params.search || undefined } })
        .then((res) => {
          this.list = res.data.data.data
          this.total = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    openCreate() {
      this.editId = null
      this.payload = { pin: '', work_start: '09:00', work_end: '18:00', note: '' }
      this.visible = true
    },
    openEdit(row) {
      this.editId = row.id
      this.payload = {
        pin: row.pin,
        work_start: row.work_start,
        work_end: row.work_end,
        note: row.note ?? ''
      }
      this.visible = true
    },
    _save() {
      this.saveLoading = true
      const { pin, ...rest } = this.payload
      const req = this.editId
        ? $ApiService.guestService._update({ id: this.editId, data: rest })
        : $ApiService.guestService._create({ data: { pin, ...rest } })
      req
        .then(() => {
          this.visible = false
          $Toast.success(t('message.successDone'))
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(id) {
      $ApiService.guestService._delete({ id }).then(() => {
        $Toast.success(t('message.successDone'))
        this._index()
      })
    },
    openEvents(row) {
      this.eventsGuest = row
      const end = dayjs()
      this.eventsRange = [end.subtract(6, 'day').valueOf(), end.valueOf()]
      this.events = []
      this.eventsVisible = true
      this._events()
    },
    _events() {
      if (!this.eventsGuest || !this.eventsRange) return
      this.eventsLoading = true
      $ApiService.guestService
        ._events({
          id: this.eventsGuest.id,
          params: {
            from: dayjs(this.eventsRange[0]).format('YYYY-MM-DD'),
            to: dayjs(this.eventsRange[1]).format('YYYY-MM-DD')
          }
        })
        .then((res) => {
          this.events = res.data.data
        })
        .finally(() => {
          this.eventsLoading = false
        })
    }
  }
})
