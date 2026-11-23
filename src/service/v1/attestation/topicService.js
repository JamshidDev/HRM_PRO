import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/exam/topics`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/exam/topics/${payload.id}`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/exam/topics`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/exam/topics/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/exam/topics/${payload.id}`)
}

// Hali saqlanmagan katta imtihon doirasi bo'yicha lavozim/xodimlar (scope, department_ids).
const _audiencePositions = async (payload) => {
  return await axios.get(`/v1/exam/topic-audience/positions`, { params: payload.params })
}

const _audienceWorkers = async (payload) => {
  return await axios.get(`/v1/exam/topic-audience/workers`, { params: payload.params })
}

// Saqlangan mavzu: «Kimlar uchun» xulosasi va tanlangan xodimlar (ids).
const _audience = async (payload) => {
  return await axios.get(`/v1/exam/topics/${payload.id}/audience`)
}

const _topicWorkers = async (payload) => {
  return await axios.get(`/v1/exam/topics/${payload.id}/workers`, { params: payload.params })
}

// Faqat holat (faol / ko'rinmas).
const _setActive = async (payload) => {
  return await axios.patch(`/v1/exam/topics/${payload.id}/active`, { active: payload.active })
}

export default {
  _audience,
  _topicWorkers,
  _setActive,
  _audiencePositions,
  _audienceWorkers,
  _index,
  _create,
  _update,
  _delete,
  _show
}
