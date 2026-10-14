import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`v1/hr/contracts`, { params: payload.params })
}
const _show = async (payload) => {
  return await axios.get(`v1/hr/contracts/${payload.id}`, { params: payload.params })
}
const _create = async (payload) => {
  return await axios.post(`v1/hr/contracts`, payload.data)
}
const _delete = async (payload) => {
  return await axios.delete(`v1/hr/contracts/${payload.id}`, payload.data)
}
// Tahrir: saqlangan forma, yakuniy imzolovchilar va saqlash (qayta yuborish bilan).
const _form = async (payload) => {
  return await axios.get(`v1/hr/contracts/${payload.id}/form`)
}
const _signersPreview = async (payload) => {
  return await axios.post(`v1/hr/contracts/${payload.id}/signers-preview`, payload.data)
}
const _update = async (payload) => {
  return await axios.put(`v1/hr/contracts/${payload.id}`, payload.data)
}

export default {
  _index,
  _show,
  _create,
  _delete,
  _form,
  _signersPreview,
  _update
}
