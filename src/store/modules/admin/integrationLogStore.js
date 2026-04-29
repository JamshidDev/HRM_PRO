import { defineStore } from 'pinia'

export const useIntegrationLogStore = defineStore('integrationLog', {
  state: () => ({
    list: [],
    loading: false,
    activeCol: null,
    totalItems: 0,
    tabs: ['list', 'dashboard'],
    activeTab: 'dashboard',
    params: {
      page: 1,
      per_page: 10,
      search: null,
      api_type: null,
      method: null
    },
    // Dashboard
    dashboardLoading: false,
    summary: null,
    timeline: [],
    topClients: [],
    topEndpoints: [],
    methods: [],
    statuses: []
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
      Promise.all([
        $ApiService.integrationLogService._summary(),
        $ApiService.integrationLogService._timeline(),
        $ApiService.integrationLogService._topClients(),
        $ApiService.integrationLogService._topEndpoints(),
        $ApiService.integrationLogService._methods(),
        $ApiService.integrationLogService._statuses()
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
