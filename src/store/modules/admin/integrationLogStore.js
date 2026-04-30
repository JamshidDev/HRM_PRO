import { defineStore } from 'pinia'

export const useIntegrationLogStore = defineStore('integrationLog', {
  state: () => ({
    list: [],
    loading: false,
    activeCol: null,
    totalItems: 0,
    tabs: ['list', 'dashboard', 'clients'],
    activeTab: 'dashboard',
    params: {
      page: 1,
      per_page: 10,
      search: null,
      api_type: null,
      method: null
    },
    dashboardParams: {
      date_from: null,
      date_to: null
    },
    // Dashboard
    dashboardLoading: false,
    summary: null,
    timeline: [],
    topClients: [],
    topEndpoints: [],
    methods: [],
    statuses: [],
    // Clients
    users: [],
    usersLoading: false,
    updateLoading: false
  }),
  actions: {
    _index() {
      this.loading = true
      let params = {
        page: this.params.page,
        per_page: this.params.per_page,
        search: this.params.search,
        api_type: this.params.api_type,
        method: this.params.method
      }
      $ApiService.integrationLogService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _filterEvent() {
      this.params.page = 1
      this.params.per_page = 10
      this._index()
    },
    _dashboard() {
      this.dashboardLoading = true
      const params = {
        date_from: this.dashboardParams.date_from
          ? new Date(this.dashboardParams.date_from).toISOString().slice(0, 10)
          : undefined,
        date_to: this.dashboardParams.date_to
          ? new Date(this.dashboardParams.date_to).toISOString().slice(0, 10)
          : undefined
      }
      Promise.all([
        $ApiService.integrationLogService._summary(params),
        $ApiService.integrationLogService._timeline(params),
        $ApiService.integrationLogService._topClients(params),
        $ApiService.integrationLogService._topEndpoints(params),
        $ApiService.integrationLogService._methods(params),
        $ApiService.integrationLogService._statuses(params)
      ])
        .then(([summary, timeline, topClients, topEndpoints, methods, statuses]) => {
          this.summary = summary.data.data
          this.timeline = timeline.data.data
          this.topClients = topClients.data.data
          this.topEndpoints = topEndpoints.data.data
          this.methods = methods.data.data
          this.statuses = statuses.data.data
        })
        .finally(() => {
          this.dashboardLoading = false
        })
    },
    _users() {
      this.usersLoading = true
      $ApiService.integrationLogService
        ._users()
        .then((res) => {
          this.users = res.data.data
        })
        .finally(() => {
          this.usersLoading = false
        })
    },
    _updateUser(id, payload) {
      this.updateLoading = true
      return $ApiService.integrationLogService
        ._updateUser(id, payload)
        .finally(() => {
          this.updateLoading = false
        })
    },
    resetParams() {
      this.params = {
        page: 1,
        per_page: 10,
        search: null,
        api_type: null,
        method: null
      }
    }
  }
})
