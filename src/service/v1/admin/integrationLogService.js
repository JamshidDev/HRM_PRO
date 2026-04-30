import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get('/v1/admin/integration-log', { params: payload.params })
}

const _summary = async (params) => {
  return await axios.get('/v1/admin/integration-log/summary', { params })
}

const _timeline = async (params) => {
  return await axios.get('/v1/admin/integration-log/timeline', { params })
}

const _topClients = async (params) => {
  return await axios.get('/v1/admin/integration-log/top-clients', { params })
}

const _topEndpoints = async (params) => {
  return await axios.get('/v1/admin/integration-log/top-endpoints', { params })
}

const _methods = async (params) => {
  return await axios.get('/v1/admin/integration-log/methods', { params })
}

const _statuses = async (params) => {
  return await axios.get('/v1/admin/integration-log/statuses', { params })
}

const _users = async () => {
  return await axios.get('/v1/admin/integration-log/users')
}

const _updateUser = async (id, payload) => {
  return await axios.put(`/v1/admin/integration-log/users/${id}`, payload)
}

export default {
  _index,
  _summary,
  _timeline,
  _topClients,
  _topEndpoints,
  _methods,
  _statuses,
  _users,
  _updateUser
}
