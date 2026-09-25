import axios from '../../index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/commands`, { params: payload.params })
}

const _additionalData = async (payload) => {
  return await axios.get(`/v1/hr/worker-additional/${payload?.id}`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/commands`, payload?.data)
}

const _viewFile = async (payload) => {
  return await axios.post(`/v1/hr/commands`, payload.data, { responseType: 'blob' })
}
// Bekor qilish buyrug'i (75) formasi uchun — tasdiqlangan buyruqlar select'i.
const _selectable = async (payload) => {
  return await axios.get(`/v1/hr/commands/selectable`, { params: payload.params })
}

// «Ma'lumotlar» tabi — saqlangan forma holati va tahrirlash imkoniyati.
const _form = async (payload) => {
  return await axios.get(`/v1/hr/commands/${payload.id}/form`)
}

// Saqlashdan oldin yakuniy imzolovchilar va joriy holati (qayta yuborish modali).
const _signersPreview = async (payload) => {
  return await axios.post(`/v1/hr/commands/${payload.id}/signers-preview`, payload.data)
}

// Tasdiqlanmagan buyruqni qayta rasmiylashtirish (barchaga yoki tanlanganlarga qayta yuborish).
const _update = async (payload) => {
  return await axios.put(`/v1/hr/commands/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/commands/${payload.id}`)
}

export default {
  _index,
  _create,
  _delete,
  _viewFile,
  _additionalData,
  _selectable,
  _form,
  _update,
  _signersPreview
}
