import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/schedule-types`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/types`, payload.data)
}

// Smena turlari naqshi bilan (days) — guruh sahifasidagi kartochka uchun.
const _types = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/types`, { params: payload?.params })
}

const _generateSchedule = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/generate-schedule`, payload.data)
}
const _generateWorkerSchedule = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/generate-schedule-workers`, payload.data)
}

const _getWorkers = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/get-workers`, { params: payload.params })
}

const _update = async (payload) => {
  return await axios.put(`/v1/turnstile/schedule/types/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/turnstile/schedule/types/${payload.id}`)
}

const _group = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/schedule-groups`, { params: payload.params })
}
const _groupDelete = async (payload) => {
  return await axios.delete(`/v1/turnstile/schedule/schedule-groups/${payload?.id}`, {
    params: payload.params
  })
}
const _groupEdit = async (payload) => {
  return await axios.put(`/v1/turnstile/schedule/schedule-groups/${payload?.id}`, payload.data)
}
const _groupWorker = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/schedule-workers`, { params: payload.params })
}
const _editDay = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/schedule-day`, payload.data)
}
const _replaceWorker = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/schedule-workers-replacement`, payload.data)
}

export default {
  _types,
  _index,
  _create,
  _update,
  _delete,
  _generateSchedule,
  _getWorkers,
  _generateWorkerSchedule,
  _group,
  _groupWorker,
  _editDay,
  _groupDelete,
  _groupEdit,
  _replaceWorker
}
