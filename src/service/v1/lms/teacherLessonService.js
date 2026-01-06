import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/lms/teacher/lessons`, { params: payload.params })
}
const _start = async (payload) => {
  return await axios.get(`/v1/lms/teacher/lessons/${payload.id}`, { params: payload.params })
}
const _create = async (payload) => {
  return await axios.get(`/v1/lms/lessons/${payload.id}/create-meet`, { params: payload.params })
}

export default {
  _index,
  _start,
  _create
}
