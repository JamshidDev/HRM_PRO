import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/timesheet/worker-departments`, { params: payload.params })
}

// Biriktirish formasi uchun: boshqa tabelchida bo'lmagan bo'limlar.
const _availableDepartments = async (payload) => {
  return await axios.get(`/v1/timesheet/worker-departments/available-departments`, {
    params: payload.params
  })
}

// Biriktirish formasi uchun xodimlar: faqat TimesheetHR roli borlar.
const _availableWorkers = async (payload) => {
  return await axios.get(`/v1/timesheet/worker-departments/available-workers`, {
    params: payload.params
  })
}

const _create = async (payload) => {
  return await axios.post(`/v1/timesheet/worker-departments/attach`, payload.data)
}

const _delete = async (payload) => {
  return await axios.post(`/v1/timesheet/worker-departments/detach`, payload.data)
}

export default {
  _availableDepartments,
  _availableWorkers,
  _index,
  _create,
  _delete
}
