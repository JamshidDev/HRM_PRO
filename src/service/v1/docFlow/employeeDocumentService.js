import axios from '@/service/index.js'

// Xodim hujjatlari — umumiy `documents` (moddiy javobgarlik, bitim, deklaratsiya...).
const _index = async (payload) => {
  return await axios.get(`/v1/hr/documents`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/documents`, payload.data)
}

const _form = async (payload) => {
  return await axios.get(`/v1/hr/documents/${payload.id}/form`)
}

const _signersPreview = async (payload) => {
  return await axios.post(`/v1/hr/documents/${payload.id}/signers-preview`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/hr/documents/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/documents/${payload.id}`)
}

export default {
  _index,
  _create,
  _form,
  _signersPreview,
  _update,
  _delete
}
