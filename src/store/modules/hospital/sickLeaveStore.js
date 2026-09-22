import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

// Card va filtr statuslari — backend `status` parametri bilan bir xil.
export const SICK_LEAVE_STATUS = {
  open: 1,
  closed: 2,
  unexcused: 3,
  expiring: 4
}

export const SICK_LEAVE_CLOSE_TYPE = {
  withDocument: 1,
  unexcused: 2
}

const emptyPayload = () => ({
  worker_position_id: null,
  from_date: null,
  to_date: null,
  close_type: SICK_LEAVE_CLOSE_TYPE.withDocument,
  number: null,
  issued_date: null,
  close_reason: null,
  file: null
})

const emptyClosePayload = () => ({
  close_type: SICK_LEAVE_CLOSE_TYPE.withDocument,
  to_date: null,
  number: null,
  issued_date: null,
  close_reason: null,
  file: null
})

export const useSickLeaveStore = defineStore('sickLeaveStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    totalItems: 0,
    elementId: null,

    visible: false,
    visibleType: true,
    closeVisible: false,
    viewVisible: false,
    viewRow: null,
    deleteVisible: false,

    payload: emptyPayload(),

    // Xodim tanlash ro'yxati — `/hr/worker-positions` rol + org-scope bo'yicha
    // filtrlaydi, shuning uchun korxonani qo'lda tanlash shart emas.
    workerList: [],
    workerLoading: false,
    workerTotal: 0,
    workerParams: { page: 1, per_page: 50, search: null },
    workerTimer: null,
    closePayload: emptyClosePayload(),
    // Yopish oynasidagi kalendarni cheklash uchun — varaqaning boshlanish sanasi.
    closeFrom: null,
    // Korxona filtri (UISelect) ichki holati.
    structureCheck: [],

    params: {
      page: 1,
      per_page: 15,
      search: null,
      status: null,
      organizations: [],
      from_date: null,
      to_date: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations?.map((v) => v.id).join(',') || null
      }
      $ApiService.sickLeaveService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      $ApiService.sickLeaveService
        ._create({ data: this._buildBody() })
        .then((res) => {
          if (res.data.error) return
          $Toast.success(res.data.message)
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.sickLeaveService
        ._update({ id: this.elementId, data: this._buildBody() })
        .then((res) => {
          if (res.data.error) return
          $Toast.success(res.data.message)
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _close() {
      const p = this.closePayload
      const form = new FormData()
      form.append('close_type', p.close_type)
      form.append('to_date', p.to_date)
      if (p.close_type === SICK_LEAVE_CLOSE_TYPE.withDocument) {
        form.append('number', p.number ?? '')
        form.append('issued_date', p.issued_date ?? '')
        if (p.file) form.append('file', p.file)
      } else {
        form.append('close_reason', p.close_reason ?? '')
      }

      this.saveLoading = true
      $ApiService.sickLeaveService
        ._close({ id: this.elementId, data: form })
        .then((res) => {
          if (res.data.error) return
          $Toast.success(res.data.message)
          this.closeVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.saveLoading = true
      $ApiService.sickLeaveService
        ._delete({ id: this.elementId })
        .then((res) => {
          if (res.data.error) return
          $Toast.success(res.data.message)
          this.deleteVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // `to_date` bo'lsa varaqa darhol yopiq yaratiladi — hujjat bilan yopishda
    // PDF ketadi, shuning uchun FormData.
    _workers(append = false) {
      this.workerLoading = true
      $ApiService.workerService
        ._index({ params: { ...this.workerParams } })
        .then((res) => {
          const rows = res.data.data.data.map((v) => ({
            id: v.id,
            name: [v.worker?.last_name, v.worker?.first_name, v.worker?.middle_name]
              .filter(Boolean)
              .join(' '),
            // Backenddagi `getShortPosition` bilan bir xil: markaziy bo'limda
            // (level 1) faqat lavozim, aks holda «bo'lim + lavozim».
            position:
              v.department?.level === 1
                ? (v.position?.name ?? null)
                : [v.department?.name, v.position?.name].filter(Boolean).join(' ') || null
          }))
          this.workerList = append ? [...this.workerList, ...rows] : rows
          this.workerTotal = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    // Har harfda so'rov yubormaslik uchun kechikish.
    // Tahrirlashda tanlangan xodim ro'yxatda bo'lmasligi mumkin — shunda select
    // yorliq o'rniga id ko'rsatadi. Qatordagi ma'lumotdan variant qo'shamiz.
    _ensureWorkerOption(option) {
      if (!option?.id) return
      if (this.workerList.some((v) => v.id === option.id)) return
      this.workerList = [option, ...this.workerList]
    },
    _searchWorker(v) {
      clearTimeout(this.workerTimer)
      this.workerTimer = setTimeout(() => {
        this.workerParams.search = v || null
        this.workerParams.page = 1
        this._workers()
      }, 400)
    },
    // SuperSelect pastga aylantirilganda chaqiradi — keyingi sahifa.
    _nextWorkerPage() {
      if (this.workerList.length >= this.workerTotal || this.workerLoading) return
      this.workerParams.page += 1
      this._workers(true)
    },
    _scrollWorker(e) {
      const el = e.target
      if (el.scrollTop + el.offsetHeight < el.scrollHeight - 20) return
      if (this.workerList.length >= this.workerTotal || this.workerLoading) return
      this.workerParams.page += 1
      this._workers(true)
    },
    _buildBody() {
      const p = this.payload
      if (!p.to_date) {
        return { worker_position_id: p.worker_position_id, from_date: p.from_date }
      }
      const form = new FormData()
      form.append('worker_position_id', p.worker_position_id)
      form.append('from_date', p.from_date)
      form.append('to_date', p.to_date)
      form.append('close_type', p.close_type)
      if (p.close_type === SICK_LEAVE_CLOSE_TYPE.withDocument) {
        form.append('number', p.number ?? '')
        form.append('issued_date', p.issued_date ?? '')
        if (p.file) form.append('file', p.file)
      } else {
        form.append('close_reason', p.close_reason ?? '')
      }
      return form
    },
    _resetPayload() {
      this.payload = emptyPayload()
      this.elementId = null
      this.visibleType = true
    },
    _resetClosePayload() {
      this.closePayload = emptyClosePayload()
    },
    _statusName(row) {
      return row.to_date ? t('sickLeave.status.closed') : t('sickLeave.status.open')
    }
  }
})
