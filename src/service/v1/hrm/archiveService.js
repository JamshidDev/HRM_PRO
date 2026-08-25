import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/archive`, { params: payload?.params })
}

// Rezyume — arxivning O'Z endpointi (`hr-archive-resume` ruxsati).
const _resume = async (payload) => {
  return await axios.get(`/v1/hr/archive/${payload.uuid}/resume`, {
    responseType: 'blob',
    params: payload.params
  })
}

export default {
  _index,
  _resume
}
