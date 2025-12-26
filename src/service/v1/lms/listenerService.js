import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/lms/listener/lessons`, { params: payload.params })
}
const _joinLesson = async (payload) => {
  return await axios.get(`/v1/lms/listener/lessons/${payload.id}`, { params: payload.params })
}

export default {
  _index,
  _joinLesson
}
