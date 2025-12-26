import axios from '@/service/index.js'

const _generate = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/generate`, payload.data)
}

const _create = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/generate-schedule-workers`, payload.data)
}

const _daysOfMonth = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/day-in-month`, { params: payload?.params })
}

const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/workers`, { params: payload?.params })
}

const _updateTurnstile = async (payload) => {
  return await axios.put(`/v1/turnstile/schedule/workers/${payload.id}`, payload.data)
}

const _enums = async (payload) => {
  return await axios.get(`/v1/turnstile/enums`)
}

const _department = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/departments`, { params: payload?.params })
}

const _checkFactOfWorker = async (payload) => {
  return await axios.post(`/v1/turnstile/schedule/generate-turnstile-schedule`, payload.data)
}

const _factIndex = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/workers-with-turnstile`, {
    params: payload?.params
  })
}

export default {
  _generate,
  _create,
  _daysOfMonth,
  _index,
  _updateTurnstile,
  _enums,
  _department,
  _checkFactOfWorker,
  _factIndex
}
