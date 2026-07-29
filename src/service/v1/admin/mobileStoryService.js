import axios from '@/service/index.js'

// Mobil "story" e'lonlari — admin CRUD.
// Backend: /v1/admin/mobile-stories (+ /:id/slides slayd yuklash).
const _index = async (payload) => {
  return await axios.get(`/v1/admin/mobile-stories`, { params: payload?.params })
}
const _show = async (payload) => {
  return await axios.get(`/v1/admin/mobile-stories/${payload.id}`)
}
const _create = async (payload) => {
  return await axios.post(`/v1/admin/mobile-stories`, payload.data)
}
const _update = async (payload) => {
  return await axios.put(`/v1/admin/mobile-stories/${payload.id}`, payload.data)
}
const _delete = async (payload) => {
  return await axios.delete(`/v1/admin/mobile-stories/${payload.id}`)
}
// Slayd (rasm/video) yuklash — multipart FormData (file + media_type + sort + duration).
const _createSlide = async (payload) => {
  return await axios.post(`/v1/admin/mobile-stories/${payload.id}/slides`, payload.data)
}
const _removeSlide = async (payload) => {
  return await axios.delete(`/v1/admin/mobile-stories/slides/${payload.id}`)
}

export default {
  _index,
  _show,
  _create,
  _update,
  _delete,
  _createSlide,
  _removeSlide
}
