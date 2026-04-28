import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get('/v1/admin/integration-log', { params: payload.params })
}

export default {
  _index
}
