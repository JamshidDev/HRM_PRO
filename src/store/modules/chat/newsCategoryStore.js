import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'

export const useNewsCategoryStore = defineStore('newsCategoryStore', {
  state: () => ({
    list: [],
    saveLoading: false,
    params: {
      page: 1,
      per_page: 10,
      search: null
    },
    totalItems: 0,
    payload: {
      name: {
        uz: undefined,
        ru: undefined,
        en: undefined
      }
    },
    visible: false,
    visibleType: false,
    elementId: null
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.newsCategoryService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    async _create() {
      try {
        this.saveLoading = true
        let data = {
          ...this.payload
        }
        const res = await $ApiService.newsCategoryService._create({
          data
        })
        this.visible = false
        this._index()
        return res
      } catch (error) {
        console.error(error)
      } finally {
        this.saveLoading = false
      }
      return false
    },
    async _update() {
      try {
        this.saveLoading = true
        let data = {
          ...this.payload
        }
        const res = await $ApiService.newsCategoryService._update({ data, id: this.elementId })
        this.visible = false
        this._index()
        return res
      } catch (error) {
        console.error(error)
      } finally {
        this.saveLoading = false
      }
      return false
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.newsCategoryService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    resetForm() {
      this.payload.uz = undefined
      this.payload.ru = undefined
      this.payload.en = undefined
    }
  }
})
