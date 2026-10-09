import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/structure/organizations`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/structure/organizations/${payload.id}`)
}

const _level = async (payload) => {
  return await axios.get(`/v1/structure/organization-levels`)
}

const _create = async (payload) => {
  return await axios.post(`/v1/structure/organizations`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/structure/organizations/${payload.id}`, payload.data)
}

// Hard delete yo'q — korxona asos (izoh yoki fayl) bilan yopiladi / qayta ochiladi.
const _close = async (payload) => {
  return await axios.post(`/v1/structure/organizations/${payload.id}/close`, payload.data)
}

const _reopen = async (payload) => {
  return await axios.post(`/v1/structure/organizations/${payload.id}/reopen`, payload.data)
}

// Drag & drop: boshqa otaga ko'chirish va/yoki aka-ukalar orasida tartibni o'zgartirish.
// data: { parent_id: number|null, position: number|null (0 dan; null — oxiriga), basis_comment? }
const _move = async (payload) => {
  return await axios.post(`/v1/structure/organizations/${payload.id}/move`, payload.data)
}

const _events = async (payload) => {
  return await axios.get(`/v1/structure/organizations/${payload.id}/events`)
}

export default {
  _index,
  _create,
  _update,
  _close,
  _reopen,
  _events,
  _move,
  _show,
  _level
}
