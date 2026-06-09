import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useRegionStore = defineStore('regionStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allCountryList: [],
    allLoading: false,
    payload: {
      name: null,
      name_ru: null,
      name_en: null,
      marker: {
        coords: [],
        name: null
      },
      country_id: null
    },
    headerLang: 'uz',
    params: {
      page: 1,
      per_page: 10,
      search: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.regionService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data.map((v) => ({
            ...v,
            uz: v.name,
            ru: v.name_ru,
            en: v.name_en
          }))
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      let data = {
        name: this.payload.name,
        name_ru: this.payload.name_ru,
        name_en: this.payload.name_en,
        long: this.payload.marker.coords[0],
        lat: this.payload.marker.coords[1],
        country_id: this.payload.country_id
      }
      $ApiService.regionService
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
        name: this.payload.name,
        name_ru: this.payload.name_ru,
        name_en: this.payload.name_en,
        long: this.payload.marker.coords[0],
        lat: this.payload.marker.coords[1],
        country_id: this.payload.country_id
      }
      $ApiService.regionService
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
      $ApiService.regionService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    _getCountryList() {
      this.allLoading = true
      $ApiService.countryService
        ._index({
          params: {
            page: 1,
            per_page: 1000
          }
        })
        .then((res) => {
          this.allCountryList = res.data.data.data
        })
        .finally(() => {
          this.allLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.name = null
      this.payload.name_ru = null
      this.payload.name_en = null
      this.payload.country_id = null
    }
  }
})
