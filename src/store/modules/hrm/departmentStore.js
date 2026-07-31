import { defineStore } from 'pinia'
export const useDepartmentStore = defineStore('departmentStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    showParent: false,
    payload: {
      organization_id: null,
      parent_id: null,
      level: null,
      region_id: null,
      city_id: null,
      name: null,
      name_ru: null,
      name_en: null,
      comment: null
    },
    districtList: [],
    districtLoading: false,
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      level: null
    },
    levelLoading: false,
    levelList: [],
    parentElement: null,
    refreshTarget: null,

    previewVisible: false,
    previewLoading: false,
    previewTotal: 0,
    previewList: [],
    previewParams: {
      page: 1,
      per_page: 15,
      search: null
    },
    headerLang: 'uz'
  }),
  actions: {
    _preview() {
      const params = {
        ...this.previewParams,
        departments: this.elementId
      }
      this.previewLoading = true
      $ApiService.workerService
        ._index({ params })
        .then((res) => {
          this.previewList = res.data.data.data
          this.previewTotal = res.data.data.total
        })
        .finally(() => {
          this.previewLoading = false
        })
    },
    mapNode(v, parent) {
      return {
        ...v,
        uz: v.name,
        ru: v.name_ru,
        en: v.name_en,
        ...(v.children ? { isLeaf: false } : {}),
        __parent: parent
      }
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
      }
      $ApiService.departmentService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data.map((v) => this.mapNode(v, null))
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _loadChildren(row) {
      return $ApiService.departmentService._show({ id: row.id }).then((res) => {
        row.children = res.data.data.children.map((v) => this.mapNode(v, row))
      })
    },
    // Reloads the children of `node` (root list when `node` is null/undefined).
    // Callers pass the node whose CHILDREN need reloading directly - e.g. a
    // row's __parent after editing/deleting that row, or the row itself after
    // adding a child to it.
    refreshNode(node) {
      return node ? this._loadChildren(node) : this._index()
    },
    _districts(regionId) {
      this.districtLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id: regionId } })
        .then((res) => {
          this.districtList = res.data.data.data
        })
        .finally(() => {
          this.districtLoading = false
        })
    },
    changeRegion(v) {
      this.payload.city_id = null
      this.districtList = []
      if (!v) return
      this._districts(v)
    },
    _level() {
      this.levelLoading = true
      $ApiService.departmentService
        ._level()
        .then((res) => {
          this.levelList = res.data.data
        })
        .finally(() => {
          this.levelLoading = false
        })
    },
    _create(callback) {
      this.saveLoading = true
      let data = {
        ...this.payload,
        parent_id: this.showParent ? this.payload.parent_id : undefined
      }
      $ApiService.departmentService
        ._create({ data })
        .then(() => {
          if (callback) {
            callback?.()
            return
          }
          this.visible = false
          this.refreshNode(this.refreshTarget)
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update(callback) {
      this.saveLoading = true
      let data = {
        ...this.payload,
        parent_id: this.showParent ? this.payload.parent_id : undefined
      }
      $ApiService.departmentService
        ._update({ data, id: this.elementId })
        .then(() => {
          if (callback) {
            callback?.()
            return
          }

          this.visible = false
          this.refreshNode(this.refreshTarget)
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(row) {
      this.deleteLoading = true
      $ApiService.departmentService
        ._delete({ id: row.id })
        .then(() => {
          this.refreshNode(row.__parent)
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
      this.payload.organization_id = null
      this.payload.name = null
      this.payload.name_en = null
      this.payload.name_ru = null
      this.payload.comment = null
      this.payload.parent_id = null
      this.payload.level = null
      this.payload.region_id = null
      this.payload.city_id = null
      this.districtList = []
    }
  }
})
