import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

export const useHolidayGreetingStore = defineStore('holidayGreetingStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    detailLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    instance: null,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      is_active: null
    },
    payload: {
      name: null,
      text: null,
      holiday_date: null,
      is_recurring: false,
      is_active: true,
      banner: []
    },
    overrides: [],
    overrideVisible: false,
    overrideSaveLoading: false,
    overrideDeleteLoading: false,
    overrideElementId: null,
    overridePayload: {
      client_key: null,
      text: null,
      banner: []
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.holidayGreetingService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _show(id, callback) {
      this.detailLoading = true
      $ApiService.holidayGreetingService
        ._show({ id })
        .then((res) => {
          this.instance = res.data.data
          this.overrides = res.data.data.overrides || []
          callback?.(this.instance)
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    buildFormData() {
      const fd = new FormData()
      fd.append('name', this.payload.name)
      fd.append('text', this.payload.text)
      fd.append('holiday_date', Utils.timeToZone(this.payload.holiday_date))
      fd.append('is_recurring', this.payload.is_recurring ? 1 : 0)
      fd.append('is_active', this.payload.is_active ? 1 : 0)
      const banner = this.payload.banner.find((v) => v.file)
      if (banner) fd.append('banner', banner.file)
      return fd
    },
    _create() {
      this.saveLoading = true
      $ApiService.holidayGreetingService
        ._create({ data: this.buildFormData() })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      const data = this.buildFormData()
      data.append('_method', 'PUT')
      $ApiService.holidayGreetingService
        ._update({ data, id: this.elementId })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.holidayGreetingService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(v) {
      this.visible = v
    },
    onCreate() {
      this.resetForm()
      this.visibleType = true
      this.visible = true
    },
    onEdit(item) {
      this.resetForm()
      this.visibleType = false
      this.elementId = item.id
      this.visible = true
      this._show(item.id, (instance) => {
        this.payload.name = instance.name
        this.payload.text = instance.text
        this.payload.holiday_date = instance.holiday_date
          ? new Date(instance.holiday_date).getTime()
          : null
        this.payload.is_recurring = !!instance.is_recurring
        this.payload.is_active = !!instance.is_active
        this.payload.banner = instance.banner_url
          ? [{ id: 'current', url: instance.banner_url }]
          : []
      })
    },
    resetForm() {
      this.elementId = null
      this.instance = null
      this.overrides = []
      this.payload = {
        name: null,
        text: null,
        holiday_date: null,
        is_recurring: false,
        is_active: true,
        banner: []
      }
    },
    onAddOverride() {
      this.resetOverrideForm()
      this.overrideVisible = true
    },
    onEditOverride(item) {
      this.overrideElementId = item.id
      this.overridePayload.client_key = item.client_key
      this.overridePayload.text = item.text
      this.overridePayload.banner = item.banner_url
        ? [{ id: 'current', url: item.banner_url }]
        : []
      this.overrideVisible = true
    },
    resetOverrideForm() {
      this.overrideElementId = null
      this.overridePayload = { client_key: null, text: null, banner: [] }
    },
    _overrideUpsert() {
      this.overrideSaveLoading = true
      const fd = new FormData()
      fd.append('client_key', this.overridePayload.client_key)
      fd.append('text', this.overridePayload.text)
      const banner = this.overridePayload.banner.find((v) => v.file)
      if (banner) fd.append('banner', banner.file)
      $ApiService.holidayGreetingService
        ._overrideUpsert({ id: this.elementId, data: fd })
        .then(() => {
          this.overrideVisible = false
          this._show(this.elementId)
        })
        .finally(() => {
          this.overrideSaveLoading = false
        })
    },
    _overrideDelete(overrideId) {
      this.overrideDeleteLoading = true
      $ApiService.holidayGreetingService
        ._overrideDelete({ id: this.elementId, overrideId })
        .then(() => {
          this._show(this.elementId)
        })
        .finally(() => {
          this.overrideDeleteLoading = false
        })
    }
  }
})
