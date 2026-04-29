import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get('/v1/admin/integration-log', { params: payload.params })
}

const _summary = async () => {
  return await axios.get('/v1/admin/integration-log/summary')
}

const _timeline = async () => {
  return await axios.get('/v1/admin/integration-log/timeline')
}

const _topClients = async () => {
  return await axios.get('/v1/admin/integration-log/top-clients')
}

const _topEndpoints = async () => {
  return await axios.get('/v1/admin/integration-log/top-endpoints')
}

const _methods = async () => {
  return await axios.get('/v1/admin/integration-log/methods')
}

const _statuses = async () => {
  return await axios.get('/v1/admin/integration-log/statuses')
}

export default {
  _index,
  _summary,
  _timeline,
  _topClients,
  _topEndpoints,
  _methods,
  _statuses
}
