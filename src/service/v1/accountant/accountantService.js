import axios from '@/service/index.js'

const _enum = async (payload) => {
  return await axios.get(`/v1/economist/enums`, { params: payload?.params })
}
const _structure = async (payload) => {
  return await axios.get(`/v1/economist/structure`, { params: payload?.params })
}

const _index = async (payload) => {
  return await axios.get(`/v1/economist/upload-histories`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/economist/upload`, payload.data)
}

// Oylik hisobotni 1C dan yuklash (fayl yo'q — salary-1c da tortilgan ma'lumot).
const _createFromOnes = async (payload) => {
  return await axios.post(`/v1/economist/upload/from-1c`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/structure/countries/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/structure/countries/${payload.id}`)
}

const _confirm = async (payload) => {
  return await axios.post(`/v1/economist/upload-histories/confirm`, payload.data)
}

const _updateStatus = async (payload) => {
  return await axios.post(`/v1/economist/upload-statuses`, payload.data)
}

export default {
  _index,
  _create,
  _createFromOnes,
  _update,
  _delete,
  _enum,
  _structure,
  _confirm,
  _updateStatus
}
