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
    structureCheck: [],
    // Forma kimga joy beradi: bo'lim yoki xodim (Mobile face).
    target: 'department',
    selectedWorker: null,
    workerList: [],
    workerLoading: false,
    workerTotal: 0,
    // BACKEND: GET /v1/extra/mobile-face/workers — `has_location=false` hozir 0 ta qaytaradi
    // (joysiz xodimlar 63 mingdan ortiq), ya'ni "false" satri true deb o'qilyapti. Shuningdek
    // `is_free=true` (erkin rejimdagi xodimlar) parametri yo'q. Ikkalasi «Joy holati» filtri uchun kerak.
    workerParams: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      // Swagger'da bor: `department_id`.
      department_id: null,
      has_location: null,
      is_free: null
    },
    stats: null,
    statsLoading: false,
    workerLocVisible: false,
    workerLocations: [],
    workerLocationsLoading: false,
    payload: {
      department_id: null,
      worker_id: null,
      name: null,
      is_free: false,
      geo_type: false,
      lat: null,
      lng: null,
      radius: 500,
      polygon: [],
      accuracy_limit: 3
    },
    // BACKEND: GET /v1/extra/department/list hozir `has_location` (true — joyi bor, false — joysiz)
    // va `is_free` (true — erkin rejimdagi bo'limlar) parametrlarini e'tiborsiz qoldiradi.
    // «Filterlar» → «Joy holati» tanlanganda ro'yxat shular bilan filtrlanadi.
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      has_location: null,
      is_free: null
    },
    // BACKEND: GET /v1/extra/department/locations — joylashuv turi bo'yicha filtr kerak:
    // `geo_type` (false — nuqta+radius, true — hudud/polygon) va `is_free=true` (erkin rejim).
    // Hozir swagger'da faqat page, per_page, search, organization_id, department_id bor.
    locationParams: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      department_id: null,
      geo_type: null,
      is_free: null
    }
  }),
  getters: {
    // Joriy ko'rinishda «Joy holati» filtrining qiymati (`applyLocationState` ga qarang; yo'q — null).
    locationState(state) {
      const p = state.activeTab === 'workers' ? state.workerParams : state.params
      if (p.is_free === true) return 'free'
      if (p.has_location === true) return 'areas'
      if (p.has_location === false) return 'unassigned'
      return null
    }
  },
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
    // Erkin rejimda koordinata yuborilmaydi.
    buildData() {
      const free = this.payload.is_free
      return {
        // Erkin rejimda joy nomi bo'lmaydi.
        name: free ? null : this.payload.name?.trim() || null,
        is_free: free,
        geo_type: free ? false : this.payload.geo_type,
        lat: free ? null : this.payload.lat,
        lng: free ? null : this.payload.lng,
        radius: this.payload.radius,
        polygon: !free && this.payload.polygon.length > 0 ? this.payload.polygon : undefined
      }
    },
    afterSave() {
      this.visible = false
      this._stats()
      if (this.target === 'worker') {
        this._workerIndex()
        if (this.workerLocVisible) this._workerLocationsIndex()
      } else if (this.activeTab === 'departments') {
        this._index()
      } else {
        this._locationIndex()
      }
    },
    _create() {
      if (this.target === 'worker') {
        this.saveLoading = true
        $ApiService.departmentLocationService
          ._createWorkerLocation({ data: { ...this.buildData(), worker_id: this.payload.worker_id } })
          .then(() => this.afterSave())
          .finally(() => {
            this.saveLoading = false
          })
        return
      }
      this.saveLoading = true
      const data = {
        ...this.buildData(),
        department_id: this.payload.department_id,
        accuracy_limit: this.payload.accuracy_limit
      }
      $ApiService.departmentLocationService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._stats()
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
      if (this.target === 'worker') {
        this.saveLoading = true
        $ApiService.departmentLocationService
          ._updateWorkerLocation({ data: this.buildData(), id: this.elementId })
          .then(() => this.afterSave())
          .finally(() => {
            this.saveLoading = false
          })
        return
      }
      this.saveLoading = true
      const data = {
        ...this.buildData(),
        department_id: this.payload.department_id,
        accuracy_limit: this.payload.accuracy_limit
      }
      $ApiService.departmentLocationService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._stats()
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
          this._stats()
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
    // `department` null bo'lishi mumkin — jadval sarlavhasidagi "+" orqali
    // ochilganda bo'lim formaning o'zida tanlanadi.
    openLocationModal(department = null) {
      this.resetForm()
      this.selectedDepartment = department
      this.payload.department_id = department?.id ?? null
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
            this.payload.name = data.name ?? null
            this.payload.is_free = data.is_free === true
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
      this.target = 'department'
      this.selectedWorker = null
      this.payload.worker_id = null
      this.payload.is_free = false
      this.payload.department_id = null
      this.payload.name = null
      this.payload.geo_type = false
      this.payload.lat = null
      this.payload.lng = null
      this.payload.radius = 500
      this.payload.polygon = []
      this.payload.accuracy_limit = 3
    },
    // --- Mobile face: kartalar ---
    // Kartalar joriy tab kesimida (bo'lim joylari ro'yxati — bo'limlar kesimi).
    _stats() {
      this.statsLoading = true
      const view = this.activeTab === 'workers' ? 'workers' : 'departments'
      $ApiService.departmentLocationService
        ._faceStats({ params: { view } })
        .then((res) => {
          this.stats = res.data.data
        })
        .finally(() => {
          this.statsLoading = false
        })
    },
    // --- Mobile face: xodimlar tabi ---
    _workerIndex() {
      this.workerLoading = true
      const params = {
        ...this.workerParams,
        organizations: this.workerParams.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.departmentLocationService
        ._faceWorkers({ params })
        .then((res) => {
          this.workerList = res.data.data.data
          this.workerTotal = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    openWorkerLocations(worker) {
      this.selectedWorker = worker
      this.workerLocations = []
      this.workerLocVisible = true
      this._workerLocationsIndex()
    },
    _workerLocationsIndex() {
      if (!this.selectedWorker) return
      this.workerLocationsLoading = true
      $ApiService.departmentLocationService
        ._workerLocations({ params: { worker_id: this.selectedWorker.id } })
        .then((res) => {
          this.workerLocations = res.data.data
        })
        .finally(() => {
          this.workerLocationsLoading = false
        })
    },
    openWorkerLocationModal(worker) {
      this.resetForm()
      this.target = 'worker'
      this.selectedWorker = worker
      this.payload.worker_id = worker.id
      this.visibleType = true
      this.visible = true
    },
    openWorkerEditModal(item) {
      const worker = this.selectedWorker
      this.resetForm()
      this.target = 'worker'
      this.selectedWorker = worker
      this.payload.worker_id = item.worker_id
      this.elementId = item.id
      this.payload.name = item.name ?? null
      this.payload.is_free = item.is_free === true
      this.payload.geo_type = item.geo_type === true
      this.payload.lat = item.lat
      this.payload.lng = item.lng
      this.payload.radius = item.radius || 500
      this.payload.polygon = item.polygon || []
      this.visibleType = false
      this.visible = true
    },
    _deleteWorkerLocation(id) {
      this.deleteLoading = true
      $ApiService.departmentLocationService
        ._deleteWorkerLocation({ id })
        .then(() => {
          this._workerLocationsIndex()
          this._workerIndex()
          this._stats()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    // «Joy holati» filtri: 'areas' — joyi bor, 'unassigned' — joysiz, 'free' — erkin rejim,
    // null — hammasi. Param'larga `has_location` / `is_free` bo'lib yoziladi.
    applyLocationState(p, key) {
      p.has_location = key === 'areas' ? true : key === 'unassigned' ? false : null
      p.is_free = key === 'free' ? true : null
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
      this.locationParams.geo_type = null
      this.locationParams.is_free = null
      this.selectedDepartment = null
    }
  }
})
