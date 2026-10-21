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
    workerSearchLoading: false
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
