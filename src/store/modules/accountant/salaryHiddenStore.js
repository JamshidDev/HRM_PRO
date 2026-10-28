import { defineStore } from 'pinia'

export const useSalaryHiddenStore = defineStore('salaryHidden', {
  state: () => ({
    list: [],
    total: 0,
    currentPage: 1,
    loading: false,
    createLoading: false,
    deleteLoading: false,
    search: '',
    // Yangi qo'shish formasi
    form: {
      pinfl: '',
      note: ''
    },
    showForm: false,
    // Xodim qidiruvi (ism/PINFL bo'yicha tanlab yashirish)
    workerOptions: [],
    workerSearchLoading: false,
    // "Yashirilganni ko'ra oladigan" (viewer) ro'yxati — faqat granterlar boshqaradi.
    viewerList: [],
    viewerTotal: 0,
    viewerPage: 1,
    viewerLoading: false,
    canManageViewers: false, // GET /viewers 200 → true (tab ko'rinadi); 403 → false
    viewerForm: { pinfl: '', note: '' },
    viewerCreateLoading: false,
    viewerDeleteLoading: false
  }),
  actions: {
    _index(page = 1) {
      this.currentPage = page
      this.loading = true
      $ApiService.salaryHiddenService
        ._index({ page, per_page: 20, search: this.search || undefined })
        .then((res) => {
          this.list = res.data.data?.data || []
          this.total = res.data.data?.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },

    async _create() {
      if (!this.form.pinfl || this.form.pinfl.length !== 14) return
      this.createLoading = true
      try {
        await $ApiService.salaryHiddenService._create({
          pinfl: this.form.pinfl.trim(),
          note: this.form.note.trim() || undefined
        })
        $Toast.success("Qo'shildi")
        this.form.pinfl = ''
        this.form.note = ''
        this.showForm = false
        this._index()
      } finally {
        this.createLoading = false
      }
    },

    async _delete(id) {
      this.deleteLoading = true
      try {
        await $ApiService.salaryHiddenService._delete(id)
        $Toast.success("O'chirildi")
        this._index(this.currentPage)
      } finally {
        this.deleteLoading = false
      }
    },

    onSearch() {
      this._index(1)
    },

    // ─── "Ko'ra oladiganlar" (viewers) ───────────────────────────────────────
    // GET muvaffaqiyatli → granter (tab ko'rinadi); 403 → canManageViewers=false.
    _viewers(page = 1) {
      this.viewerPage = page
      this.viewerLoading = true
      $ApiService.salaryHiddenService
        ._viewers({ page, per_page: 20 })
        .then((res) => {
          this.viewerList = res.data.data?.data || []
          this.viewerTotal = res.data.data?.total || 0
          this.canManageViewers = true
        })
        .catch((e) => {
          if (e?.response?.status === 403) this.canManageViewers = false
        })
        .finally(() => {
          this.viewerLoading = false
        })
    },

    async _addViewer() {
      if (!this.viewerForm.pinfl || this.viewerForm.pinfl.length !== 14) return
      this.viewerCreateLoading = true
      try {
        await $ApiService.salaryHiddenService._addViewer({
          pinfl: this.viewerForm.pinfl.trim(),
          note: this.viewerForm.note.trim() || undefined
        })
        $Toast.success("Qo'shildi")
        this.viewerForm.pinfl = ''
        this.viewerForm.note = ''
        this._viewers()
      } finally {
        this.viewerCreateLoading = false
      }
    },

    async _removeViewer(id) {
      this.viewerDeleteLoading = true
      try {
        await $ApiService.salaryHiddenService._removeViewer(id)
        $Toast.success("O'chirildi")
        this._viewers(this.viewerPage)
      } finally {
        this.viewerDeleteLoading = false
      }
    },

    // Xodimni ism/PINFL bo'yicha qidirish — select uchun variantlar.
    _searchWorkers(query) {
      const q = (query || '').trim()
      if (q.length < 2) {
        this.workerOptions = []
        return
      }
      this.workerSearchLoading = true
      $ApiService.salaryHiddenService
        ._searchWorkers({ search: q })
        .then((res) => {
          this.workerOptions = (res.data.data || []).map((w) => ({
            label: `${w.fio || '—'} — ${w.pinfl}${w.organization?.name ? ' · ' + w.organization.name : ''}`,
            value: w.pinfl,
            disabled: w.already_hidden
          }))
        })
        .catch(() => {
          this.workerOptions = []
        })
        .finally(() => {
          this.workerSearchLoading = false
        })
    }
  }
})
