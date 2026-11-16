import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/vacation-schedule`, { params: payload?.params })
}

const _workers = async (payload) => {
  return await axios.get(`/v1/hr/vacation-schedule-workers`, { params: payload?.params })
}

const _autoGenerate = async (payload) => {
  return await axios.get(`/v1/hr/vacation-schedule/${payload.id}/auto-generate`, {
    params: payload?.params
  })
}

const _notIncludes = async (payload) => {
  return await axios.get(`/v1/hr/vacation-schedules-not-included`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/vacation-schedule`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/hr/vacation-schedules/${payload.id}`, payload.data)
}

// Grafik (yil-hujjat) qatorlari bilan o'chiriladi.
const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/vacation-schedule/${payload.id}`)
}

// Sarlavha + korxonaning barcha xodimlari (davr va kunlar hisoblangan).
const _createSchedule = async (payload) => {
  return await axios.post(`/v1/hr/vacation-schedule/create`, payload.data)
}

const _updateHeader = async (payload) => {
  return await axios.put(`/v1/hr/vacation-schedule/${payload.id}/header`, payload.data)
}

const _rows = async (payload) => {
  return await axios.get(`/v1/hr/vacation-schedule/${payload.id}/rows`, { params: payload.params })
}

const _summary = async (payload) => {
  return await axios.get(`/v1/hr/vacation-schedule/${payload.id}/summary`)
}

const _updateRow = async (payload) => {
  return await axios.put(`/v1/hr/vacation-schedule/rows/${payload.id}`, payload.data)
}

const _bulkPlanDate = async (payload) => {
  return await axios.put(`/v1/hr/vacation-schedule/${payload.id}/plan-date`, payload.data)
}

const _sync = async (payload) => {
  return await axios.post(`/v1/hr/vacation-schedule/${payload.id}/sync`)
}

export default {
  _index,
  _create,
  _update,
  _delete,
  _notIncludes,
  _workers,
  _autoGenerate,
  _createSchedule,
  _updateHeader,
  _rows,
  _summary,
  _updateRow,
  _bulkPlanDate,
  _sync
}
