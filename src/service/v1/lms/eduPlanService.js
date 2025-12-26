import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/lms/edu-plan`, { params: payload?.params })
}
const _enum = async (payload) => {
  return await axios.get(`/v1/lms/enums`, { params: payload?.params })
}
const _learningCenter = async (payload) => {
  return await axios.get(`/v1/lms/learning-centers`, { params: payload.params })
}
const _create = async (payload) => {
  return await axios.post(`/v1/lms/edu-plan`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/lms/edu-plan/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/lms/edu-plan/${payload.id}`)
}

const _attachWorkers = async (payload) => {
  return await axios.get(`/v1/lms/edu-plans/${payload.id}/attached-workers`, {
    params: payload?.params
  })
}

const _detachWorkers = async (payload) => {
  return await axios.post(`/v1/lms/edu-plans/${payload.id}/detach-workers`, payload.data)
}

export default {
  _index,
  _create,
  _update,
  _delete,
  _enum,
  _learningCenter,
  _attachWorkers,
  _detachWorkers
}
