import { defineStore } from 'pinia'

export const useDepartmentLocationStore = defineStore('departmentLocationStore', {
  state: () => ({
    list: [],
    loading: false,
    showLoading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    payload: {
      department_id: null,
      geo_type: false,
      lat: null,
      lng: null,
      radius: 500,
      polygon: [],
      accuracy_limit: 3
    },
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: []
    },
    departmentList: [],
    departmentLoading: false,
    departmentParams: {
      page: 1,
      per_page: 20,
      search: null
    }
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.departmentLocationService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _departmentList() {
      this.departmentLoading = true
      const params = { ...this.departmentParams }
      $ApiService.departmentLocationService
        ._departmentList({ params })
        .then((res) => {
          this.departmentList = res.data.data.data
        })
        .finally(() => {
          this.departmentLoading = false
        })
    },
    _create() {
      this.saveLoading = true
      const data = {
        department_id: this.payload.department_id,
        geo_type: this.payload.geo_type,
        lat: this.payload.lat,
        lng: this.payload.lng,
        radius: this.payload.radius,
        polygon: this.payload.polygon.length > 0 ? this.payload.polygon : undefined,
        accuracy_limit: this.payload.accuracy_limit
      }
      $ApiService.departmentLocationService
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
      const data = {
        department_id: this.payload.department_id,
        geo_type: this.payload.geo_type,
        lat: this.payload.lat,
        lng: this.payload.lng,
        radius: this.payload.radius,
        polygon: this.payload.polygon.length > 0 ? this.payload.polygon : undefined,
        accuracy_limit: this.payload.accuracy_limit
      }
      $ApiService.departmentLocationService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _show(id) {
      this.showLoading = true
      this.elementId = id
      this.visibleType = false
      this.visible = true
      $ApiService.departmentLocationService
        ._show({ id })
        .then((res) => {
          const data = res.data.data
          this.payload.department_id = data.department_id
          this.payload.geo_type = data.geo_type
          this.payload.lat = data.lat
          this.payload.lng = data.lng
          this.payload.radius = data.radius || 500
          this.payload.polygon = data.polygon || []
          this.payload.accuracy_limit = data.accuracy_limit || 3

          // Add department to list if not exists
          if (data.department) {
            const exists = this.departmentList.find(d => d.id === data.department.id)
            if (!exists) {
              this.departmentList.unshift({
                id: data.department.id,
                name: data.department.name,
                organization: {
                  name: data.department.organization_name
                }
              })
            }
          }
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.departmentLocationService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openCreate() {
      this.resetForm()
      this.visibleType = true
      this.visible = true
    },
    resetForm() {
      this.elementId = null
      this.payload.department_id = null
      this.payload.geo_type = false
      this.payload.lat = null
      this.payload.lng = null
      this.payload.radius = 500
      this.payload.polygon = []
      this.payload.accuracy_limit = 3
    },
    resetParams() {
      this.params.page = 1
      this.params.search = null
      this.params.organizations = []
    }
  }
})
