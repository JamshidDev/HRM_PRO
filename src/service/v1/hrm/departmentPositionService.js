import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/department-positions`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/department-positions`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/hr/department-positions/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/department-positions/${payload.id}`)
}

// Oklad oshiruvchi koeffitsientlar.
const _coefficients = async (payload) =>
  axios.get(`/v1/hr/department-positions/${payload.id}/coefficients`)
const _addCoefficient = async (payload) =>
  axios.post(`/v1/hr/department-positions/${payload.id}/coefficients`, payload.data)
const _updateCoefficient = async (payload) =>
  axios.put(`/v1/hr/department-positions/${payload.id}/coefficients/${payload.coefId}`, payload.data)
const _deleteCoefficient = async (payload) =>
  axios.delete(`/v1/hr/department-positions/${payload.id}/coefficients/${payload.coefId}`)

// Oklad o'zgarish tarixi (lavozim darajasi).
const _salaryHistory = async (payload) =>
  axios.get(`/v1/hr/department-positions/${payload.id}/salary-history`, { params: payload?.params })

export default {
  _index,
  _create,
  _update,
  _delete,
  _coefficients,
  _addCoefficient,
  _updateCoefficient,
  _deleteCoefficient,
  _salaryHistory
}
