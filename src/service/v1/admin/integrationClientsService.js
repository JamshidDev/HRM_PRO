import axios from '@/service/index.js'

// Keyed integration client — CRUD + rotate + org tanlash + statistika.
// Backend: /api/v1/admin/integration-clients (Permission: users-write).

// --- statistika (integration-log bilan bir xil shakl, model_type keyed) ---
const _summary = async (params) => await axios.get('/v1/admin/integration-clients/summary', { params })
const _timeline = async (params) => await axios.get('/v1/admin/integration-clients/timeline', { params })
const _topClients = async (params) => await axios.get('/v1/admin/integration-clients/top-clients', { params })
const _topEndpoints = async (params) => await axios.get('/v1/admin/integration-clients/top-endpoints', { params })
const _methods = async (params) => await axios.get('/v1/admin/integration-clients/methods', { params })
const _statuses = async (params) => await axios.get('/v1/admin/integration-clients/statuses', { params })
const _logs = async (payload) => await axios.get('/v1/admin/integration-clients/logs', { params: payload.params })

// --- CRUD ---
const _meta = async () => await axios.get('/v1/admin/integration-clients/meta')
const _list = async () => await axios.get('/v1/admin/integration-clients')
const _show = async (id) => await axios.get(`/v1/admin/integration-clients/${id}`)
const _secret = async (id) => await axios.get(`/v1/admin/integration-clients/${id}/secret`)
const _create = async (data) => await axios.post('/v1/admin/integration-clients', data)
const _update = async (id, data) => await axios.put(`/v1/admin/integration-clients/${id}`, data)
const _organizations = async (id, data) => await axios.put(`/v1/admin/integration-clients/${id}/organizations`, data)
const _rotate = async (id) => await axios.post(`/v1/admin/integration-clients/${id}/rotate`)
const _delete = async (id) => await axios.delete(`/v1/admin/integration-clients/${id}`)

export default {
  _summary, _timeline, _topClients, _topEndpoints, _methods, _statuses, _logs,
  _meta, _list, _show, _secret, _create, _update, _organizations, _rotate, _delete
}
