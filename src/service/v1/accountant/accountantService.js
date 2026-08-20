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
// payload.config — ommaviy yuklashda { silentError: true } uzatiladi (har org uchun
// toast chiqmasin; xatolar modalda alohida ko'rsatiladi).
const _createFromOnes = async (payload) => {
  return await axios.post(`/v1/economist/upload/from-1c`, payload.data, payload.config)
}

// 1C dan ommaviy yuklash uchun — shu davrda tortilgan korxonalar ro'yxati.
// economist-uploads ruxsati ostida (salary-1c-access dan mustaqil).
const _onesOrgs = async (payload) => {
  return await axios.get(`/v1/economist/upload/ones-orgs`, { params: payload?.params })
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

const _cancelConfirm = async (payload) => {
  return await axios.post(`/v1/economist/upload-histories/cancel-confirm`, payload.data)
}

const _updateStatus = async (payload) => {
  return await axios.post(`/v1/economist/upload-statuses`, payload.data)
}

// Hisobot yuklash holati — tanlangan oy uchun korxonalar kesimida (yuklagan/yuklamagan).
const _reportStatus = async (payload) => {
  return await axios.get(`/v1/economist/upload-report-status`, { params: payload?.params })
}
// Hisobot yuklash holati — Excel eksport (blob).
const _reportStatusExport = async (payload) => {
  return await axios.get(`/v1/economist/upload-report-status/export`, {
    params: payload?.params,
    responseType: 'blob'
  })
}

export default {
  _index,
  _create,
  _createFromOnes,
  _onesOrgs,
  _update,
  _delete,
  _enum,
  _structure,
  _confirm,
  _cancelConfirm,
  _updateStatus,
  _reportStatus,
  _reportStatusExport
}
