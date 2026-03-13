import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import { useComponentStore } from '@/store/modules/index.js'

const { t } = i18n.global
export const useReport2Store = defineStore('report2Store', {
  state: () => ({
    list: [],
    loading: false,
    orgCheck: [],
    selectedPosId: null,

    positionLoading: false,
    totalPosition: 0,
    positionList: [],
    byPosition: true,

    workerParams: {
      page: 1,
      per_page: 1000,
      search: null,
      organization_id: null,
      department_id: null,
      department_position_id: null
    },
    workerLoading: false,
    workerList: [],
    totalWorker: 0,
    optimizationLoading: false,

    visible: false,
    showLoading: false,
    saveLoading: false,
    elementId: null,
    lastDepartmentId: null,
    position: {
      loading: false,
      params: {
        page: 1,
        per_page: 1000,
        search: null
      },
      list: [],
      total: 0,
      selectedId: null,
      elementId: null,
      visible: false,
      visibleType: false
    },
    positionPayload: {
      position_id: null,
      department_id: null,
      group: null,
      rank: null,
      max_rank: null,
      rate: null,
      salary: null,
      experience: null,
      education: null,
      organizations: [],
      departments: []
    },
    confirmVisible: false,
    structure: {
      cache: [],
      loading: false,
      list: [],
      params: {
        search: null
      }
    },
    department: {
      loading: false,
      params: {
        organization_id: []
      },
      payload: {
        parent_id: null,
        level: null,
        name: null,
        name_ru: null,
        name_en: null,
        comment: null
      },
      list: [],
      cache: [],
      selectedId: null,
      elementId: null,
      selectDepartments: [],
      deleteVisible: false,
      visible: false
    },
    isDpDelete: true
  }),
  actions: {
    _positionOrderable(order) {
      const data = {
        type: 'position',
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: this.department.selectedId,
        order: order
      }

      $ApiService.reportService._orderable({ data }).then((res) => {
        console.log(res.data)
      })
    },
    _fetchStructure(callback) {
      const params = {
        ...this.structure.params
      }
      this.structure.loading = true
      $ApiService.reportService
        ._structure({ params })
        .then((res) => {
          this.structure.list = res.data.data
          callback?.(res.data.data)
        })
        .finally(() => {
          this.structure.loading = false
        })
    },
    _getOptimization() {
      this.optimizationLoading = true
      const department_id = this.department.selectedId
      $ApiService.reportService
        ._optimization({ params: { department_id } })
        .then((res) => {
          this.confirmVisible = false
          this.getPosition()
        })
        .finally(() => {
          this.optimizationLoading = false
        })
    },
    _getDepartment() {
      this.department.loading = true
      let params = {
        ...this.positionParams,
        organization_id: this.department.params.organization_id?.[0]?.id
      }
      $ApiService.reportService
        ._department({ params })
        .then((res) => {
          this.department.list = res.data.data.map((v) => ({
            ...v,
            name: v?.name,
            position: v?.organization?.name
          }))
        })
        .finally(() => {
          this.department.loading = false
        })
    },
    _deleteDepartment() {
      const id = this.department.elementId
      this.department.loading = true
      $ApiService.departmentService
        ._delete({ id })
        .then((res) => {
          this._getDepartment()
        })
        .finally(() => {
          this.department.loading = false
        })
    },
    _deletePosition() {
      this.position.loading = true
      $ApiService.departmentPositionService._delete({ id: this.position.elementId }).finally(() => {
        this.position.loading = false
        this.getPosition()
      })
    },
    getPosition() {
      this.position.loading = true
      let params = {
        ...this.position.params,
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: this.department.selectedId
      }
      $ApiService.reportService
        ._position({ params })
        .then((res) => {
          this.position.list = res.data.data.data
          this.position.total = res.data.data.total
        })
        .finally(() => {
          this.position.loading = false
        })
    },
    getWorker() {
      this.workerLoading = true
      let params = {
        ...this.workerParams,
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: this.department.selectedId,
        department_position_id: this.byPosition ? this.position.selectedId : undefined
      }
      $ApiService.reportService
        ._worker({ params })
        .then((res) => {
          this.workerList = res.data.data.data
          this.totalWorker = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    onChangeDepartment(v) {},
    async onChangeRadio(v) {
      this.department.selectedId = this.department.selectedId === v.id ? null : v.id
      this.position.selectedId = null
      this.position.list = []
      await nextTick()
      if (this.department.selectedId) {
        this.positionList = []
        this.workerList = []
        if (this.byPosition) {
          this.getPosition()
        } else {
          this.getWorker()
        }
      }
    },
    async onChangePosRadio(v) {
      this.position.selectedId = this.position.selectedId === v.id ? null : v.id
      await nextTick()
      this.workerList = []
      if (this.position.selectedId) {
        this.getWorker()
      }
    },
    onChangeFilter() {
      this.department.selectedId = null
      this.byPosition = !this.byPosition
    },
    onChangeOrg(v) {
      const store = useComponentStore()
      store.depParams.organizations = [v?.[0]?.id]
      this.params.organization_id = v
      this._getDepartment()
    },
    onEdit(v) {
      const store = useComponentStore()
      this.position.visibleType = false
      this.position.visible = true
      this.showLoading = true
      this.elementId = v.id
      $ApiService.reportService
        ._showPosition({ id: v.id })
        .then((res) => {
          const v = res.data.data
          store.departmentList = [v.department]
          store._departments()
          this.positionPayload.position_id = v.position.id
          this.positionPayload.department_id = v.department.id
          this.lastDepartmentId = v.department.id
          this.positionPayload.rate = v.rate
          this.positionPayload.rank = v.rank.id
          this.positionPayload.max_rank = v.max_rank.id
          this.positionPayload.group = v.group.id
          this.positionPayload.education = v.education.id
          this.positionPayload.salary = v.salary?.toString()
          this.positionPayload.experience = v.experience?.toString()
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    onCreatePosition(data) {
      this.saveLoading = true
      $ApiService.departmentPositionService
        ._create({ data })
        .then((res) => {
          this.position.visible = false
          if (this.department.selectedId === this.positionPayload.department_id) {
            this.getPosition()
          }
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    onUpdatePosition() {
      this.saveLoading = true
      let data = { ...this.positionPayload }
      $ApiService.departmentPositionService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.position.visible = false
          this.getPosition()
          if (this.lastDepartmentId !== this.positionPayload.department_id) {
            this._getDepartment()
          }
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    resetPositionPayload() {
      Object.assign(this.positionPayload, {
        position_id: null,
        department_id: null,
        group: null,
        rank: null,
        max_rank: null,
        rate: null,
        salary: null,
        experience: null,
        education: null
      })
    }
  }
})
