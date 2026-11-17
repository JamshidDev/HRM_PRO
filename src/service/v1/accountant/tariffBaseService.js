import axios from '@/service/index.js'

// Bazaviy summa (baza) — alohida obyekt (CRUD + versiya + tasdiqlash). Backend: /api/v1/tariff-bases

const _index = async (payload) => axios.get(`/v1/tariff-bases`, { params: payload?.params })
const _show = async (payload) => axios.get(`/v1/tariff-bases/${payload.id}`)
const _store = async (payload) => axios.post(`/v1/tariff-bases`, payload.data)
const _update = async (payload) => axios.put(`/v1/tariff-bases/${payload.id}`, payload.data)
// silentSuccess: xabarni store o'zi ko'rsatadi (zaxira matn bilan) — ikki toast chiqmasin.
const _delete = async (payload) => axios.delete(`/v1/tariff-bases/${payload.id}`, { silentSuccess: true })
const _versions = async (payload) => axios.get(`/v1/tariff-bases/${payload.id}/versions`)
const _version = async (payload) => axios.get(`/v1/tariff-bases/${payload.id}/versions/${payload.versionId}`)
const _storeVersion = async (payload) => axios.post(`/v1/tariff-bases/${payload.id}/versions`, payload.data)
const _confirmVersion = async (payload) =>
  axios.post(`/v1/tariff-bases/${payload.id}/versions/${payload.versionId}/confirm`, undefined, { silentSuccess: true })

// Bazani lavozimlarga qo'llash: ta'sir preview + qo'llash + qo'llash tarixi.
const _affectedPositions = async (payload) => axios.get(`/v1/tariff-bases/${payload.id}/affected-positions`)
const _applyToPositions = async (payload) =>
  axios.post(`/v1/tariff-bases/${payload.id}/apply-to-positions`, payload.data, { silentSuccess: true })
const _applyLogs = async (payload) =>
  axios.get(`/v1/tariff-bases/${payload.id}/apply-logs`, { params: payload?.params })

export default {
  _index,
  _show,
  _store,
  _update,
  _delete,
  _versions,
  _version,
  _storeVersion,
  _confirmVersion,
  _affectedPositions,
  _applyToPositions,
  _applyLogs
}
