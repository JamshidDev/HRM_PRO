import axios from '@/service/index.js'

// HR yordamchilari va ularning doirasi (butun korxona yoki bo'limlar).
const _index = async (payload) => {
  return await axios.get(`/v1/hr/assistants`, { params: payload.params })
}

const _save = async (payload) => {
  return await axios.put(`/v1/hr/assistants`, payload.data)
}

export default {
  _index,
  _save
}
