import axios from '@/service/index.js'

// Tarif setkasi — koeffitsient ma'lumotnomasi (CRUD + versiya + PDF). Backend: /api/v1/tariff-grids

const _index = async (payload) => axios.get(`/v1/tariff-grids`, { params: payload?.params })
const _show = async (payload) => axios.get(`/v1/tariff-grids/${payload.id}`)
const _pdf = async (payload) => axios.get(`/v1/tariff-grids/${payload.id}/pdf`, { responseType: 'blob' })
const _excel = async (payload) => axios.get(`/v1/tariff-grids/${payload.id}/xlsx`, { responseType: 'blob' })
const _store = async (payload) => axios.post(`/v1/tariff-grids`, payload.data)
const _update = async (payload) => axios.put(`/v1/tariff-grids/${payload.id}`, payload.data)
const _delete = async (payload) => axios.delete(`/v1/tariff-grids/${payload.id}`)
const _versions = async (payload) => axios.get(`/v1/tariff-grids/${payload.id}/versions`, { params: payload?.params })
const _version = async (payload) => axios.get(`/v1/tariff-grids/${payload.id}/versions/${payload.versionId}`)
const _storeVersion = async (payload) => axios.post(`/v1/tariff-grids/${payload.id}/versions`, payload.data)
const _confirmVersion = async (payload) =>
  axios.post(`/v1/tariff-grids/${payload.id}/versions/${payload.versionId}/confirm`)

export default {
  _index,
  _show,
  _pdf,
  _excel,
  _store,
  _update,
  _delete,
  _versions,
  _version,
  _storeVersion,
  _confirmVersion
}
