import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/tasks`, { params: payload.params })
}
const _show = async (payload) => {
  return await axios.get(`/v1/hr/tasks/${payload.id}`)
}
const _create = async (payload) => {
  return await axios.post(`/v1/hr/tasks`, payload.data)
}
const _update = async (payload) => {
  return await axios.put(`/v1/hr/tasks/${payload.id}`, payload.data)
}
const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/tasks/${payload.id}`)
}
const _status = async (payload) => {
  return await axios.patch(`/v1/hr/tasks/${payload.id}/status`, payload.data)
}
const _comment = async (payload) => {
  return await axios.post(`/v1/hr/tasks/${payload.id}/comments`, payload.data)
}

export default {
  _index,
  _show,
  _create,
  _update,
  _delete,
  _status,
  _comment
}
