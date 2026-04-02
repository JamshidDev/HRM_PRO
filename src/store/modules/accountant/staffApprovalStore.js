import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { getOneMonthAgoYearMonth } from '@utils'
const { t } = i18n.global
export const useStaffingApprovalStore = defineStore('staffingApprovalStore', {
  state: () => ({
    list: [],
    loading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 10,
      search: null
    },
    payload: {
      organization_id: null,
      confirmations: [],
      director_id: null,
      date: null,
      department_positions: [],
      confirmatory_id: null
    },
    sortableConfirmations: [],
    positions: [],
    generateLoading: false,
    saveLoading: false,

    worker: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        organization_id: null,
        page: 1,
        per_page: 100,
        search: null
      }
    },
    parent: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        page: 1,
        per_page: 100,
        search: null
      }
    },
    leader: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        organization_id: null,
        parent_id: null,
        page: 1,
        per_page: 100,
        search: null
      }
    },
    confirmation: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        organization_id: null,
        parent_id: null,
        page: 1,
        per_page: 100,
        search: null
      }
    }
  }),
  actions: {
    _confirmation(infinity) {
      this.confirmation.loading = true
      const params = {
        ...this.confirmation.params
      }
      $ApiService.staffApprovalService
        .confirmation({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: Utils.combineFullName(v.worker),
            position: v.post_short_name
          }))
          this.confirmation.list = infinity ? [...this.confirmation.list, ...data] : data
          this.confirmation.totalItems = res.data.data.total
        })
        .finally(() => {
          this.confirmation.loading = false
        })
    },
    _organizationParents(organization_id) {
      this.parent.loading = true
      $ApiService.staffApprovalService
        .organizationParents({ params: { organization_id } })
        .then((res) => {
          this.parent.list = res.data.data
        })
        .finally(() => {
          this.parent.loading = false
        })
    },
    _organizationLeader(infinity) {
      this.leader.loading = true
      const params = {
        ...this.leader.params
      }
      $ApiService.staffApprovalService
        .organizationLeaders({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: Utils.combineFullName(v.worker),
            position: v.post_short_name
          }))
          this.leader.list = infinity ? [...this.leader.list, ...data] : data
          this.leader.totalItems = res.data.data.total
        })
        .finally(() => {
          this.leader.loading = false
        })
    },

    _workers(infinity) {
      this.worker.loading = true
      const params = {
        ...this.worker.params
      }
      $ApiService.workerService
        ._index({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: Utils.combineFullName(v.worker),
            position: v.position.name
          }))
          this.worker.list = infinity ? [...this.worker.list, ...data] : data
          this.worker.totalItems = res.data.data.total
        })
        .finally(() => {
          this.worker.loading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params
        // organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.staffApprovalService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _showGenerate() {
      if (!this.payload.organization_id) {
        this.positions = []
        return
      }
      this.generateLoading = true
      const params = {
        ...this.params,
        organization_id: this.payload.organization_id
      }
      $ApiService.staffApprovalService
        ._showGenerate({ params })
        .then((res) => {
          this.positions = res.data.data.positions
        })
        .finally(() => {
          this.generateLoading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.staffApprovalService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.loading = true
      $ApiService.staffApprovalService._delete({ id: this.elementId }).finally(() => {
        this.loading = false
        this._index()
      })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.organization_id = null
      this.payload.department_positions = []
      this.payload.date = Date.now()
      this.positions = []
    }
  }
})
