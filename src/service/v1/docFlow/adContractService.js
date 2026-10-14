import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/contract-additional`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/hr/contract-additional/${payload.id}`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/contract-additional`, payload.data)
}

// Tahrir: saqlangan forma, yakuniy imzolovchilar va saqlash (qayta yuborish bilan).
const _form = async (payload) => {
  return await axios.get(`/v1/hr/contract-additional/${payload.id}/form`)
}
const _signersPreview = async (payload) => {
  return await axios.post(`/v1/hr/contract-additional/${payload.id}/signers-preview`, payload.data)
}
const _update = async (payload) => {
  return await axios.put(`/v1/hr/contract-additional/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/contract-additional/${payload.id}`)
}

export default {
  _index,
  _create,
  _update,
  _delete,
  _show,
  _form,
  _signersPreview
}
