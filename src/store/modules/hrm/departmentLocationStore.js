import { defineStore } from 'pinia'

export const useDepartmentLocationStore = defineStore('departmentLocationStore', {
  state: () => ({
    activeTab: 'departments',
    list: [],
    loading: false,
    locationList: [],
    locationLoading: false,
    locationTotalItems: 0,
    showLoading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    viewVisible: false,
    viewData: null,
    viewLoading: false,
    elementId: null,
    totalItems: 0,
    selectedDepartment: null,
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
    locationParams: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      department_id: null
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
    _locationIndex() {
      this.locationLoading = true
      const params = {
        ...this.locationParams,
        organizations: this.locationParams.organizations.map((v) => v.id).toString() || undefined,
        department_id: this.locationParams.department_id || undefined
      }
      $ApiService.departmentLocationService
        ._locationIndex({ params })
        .then((res) => {
          this.locationList = res.data.data.data
          this.locationTotalItems = res.data.data.total
        })
        .finally(() => {
          this.locationLoading = false
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
          if (this.activeTab === 'departments') {
            this._index()
          } else {
            this._locationIndex()
          }
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
          if (this.activeTab === 'departments') {
            this._index()
          } else {
            this._locationIndex()
          }
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.departmentLocationService
        ._delete({ id: this.elementId })
        .then((res) => {
          this.visible = false
          if (this.activeTab === 'departments') {
            this._index()
          } else {
            this._locationIndex()
          }
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openAttach(department) {
      // Locations tabga o'tish va department_id bilan filter qilish
      this.activeTab = 'locations'
      this.locationParams.department_id = department.id
      this.selectedDepartment = department
      this._locationIndex()
    },
    openLocationModal(department) {
      this.resetForm()
      this.selectedDepartment = department
      this.payload.department_id = department.id
      this.visibleType = true
      this.visible = true
    },
    openViewModal(item) {
      this.viewData = null
      this.viewVisible = true
      this.viewLoading = true
      $ApiService.departmentLocationService
        ._show({ id: item.id })
        .then((res) => {
          this.viewData = res.data.data
        })
        .finally(() => {
          this.viewLoading = false
        })
    },
    openEditModal(item) {
      this.resetForm()
      this.payload.department_id = item.department_id
      this.elementId = item.id
      this.visibleType = false
      this.visible = true
      this._showDetails(item.id)
    },
    _showDetails(locationId) {
      this.showLoading = true
      $ApiService.departmentLocationService
        ._show({ id: locationId })
        .then((res) => {
          const data = res.data.data
          if (data) {
            this.payload.department_id = data.department_id
            this.payload.geo_type = data.geo_type
            this.payload.lat = data.lat
            this.payload.lng = data.lng
            this.payload.radius = data.radius || 500
            this.payload.polygon = data.polygon || []
            this.payload.accuracy_limit = data.accuracy_limit || 3
            // Department ma'lumotlarini set qilish
            if (data.department) {
              this.selectedDepartment = {
                id: data.department.id,
                name: data.department.name,
                organization: {
                  name: data.department.organization_name
                }
              }
            }
          }
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    resetForm() {
      this.elementId = null
      this.selectedDepartment = null
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
    },
    resetLocationParams() {
      this.locationParams.page = 1
      this.locationParams.search = null
      this.locationParams.organizations = []
      this.locationParams.department_id = null
      this.selectedDepartment = null
    }
  }
})
