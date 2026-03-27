import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/structure/reports`, { params: payload.params })
}

const _generate = async (payload) => {
  return await axios.post(`/v1/structure/report/generate`, payload.data)
}

const _labels = async () => {
  return await axios.get(`/v1/structure/report/labels`)
}

const _show = async (payload) => {
  return await axios.get(`/v1/structure/reports/${payload.id}`)
}

const _save = async (payload) => {
  return await axios.post(`/v1/structure/reports`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/structure/reports/${payload.id}`, payload.data)
}

const _createConfirmation = async (payload) => {
  return await axios.post(`/v1/structure/report/create-confirmation`, payload.data)
}

const _deleteConfirmation = async (payload) => {
  return await axios.delete(`/v1/structure/report/delete-confirmation/${payload.id}`)
}

const _updateDetail = async (payload) => {
  return await axios.put(`/v1/structure/reports-detail/${payload.id}`, payload.data)
}

const _deleteDetail = async (payload) => {
  return await axios.delete(`/v1/structure/reports-detail/${payload.id}`)
}

const _excel = async (payload) => {
  return await axios.post(`/v1/structure/report/excel`, payload.data, { responseType: 'blob' })
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/structure/reports/${payload.id}`)
}

const _reportsStat = async (payload) => {
  return await axios.get(`/v1/structure/reports-stat`, { params: payload.params })
}

export default {
  _index,
  _show,
  _generate,
  _labels,
  _save,
  _update,
  _delete,
  _createConfirmation,
  _deleteConfirmation,
  _updateDetail,
  _deleteDetail,
  _excel,
  _reportsStat
}
