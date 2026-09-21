import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/med/sick-leaves`, { params: payload?.params })
}

const _statistics = async (payload) => {
  return await axios.get(`/v1/med/sick-leaves/statistics`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/med/sick-leaves`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/med/sick-leaves/${payload.id}`, payload.data)
}

// Yopish: hujjat bilan yopilganda PDF ketadi — shuning uchun FormData.
const _close = async (payload) => {
  return await axios.post(`/v1/med/sick-leaves/${payload.id}/close`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/med/sick-leaves/${payload.id}`)
}

export default {
  _index,
  _statistics,
  _create,
  _update,
  _close,
  _delete
}
