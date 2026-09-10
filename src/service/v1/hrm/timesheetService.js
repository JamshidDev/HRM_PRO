import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/timesheet`, { params: payload.params })
}

// Hujjat aylanishidagi «Tabellar»: men tabelchi bo'lgan yoki menda imzo bor tabellar.
const _assigned = async (payload) => {
  return await axios.get(`/v1/timesheet/assigned`, { params: payload?.params })
}

const _index_departments = async () => {
  return await axios.get(`/v1/timesheet/departments`)
}

const _show = async (payload) => {
  return await axios.get(`/v1/timesheet/user-departments/${payload.id}`)
}

const _create = async (payload) => {
  return await axios.post(`/v1/timesheet`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/timesheet/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/timesheet/${payload.id}`)
}

const _send = async (payload) => {
  return await axios.post(`/v1/timesheet/${payload.id}/send`)
}

const _decide = async (payload) => {
  return await axios.post(`/v1/timesheet/${payload.id}/confirmation`, payload.data)
}

const _accept = async (payload) => {
  return await axios.post(`/v1/timesheet/${payload.id}/accept`, payload.data)
}

const _enumTimesheet = async () => {
  return await axios.get(`/v1/timesheet/enums`)
}

export default {
  _index,
  _assigned,
  _show,
  _create,
  _update,
  _delete,
  _send,
  _decide,
  _index_departments,
  _enumTimesheet,
  _accept
}
