import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
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
      per_page: 10,
      search: null,
      organizations: [],
      level: null
    },
    levelLoading: false,
    levelList: [],
    parentElement: null,
    tabList: [
      {
        name: t('content.main'),
        key: 1,
        parentId: null
      }
    ],
    activeTab: 1,
    tabDataList: [],
    id: null,

    activeDeep: null,
    activeParentId: null,

    previewVisible: false,
    previewLoading: false,
    previewTotal: 0,
    previewList: [],
    previewParams: {
      page: 1,
      per_page: 10,
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
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
      }
      $ApiService.departmentService
        ._index({ params })
        .then((res) => {
          this.tabDataList[0] = res.data.data.data.map((v) => ({
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
        .then((res) => {
          if (callback) {
            callback?.()
            return
          }
          this.visible = false
          this.updateList()
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
        .then((res) => {
          if (callback) {
            callback?.()
            return
          }

          this.visible = false
          this.updateList()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      let deep = this.activeDeep
      this.deleteLoading = true

      this.tabList = this.tabList.filter((x, idx) => idx < deep)
      this.tabDataList = this.tabDataList.filter((x, idx) => idx < deep)

      $ApiService.departmentService
        ._delete({ id: this.elementId })
        .then((res) => {
          this.updateList()
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
    },
    goDeep(v) {
      this.id = v.id
      const currentTab = v.deep
      $ApiService.departmentService
        ._show({ id: v.id })
        .then((res) => {
          this.tabList = this.tabList.filter((x, idx) => idx < currentTab)
          this.tabDataList = this.tabDataList.filter((x, idx) => idx < currentTab)
          this.tabList.push({
            name: res.data.data.department.name,
            key: currentTab + 1,
            parentId: res.data.data.department.id
          })
          const children = res.data.data.children.map((v) => ({
            ...v,
            uz: v.name,
            ru: v.name_ru,
            en: v.name_en
          }))
          this.tabDataList.push(children)
          this.activeTab = currentTab + 1
        })
        .finally(() => {
          this.id = null
        })
    },
    closeTab(deep) {
      if (deep !== 1) {
        this.tabList = this.tabList.filter((a, idx) => idx !== Number(deep) - 1)
        this.tabDataList = this.tabDataList.filter((v, idx) => idx !== Number(deep) - 1)
        this.activeTab = Number(deep) - 1
      }
    },
    updateList() {
      let deep = this.activeDeep
      if (deep !== 1) {
        $ApiService.departmentService._show({ id: this.activeParentId }).then((res) => {
          if (res.data.data.children.length === 0 && deep !== 2) {
            this.activeTab = this.activeTab - 1
            this.tabDataList.pop()
            this.tabList.pop()

            let parentId = this.tabList[this.tabList.length - 1].parentId
            $ApiService.departmentService._show({ id: parentId }).then((res) => {
              this.tabDataList[this.tabDataList.length - 1] = res.data.data.children
            })
          } else if (res.data.data.children.length === 0 && deep === 2) {
            this.activeTab = this.activeTab - 1
            this.tabDataList.pop()
            this.tabList.pop()
            this._index()
          } else {
            this.tabDataList[deep - 1] = res.data.data.children
          }
        })
        this.tabList = this.tabList.filter((x, idx) => idx < deep)
        this.tabDataList = this.tabDataList.filter((x, idx) => idx < deep)
      } else {
        this._index()
      }
    }
  }
})
