import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/extra/department/list`, { params: payload?.params })
}

const _locationIndex = async (payload) => {
  return await axios.get(`/v1/extra/department/locations`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/extra/department/locations`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/extra/department/locations/${payload.id}`, payload.data)
}

const _show = async (payload) => {
  return await axios.get(`/v1/extra/department/locations/${payload.id}`)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/extra/department/locations/${payload.id}`)
}

export default {
  _index,
  _locationIndex,
  _create,
  _update,
  _delete,
  _show
}
