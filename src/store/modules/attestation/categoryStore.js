import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useCategoryStore = defineStore('categoryStore', {
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
    structureCheck: [],
    payload: {
      name: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null
    }
  }),
  actions: {
    _clear() {
      this.loading = true
      $ApiService.categoryService
        ._clear({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          // `_index()` faqat muvaffaqiyatda ishga tushadi — xatoda spinner
          // shu yerda o'chmasa, jadval abadiy yuklanish holatida qolardi.
          this.loading = false
        })
    },
    _index() {
      this.loading = true
      $ApiService.categoryService
        ._index({ params: this.params })
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
      let data = {
        ...this.payload
      }
      $ApiService.categoryService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      let data = {
        ...this.payload
      }
      $ApiService.categoryService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.categoryService
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
      this.elementId = null
      this.payload.name = null
    }
  }
})
