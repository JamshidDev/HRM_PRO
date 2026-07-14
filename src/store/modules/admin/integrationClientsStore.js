import { defineStore } from 'pinia'

// Keyed integration client — dashboard statistikasi + client CRUD.
// $ApiService global (import kerak emas). Envelope: list = res.data.data,
// obyekt = res.data.data. Statistika integration-log bilan bir xil shakl.

export const useIntegrationClientsStore = defineStore('integrationClients', {
  state: () => ({
    // tabs
    tabs: ['dashboard', 'clients', 'logs'],
    activeTab: 'dashboard',

    // dashboard
    dashboardParams: { date_from: null, date_to: null },
    dashboardLoading: false,
    summary: null,
    timeline: [],
    topClients: [],
    topEndpoints: [],
    methods: [],
    statuses: [],

    // clients (CRUD)
    clients: [],
    clientsLoading: false,
    clientsTotalItems: 0,
    clientsParams: { page: 1, per_page: 10, search: null },
    saveLoading: false,
    meta: { roles: [], scope_modes: ['all', 'subtree', 'exact'] },

    // logs
    list: [],
    loading: false,
    totalItems: 0,
    params: { page: 1, per_page: 10, search: null, method: null }
  }),

  actions: {
    // ---- dashboard ----
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
        $ApiService.integrationClientsService._summary(params),
        $ApiService.integrationClientsService._timeline(params),
        $ApiService.integrationClientsService._topClients(params),
        $ApiService.integrationClientsService._topEndpoints(params),
        $ApiService.integrationClientsService._methods(params),
        $ApiService.integrationClientsService._statuses(params)
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

    // ---- clients CRUD ----
    _clients() {
      this.clientsLoading = true
      $ApiService.integrationClientsService
        ._list({
          page: this.clientsParams.page,
          per_page: this.clientsParams.per_page,
          search: this.clientsParams.search || undefined
        })
        .then((res) => {
          this.clients = res.data.data.data
          this.clientsTotalItems = res.data.data.total
        })
        .finally(() => {
          this.clientsLoading = false
        })
    },
    _meta() {
      if (this.meta.roles.length) return Promise.resolve()
      return $ApiService.integrationClientsService._meta().then((res) => {
        this.meta = res.data.data
      })
    },
    _create(data) {
      this.saveLoading = true
      // Javob: { id, public_key, secret_key } — plaintext BIR MARTA.
      return $ApiService.integrationClientsService
        ._create(data)
        .then((res) => res.data.data)
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update(id, data) {
      this.saveLoading = true
      return $ApiService.integrationClientsService
        ._update(id, data)
        .finally(() => {
          this.saveLoading = false
        })
    },
    _setOrganizations(id, organization_ids) {
      return $ApiService.integrationClientsService._organizations(id, { organization_ids })
    },
    _rotate(id) {
      this.saveLoading = true
      return $ApiService.integrationClientsService
        ._rotate(id)
        .then((res) => res.data.data)
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(id) {
      return $ApiService.integrationClientsService._delete(id)
    },

    // ---- logs ----
    _index() {
      this.loading = true
      const params = {
        page: this.params.page,
        per_page: this.params.per_page,
        search: this.params.search,
        method: this.params.method
      }
      $ApiService.integrationClientsService
        ._logs({ params })
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
    }
  }
})
